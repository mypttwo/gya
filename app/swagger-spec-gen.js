'use strict'


const swaggerJSDoc = require('swagger-jsdoc');

let swaggerDefinition = {
    swagger : '2.0',
    info : {
        title : 'gya API',
        version : '1.0.0',
        description : 'gya API'
    }
};

let swaggerOptions = {
    swaggerDefinition : swaggerDefinition,
    apis : ['./app/models/*.js', './app/controllers/*.js']
};

let swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = swaggerSpec;