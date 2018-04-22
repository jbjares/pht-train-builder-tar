from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask import request
from flask import render_template
from flask import jsonify
from sqlalchemy.orm.attributes import flag_modified
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import atexit
import tarfile
import docker
import enum
import os


# CONSTANTS
GET = 'GET'


class JobState(enum.Enum):
    """
    Represents the states a TrainBuilderArchive job traverses.
    """
    CREATED = "CREATED"
    TAR_UPLOADED = "FILE_UPLOADED"
    TRAIN_BEING_CREATED = "TRAIN_BEING_CREATED"
    TRAIN_SUBMITTED = "TRAIN_SUBMITTED"


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/jobs.db'
db = SQLAlchemy(app)

UPLOAD_FOLDER = '/data/archive_files'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Init Docker client
docker_client = docker.DockerClient(base_url='unix://var/run/docker.sock')


# Get the Registry and the station-service urls from environ
URI_STATION_SERVICE = os.environ['URI_STATION_SERVICE']


@app.before_first_request
def setup_database():
    db.create_all()

class TrainArchiveJob(db.Model):

    # Regular primary key
    id = db.Column(db.Integer, primary_key=True)

    # Id of the train (from the TrainSubmissionRecord)
    trainID = db.Column(db.String(80), unique=True, nullable=False)

    # Docker Registry URI (from the TrainSubmissionRecord)
    registry_uri = db.Column(db.String(80), unique=True, nullable=False)

    # Path to the zip File
    filepath = db.Column(db.String(80), unique=True, nullable=True)

    # State of this archive job
    state = db.Column(db.Enum(JobState))

    def serialize(self):
        return {
            'id': self.id,
            'trainID': self.trainID,
            'registry_uri': self.registry_uri,
            'filepath': self.filepath,
            'state': str(self.state)
        }

    @classmethod
    def from_kws(cls, kws):
        return TrainArchiveJob(trainID=kws['trainID'], registry_uri=kws['registry'], state=JobState.CREATED)


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


@app.route("/", methods=[GET])
def index():
    return render_template('index.html', URI_STATION_SERVICE=URI_STATION_SERVICE)


@app.route('/job', methods=[GET])
def get_job():
    resp = jsonify([x.serialize() for x in TrainArchiveJob.query.all()])
    resp.status_code = 200
    return resp


# Upload file for a particular job
@app.route('/upload', methods=['POST'])
def upload():

    trainname = request.form['trainname']
    trainfile = request.form['trainfile']


    return response({'success': 'true'}, status_code=200)


# Define the background jobs
def create_train():
    
    setup_database()
    # Find all jobs with the from state
    job = db.session.query(TrainArchiveJob).filter_by(state=JobState.TAR_UPLOADED).first()
    if job is not None:
        update_job_state(job, JobState.TRAIN_BEING_CREATED)
        dockerfile = os.path.abspath(os.path.join(app.instance_path, 'Dockerfile'))
        with tarfile.open(job.filepath, 'a') as tar:
            tar.add(dockerfile, arcname='Dockerfile')

        # Build Docker container from tar file
        with open(job.filepath, 'r') as f:
            repository = '{}/{}:START'.format(job.registry_uri, job.trainID)
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


