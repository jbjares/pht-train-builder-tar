from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from JobState import JobState
from flask import request
from flask import jsonify
import os
from sqlalchemy.orm.attributes import flag_modified
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import atexit
import tempfile
import zipfile
import shutil
import docker


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/test.db'
db = SQLAlchemy(app)

UPLOAD_FOLDER = '/tmp/archive_files'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


# Start the AP Scheduler
scheduler = BackgroundScheduler()
scheduler.start()
atexit.register(lambda: scheduler.shutdown())


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

    # Algorithm (Entrypoint) of the train, stored as LargeBinary)
    algorithm_content = db.Column(db.LargeBinary)

    # Metadata of the train, stored as LargeBinary
    metadata_content = db.Column(db.LargeBinary)

    # Query of the train, stored as LargeBinary
    query_content = db.Column(db.LargeBinary)

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


# Ensure that the database table exists before making the first request
@app.before_first_request
def create_db():
    db.drop_all()
    db.create_all()


def validate_train_submission_record(json):
    return 'trainID' in json and 'registry' in json


def response(body, status_code):
    resp = jsonify(body)
    resp.status_code = status_code
    return resp


# Create a new job for being processed
@app.route('/job', methods=['POST'])
def create_job():
    json_body = request.get_json(force=True)

    if not validate_train_submission_record(json_body):
        return response({'success': 'false'}, status_code=400)

    # Add the new job to the database
    job = TrainArchiveJob.from_kws(json_body)

    # TODO Fail if the database already contains such a job

    db.session.add(job)
    db.session.commit()
    return response({'success': 'true', 'upload_id': job.trainID}, status_code=200)


@app.route('/job', methods=['GET'])
def get_job():
    resp = jsonify([x.serialize() for x in TrainArchiveJob.query.all()])
    resp.status_code = 200
    return resp


# Upload file for a particular job
@app.route('/job/<uuid>', methods=['POST'])
def upload_file(uuid):

    # Check if the object with the trainID
    job = db.session.query(TrainArchiveJob).filter_by(trainID=uuid).scalar()

    # Return 404 if the job with the URL cannot be found
    if job is None:
        return response({'success': 'true'}, status_code=404)

    if 'file' not in request.files:
        return response({'success': 'true'}, 400)
    file = request.files['file']

    # Create the upload directory if it does not already exist
    if not os.path.exists(UPLOAD_FOLDER):
        os.mkdir(UPLOAD_FOLDER)

    # Save the file to the upload directory
    filepath = os.path.join(UPLOAD_FOLDER, job.trainID)
    file.save(filepath)
    job.filepath = filepath
    update_job_state(job, JobState.FILE_UPLOAD_COMPLETED)
    return response({'success': 'true'}, status_code=200)


# Define the background jobs

def work_on_job(from_state, via_state, to_state, worker_function):

    # Find all jobs with the from state
    job = db.session.query(TrainArchiveJob).filter_by(state=from_state).first()
    if job is not None:
        update_job_state(job, via_state)

        # Use the worker to work on the job
        result = worker_function(job)

        # Update job state again to state or to to error
        if result != 0:
            update_job_state(job, JobState.ERROR)
        else:
            update_job_state(job, to_state)


def load(job: TrainArchiveJob):

    # Create a temporary directory to load the files into
    tmp_dir = tempfile.mkdtemp()
    with zipfile.ZipFile(job.filepath, 'r') as zip_ref:
        zip_ref.extractall(tmp_dir)

    # Filenames
    metadata = "metadata.rdf"
    query = "query.sparql"
    algorithm = "algorithm.py"

    # Traverse the directory recursively
    container_files = dict()
    for dirpath, _, filenames in os.walk(tmp_dir):
        for f in filenames:
            abs_path = os.path.abspath(os.path.join(dirpath, f))
            if f == metadata:
                container_files[metadata] = abs_path
            elif f == query:
                container_files[query] = abs_path
            else:
                container_files[algorithm] = abs_path
            if len(container_files) > 2:
                break
        if len(container_files) > 2:
            break
    if len(container_files) > 3 \
            or metadata not in container_files \
            or query not in container_files \
            or algorithm not in container_files:
        return 1

    with open(container_files[metadata], 'rb') as f:
        job.metadata_content = f.read()
    with open(container_files[query], 'rb') as f:
        job.query_content = f.read()
    with open(container_files[algorithm], 'rb') as f:
        job.algorithm_content = f.read()
    shutil.rmtree(tmp_dir)
    return 0


def create_container(job: TrainArchiveJob):
    tmp_dir = tempfile.mkdtemp()

    # Filenames
    metadata = "metadata.rdf"
    query = "query.sparql"
    algorithm = "algorithm"

    with open(os.path.join(tmp_dir, metadata), 'wb') as f:
        f.write(job.metadata_content)

    with open(os.path.join(tmp_dir, query), 'wb') as f:
        f.write(job.query_content)

    with open(os.path.join(tmp_dir, algorithm), 'wb') as f:
        f.write(job.algorithm_content)

    dockerfile = os.path.join(tmp_dir, 'Dockerfile')
    shutil.copyfile(
        os.path.join(app.instance_path, 'Dockerfile'),
        dockerfile
    )
    client = docker.from_env()
    client.images.build(
        path=os.path.dirname(dockerfile),
        rm=True,
        tag='{}:init'.format(job.trainID))

    return 0


# Register Job for loading the images
scheduler.add_job(
    func=lambda: work_on_job(
            JobState.FILE_UPLOAD_COMPLETED,
            JobState.CONTAINER_FILES_BEING_EXTRACTED,
            JobState.CONTAINER_FILES_CREATED,
            load),
    trigger=IntervalTrigger(seconds=2),
    id='load',
    name='Loads the content from the submitted archive file',
    replace_existing=True)


# Register Job for loading the images
scheduler.add_job(
    func=lambda: work_on_job(
            JobState.CONTAINER_FILES_CREATED,
            JobState.DOCKER_IMAGE_BEING_CREATED,
            JobState.DOCKER_IMAGE_PUSHED,
            create_container),
    trigger=IntervalTrigger(seconds=2),
    id='create_image',
    name='Create Docker Image',
    replace_existing=True)


if __name__ == '__main__':
    app.run()
