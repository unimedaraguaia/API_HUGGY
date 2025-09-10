const swaggerJsdoc = require('swagger-jsdoc');
const localService = process.env.ADDRESS_SERVICE
const porta = process.env.PORT

const options = {
    definition: {
    openapi: '3.0.3',
    info: {
        title: 'API_UNIMED HUGGY',
        version: '0.2.0',
        description: 'Documentação da API_UNIMED desenvovida para fluxos HUGGY',

    },
    servers: [{ url: `${localService}:${porta}` }], // Ajuste para sua URL
    },
    apis: ['../doc/swagger.yaml'], // Caminho para seus arquivos de rotas
}; 

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;