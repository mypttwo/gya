'use strict'

const logger = require('../logger');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../models/user').User;

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended : true}));

module.exports = router;

router.get('/', (req, res) => {
    User.find().then((data) => {
        return res.status(200).send(data);
    }).catch((error) => {
        logger.error(`${error}`);
        return res.status(500).send('Server Error');        
    })
});



