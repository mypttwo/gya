'use strict'

const mongoose = require('../db');
const walletSchema = require('./wallet').walletSchema;

/**
 * @swagger
 * definitions:
 *   user:
 *     properties:
 *       name:
 *         type: string
 *       email:
 *         type: string
 *       password:
 *         type: string
 */
let userSchema = new mongoose.Schema({
    name : {
        type : String,
        unique : true,
        index : true
    },
    email : {
        type : String,
        unique : true
    },
    password : {
        type : String
    },
    wallets : [walletSchema]
});

mongoose.model('User', userSchema);

module.exports = {
    User : mongoose.model('User'),
    userSchema
}
