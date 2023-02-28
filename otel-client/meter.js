const { MeterProvider } = require('@opentelemetry/sdk-metrics-base');
const { OTLPMetricExporter } =  require('@opentelemetry/exporter-metrics-otlp-grpc');

const MetricHandler = (name) => {

  const collectorOptions = {
    // url is optional and can be omitted - default is grpc://localhost:4317
    url: 'grpc://localhost:4317'
  };
  const exporter = new OTLPMetricExporter(collectorOptions);

  // Register the exporter
  const meter = new MeterProvider({
    exporter,
    interval: 60000,
  }).getMeter(`${name}-meter`);

  return meter;
}

module.exports = MetricHandler;


// const counter = meter.createCounter('metric_name_test_jn');
// counter.add(15, { 'key': 'value' });

// const requestCount = meter.createCounter("requests_count_jn", {
  // description: "Count all incoming requests"
// });

// const boundInstruments = new Map();

// module.exports.countAllRequests = () => {
  // return (req, res, next) => {
    // if (!boundInstruments.has(req.path)) {
      // const labels = { route: req.path };
      // const boundCounter = requestCount.bind(labels);
      // boundInstruments.set(req.path, boundCounter);
    // }

    // boundInstruments.get(req.path).add(1);
    // next();
  // };
// };
