'use strict'

const logger = require('../logger');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../models/user').User;
const Ballot = require('../models/ballot').Ballot;
const verifyToken = require('../auth').verifyAuthToken;

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended : true}));

module.exports = router;

let verifyUser = function(req, res, next){
    if(req.userId != req.params.id){
        logger.error(`User ${req.userId} is attempting to modify data of user ${req.params.id}`);
        return res.status(403).send({auth : false, message : messages.getFailureMessage(messages.verify_failed)});
    }
    next();
}

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
router.get('/',  (req, res) => {
    User.find().select({ password: 0 }).then((data) => {
        return res.status(200).send(data);
    }).catch((error) => {
        logger.error(`${error}`);
        return res.status(500).send('Server Error');        
    })
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags:
 *       - users
 *     description: Returns the user by id
 *     produces:
 *       - application/json
 *     parameters:
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
 *         description: An array of users
 *         schema:
 *           $ref: '#/definitions/user'
 */
router.get('/:id',  (req, res) => {
    User.findById().select({ password: 0 }).then((data) => {
        return res.status(200).send(data);
    }).catch((error) => {
        logger.error(`${error}`);
        return res.status(500).send('Server Error');        
    })
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags: 
 *       - users
 *     description: Updates a single user
 *     produces: application/json
 *     parameters:
 *       - name: user object
 *         in: body
 *         description: Updates a user
 *         schema:
 *            $ref: '#/definitions/user'
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
 *         description: Successfully updated
 *       500:
 *         description: Internal Error
 *       403:
 *         description: Authentication Failure
 *       404:
 *         description: Authentication Failure
 */
router.put('/:id', verifyToken, verifyUser, (req, res) => {
    User.findByIdAndUpdate(req.params.id, req.body, {new : true}).select({password : 0}).then((data) => {
        res.status(200).send(data);
    }).catch((error) => {
        res.status(500).send();
    });
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: 
 *       - users
 *     description: Deletes a single user
 *     produces: application/json
 *     parameters:
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
 *         description: Successfully deleted
 *       500:
 *         description: Internal Error
 *       403:
 *         description: Authentication Failure
 *       404:
 *         description: Authentication Failure
 */
router.delete('/:id', verifyToken, verifyUser, (req, res) => {
    User.findByIdAndRemove(req.params.id, (error, data) => {
        if(error){
            logger.error(`Could not delete User ${data._id} ${error}`);
            res.status(500).send();
        }
        Ballot.remove({creatorId : data._id}).then((data) => {
            logger.info(`Deleted Ballots for User ${req.params.id}`);
        }).catch((error) => {
            logger.error(`Could not delete Ballots for user ${data._id} ${error}`);
        });
        logger.info(`Deleted User ${req.params.id}`);
        res.status(200).send();
    });
});



