FROM instantchat/base

RUN apt-get update
RUN apt-get install -y bison flex libgcrypt-dev rrdtool

RUN git clone https://github.com/collectd/collectd
RUN cd collectd && git checkout collectd-5.4 && ./build.sh && ./configure && make && make install

ADD ./collectd.conf.runme ./collectd.conf.runme
ADD ./run.sh ./run.sh

ENTRYPOINT ["./run.sh"]