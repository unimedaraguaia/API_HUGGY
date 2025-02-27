// IMPORTAÇÕES
require('dotenv').config()
const express = require('express')
const rotas = require('./routes/rotas')

// CONFIGURAÇÕES
const app  = express()
const porta = process.env.PORT

// USANDO AS ROTAS
app.use(rotas)

// EXECUTANDO SERVICO
app.listen(
    porta, () => {
        console.log(`SERVIDOR RODANDO EM https://localhost:${porta}`)
    }
)