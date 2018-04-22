#!/bin/bash
export EUREKA_SERVICE_URL=http://localhost:8761/eureka
export EUREKA_INSTANCE_HOSTNAME=train-builder-tar
export EUREKA_INSTANCE_PORT=6007
export URI_STATION_SERVICE=http://localhost:6006/station

# Configuration Items are
#SERVICE_NAME = Service name is used as the application ID towards Eureka
#EUREKA_SERVICE_URL= The Eureka service endpoint used for registration
#EUREKA_SERVICE_PATH = The path of eureka service end point. Default to eureka/apps
#EUREKA_INSTANCE_HOSTNAME = The hostname used for registration on eureka.
#EUREKA_INSTANCE_PORT = The port number used for the instance
#EUREKA_HEARTBEAT = Number of seconds used for updating registration status towards Eureka. Default is 90 seconds

