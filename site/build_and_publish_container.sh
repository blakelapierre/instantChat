#!/bin/bash

#grunt build

cd container
rm -rf app
mkdir app
mkdir app/node_modules
mkdir app/bower_components

cp -r ../node_modules ./app/node_modules
cp -r ../bower_components ./app/bower_components
cp -r ../dist ./app

sudo docker build -t instantchat/site .
#sudo docker push instantchat/site