'use strict'

const bcryptjs = require('bcryptjs');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

const logger = require('../logger');
const User = require('../models/user').User;

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended : true}));

/**
 * @swagger
 * /register:
 *   post:
 *     tags:
 *       - users
 *     description: Registers a new user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user object
 *         in: body
 *         description: user object
 *         required: true
 *         schema:
 *           $ref: '#/definitions/user'
 *     responses:
 *       200:
 *         description: Successfully registered
 *       400:
 *         description: Name is mandatory
 *       404:
 *         description: Email is mandatory
 *       405:
 *         description: Password is mandatory
 *       406:
 *         description: Duplicate user name or email
 *       500:
 *         description: Internal Error
 */
router.post('', (req, res) => {
    if(!req.body.password){
        return res.status(405).send();
    }
    if(!req.body.name){
        return res.status(400).send();
    }
    if(!req.body.email){
        return res.status(404).send();
    }
    let hashedPassword = bcryptjs.hashSync(req.body.password);

    User.create({
        name : req.body.name,
        email : req.body.email,
        password : hashedPassword
    }).then((data) => {
        return res.status(200).send();
    }).catch((error) => {
        if(error.code == 11000){
            logger.error(`${error}`);
            return res.status(406).send();
        }
        return res.status(500).send();
    });
});

module.exports = router;