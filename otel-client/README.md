## IMPORTANT!

In order to initialize tracing, you must call `startTracing` BEFORE requiring express/http in your application.  Failure to do so will prevent traces from being collected and reported!

```js
oTelSDK.startTracing()
  .then({
    const express = require('express');
    const app = express();
    // the rest of your server startup code here
  });
```

## Metrics

To create metrics, you need to create a counter.  This is simple using the sdk. Once the counter is created, it will exist on the SDK object, anywhere it's required in the code.  Counters are collected in an array on the object named `counters`.  You can get a reference to your counter by accessing it directly, or through destructuring.
```js
// ** CREATE **
oTelSDK.createCounter('my_counter'); // creates counter named `my_counter`
// ** USE ** 
let myCounter = oTelSDK.counters.my_counter;
// ** OR **
let { my_counter: myCounter } = oTelSDK.counters;

myCounter.Add(1, { comment: 'add tags/metadata here' });
```

## Serverless/Short-lived process

  - Running short applications (Lambda/Serverless/etc) If your application exits quickly after startup, you may need to explicitly shutdown the tracer to ensure that all spans are flushed:

  - `opentelemetry.trace.getTracer('your_tracer_name').getActiveSpanProcessor().shutdown()`



## TLDR; (Quick Start)

```js
const oTelSDK = require('otel-client');
oTelSDK.initialize('SERVICE_NAME_HERE', 'dev'); // `console` here makes traces/metrics report to console, change to `staging` before deploying
// ONLY DEV CURRENTLY WORKS
oTelSDK.startTracing()
  .then({
    const express = require('express'); // MUST require express and/or http after startTracing has completed!
    const app = express();
    let myCounter = oTelSDK.meter.createCounter('my_counter'); // creates counter named `my_counter`
    let { my_counter: myCounter } = oTelSDK.counters;

    app.get('/status', (req, res) => {
      myCounter.Add(1, { endpoint: '/status', status_code: 200 });
      res.json({ status: 'OK' });
    });
    
    // the rest of your server startup code here
  });

```
