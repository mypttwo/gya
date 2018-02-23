'use strict'

const express = require('express');
const app = express();
const logger = require('./logger');
const swaggerUI = require('swagger-ui-express');

let userController = require('./controllers/user-controller');
let registrationController = require('./controllers/regsitration-controller');
let swaggerSpec = require('./swagger-spec-gen');


app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`); 
    next();
});

app.use('/users', userController);
app.use('/register', registrationController);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

module.exports = app;
