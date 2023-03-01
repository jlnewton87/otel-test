require('dotenv').config();
const metricsSDK = require('../otel-client/');
const port = process.env.PORT || 3000;

metricsSDK.initialize('AsyncDelimaSolved01', 'dev');

metricsSDK.startTracing()
  .then(() => {
    let statusCounter = metricsSDK.meter.createCounter('status_counter_ADS');
    const express = require('express');
    const app = express();

    app.get('/status', (req, res) => {
      statusCounter.add(1, {status_code: req.statusCode});
      // console.log(JSON.stringify(statusCounter));
      res.json({ status: 'OK' });
    });

    let histogram = metricsSDK.createAutoHistogram('some_time', { 
      unit: 'milliseconds', 
      description: 'measures the duration of 5 second function :)'
    });
    app.get('/histo', (req, res) => {
      let start = new Date();
      setTimeout(() => {
        console.log(`Recording diff of: ${new Date() - start} (ish)`);
        histogram.record(start);
        res.json({msg: '5 seconds passed'})
      }, 5000)
    })
  
    app.get('/testcounter', (req, res) => {
      // let { testcounter1: testCounter } = metricsSDK.counters;
      // testCounter.add(5, { incrementBy: 5 });
      res.json({ incrementedCounter: true });
    });

    app.listen(port);
    console.log(`Testbed listening on port ${port}...`);
  })
