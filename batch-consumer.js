'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Logger = require("../local_modules/logger");
const logger_ = Logger.Logger_;
logger_.initialize('batchProcessor');
let msgpk = require('msgpack-lite');
const trace = require('../local_modules/tracing');
trace.start("BATCH-PROCESSOR");
const redisReader = require('../local_modules/redisreader').RedisReader_;
const redisWriter = require('../local_modules/rediswriter').RedisWriter_;
let SpanLib = require("../local_modules/span");
const { context } = require("@opentelemetry/api");

var args = [];
let instanceID = '';
let streamName = "BATCH";
if (!process.env.NODE_APP_INSTANCE) {
    if (process.argv.length != 3) {
        console.log("Usage : <instanceID>\r\nHint: consumerName: stream+instanceID");
        process.exit(1);
    }
    else {
        args = process.argv.slice(2);
        instanceID = args[0];
    }
}
else {
    instanceID = process.env.NODE_APP_INSTANCE;
}
let stationID = "";

let groupName = streamName + "GROUP";
let consumerName = stationID + streamName + instanceID;
console.log(`instanceID ${instanceID} , streamName ${streamName}`);
redisReader.on("connected", function () {
    redisReader.setupGroup(streamName, groupName, consumerName);
});
redisReader.on("read", function (data, type) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Message received from stream");
        console.log(`Type is ${type}`);
        try {
            if (data) {
                let schema = msgpk.decode(data);
                console.log(`Data for Batch Processing: ${JSON.stringify(schema)}`);

                var mySpan = new SpanLib("BATCH-PROCESSOR-PROCESS");
                console.log(`starting span 1`);

                //extract parent context . pass entire message in which injection was done via msg publisher.
                var ctx = mySpan.extractAndGetContext(schema);

                //start span by passing extracted context above
                mySpan.start("reprocess-batch", ctx);
                console.log(`starting span 2`);

                //start another span, pass context of mySpan. Everything is well linked.
                var mySpan2 = new SpanLib("BATCH-PROCESSOR-PROCESS");
                mySpan2.start("reprocess-batch2", mySpan.getContextForChildSpan());

                console.log(`Ending span 2`);
                mySpan2.stop();

                console.log(`Ending span 1`);
                mySpan.stop();

                console.log(`Batch - [X] stage called with BATCH_ID [${schema.BATCH_ID}]`);
                console.log("Batch - [X] stage ended.");
            }
            else {
                console.error(`No data received`);
            }
        }
        catch (error) {
            console.log(`Failed processing batch ${error}`);
            console.log(String(error));
        }
    });
});

redisReader.on("error", function (error) {
    console.log(error);
});
redisReader.on("readerror", function (error) {
    console.log(error);
});

redisReader.connect();
redisWriter.connect();
