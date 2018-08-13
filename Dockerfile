FROM phusion/baseimage

RUN apt-get update; apt-get -y upgrade
RUN apt-get install -y build-essential git-core curl imagemagick

## install Node
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash
RUN apt-get install -y nodejs
RUN apt-get autoclean -y; apt-get autoremove -y

RUN mkdir -p /resizer
RUN mkdir -p /resizer/tmp
WORKDIR /resizer

COPY package.json .
COPY index.js .

RUN npm install --package-lock
CMD ["node", "index.js"]