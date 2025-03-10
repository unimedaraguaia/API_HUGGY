// IMPORTACOES
const rotas = require('express').Router()
const controlador = require('../controller/controlador')

// CONFIGURANDO ROTAS
rotas.get('/usuario/:cpf', controlador.buscarUsuario)
rotas.get('/titular/:carteira', controlador.buscarCodigoTitular)

// EXPORTACOES
module.exports = rotas