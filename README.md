# monitor-nodejs-opentelemetry
monitor-nodejs-opentelemetry

#Run on CLI

node app.js

#Run with docker

docker build . -t sana/opentelem-test

docker run --name prom -p 9090:9090 -v ${PWD}/prometheus.yml:/etc/prometheus/prometheus.yml prom/prometheus  --config.file=/etc/prometheus/prometheus.yml

docker run -d --name grafana --link prom -p 3000:3000 --volume "$PWD/data:/var/lib/grafana"  grafana/grafana

docker run -p 4916:8080 -p 4917:8081 --name nodeapp --link prom -d sana/opentelem-test
