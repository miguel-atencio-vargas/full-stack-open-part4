'use strict';
const logger = require('./logger');

const requestLogger = (req, res, next) => {
  logger.info('Method:', req.method);
  logger.info('Path:  ', req.path);
  logger.info('Body:  ', req.body);
  logger.info('---');
  next();
};

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'Unknown Endpoint' });
};

const errorHandler = (exception, req, res, next) => {
  logger.error(exception);
  let error;
  let code = 400;
  if (exception.name === 'CastError') error = 'Malformatted ID';
  if (exception.name === 'ValidationError') error = exception.message;
  if (exception.name === 'JsonWebTokenError') {
    code = 401;
    error = exception.message;
  }
  if (error) return res.status(code).send({ error });
  next(exception);
};

const tokenExtractor = (req, res, next) => {
  const auth = req.get('authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    req.token =  auth.substring(7);
  }
  next();
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor
};
