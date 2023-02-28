const { MeterProvider } = require('@opentelemetry/sdk-metrics-base');
const { OTLPMetricExporter } =  require('@opentelemetry/exporter-metrics-otlp-grpc');

const collectorOptions = {
  // url is optional and can be omitted - default is grpc://localhost:4317
  url: 'grpc://localhost:4317'
};
const exporter = new OTLPMetricExporter(collectorOptions);

// Register the exporter
const meter = new MeterProvider({
  name: "some-service",
  exporter,
  interval: 60000,
}).getMeter('example-meter');


const counter = meter.createCounter('morty_suit_1000');
counter.add(15, { 'key': 'value', 'service_name': "MetricsTest001" });

const requestCount = meter.createCounter("jn_status_check_count", {
  description: "Count all incoming requests"
});
console.log(meter)

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

