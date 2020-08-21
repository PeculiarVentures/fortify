# This is for developing in a containerized environment

FROM node:lts

RUN mkdir /fortify
COPY ./package.json /fortify
COPY .package-lock.json /fortify
WORKDIR /fortify

RUN npm install

COPY . /fortify
WORKDIR /fortify

RUN npm run build

CMD npm start
