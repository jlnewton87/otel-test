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
    this.interval = {};
  }

  // NOTE: NodeJS Auto Instrumentation for tracing currently always enabled
  // serviceName: name of the service
  // outputType: `console` for debug/dev, `dev`, `production`
  initialize(serviceName, outputType, optInterval) {
    this.serviceName = serviceName;
    this.env = outputType;
    // For troubleshooting, set the log level to DiagLogLevel.DEBUG
    // diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);


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

  // found some good examples of other instrument types here: 
  // https://nodesource.com/blog/instrument-nodejs-applications-with-open-source-OTel-Tools-2
  startMetrics() {
    console.log('STARTING METRICS' + '\n' + this.serviceName);
  
    const meterProvider = new MeterProvider();
    metrics.setGlobalMeterProvider(meterProvider);
  
    meterProvider.addMetricReader(new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: this.serviceName,
      }),
      exportIntervalMillis: 1000
    }));
  
    this.meter = meterProvider.getMeter(`${this.serviceName}-collector`)
    this.createAutoHistogram = (name, optConfig) => {
      let output = this.meter.createHistogram(name, optConfig);
      return {
        record: (start) => {
          start = start || new Date();
          return output.record(new Date() - start)
        }
      }
    }
  }

  async startTracing() {
    let mod = this;
    this.startMetrics();
    return this.sdk.start()
  }
}

module.exports = new OpenTelemetrySDK();
