// IMPORTACOES
const rotas = require('express').Router()
const controlador = require('../controller/controlador')

// ================== ROTAS DE GET ===================== //
rotas.get('/titular/:cpf',  controlador.buscarTitular)
rotas.get('/titularBoleto', controlador.buscarTitularBoletoDigitos)
rotas.get('/boleto', controlador.buscarBoleto)
rotas.get('/guias/:numeroGuia', controlador.buscarGuia)
rotas.get('/listarGuias/:codigoTitular', controlador.listarGuias)

// ======================= ROTAS DE POST ========================= //
rotas.post('/gerarProtocolo', controlador.criarProtocolo)
rotas.post('/adicionaAtendimento', controlador.adicionaAtendimento)
rotas.post('/insereMensagemAtendimento', controlador.adicionaMensagem)
rotas.post('/fecharAtendimento', controlador.fecharAtendimento)

// ====================== EXPORTACOES ============================ //
module.exports = rotas 