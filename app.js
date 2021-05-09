'use strict';
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('express-async-errors');
const app = express();

const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const blogRouter = require('./controllers/blog');
const userRouter = require('./controllers/user');

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
  .then((_) => {
    const uri = _.connections[0]._connectionString;
    logger.info('Connected to:', uri);
  })
  .catch((err) => logger.error(err));

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/blogs', blogRouter);
app.use('/api/users', userRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
