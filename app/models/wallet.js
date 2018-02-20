'use strict'

const mongoose = require('../db');

let walletSchema = new mongoose.Schema({
    name : {
        type : String
    }
});

mongoose.model('Wallet', walletSchema);

module.exports = {
    Wallet : mongoose.model('Wallet'),
    walletSchema
}