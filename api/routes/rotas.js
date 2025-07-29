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

// gera proctocolo para atendimentos
rotas.post('/gerarProtocolo/:idPessoa', controlador.criarProtocolo)
// adicioan um atendimento no protocolo criado
rotas.post('/adicionaAtendimento/:idProtocolo', controlador.adicionaAtendimento)
// rota para adicionar mensagem no atendimento
rotas.post('/insereMensagemAtendimento/:idAtendimento', controlador.adicionaMensagem)
// rota pra fechar atendimento 
rotas.post('/fecharAtendimento/:idAtendimento', controlador.fecharAtendimento)
// EXPORTACOES
module.exports = rotas 