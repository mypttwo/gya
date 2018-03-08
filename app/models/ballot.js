'use strict'

const mongoose = require('../db');
const DeploymentStatus = require('./DeploymentStatus');

/**
 * @swagger
 * definitions:
 *   ballot:
 *     properties:
 *       name:
 *         type: string
 *       deploymentStatus:
 *         type: string
 *         enum: 
 *              - PENDING
 *              - INPROGRESS
 *              - DEPLOYED 
 *       options: 
 *         type: array    
 *       creatorId:
 *         type: string
 *       address:
 *         type: string
 *       jsonInterface:
 *         type: string
 */
let ballotSchema = new mongoose.Schema({
    name : {
        type : String
    },
    deploymentStatus : {
        type : DeploymentStatus
    },
    options :{
        type : [String]
    },
    creatorId : {
        type : String
    },
    address : {
        type : String
    },
    jsonInterface : {
        type : String
    }
});

mongoose.model('Ballot', ballotSchema);

module.exports = {
    Ballot : mongoose.model('Ballot'),
    ballotSchema
}
