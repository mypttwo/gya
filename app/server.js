'use strict'

const app = require('./app');
const port = require('./config').port;
const logger = require('./logger');

app.listen(port, (error) => {
    if(error){
        return logger.error(`Cannot start server at ${port}. Terminating now...`);
    }
    logger.info(`Started server at ${port}`);
});
