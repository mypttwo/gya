'use strict'

const db = require('./config').db;
const logger = require('./logger');
const mongoose = require('mongoose');

mongoose.connect(db).then(() => {
    logger.info(`Connected to db : ${db}`);
}).catch((error) => {
    logger.error(`Could not connect to db : ${db} ${error} \nTerminating now...`);
    process.exit(1);
});

module.exports = mongoose;