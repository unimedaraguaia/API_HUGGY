// IMPORTACOES
const rotas = require('express').Router()
const controlador = require('../controller/controlador')

// CONFIGURANDO ROTAS
rotas.get('/usuario/:cpf', controlador.buscarUsuario)
rotas.get('/titular/:carteira', controlador.buscarCodigoTitular)
rotas.get('/boleto/:codigoTitular', controlador.buscarBoleto)
rotas.get('/pagar/:idBoleto', controlador.buscarLinhaEditavel)
rotas.get('/beneficiario/:digitos', controlador.buscarBeneficiario)

// EXPORTACOES
module.exports = rotas