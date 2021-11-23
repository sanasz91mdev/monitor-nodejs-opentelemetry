let SpanLib = require("./span");

module.exports.work = async (req) => {
  // Create a span. A span must be closed.
  var span = new SpanLib("work-tracer")
  span.start('work span');
  for (let i = 0; i < 1; i += 1) {
    await doWork(span); //pass span if exists
  }
  // Be sure to end the span.

  span.setStatus(true, "Operation completed successfully");
  //Attach any attributes with span
  var spanAttr = {
    "BATCH_ID": "1234567890",
    "instId": "234",
    "type": "some"
  };
  span.setAttributes(spanAttr);
  // when implementing instrumentation / or dont have instance of currently active span/trace ..
  await doWorkWithoutPassingParentSpan(); 
  span.stop();

}

async function doWork(parentSpan) {
  await sleep(1000); // sleep for 1 second
  doMoreWork(parentSpan);
}

async function doMoreWork(parentSpan){

  var span = new SpanLib("work-tracer");
  //When parent span exists, use parent span's context to create a child span.
  span.start('span-child',parentSpan.getContextForChildSpan());
  await sleep(1000); // sleep for 10 seconds
  span.setStatus(true, "Child Operation completed successfully");
  var spanAttr = {
    "BATCH_ID": "1234567890",
    "instId": "234",
    "type": "some",
    "more":"childEvent"
  };
  span.attachEvent("child span event3");
  span.attachEvent("child span event2");
  span.attachEvent("child span event1");
  span.setAttributes(spanAttr);
  span.stop();
}

async function doWorkWithoutPassingParentSpan(){
  var span = new SpanLib("work-tracer");
  // when implementing instrumentation / or dont have instance of currently active span/trace ..
  span.start('span-child2',span.getContextFromCurrentActiveRequest());
  await sleep(500); // sleep for 500 milliseconds
  span.setStatus(true, "Child 2 operation succeeded");
  span.attachEvent("closing child span");
  span.stop();
}


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
