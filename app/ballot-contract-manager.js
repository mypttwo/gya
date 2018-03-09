'use strict'

const logger = require('./logger');
const ContractDeployer = require('./contract-deployer');
const Ballot = require('./models/ballot').Ballot;
const DeploymentStatus = require('./models/deploymentStatus');
const infura_url_apikey = require('./config').infura_url_apikey;
const mnemonic = require('./config').mnemonic;
const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');
const asciiToHex = Web3.utils.asciiToHex;

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
                 contractDeployer.deploy('./contracts/Voting.sol', 'Voting', data.candidates).then((deployedContract) => {
                     if(deployedContract){
                        let updateObj = {
                            address : deployedContract.options.address,
                            jsonInterface : JSON.stringify(deployedContract.options.jsonInterface),
                            deploymentStatus : DeploymentStatus.DEPLOYED
                        }
                        Ballot.findByIdAndUpdate(ballotId, updateObj, {new :true}).then((data) =>{
                            logger.info(`Updated Ballot ${data._id} after Contract Deployment`);
                        });
                    } else {
                        logger.error(`Ballot ${data._id} Contract could not be Deployed`);
                    }
                 }).catch((error) => {
                    logger.error(`Ballot ${data._id} Contract could not be Deployed`);
                 });
            }).catch((error) => {
                logger.error(`Error ${error}`);
            })
        });
    }

    vote(ballotId, candidate){
        let candidateHex = asciiToHex(candidate);
        let web3 = new Web3(new HDWalletProvider(mnemonic, infura_url_apikey));
        let contractInstance = null;
        return new Promise((resolve, reject) =>{
            Ballot.findById(ballotId).then((data) => {
                return data;
            }).then((data) => {
                contractInstance = new web3.eth.Contract(JSON.parse(data.jsonInterface), data.address);
                return web3.eth.getAccounts();
            }).then((accountArray) => {
                let defaultAccount = accountArray[0];
                return contractInstance.methods.voteForCandidate(candidateHex).send({
                    gas: 140000,
                    from: defaultAccount
                });
            }).then((receipt) => {
                resolve(receipt)
            }).catch((error) => {
                reject(error);
            });
        });
    }

    tally(ballotId){
        let web3 = new Web3(new HDWalletProvider(mnemonic, infura_url_apikey));
        let contractInstance = null;
        let ballot = null;
        return new Promise((resolve, reject) =>{
            Ballot.findById(ballotId).then((data) => {
                ballot = data;
                return data;
            }).then((data) => {
                contractInstance = new web3.eth.Contract(JSON.parse(data.jsonInterface), data.address);
                return web3.eth.getAccounts();
            }).then((accountArray) => {
                let defaultAccount = accountArray[0];

                let ballotScores = [];

                let ballotScorePromises = ballot.candidates.map(candidate => {
                    let candidateHex = asciiToHex(candidate);
                    return contractInstance.methods.totalVotesFor(candidateHex).call((error, result) => {
                        if(!error){
                            let scoreObj = {
                                candidate,
                                result
                            };
                            ballotScores.push(scoreObj);
                        }
                    });
                });

                return Promise.all(ballotScorePromises).then((responses) => {
                    return ballotScores;
                });
            }).then((ballotScores) => {
                resolve(ballotScores)
            }).catch((error) => {
                reject(error);
            });
        });
    }
}

module.exports = BallotContractManager;