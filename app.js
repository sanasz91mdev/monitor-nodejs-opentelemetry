const express = require("express");
//import tracing reference
const trace = require('./tracing');
trace.start("SAMPLE-SERVICE");
//import monitoring
const appMonitor = require("./monitoring");
appMonitor.init("SAMPLE-SERVICE");
const PORT = process.env.PORT || "8080";
const app = express();
const { work } = require('./work');
var ip = require("ip");

let monitoringClient = appMonitor.getClient();


const httpRequestDurationSeconds = new monitoringClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10] // 0.1 to 10 seconds
});
const errorsTotal = new monitoringClient.Counter({
  name: 'errors_total',
  help: 'Total number of ERRORS in route',
  labelNames: ['api_error_count', 'route']
});


const routesTotal = new monitoringClient.Counter({
  name: 'request_count_total',
  help: 'Total number of requests on server',
  labelNames: ['route']
});

appMonitor.registerMetric(httpRequestDurationSeconds);
appMonitor.registerMetric(errorsTotal);
appMonitor.registerMetric(routesTotal);



// Add this to the VERY top of the first file loaded in your app
// var apm = require('elastic-apm-node').start({

//   // Override the service name from package.json
//   // Allowed characters: a-z, A-Z, 0-9, -, _, and space
//   serviceName: 'new-service',

//   // Use if APM Server requires a secret token
//   secretToken: 'pHEIKVYnyFpe9Rq1kQ',

//   // Set the custom APM Server URL (default: http://localhost:8200)
//   serverUrl: 'https://my-deployment-97901c.apm.us-central1.gcp.cloud.es.io',

//   // Set the service environment
//   environment: 'production'
//   })

app.get("/", (req, res) => {
  res.send("Hello World");
});


app.get("/work", async (req, res) => {
  var stopCallBack = httpRequestDurationSeconds.startTimer();
  let url = req.originalUrl.split("/").pop();
  routesTotal.inc({
    route: `/${url}`
  });
  // refer this to implement tracing using span.js
  await work(req);
  var json = {
    "status": "OK",
    "timeStamp": new Date().toISOString()
  }
  res.header("Content-Type", "application/json")
  res.send(json);
  stopCallBack({route:url,method:req.method,code:200});

});

app.get("/metrics", async (req, res) => {
  let url = req.originalUrl.split("/").pop();
  routesTotal.inc({
    route: `/${url}`
  });
  // Return all metrics the Prometheus exposition format
  // res.setHeader('Content-Type', register.contentType)
  // var metrics = await register.metrics();
  // res.end(metrics);

  let register = appMonitor.getRegistry();
  res.setHeader('Content-Type', register.contentType);
  var metrics = await register.metrics();
  res.end(metrics);


});

app.get("/health", async (req, res) => {
  var stopCallBack = httpRequestDurationSeconds.startTimer();

  let url = req.originalUrl.split("/").pop();
  routesTotal.inc({
    route: `/${url}`
  });
  // return an error 1% of the time
  var num = Math.floor(Math.random() * 100);
  if ((num) % 2 == 0) {
    //throw new Error('Internal Error');
    var json = {
      "status": "NOT OK",
      "timeStamp": new Date().toISOString(),
      "num": num
    }
    errorsTotal.inc({
      api_error_count: `/${url} Errors`,
      route: `/${url}`
    });
    stopCallBack({route:url,method:req.method,code:500});
    res.header("Content-Type", "application/json");
    res.status(500).send(json);
  }
  else {
    await work(req);
    var json = {
      "status": "OK",
      "timeStamp": new Date().toISOString(),
      "num": num
    }
    stopCallBack({route:url,method:req.method,code:200});
    res.header("Content-Type", "application/json")
    res.send(json);
  }
});






app.listen(parseInt(PORT, 10), () => {
  console.log(`Listening for requests on http://${ip.address()}:${PORT}`);
});

