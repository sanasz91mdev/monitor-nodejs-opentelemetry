/* monitoring.js */
'use strict';

const { MeterProvider, ConsoleMetricExporter } = require('@opentelemetry/metrics');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
const Registry = client.Registry;
const register = new Registry();
module.exports.register = register;
collectDefaultMetrics({ register });


const meter = new MeterProvider({
  exporter: new PrometheusExporter(
    {
      startServer: true,
      port: 8081
    },
    () => {
      console.log("prometheus scrape endpoint: http://localhost:"
        + "8081"
        + "/metrics");
    }
  )
}).getMeter('prometheus');

const requestCount = meter.createCounter("requests", {
  description: "Count all incoming requests"
});


const tester = meter.createValueRecorder('tester', {
  description: 'test span of req processing',
  boundaries: [0.1, 0.2, 0.3, 0.5, 1, 1.1, 1.2, 1.8, 1.9]
});


var histogramSpan = new client.Histogram({
  name: 'histo_tester_prom',
  help: 'histo_tester_prom',
  buckets: [0.1, 0.2, 0.3, 0.5, 1, 1.1, 1.2, 1.8, 1.9],
});

const errorsTotal = new client.Counter({
  name: 'errors_total',
  help: 'Total number of ERRORS in route',
  labelNames: ['api_error_count']
});


register.registerMetric(errorsTotal);
register.registerMetric(histogramSpan);


const boundInstruments = new Map();

module.exports.countAllRequests = () => {
  return (req, res, next) => {
    if (!boundInstruments.has(req.path)) {
      const labels = { route: req.path };
      const boundCounter = requestCount.bind(labels);
      boundInstruments.set(req.path, boundCounter);
    }

    boundInstruments.get(req.path).add(1);
    next();
  };
};


module.exports.incrementReqInErrorCount = () => {
  errorsTotal.inc({
    api_error_count: "Health Errors"
  });
}

module.exports.recordSpan = (value) => {
  console.log('recording span ' + value)
  tester.record(value);
  histogramSpan.observe(value);
}