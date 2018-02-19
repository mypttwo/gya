'use strict'

require('dotenv').config();

const db = process.env.DB;
const port = process.env.PORT;

module.exports = {db, port};