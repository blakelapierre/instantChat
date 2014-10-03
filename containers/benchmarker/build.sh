#!/bin/bash

rm -rf app
mkdir app
cp -r ../../services/benchmarker/node_modules ./app
cp -r ../../services/benchmarker/dist ./app

sudo docker build -t instantchat/benchmarker .
sudo docker push instantchat/benchmarker