FROM node

ENV PORT 9337

EXPOSE 9337

RUN npm install -g traceur

RUN git clone https://github.com/blakelapierre/instantChat
RUN cd instantChat/services/kvs && git checkout feature/broadcast && npm install
