const opentelemetry = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");

var exporter = new JaegerExporter();
 function start(appName) {
    const sdk = new opentelemetry.NodeSDK({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: appName,
        }),
        traceExporter: exporter,
        spanProcessor: new SimpleSpanProcessor(exporter),
        instrumentations: [getNodeAutoInstrumentations()]
    });
    sdk.start();
}

module.exports = {start}
