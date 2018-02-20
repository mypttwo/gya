'use strict'

const mongoose = require('../db');
const walletSchema = require('./wallet').walletSchema;

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
