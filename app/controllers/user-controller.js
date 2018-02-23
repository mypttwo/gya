'use strict'

const logger = require('../logger');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../models/user').User;

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended : true}));

module.exports = router;

/**
 * @swagger
 * /users/:
 *   get:
 *     tags:
 *       - users
 *     description: Returns all users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of users
 *         schema:
 *           $ref: '#/definitions/user'
 */
router.get('/', (req, res) => {
    User.find().then((data) => {
        return res.status(200).send(data);
    }).catch((error) => {
        logger.error(`${error}`);
        return res.status(500).send('Server Error');        
    })
});



