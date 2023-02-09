require('dotenv').config();
const metricsSDK = require('../otel-client/');
const port = process.env.PORT || 3000;

metricsSDK.initialize('TestApplication1', 'dev');
metricsSDK.createCounter('status_counter');
metricsSDK.createCounter('testcounter1');

metricsSDK.startTracing()
  .then(() => {
    const express = require('express');
    const app = express();

    app.get('/status', (req, res) => {
      let { status_counter: statusCounter } = metricsSDK.counters;
      statusCounter.add(1, {status_code: req.statusCode});
      res.json({ status: 'OK' });
    });
  
    app.get('/testcounter', (req, res) => {
      let { testcounter1 } = metricsSDK.counters;
      testcounter1.add(5, { incrementBy: 5 });
      res.json({ incrementedCounter: true });
    });

    app.listen(port);
    console.log(`Testbed listening on port ${port}...`);
  })
  .catch(e => {
    console.log('HERE!!!!!!');
    console.log(`Error: \n${e}`);
});
