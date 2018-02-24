'use strict'

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const bcryptjs = require('bcryptjs');
const logger = require('../logger');
const User = require('../models/user').User;
const generateAuthToken = require('../auth').generateAuthToken;
const failureMessageLookup = require('../auth').messages;

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended : true}));

/**
 * @swagger
 * definitions:
 *   loginData:
 *     properties:
 *       email:
 *         type: string
 *       password:
 *         type: string
 * @swagger
 * /login:
 *   post:
 *     tags:
 *       - users
 *     description: Logs in a user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: loginData object
 *         in: body
 *         description: loginData object
 *         required: true
 *         schema:
 *           $ref: '#/definitions/loginData'
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       404:
 *         description: No User found
 *       403:
 *         description: Authentication failed
 *       400:
 *         description: Email and Password are mandatory
 *       500:
 *         description: Internal Error
 */
router.post('', (req, res) => {
    if(!req.body.email){
        return res.status(400).send();
    }
    if(!req.body.password){
        return res.status(400).send();
    }
    User.findOne({email : req.body.email}).then((data) => {
        if(!data){
            return res.status(404).send({auth : false, message : 'Auth Failed'});
        }
        let passwordIsValid = bcryptjs.compareSync(req.body.password, data.password);
        if(passwordIsValid){
            let token  = generateAuthToken(data._id);
            return res.status(200).send({auth : true, token, userId : data._id});
        } else {
            return res.status(403).send({auth : false, message : failureMessageLookup.getFailureMessage(failureMessageLookup.bad_pwd)});
        }
    }).catch((error) => {
        return res.status(500).send({auth : false, message : 'Auth Failed'});
    })
});

module.exports = router;
