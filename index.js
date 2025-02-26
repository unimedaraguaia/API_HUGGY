// IMPORTAÇÕES
const express = require('express')

// CONFIGURAÇÕES
const app  = express()
const porta = 3000

// EXECUTANDO SERVICO
app.listen(
    porta, () => {
        console.log(`SERVIDOR RODANDO EM https://localhost:${porta}`)
    }
)