'use strict'

const winston = require('winston');
require('winston-daily-rotate-file');
const fs = require('fs');
var dir = './logs';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const transport = new winston.transports.DailyRotateFile({
    filename : './logs/server_',
    datePattern : 'yyyy-MM-dd.log'
});

const logger = new winston.Logger({
    transports : [
        new winston.transports.Console(),
        transport
    ]
});

module.exports = logger;