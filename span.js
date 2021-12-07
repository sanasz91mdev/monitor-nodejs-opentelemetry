const openTelemetry = require('@opentelemetry/api');
const { propagation, ROOT_CONTEXT } = require('@opentelemetry/api');


module.exports = class Span {

    constructor(libName) {
        this.tracer = openTelemetry.trace.getTracer(libName);
        this.span = {};
    }

    start = (spanName, context) => {
        if (!spanName) {
            throw "Span name cannot be empty.";
        }
        var appSpan = {};
        if (context == undefined) {
            appSpan = this.tracer.startSpan(spanName);
        }
        else {
            appSpan = this.tracer.startSpan(spanName, undefined, context);
        }
        this.span = appSpan;
    }

    setAttributes = (attributes) => {
        if (!attributes || attributes.length < 1) {
            throw "No attributes provided to set";
        }

        this.validate();

        Object.keys(attributes).forEach(key => {
            this.span.setAttribute(key, attributes[key]);
        });
    }

    setStatus = (isSuccess, message) => {
        this.span.setStatus({
            code: isSuccess == true ? openTelemetry.SpanStatusCode.OK : openTelemetry.SpanStatusCode.ERROR,
            message: message
        })
    }

    attachEvent = (eventName) => {
        this.span.addEvent(eventName);
    }

    getDuration = () => {
        console.log(this.span.duration);
        return this.span.duration;
    }

    getContextForChildSpan = () => {
        const ctx = openTelemetry.trace.setSpan(openTelemetry.context.active(), this.span);
        return ctx;
    }

    getContextFromCurrentActiveRequest = () => {
        let current_span = openTelemetry.trace.getSpan(openTelemetry.context.active());
        let trace_id = current_span?.spanContext()?.traceId;
        console.log(trace_id);
        var ctx = openTelemetry.trace.setSpan(openTelemetry.context.active(), current_span);
        return ctx;
    }

    //use for communication across processes that uses publisher-consumer model i.e. queues/streams -- see batch-consumer.js for sample
    injectMessageWithContext = (message, activeContext) => {
        var ctx = activeContext;

        if (activeContext == undefined) {
            if (this.span == undefined) {
                throw "Span instance is required to inject context. start a span 1st before calling function: injectMessageWithContext()."
            }
            else {
                ctx = openTelemetry.trace.setSpan(openTelemetry.context.active(), this.span);
            }
        }
        console.log(`Injecting ...`);
        propagation.inject(ctx, message);
        console.log(msg);
    }


    //use for communication across processes that uses publisher-consumer model i.e. queues/streams -- see batch-consumer.js for sample
    extractAndGetContext = (message) => {
        console.log(`Extracting ...`);
        const ctx = propagation.extract(ROOT_CONTEXT, message);
        return ctx
    }


    attachEvent = (eventName, attributes) => {
        var date = new Date().toISOString();
        if (attributes == null || Object.keys(attributes).length < 1) {
            attributes = {};
        }
        attributes["time"] = date
        this.span.addEvent(eventName, attributes);
    }

    stop = () => {
        this.validate();
        this.span.end();
    }

    setDBAttributes = (query, op) => {
        return {
            "db.system": "oracle",
            "db.statement": query,
            "db.operation": op
        }
    }

    validate = () => {
        if (!this.span) {
            throw "No Span exists to set attributes to.";
        }
    }
}
