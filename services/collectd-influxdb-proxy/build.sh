#!/bin/bash

docker build -t instantchat/collectd-influxdb-proxy ./

docker push instantchat/collectd-influxdb-proxy