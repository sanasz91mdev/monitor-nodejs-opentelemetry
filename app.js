const express = require("express");
//import tracing reference
const trace = require('./tracing');
trace.start("SAMPLE-SERVICE");
const PORT = process.env.PORT || "8080";
const app = express();
const { countAllRequests, incrementReqInErrorCount, register } = require("./monitoring");
const { work } = require('./work');
var ip = require("ip");
app.use(countAllRequests());


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
    incrementReqInErrorCount();
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

