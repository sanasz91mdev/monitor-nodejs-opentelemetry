const opentelemetry = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { OTLPTraceExporter } = require('@opentelemetry/exporter-otlp-http');

const collectorOptions = {
  url: 'https://my-deployment-97901c.apm.us-central1.gcp.cloud.es.io', // url is optional and can be omitted - default is http://localhost:55681/v1/traces
  headers: {}, // an optional object containing custom headers to be sent with each request
  concurrencyLimit: 10, // an optional limit on pending requests
};

const exporter1 = new OTLPTraceExporter(collectorOptions);
//console.log(exporter1.getDefaultUrl());


var exporter = new JaegerExporter();
 function start(appName) {
    const sdk = new opentelemetry.NodeSDK({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: appName,
        }),
        traceExporter: exporter1,
        spanProcessor: new SimpleSpanProcessor(exporter1),
        instrumentations: [getNodeAutoInstrumentations()]
    });
    sdk.start();
}

module.exports = {start}
