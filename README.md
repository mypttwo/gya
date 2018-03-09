# Simple Voting App based on Ethereum

This is the server implementation of an app that allows deployment of simple smart voting contracts and interaction with them without running a local geth node using [web3 1.0.0](https://web3js.readthedocs.io/en/1.0/) and [nodejs](https://nodejs.org/en/).

You will find this interesting if
 - you need a  nodejs server 
   - with a simple user management module that includes authentication and authorization using [jsonwebtokens](https://www.npmjs.com/package/jsonwebtoken)
   - that exposes a REST API which can be browsed via [Swagger](https://swagger.io/)
   - that uses [mongo](https://www.mongodb.com/) as the db
 - you need a working example using [web3 1.0.0](https://web3js.readthedocs.io/en/1.0/). 
 - you do not want to run a local Ethereum node - either to connect to [Ropsten](https://ropsten.etherscan.io/)/[Rinkeby](https://rinkeby.etherscan.io/) or even [testrpc/ganache](http://truffleframework.com/ganache/) .   

Disclaimers :  
 1. While this allows deployment of smart contracts and interaction with them,  this does not restrict anonymous users from directly interacting with the smart contracts on Ethereum. This can only serve as a model for future development.
 2. The simpler way to deploy the contract is to use [truffle console](#using-truffle-console) of course. This only demonstrates a way it can be done via nodejs. 

## Getting Started

Apart from having nodejs installed and other usual stuff you will need to 
 - Signup on [infura.io](https://infura.io/). This is the infrastructure that powers [Metamask](https://metamask.io/). You should have an **API key** at the end of the signup.
 - Install [Metamask](https://metamask.io/) if you have not done that as yet. This will give you a **default account and a [mnemonic](https://en.bitcoin.it/wiki/Mnemonic_phrase)** to login. 
 - Get some **ether** to begin with.  You would also like to work with a *test* network like [Ropsten](https://ropsten.etherscan.io/) or [Rinkeby](https://rinkeby.etherscan.io/). Look for faucets in the respective networks - like [Ropsten faucet](http://faucet.ropsten.be:3001/), [Rinkeby faucet](https://faucet.rinkeby.io/).

## Setting up the environment
The code includes a **.env** file. You will need to set the appropriate variables to run the app.
 - Specify the url for your mongodb instance. (Either you can [download](https://www.mongodb.com/download-center#community) and run mongo locally or you can use a service ([mlab](https://mlab.com/), [Atlas](https://www.mongodb.com/download-center#atlas)) 
``DB=mongodb://localhost:27017/gya``
 - Specify the port on which your server will run 
``PORT=3000``
 - Specify a secret which will be used for encryption of passwords and sensitive data 
``SECRET=<)GV-}Y+j{3WYGBa``
 - Specify the [infura.io](https://infura.io/) url with key which will allow you to interact with Ethereum blockchain
``INFURA_URL_API_KEY=https://ropsten.infura.io/1t7lIne9gTwmPs9Twsd5``  
 - Specify the mnemonic that allows you to access your [Metamask](https://metamask.io/)  wallet
``MNEMONIC=one two three four five six seven eight nine ten eleven twelve``


*Needless to say the above file should never be checked in or even logged. If you do that in production you will be robbed.*



## Running the app
You run the server like so 
>  ``npm start``

### API
The server API documentation can be accessed from the 
**/api-docs** endpoint.
For example if you are running the server off localhost and port 3000 you can access the API from the below endpoint
http://localhost:3000/api-docs/

### Quick API walkthrough
If you would like to get a quick idea on the capabilities of the server follow the below steps.  
*For the purposes of this walkthrough we will assume that your server is running on* *http://localhost:3000/*. 

 1. You can at any time **list all users** this endpoint 
 http://localhost:3000/api-docs/#/users/get_users_
 <sup>Todo : This is an unauthenticated call. This can be put behind authentication and authorization.</sup>
 2. **Register a user** with appropriate credentials via this endpoint
 http://localhost:3000/api-docs/#/users/post_register.
 As a quick check you can now list users once again via
  http://localhost:3000/api-docs/#/users/get_users_
 If all has gone well you would see the user created in the list. 
 3. **Login the user** with appropriate credentials via 
 http://localhost:3000/api-docs/#/users/post_login
 If all has gone well again you should get a response as so
 ``{
  "auth": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhYTE5MGJmZWRmZGZkMmI4MzUyYjMyOCIsImlhdCI6MTUyMDUzNzg0MiwiZXhwIjoxNTIwNjI0MjQyfQ.mXiGsy2AfzgvCstr4w5dwXLWJAzBdjtQl6KBZaI4cyI",
  "userId": "5aa190bfedfdfd2b8352b328"
}
``
*You will need the ``token`` and the ``userId`` for further calls.* 
 4. **Create a ballot** using 
 http://localhost:3000/api-docs/#/ballots/post_ballots
 This is an authenticated call so you would need to add the ``token`` as a part of the  ``x-access-token``header.
 You will need to list the candidates with double quotes not single quotes. For instance ["Pam", "Sam", "VanDam"].  
 *You will need the ballot  ``id`` for further calls.* 
 
 5. **Deploy the smart contract** on Ethereum for a specific ballot via
 http://localhost:3000/api-docs/#/ballots/post_ballots__id__deploy.
 This may take a couple of minutes, so the call returns immediately. You will have to check back after a couple of minutes via http://localhost:3000/api-docs/#/ballots/get_ballots_
 <sup>Todo : This call gets all the ballots created in the db. An endpoint can be supported to get the specific ballot.</sup>  
Its also possible that an error may result *even if all works well*. 

> ``Error: Transaction was not mined within 50 blocks, please make sure your transaction was properly sent. Be aware that it might still be mined!``

This means that you may have to try deploying the smart contract again after some time. 
 <sup>Todo : Some kind of a queueing mechanism needs to be put in place so that if the smart contract fails to deploy the server automatically re-queues the smart contract for deployment without user intervention.</sup>  

 6. **Vote for a candidate** via 
 http://localhost:3000/api-docs/#/ballots/post_ballots__id__vote
  <sup>Todo : Currently no checks are maintained as to the number of times a user can vote. <br/>Todo : Also there is no check as to whether  the candidate exists.</sup>
  
 7. Finally **get the tally of votes** for all candidates via
 http://localhost:3000/api-docs/#/ballots/get_ballots__id__tally 
 
<sup>Todos have also been listed with some endpoints which can be taken up later.</sup>

Apart from the above, the API also contains endpoints that handle the usual data CRUD stuff. 

## Acknowledgements

 - Excellent [tutorials](https://github.com/maheshmurthy/ethereum_voting_dapp) by [Mahesh Murthy](https://medium.com/@mvmurthy)  
 - The code uses the [Voting Contract](https://gist.github.com/maheshmurthy/3da385a42678c3e36a8328cbe47cae5b#file-voting-sol) by [Mahesh Murthy](https://medium.com/@mvmurthy). 

