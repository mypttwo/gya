'use strict'

require('dotenv').config();

const db = process.env.DB;
const port = process.env.PORT;
const secret = process.env.SECRET;

module.exports = {db, port, secret};