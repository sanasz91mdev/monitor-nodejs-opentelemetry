const openTelemetry = require('@opentelemetry/api');


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
        var ctx = openTelemetry.trace.setSpan(openTelemetry.context.active(), current_span);
        return ctx;
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

    setDBAttributes= (query,op)=>{
        return {
            "db.system":"oracle",
            "db.statement":query,
            "db.operation": op
        }
    }

    validate = () => {
        if (!this.span) {
            throw "No Span exists to set attributes to.";
        }
    }
}
