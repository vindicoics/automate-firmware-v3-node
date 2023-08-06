#!/bin/bash
# export HOST_IP=$(hostname -I | cut -d' ' -f1)
# sudo docker-compose up

# Retrieve the IP address of the host
HOST_IP=$(hostname -I | awk '{print $1}')
export HOST_IP
echo ${HOST_IP}
# # Export the host IP address as an environment variable
# export HOST_IP

sudo docker image prune -f

# # Run docker-compose with the provided IP address
sudo HOST_IP=$HOST_IP docker-compose up -d