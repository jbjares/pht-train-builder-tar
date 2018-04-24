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
import requests
import sys

# CONSTANTS
GET = 'GET'
POST = 'POST'
TRAINFILE_NAME = 'trainfile'
TRAINNAME_NAME = 'trainname'
KEY_TRAINID = 'trainID'
TRAIN_ROUTER_TRAIN_ROUTE = 'train'


class JobState(enum.Enum):
    """
    Represents the states a TrainBuilderArchive job traverses.
    """
    JOB_SUBMITTED = "JOB_SUBMITTED"
    TRAIN_BEING_CREATED = "TRAIN_BEING_CREATED"
    TRAIN_SUBMITTED = "TRAIN_SUBMITTED"


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/jobs.db'
db = SQLAlchemy(app)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Init Docker client
docker_client = docker.DockerClient(base_url='unix://var/run/docker.sock')


# Get the Registry and the station-service urls from environ
URI_STATION_OFFICE = os.environ['URI_STATION_OFFICE']
URI_TRAIN_OFFICE = os.environ['URI_TRAIN_OFFICE']
URI_TRAIN_ROUTER = os.environ['URI_TRAIN_ROUTER']


# Setup session
app.secret_key = '37rwfyw89rfvbuyeiwjfwruf84ewuesbvguei'


# Currently, we only allow the tar extension
ALLOWED_EXTENSIONS = ['tar']


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.before_first_request
def setup_database():
    db.create_all()


def request_train_id():
    return requests.post(URI_TRAIN_OFFICE).json()[KEY_TRAINID]


class TrainArchiveJob(db.Model):

    # Regular primary key
    id = db.Column(db.Integer, primary_key=True)

    # Path to the zip File
    filepath = db.Column(db.String(80), unique=True, nullable=True)

    # State of this archive job
    state = db.Column(db.Enum(JobState))


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

@app.route("/", methods=[GET])
def index():
    return render_template('index.html',
                           URI_STATION_SERVICE=URI_STATION_OFFICE,
                           TRAINFILE_NAME=TRAINFILE_NAME,
                           HEADER='Home Page')


@app.route("/routeplan", methods=[GET])
def routeplan():

    # Get all trains for which routes can be planned (from TrainOffice)
    trains = []
    try:
        trains = [x[KEY_TRAINID] for x in requests.get(URI_TRAIN_OFFICE).json()]
    except requests.exceptions.ConnectionError:
        # No trainrouter is available. We cannot look at the train routes
        pass
    return render_template('routeplan.html',
                           URI_STATION_SERVICE=URI_STATION_OFFICE,
                           TRAINFILE_NAME=TRAINFILE_NAME,
                           HEADER='Plan Route',
                           trains=trains,
                           URI_TRAIN_ROUTER=URI_TRAIN_ROUTER)


@app.route("/trainsubmit", methods=[GET])
def trainsubmit():

    return render_template('train.html',
                           URI_STATION_SERVICE=URI_STATION_OFFICE,
                           TRAINFILE_NAME=TRAINFILE_NAME,
                           HEADER='Submit Train')


@app.route("/routeview", methods=[GET])
def routeview():

    # Get all trains with the respective routes from the TrainRouter
    routelist = []
    try:
        resp = requests.get(URI_TRAIN_ROUTER + "/" + TRAIN_ROUTER_TRAIN_ROUTE).json()

        # Assemble routelist
        routelist = [train[KEY_TRAINID] + "." + str(route) for train in resp for route in train['routes']]
    except requests.exceptions.ConnectionError:
        # No trainrouter is available. We cannot look at the train routes
        pass

    return render_template('routeview.html',
                           HEADER='View Route',
                           URI_TRAIN_ROUTER=URI_TRAIN_ROUTER,
                           routelist=routelist)
#
# Route for submitting trains
#

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
        # TODO  Use the returned ID for pushing the image
        train_id = request_train_id()

        # Create a new trainArchiveJob
        train_archive_job = TrainArchiveJob(filepath=file_path, state=JobState.JOB_SUBMITTED)
        db.session.add(train_archive_job)
        db.session.commit()

        flash('New Train: {} was submitted successfully'.format(train_id))
    return redirect(url_for('trainsubmit'))


# Define the background jobs
def create_train():
    
    setup_database()
    # Find all jobs with the from state
    job = db.session.query(TrainArchiveJob).filter_by(state=JobState.JOB_SUBMITTED).first()
    if job is not None:
        update_job_state(job, JobState.TRAIN_BEING_CREATED)
        dockerfile = os.path.abspath(os.path.join(app.instance_path, 'Dockerfile'))

        # Add the Dockerfile to the archive
        with tarfile.open(job.filepath, 'a') as tar:
            tar.add(dockerfile, arcname='Dockerfile')

            # Build Docker container from tar file
        with open(job.filepath, 'r') as f:
            repository = '{}/{}:START'.format('test1', 'test2')
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
    func=create_train,
    trigger=IntervalTrigger(seconds=3),
    id='load',
    name='Loads the content from the submitted archive file',
    replace_existing=True)

if __name__ == '__main__':
    app.run(port=6007, host='0.0.0.0')


