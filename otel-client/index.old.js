// --------------------------------------------------------------------
// Setup for OpenTelemetry Tracing
require('dotenv').config();
const { DiagConsoleLogger, DiagLogLevel, diag, metrics } = require('@opentelemetry/api');
const opentelemetry = require('@opentelemetry/sdk-node');
const { SimpleSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { Resource } = require('@opentelemetry/resources');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { MeterProvider, PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');

// --------------------------------------------------------------------
// SDK Class
class OpenTelemetrySDK {
  constructor() {
    this.counters = {};
    this.serviceName = '';
    this.sdk = {};
    this.env = '';
    this.createCounter = () => {};
  }

  // NOTE: NodeJS Auto Instrumentation for tracing currently always enabled
  // serviceName: name of the service
  // outputType: `console` for debug/dev, `dev`, `production`
  initialize(serviceName, outputType, optInterval) {
    this.serviceName = serviceName;
    this.env = outputType;
    // For troubleshooting, set the log level to DiagLogLevel.DEBUG
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);


    const validTraceTypes = ['console', 'dev', 'production'];
    if (validTraceTypes.indexOf(outputType) === -1) {
      throw new Error(
        `Invalid output type - Options: console, dev, production | Got: ${outputType}`
      );
    }

    // --------------------------------------------------------------------
    // Traces Setup (Default NodeJS Traces Enabled)
    const traceExporters = () => {
      const urls = {
        dev: 'http://localhost:4318/v1/traces', // DEV_URL
        prod: 'NOT_YET_IMPLEMENTED'
      };

      console.log(outputType)
      switch(outputType) {
        case 'dev':
          return new OTLPTraceExporter({
            url: urls['dev']
          });
        case 'production':
          return new OTLPTraceExporter({
            url: urls['prod']
          });
        case 'console':
        default:
          return new ConsoleSpanExporter();
      }
    };

    const sdk = new opentelemetry.NodeSDK({
      traceExporter: traceExporters(),
      instrumentations: [getNodeAutoInstrumentations()],
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      }),
    });

    this.sdk = sdk;
  };

  stopTracing() {
    opentelemetry.trace.getTracer('your_tracer_name').getActiveSpanProcessor().shutdown()
  }

  startMetrics() {
    console.log('STARTING METRICS');
  
    const meterProvider = new MeterProvider();
    metrics.setGlobalMeterProvider(meterProvider);
  
    meterProvider.addMetricReader(new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
      exportIntervalMillis: 1000
    }));
  
    meter = meterProvider.getMeter(`${this.serviceName}-collector`)
  
    const requestCounter = meter.createCounter('fett_test', {
      description: 'Example of a Counter',
    });
  
    const upDownCounter = meter.createUpDownCounter('mando_test', {
      description: 'Example of a UpDownCounter',
    });
  
    const attributes = { environment: this.env };
  
    interval = setInterval(() => {
      requestCounter.add(1, attributes);
      upDownCounter.add(Math.random() > 0.5 ? 1 : -1, attributes);
    }, 1000);
  
  }

  async startTracing() {
    let mod = this;
    return this.sdk.start()
  }
}

module.exports = new OpenTelemetrySDK();
