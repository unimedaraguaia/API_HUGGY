// IMPORTACOES
const rotas = require('express').Router()
const controlador = require('../controller/controlador')


// CONFIGURANDO ROTAS
rotas.get('/titular/:cpf', controlador.buscarTitular)
// rota para pegar id e nome de um titular que tenha acesso a boletos
rotas.get('/titularBoleto', controlador.buscarTitularBoletoDigitos)
// rota para pegar os boletos por meio do codigo do titular
rotas.get('/boleto', controlador.buscarBoleto)

// rota de aceso aos dados da guia pelo numero da mesma
rotas.get('/guias/:numeroGuia', controlador.buscarGuia)
// lista todas as guias de um beneficiario titular
rotas.get('/listarGuias/:codigoTitular', controlador.listarGuias)

// gera proctocolo para atendimentos
rotas.post('/gerarProtocolo', controlador.criarProtocolo)
// adicioan um atendimento no protocolo criado
rotas.post('/adicionaAtendimento', controlador.adicionaAtendimento)
// rota para adicionar mensagem no atendimento
rotas.post('/insereMensagemAtendimento', controlador.adicionaMensagem)
// rota pra fechar atendimento 
rotas.post('/fecharAtendimento', controlador.fecharAtendimento)
// EXPORTACOES
module.exports = rotas 