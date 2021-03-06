import requests


class TrainRouterClient:

    def __init__(self, uri):
        self.uri = uri[:-1] if uri.endswith("/") else uri
        self.route_train = self.uri + "/train"
        self.route_route = self.uri + "/route"
        self.route_node = self.uri + "/node"

    def get_uri(self):
        return self.uri

    def get_all_routes(self, train_id):
        return requests.get(self.route_train + "/" + str(train_id)).json()

    # Train Route of the train office
    def get_route_train(self):
        return self.route_train

    def get_route_route(self):
        return self.route_route

    def get_route_node(self):
        return self.route_node

    def get_node_info(self, node_id):
        return requests.get(self.route_node + "?id={}".format(node_id))
