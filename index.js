'use strict';
const app = require('./app');
const config = require('./utils/config');

app.listen(config.PORT, () => {
  console.log(`Running on ${config.PORT}`);
});
