// IMPORTAÇÕES
require('dotenv').config()
const express = require('express')
const rotas = require('../routes/rotas')
const path = require('path');

// CONFIGURAÇÕES
const app  = express()
const localService = process.env.ADDRESS_SERVICE
const porta = process.env.PORT

// levantando a documetação
//const fs = require("fs")
//const YAML = require('yaml')
//const swaggerUi = require('swagger-ui-express')
//const cors = require('cors')
// Carrega o arquivo OpenAPI
//const file = fs.readFileSync('../doc/swagger.yaml', 'utf8')
//const file = fs.readFileSync(path.join(__dirname, '../doc/swaggger.yaml'), 'utf8')
//const swaggerDocument = YAML.parse(file)

// USANDO AS ROTAS
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // rota de documentação deve ser sempre a primeira
//app.use(cors());
app.use(rotas)
app.use('/temp', express.static(path.join(__dirname, '../temp')));


// EXECUTANDO SERVICO
app.listen(
    porta, () => {
        console.log(`SERVIDOR RODANDO EM ${localService}:${porta}`)
        //console.log('Rota de documentação: http://localhost:3000/api-docs');
    }
)