'use strict'

const express = require('express');
const app = express();
const logger = require('./logger');

let userController = require('./controllers/user-controller');


app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`); 
    next();
});

app.use('/users', userController);

module.exports = app;
