const opentelemetry = require('@opentelemetry/api');
const { Span } = require('@opentelemetry/sdk-trace-base');
const tracer = opentelemetry.trace.getTracer('example-basic-tracer-node');
const { recordSpan } = require("./monitoring");


module.exports.work = async (req) => {
    // Create a span. A span must be closed.
    console.log("starting span...");
    var parentSpan = tracer.startSpan('work span');
    for (let i = 0; i < 1; i += 1) {
        await doWork(parentSpan);
    }
    // Be sure to end the span.
    parentSpan.setStatus({
      code: opentelemetry.SpanStatusCode.OK,
      message: 'OK'
    })
    parentSpan.end();
    console.log("===========================parentSpan================");
    var duration = parentSpan.duration[0] + (parentSpan.duration[1]/1000000000);
    console.log(duration);
    recordSpan(duration);
    console.log("~====END=======================parentSpan================");
}

async function doWork() {
    console.log("work...")
    // simulate some random work.
    // for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
    // }

    await sleep(210); // sleep for 10 seconds
    //await delay(1000);

}

  
  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  