// IMPORTAÇÕES
require('dotenv').config()
const express = require('express')
const rotas = require('../routes/rotas')
const path = require('path');

// CONFIGURAÇÕES
const app  = express()
const localService = process.env.ADDRESS_SERVICE
const porta = process.env.PORT

// USANDO AS ROTAS
app.use(rotas)
app.use('/temp', express.static(path.join(__dirname, '../temp')));
// EXECUTANDO SERVICO
app.listen(
    porta, () => {
        console.log(`SERVIDOR RODANDO EM ${localService}:${porta}`)
    }
)