#!/bin/bash

docker build -t instantchat/collectd ./

docker push instantchat/collectd