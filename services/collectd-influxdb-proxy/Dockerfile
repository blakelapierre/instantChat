FROM node:0.10.31

EXPOSE 8079

ENV DB_HOST collectd-influxdb-proxy
ENV DB_PORT 8086
ENV DB_DB collectd
ENV DB_USER root
ENV DB_PASSWORD root

RUN git clone https://github.com/bpaquet/collectd-influxdb-proxy.git
RUN cd collectd-influxdb-proxy && npm install


CMD cd collectd-influxdb-proxy && node proxy.js --influxdb_host $DB_HOST --influxdb_port $DB_PORT --influxdb_db $DB_DB --influxdb_user $DB_USER --influxdb_password $DB_PASSWORD --proxy_http_address 127.0.0.1
