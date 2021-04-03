FROM node:alpine

# ensure latest npm
RUN npm install -g npm@7.8.0

RUN mkdir -p /var/lib/wvr

ADD . /var/lib/wvr

# install
RUN cd /var/lib/wvr && \
#    npm update && \
    npm i

EXPOSE 3000

WORKDIR /var/lib/wvr

CMD ["npm","start"]