'use strict'

const logger = require('../logger');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../models/user').User;
const verifyToken = require('../auth').verifyAuthToken;

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
router.put('/:id', verifyToken, (req, res) => {
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
router.delete('/:id', verifyToken, (req, res) => {
    User.findByIdAndRemove(req.params.id, (error, data) => {
        if(error){
            res.status(500).send();
        }
        res.status(200).send(data);
    });
});



