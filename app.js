const express = require("express");
//import tracing reference
const trace = require('./tracing');
trace.start("SAMPLE-SERVICE");
const PORT = process.env.PORT || "8080";
const app = express();
const { work } = require('./work');
var ip = require("ip");



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

  // refer this to implement tracing using span.js
    await work(req);
    var json = {
      "status": "OK",
      "timeStamp": new Date().toISOString()
    }
    res.header("Content-Type", "application/json")
    res.send(json);

});

app.get("/metrics", async (req, res) => {
  // Return all metrics the Prometheus exposition format
  res.setHeader('Content-Type', register.contentType)
  var metrics = await register.metrics();
  res.end(metrics);
});

app.get("/health", async (req, res) => {

  // return an error 1% of the time
  var num = Math.floor(Math.random() * 100);
  if ((num)%2==0) {
    //throw new Error('Internal Error');
    var json = {
      "status": "NOT OK",
      "timeStamp": new Date().toISOString(),
      "num": num
    }
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
    res.header("Content-Type", "application/json")
    res.send(json);
  }
});






app.listen(parseInt(PORT, 10), () => {
  console.log(`Listening for requests on http://${ip.address()}:${PORT}`);
});

