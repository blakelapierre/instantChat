FROM node

ENV PORT 9337

EXPOSE 9337

RUN npm install -g traceur

RUN git clone https://github.com/blakelapierre/instantChat
RUN cd instantChat
RUN git checkout feature/broadcast
RUN cd services/kvs
RUN npm install
