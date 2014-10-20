#!/bin/bash

rm -rf app
mkdir app
mkdir app/node_modules

cp -r ../../services/benchmarker/node_modules/node-etcd ../../services/benchmarker/node_modules/lodash ../../services/benchmarker/node_modules/express ../../services/benchmarker/node_modules/socket.io ../../services/benchmarker/node_modules/traceur-runtime ./app/node_modules/
cp -r ../../services/benchmarker/dist ./app

sudo docker build -t instantchat/benchmarker .
sudo docker push instantchat/benchmarker