from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask import request, render_template, jsonify, flash, redirect, url_for
from sqlalchemy.orm.attributes import flag_modified
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import atexit
import tarfile
import docker
import enum
import os
from werkzeug.utils import secure_filename
import tempfile
from clients.TrainOfficeClient import TrainOfficeClient
from clients.TrainRouterClient import TrainRouterClient
from clients.SparqlClient import SparqlClient

import sys


# CONSTANTSfL
GET = 'GET'
POST = 'POST'
TRAINFILE_NAME = 'trainfile'
TRAINNAME_NAME = 'trainname'
KEY_TRAINID = 'trainID'


class JobState(enum.Enum):
    """
    Represents the states a TrainBuilderArchive job traverses.
    """
    JOB_SUBMITTED = "JOB_SUBMITTED"
    DOCKERFILE_BEING_ADDED = "DOCKERFILE_BEING_ADDED"
    DOCKERFILE_ADDED = "DOCKERFILE_ADDED"
    TRAIN_BEING_CREATED = "TRAIN_BEING_CREATED"
    TRAIN_SUBMITTED = "TRAIN_SUBMITTED"


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://'
db = SQLAlchemy(app)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Init Docker client
docker_client = docker.DockerClient(base_url='unix://run/docker.sock')


# Get the Registry and the station-service urls from environ
URI_STATION_OFFICE = os.environ['URI_STATION_OFFICE']


train_office_client = TrainOfficeClient(os.environ['URI_TRAIN_OFFICE'])
train_router_client = TrainRouterClient(os.environ['URI_TRAIN_ROUTER'])

URI_DOCKER_REGISTRY = os.environ['URI_DOCKER_REGISTRY']


# Setup session
app.secret_key = '37rwfyw89rfvbuyeiwjfwruf84ewuesbvguei'


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ['tar']


class TrainArchiveJob(db.Model):

    # Regular primary key
    id = db.Column(db.Integer, primary_key=True)

    # Path to the zip File
    filepath = db.Column(db.String(80), unique=True, nullable=True)

    # TrainID, as obtained from the TrainOffie
    train_id = db.Column(db.String(80), unique=False, nullable=False)

    # State of this archive job
    state = db.Column(db.Enum(JobState))


db.create_all()


def update_job_state(job, state):
    """
    Updates the job state in the persistence
    :param job:
    :param state:
    :return:
    """
    job.state = state
    flag_modified(job, "state")
    db.session.merge(job)
    db.session.flush()
    db.session.commit()


def response(body, status_code):
    resp = jsonify(body)
    resp.status_code = status_code
    return resp

#
# Routes for viewing
#

@app.route("/support", methods=[GET])
def support():
    return render_template('support.html')


@app.route("/citeus", methods=[GET])
def citeus():
    return render_template('citeus.html')


@app.route("/contact", methods=[GET])
def contact():
    return render_template('contact.html')



@app.route("/", methods=[GET])
def index():
    return render_template('index.html')


@app.route("/routeplan", methods=[GET])
def routeplan():
    return render_template('routeplan.html',
                           URI_STATION_OFFICE=URI_STATION_OFFICE + "/station",
                           TRAINFILE_NAME=TRAINFILE_NAME,
                           HEADER='Plan Route',
                           trains=train_office_client.get_all_trains(),
                           URI_TRAIN_ROUTER=train_router_client.get_uri())


@app.route("/train", methods=[GET])
def train_index():

    return render_template('train_index.html',
                           HEADER='Available Trains',
                           TRAINFILE_NAME=TRAINFILE_NAME,
                           URI=train_office_client.get_route_train())


@app.route("/train/<train_id>", methods=[GET])
def train(train_id):

    return render_template('train.html',
                           HEADER='Train ' + train_id,
                           TRAIN_ID=train_id,
                           URI_TRAIN_ROUTER=train_router_client.get_route_route(),
                           URI_TRAIN_OFFICE=train_office_client.get_route_train(),
                           routes=train_router_client.get_all_routes(train_id))


@app.route("/design", methods=[GET])
def design():
    results = SparqlClient.query()["results"]["bindings"]
    names = []
    comments = []
    ip_types = []
    for result in results:
        names.append(result['Name']['value'])
        comments.append(result['Comment']['value'])
        ip_types.append(result['DataType']['value'])
    return render_template("design.html", names=names, comments=comments, ip_types=ip_types)


# Upload file for a particular job
@app.route('/submit', methods=[POST])
def submit():

    # check if the post request has the file part
    if TRAINFILE_NAME not in request.files:
        flash('No file has been uploaded. Did you select the train.tar file?')

    file = request.files[TRAINFILE_NAME]
    # if user does not select file, browser also
    # submit a empty part without filename
    if file.filename == '':
        flash('No selected file')
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        temp_dir = tempfile.mkdtemp()

        # The absolute where the file is going to be saved to
        file_path = os.path.abspath(os.path.join(temp_dir, filename))
        file.save(file_path)

        # Fetch a new ID for the train
        train_id = train_office_client.create_train()

        # Create a new trainArchiveJob
        train_archive_job = TrainArchiveJob(filepath=file_path, state=JobState.JOB_SUBMITTED, train_id=train_id)
        db.session.add(train_archive_job)
        db.session.commit()

        flash('New Train: {} was submitted successfully'.format(train_id))
    return redirect(url_for('train_index'))


# Define the background jobs

def add_dockerfile():

    # Find all jobs with the from state
    job = db.session.query(TrainArchiveJob).filter_by(state=JobState.JOB_SUBMITTED).first()
    if job is not None:
        update_job_state(job, JobState.DOCKERFILE_BEING_ADDED)
        dockerfile = os.path.abspath(os.path.join(app.instance_path, 'Dockerfile_R'))
        # TODO Remove the Dockerfile_R if already present
        # Add the Dockerfile_R to the archive
        with tarfile.open(job.filepath, 'a') as tar:
            tar.add(dockerfile, arcname='Dockerfile')
        update_job_state(job, JobState.DOCKERFILE_ADDED)


def create_train():

    job = db.session.query(TrainArchiveJob).filter_by(state=JobState.DOCKERFILE_ADDED).first()
    if job is not None:
        update_job_state(job, JobState.TRAIN_BEING_CREATED)
        with open(job.filepath, 'r') as f:
            repository = '{}/{}:START'.format(URI_DOCKER_REGISTRY, job.train_id)
            docker_client.images.build(
                fileobj=f,
                custom_context=True,
                tag=repository)
            docker_client.images.push(repository)
        update_job_state(job, JobState.TRAIN_SUBMITTED)



# Start the AP Scheduler
scheduler = BackgroundScheduler()
scheduler.start()
atexit.register(lambda: scheduler.shutdown())

scheduler.add_job(
    func=add_dockerfile,
    trigger=IntervalTrigger(seconds=3),
    id='add_dockerfile',
    name='Loads the content from the submitted archive file',
    replace_existing=True)

scheduler.add_job(
    func=create_train,
    trigger=IntervalTrigger(seconds=3),
    id='add_job',
    name='Loads the content from the submitted archive file',
    replace_existing=True)


if __name__ == '__main__':
    app.run(port=6007, host='0.0.0.0')

