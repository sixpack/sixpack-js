FROM node:14

ENV wdir /app
RUN mkdir -p ${wdir}
WORKDIR ${wdir}

COPY . ${wdir}/
RUN yarn install --frozen-lockfile
