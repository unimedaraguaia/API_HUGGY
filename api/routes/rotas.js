// ==================== IMPORTACOES ====================== //
const rotas = require('express').Router()
const controlador = require('../controller/controlador')

// ================== ROTAS DE GET ===================== //
rotas.get('/guias',  controlador.buscar_beneficiario_guias)
rotas.get('/titularBoleto', controlador.buscar_titular_boleto_digitos)
rotas.get('/boleto', controlador.buscar_boletos)
rotas.get('/guia', controlador.buscar_guia)
rotas.get('/listarGuias', controlador.listar_guias)

// ======================= ROTAS DE POST ========================= //
rotas.post('/gerarProtocolo', controlador.criar_protocolo)
rotas.post('/adicionarAtendimentoBoleto', controlador.adicionar_atendimento)
rotas.post('/adicionarAtendimentoGuias', controlador.adicionar_atendimento)
rotas.post('/insereMensagemAtendimento', controlador.adicionar_mensagem_atendimento_boleto)
rotas.post('/fecharAtendimento', controlador.fechar_atendimento)

// ====================== EXPORTACOES ============================ //
module.exports = rotas