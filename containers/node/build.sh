#!/bin/bash

NODE_VERSION=v0.10.32
NODE_ARCHIVE=node-$NODE_VERSION-linux-x64.tar.gz
NODE_DIRECTORY=node-$NODE_VERSION-linux-x64

if [ ! -f node-v0.10.32-linux-x64.tar.gz ]; then
  wget http://nodejs.org/dist/$NODE_VERSION/$NODE_ARCHIVE
fi

cat >Dockerfile <<EOF
FROM instantchat/base

ADD http://nodejs.org/dist/$NODE_VERSION/$NODE_ARCHIVE node.tar.gz

RUN tar -xvf node.tar.gz
EOF

docker build -t instantchat/node .

docker push instantchat/node

#rm -rf node