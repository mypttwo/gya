'use strict'

const logger = require('./logger');
const port = require('./config').port;
const express = require('express');
const app = express();

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.baseUrl}`); 
    next();
});

module.exports = app;
