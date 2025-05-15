// IMPORTACOES
const rotas = require('express').Router()
const controlador = require('../controller/controlador')

// CONFIGURANDO ROTAS
// rota para pegar os dados do usuário por meio do cpf
rotas.get('/usuario/:cpf', controlador.buscarUsuarioCpf)
// rota para pegar o codigo do titular por meio de uma carteira
rotas.get('/titular/:carteira', controlador.buscarCodigoTitular)
// rota para pegar os boletos por meio do codigo do titular
rotas.get('/boleto/:codigoTitular', controlador.buscarBoleto)
// rota para pegar a linha digitavel de um boleto 
//rotas.get('/pagar/:idBoleto', controlador.buscarLinhaEditavel)
// rota para pegar dados de beneficiários com indepente se for por cpf ou por carteira

rotas.get('/beneficiario/:digitos', controlador.buscarBeneficiarioDigitos)
// rota para acessar o boleto
rotas.get('/:id', controlador.pegaLink)
rotas.get('/guias/:numeroGuia', controlador.buscarGuia)

// EXPORTACOES
module.exports = rotas