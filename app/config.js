'use strict'

require('dotenv').config();

const db = process.env.DB;
const port = process.env.PORT;
const secret = process.env.SECRET;
const infura_url_apikey = process.env.INFURA_URL_API_KEY;
const mnemonic = process.env.MNEMONIC;

module.exports = {db, port, secret, infura_url_apikey, mnemonic};