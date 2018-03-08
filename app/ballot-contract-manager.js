'use strict'

const logger = require('./logger');
const ContractDeployer = require('./contract-deployer');
const Ballot = require('./models/ballot').Ballot;
const DeploymentStatus = require('./models/deploymentStatus');
const infura_url_apikey = require('./config').infura_url_apikey;
const mnemonic = require('./config').mnemonic;

class BallotContractManager {
    constructor() {

    }

    deployContract(ballotId){
        Ballot.findById(ballotId).then((data) => {
            if(data.deploymentStatus == DeploymentStatus.DEPLOYED){
                logger.error(`Ballot ${ballotId} is already deployed. Not deploying again`);
                return;
            }
            Ballot.findByIdAndUpdate(ballotId, {deploymentStatus : DeploymentStatus.INPROGRESS}, {new :true}).then((data) => {
                let contractDeployer = new ContractDeployer(mnemonic, infura_url_apikey);
                 contractDeployer.deploy('./contracts/Voting.sol', 'Voting', data.options).then((deployedContract) => {
                     if(deployedContract){
                        let updateObj = {
                            address : deployedContract.options.address,
                            jsonInterface : deployedContract.options.jsonInterface,
                            deploymentStatus : DeploymentStatus.DEPLOYED
                        }
                        Ballot.findByIdAndUpdate(ballotId, updateObj, {new :true}).then((data) =>{
                            logger.info(`Updated Ballot ${data._id} after Contract Deployment`);
                        });
                    } else {
                        logger.error(`Ballot ${data._id} Contract could not be Deployed`);
                    }
                 });
            }).catch((error) => {
                logger.error(`Error ${error}`);
            })
        });
    }
}

module.exports = BallotContractManager;