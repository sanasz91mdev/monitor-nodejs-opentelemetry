const promClient = require('prom-client');
let register = new promClient.Registry();

class Monitor {
    constructor() {
    }

    init(appName) {
        register.setDefaultLabels({
            app: appName
        });
        promClient.collectDefaultMetrics({ register });
    }

    getRegistry() {
        return register;
    }

    getClient() {
        return promClient;
    }

    registerMetric(metric) {
        register.registerMetric(metric);
    }

}

var Monitor_ = new Monitor();
module.exports = Monitor_;