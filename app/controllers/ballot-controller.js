'use strict'

const logger = require('../logger');
const express = require('express');
let router = express.Router();
const bodyParser = require('body-parser');
const Ballot = require('../models/ballot').Ballot; 
const verifyToken = require('../auth').verifyAuthToken;
const BallotContractManager = require('../ballot-contract-manager');

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
 *     description: Creates a new ballot
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
 *       405:
 *         description: Candidates is mandatory
 *       406:
 *         description: Creator is mandatory
 *       500:
 *         description: Internal Error
 */
router.post('', verifyToken, (req, res) => {
    if(!req.body.name){
        res.status(400).send();        
    }
    if(!req.body.candidates){
        res.status(405).send();
    }
    if(!req.body.creatorId){
        res.status(406).send();
    } 
    
    let ballot = new Ballot();
    ballot.name = req.body.name;
    ballot.candidates = req.body.candidates;
    ballot.creatorId = req.body.creatorId;

    Ballot.create(ballot).then((data) => {
        res.status(200).send(data);
    }).catch((error) => {
        logger.error(`${error}`);
        res.status(500).send('Internal Error');
    });
    
});

/**
 * @swagger
 * /ballots/{id}:
 *   put:
 *     tags: 
 *       - ballots
 *     description: Updates a single ballot
 *     produces: application/json
 *     parameters:
 *       - name: ballot object
 *         in: body
 *         description: Updates a ballot
 *         schema:
 *            $ref: '#/definitions/ballot'
 *       - name: id
 *         in: path
 *         description: Ballot id
 *       - name: x-access-token
 *         in: header
 *         description: authorization header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully updated
 *       500:
 *         description: Internal Error
 *       403:
 *         description: Authentication Failure
 *       404:
 *         description: Authentication Failure
 */
router.put('/:id', verifyToken, (req, res) => {
    let updateObj = {
        name : req.body.name,
        candidates : req.body.candidates
    };

    Ballot.findByIdAndUpdate(req.params.id, updateObj, {new : true}).then((data) => {
        res.status(200).send(data);
    }).catch((error) => {
        res.status(500).send();
    });
});


/**
 * @swagger
 * /ballots/{id}/deploy:
 *   post:
 *     tags:
 *       - ballots
 *     description: Deploys the ballot contract on ethereum
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Ballot id
 *       - name: x-access-token
 *         in: header
 *         description: authorization header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Queued the ballot contract for deployment; check back later
 *       400:
 *         description: Ballot id is mandatory
 *       500:
 *         description: Internal Error
 */
router.post('/:id/deploy', verifyToken, (req, res) => {
    if(!req.params.id){
        return res.status(400).send();
    }
    let bcm = new BallotContractManager();
    bcm.deployContract(req.params.id);
    res.status(200).send();
});


/**
 * @swagger
 * definitions:
 *   voteData:
 *     properties:
 *       candidate:
 *         type: string
 * @swagger
 * /ballots/{id}/vote:
 *   post:
 *     tags:
 *       - ballots
 *     description: Votes on the ballot contract on ethereum
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Ballot id
 *       - name: candidate
 *         in: body
 *         description: candidate name
 *         required: true
 *         schema: 
 *            $ref: '#/definitions/voteData'          
 *       - name: x-access-token
 *         in: header
 *         description: authorization header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Registered a Vote on the ballot contract on ethereum
 *       400:
 *         description: Ballot id is mandatory
 *       500:
 *         description: Internal Error
 */
router.post('/:id/vote', verifyToken, (req, res) => {
    if(!req.params.id){
        res.status(400).send();
    }
    
    let bcm = new BallotContractManager();
    bcm.vote(req.params.id, req.body.candidate).then((receipt) => {
        res.status(200).send(receipt.transactionHash);
    }).catch((error) => {
        logger.error(error);
        res.status(500).send('Failed to register vote..');
    });
});

/**
 * @swagger
 * /ballots/{id}/tally:
 *   get:
 *     tags:
 *       - ballots
 *     description: Returns tally of votes for the ballot
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Ballot id
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: tally of votes for the ballot
  *       400:
 *         description: Ballot id is mandatory
 *       500:
 *         description: Internal Error
 */
router.get('/:id/tally', (req, res) => {
    if(!req.params.id){
        res.status(400).send();
    }
    
    let bcm = new BallotContractManager();
    bcm.tally(req.params.id).then((ballotScores) => {
        res.status(200).send(ballotScores);
    }).catch((error) => {
        logger.error(error);
        res.status(500).send('Failed to tally votes..');
    });
});

/**
 * @swagger
 * /ballots/{id}:
 *   delete:
 *     tags: 
 *       - ballots
 *     description: Deletes a single ballot
 *     produces: application/json
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Ballot id
 *       - name: x-access-token
 *         in: header
 *         description: authorization header
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successfully deleted
 *       500:
 *         description: Internal Error
 *       403:
 *         description: Authentication Failure
 *       404:
 *         description: Authentication Failure
 */
router.delete('/:id', verifyToken, (req, res) => {
    Ballot.findByIdAndRemove(req.params.id, (error, data) => {
        if(error){
            logger.error(`Could not delete Ballot ${data._id} ${error}`);
            res.status(500).send();
        }
       
        logger.info(`Deleted Ballot ${req.params.id}`);
        res.status(200).send();
    });
});