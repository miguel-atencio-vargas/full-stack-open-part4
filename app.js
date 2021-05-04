'use strict';

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

const config = require('./utils/config');
const blogRouter = require('./controllers/blog');

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
  .then((_) => {
    const uri = _.connections[0]._connectionString;
    console.log('Connected to:', uri);
  })
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.json());
app.use('/api/blog', blogRouter);

module.exports = app;
