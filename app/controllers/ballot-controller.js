'use strict'

const logger = require('../logger');
const express = require('express');
let router = express.Router();
const bodyParser = require('body-parser');
const Ballot = require('../models/ballot').Ballot; 
const verifyToken = require('../auth').verifyAuthToken;

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended : true}));

module.exports = router;

/**
 * @swagger
 * /ballots/:
 *   get:
 *     tags:
 *       - ballots
 *     description: Returns all ballots
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: An array of ballots
 *         schema:
 *           $ref: '#/definitions/ballot'
 */
router.get('', (req, res) => {
    Ballot.find().then((data) => {
        res.status(200).send(data);
    }).catch((error) => {
        logger.error(`${error}`);
        res.status(500).send();
    });
});

/**
 * @swagger
 * /ballots:
 *   post:
 *     tags:
 *       - ballots
 *     description: creates a new ballot
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: ballot object
 *         in: body
 *         description: ballot object
 *         required: true
 *         schema:
 *           $ref: '#/definitions/ballot'
 *       - name: id
 *         in: path
 *         description: User id
 *       - name: x-access-token
 *         in: header
 *         description: authorization header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully created
 *       400:
 *         description: Name is mandatory
 *       404:
 *         description: Options is mandatory
 *       405:
 *         description: Creator is mandatory
 *       500:
 *         description: Internal Error
 */
router.post('', verifyToken, (req, res) => {
    if(!req.body.name){
        res.status(400).send();        
    }
    if(!req.body.options){
        res.status(404).send();
    }
    if(!req.body.creatorId){
        res.status(405).send();
    } 
    Ballot.create(req.body).then((data) => {
        res.status(200).send(data);
    }).catch((error) => {
        logger.error(`${error}`);
        res.status(500).send('Internal Error');
    });
    
});