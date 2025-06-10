// IMPORTACOES
const rotas = require('express').Router()
const controlador = require('../controller/controlador')

// CONFIGURANDO ROTAS

rotas.get('/titular/:cpf', controlador.buscarTitular)
// rota para pegar id e nome de um titular que tenha acesso a boletos
rotas.get('/titularBoleto/:digitos', controlador.buscarTitularBoletoDigitos)
// rota para pegar os boletos por meio do codigo do titular
rotas.get('/boleto/:codigoTitular', controlador.buscarBoleto)
// rota de aceso aos dados da guia pelo numero da mesma
rotas.get('/guias/:numeroGuia', controlador.buscarGuia)
// lista todas as guias de um beneficiario titular
rotas.get('/listarGuias/:codigoTitular', controlador.listarGuias)
// EXPORTACOES
module.exports = rotas 