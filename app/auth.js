'use strict'

const secret = require('./config').secret;
const jwt = require('jsonwebtoken');
const logger = require('./logger');

let messages = {
    no_token : 'No token provided',
    verify_failed : 'Token verification failed',
    bad_pwd : 'Invalid credentials',
    getFailureMessage : function(msg){
        return `Authentication failure : ${msg}`;
    }
}

let generateAuthToken = function(userId){
    return jwt.sign({id : userId}, secret, {
        expiresIn : 86400 
    })
}

let verifyAuthToken = function(req, res, next){
    let authToken = req.headers['x-access-token'];
    if(!authToken){
        logger.error(`No auth token provided for ${req.method} ${req.path} for user ${req.params.id}`);
        return res.status(403).send({auth : false, message : messages.getFailureMessage(messages.no_token)});
    }
    jwt.verify(authToken, secret, (error, data) => {
        if(error){
            logger.error(`${error} ${new Error().stack}`);
            return res.status(404).send({auth : false, message : messages.getFailureMessage(messages.verify_failed)});
        }
        req.userId = data.id;
        next();
    })
}

module.exports = {
    generateAuthToken,
    verifyAuthToken,
    messages
}
