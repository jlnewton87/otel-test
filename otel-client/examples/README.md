# OpenTelemetry Client Tester

  - run `npm install`
  - run `npm start`

This will allow you to test various metrics supported easily.

- App auto instrumented (available via client - See `.initialize` and `.startTracing`)
- GET /status 
  - increments counter named `status_counter_ADS`
- GET /testcounter
  - doesn't do anything :D
  - was used while trying different methods of sending metrics
- GET /histo
  - waits 5 seconds, and records 5000 ish milliseconds to a histogram named `some_time`
