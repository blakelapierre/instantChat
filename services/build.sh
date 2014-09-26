#!/bin/bash

(cd base; ./build.sh)
(cd broadcaster; ./build.sh)
(cd collectd; ./build.sh)
(cd collectd-influxdb-proxy; ./build.sh)