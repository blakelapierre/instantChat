#!/bin/bash

rm -rf app
mkdir app
cp -r ../../site/bower_components ./app
cp -r ../../site/node_modules ./app
cp -r ../../site/dist ./app

sudo docker build -t instantchat/site .
sudo docker push instantchat/site

rm -rf app