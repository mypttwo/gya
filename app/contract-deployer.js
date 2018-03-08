'use strict'

const fs = require('fs');
const Web3 = require('web3');
const solc = require('solc');
const HDWalletProvider = require('truffle-hdwallet-provider');

const logger = require('./logger');

const asciiToHex = Web3.utils.asciiToHex;

class ContractDeployer{

    constructor(mnemonic, infura_url_apikey){
        this.web3 = new Web3(new HDWalletProvider(mnemonic, infura_url_apikey));
    }

    deploy(contract_path_and_filename, contract_name, contractArgsArray){
        return new Promise((resolve, reject) => {
            logger.info(`Deploying contract ${contract_path_and_filename} with args ${contractArgsArray}`);

            this.web3.eth.getAccounts().then((accountArray) => {
                let code = fs.readFileSync(contract_path_and_filename).toString();
                let compiledCode = solc.compile(code);
                let abiDefinition = JSON.parse(compiledCode.contracts[`:${contract_name}`].interface);
                let byteCode = compiledCode.contracts[`:${contract_name}`].bytecode;
                let defaultAccount = accountArray[0];
                logger.info(`Default Account : ${defaultAccount}`);
                this.web3.eth.estimateGas({data: '0x' + byteCode}).then((gasEstimate) => {
                    logger.info(`Gas Estimate : ${gasEstimate}`);

                    let gasEstimateHex = this.web3.utils.toHex(gasEstimate + 500000);
                    let contractArgsHex = contractArgsArray.map(asciiToHex);

                    let contract = new this.web3.eth.Contract(abiDefinition);  

                    contract.deploy({
                        data: '0x' + byteCode, 
                        arguments: [contractArgsHex]
                    }).send({
                        from: defaultAccount, 
                        gas: gasEstimateHex
                    }).then((result) => {
                        let deployedContract = result;
                        logger.log(`Deployed Contract at address ${deployedContract.options.address} with abi ${deployedContract.options.jsonInterface}`);    
                        resolve(deployedContract);
                    }).catch((error) => {
                        logger.error(`Deployment Error ${error}`);
                        reject(error);
                    });
                }).catch((error) => {
                    logger.error(`web3 cannot Estimate gas ${error}`);
                });
                
            }).catch((error) => {
                logger.error(`web3 cannot get Accounts ${error}`);
            });

        });

    }

    
}

module.exports = ContractDeployer;