import requests
import sys


class TrainOfficeClient:

    def __init__(self, uri):
        self.uri = uri[:-1] if uri.endswith("/") else uri
        self.route_train = self.uri + "/train"

    @staticmethod
    def _train_id():
        return "trainID"

    def create_train(self):
        return requests.post(self.route_train).json()[TrainOfficeClient._train_id()]

    def get_uri(self):
        return self.uri

    def get_all_trains(self):
        resp = requests.get(self.route_train).json()
        return [x[TrainOfficeClient._train_id()] for x in resp]

    # Train Route of the train office
    def get_route_train(self):
        return self.route_train
