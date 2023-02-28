const { MeterProvider } = require('@opentelemetry/sdk-metrics-base');
const { OTLPMetricExporter } =  require('@opentelemetry/exporter-metrics-otlp-grpc');

const collectorOptions = {
  // url is optional and can be omitted - default is grpc://localhost:4317
  url: 'grpc://localhost:4317'
};
const exporter = new OTLPMetricExporter(collectorOptions);
// Register the exporter
const meter = new MeterProvider({
  name: 'serviceName',
  exporter,
  interval: 60000,
}).getMeter('serviceName_meter');

let MeterHelper = (serviceName) => {
  const testCounter = meter.createCounter('jn_client_fix');
  testCounter.add(3);
  console.log(`here ${serviceName}`)
  return meter;
}

module.exports = MeterHelper;
