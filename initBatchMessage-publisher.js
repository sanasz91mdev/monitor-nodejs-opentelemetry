"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger = require("../local_modules/logger");
const logger_ = Logger.Logger_;
const trace = require('../local_modules/tracing');
trace.start("pro1");
let SpanLib = require("../local_modules/span");

logger_.initialize('testBatch');
const testRedisStream = require('../local_modules/rediswriter').RedisWriter_;
const msgpk = require("msgpack-lite");
testRedisStream.connect();
testRedisStream.on("connected", function () {

    //start a span
    var span = new SpanLib("test-script-tracer");
    parentSpan.start("testspan-1");

    //start child span by passing context of parent span: spparentSpann
    var childSpan = new SpanLib("test-script-tracer");
    var activeCtx = parentSpan.getContextForChildSpan();
    childSpan.start("testspan-2", activeCtx);

    let processMessage = {};
    processMessage["BATCH_ID"] = "INTR-99593940478053";
    processMessage["FUNCTION"] = "reprocess";

    //inject active context into message that will be published to another process via streams.
    childSpan.injectMessageWithContext(processMessage, activeCtx);

    console.log(JSON.stringify(processMessage));

    let binaryMessage = msgpk.encode(processMessage);

    //write message to streams
    testRedisStream.client.xadd(['BATCH', '*', 'message', new Buffer(binaryMessage), 'function', 'parse'], function (err) {
        if (err) {
            logger_.logError("Error adding data : " + err);
        }
        logger_.logInfo(`Message written successfully on stream`);
    }); childSpan.stop();

    parentSpan.stop();
});
testRedisStream.on("error", function (error) {
    logger_.logDebug(error);
});
