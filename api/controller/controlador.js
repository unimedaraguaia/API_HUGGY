// IMPORTACOES
const banco = require('../model/banco')             // conector de banco
const shortLinks = require('../util/encurtador')    // mapeador de links encurtados
const beneficiario = require('../model/beneficiario')
const boleto = require("../model/boleto")
const guia = require('../model/guia')
const protocolo = require('../model/protocolo')
const atendimento = require('../model/atendimento')

const Beneficiario = new beneficiario.Beneficiario()
const Boleto = new boleto.Boleto()
const Guia = new guia.Guia()
const Protocolo = new protocolo.Protocolo()
const Atendimento = new atendimento.Atendimento()


// Por meio dos digitos passado verifica se é um titular com acesso aos boletos
// Retorna [id, nome] caso encontre.
const buscarTitularBoletoDigitos = async (req, res) => { 
    const { digitos } = req.params;
    try {
        const resultado = await Beneficiario.buscarTitularBoleto(digitos)
        if (resultado.rows.length > 0) {
            res.status(200).json(
                { 
                    mensagem:"200",
                    status:{
                        sucesso:"✅"
                    },
                    titular: resultado.rows[0]
                }
            );
        } 
        else {
            res.status(200).json(
                {
                    mensagem: "404",
                } 
            );
        }
    }
    catch(erro) {
        res.status(200).json(
            { 
                mensagem: "500", 
            } 
        );
    }
}

// Por meio do codigo do titular busca os boletos não pagos do mesmo.
const buscarBoleto = async (req, res) => {
    const { codigoTitular } = req.params;
    try {
        const resultado = await Boleto.buscarBoletosTitular(codigoTitular)
        if (resultado.rows.length > 0) {
            resposta = {
                mensagem:'200',
                status:{
                   data:"🗓️",
                   money:"💵",
                   doc:"📄", 
                   link:"🔗"
                }
            }
            for (let i = 0; i < resultado.rows.length; i++) {
                resposta[`boleto${i + 1}`] = resultado.rows[i]
            }
            res.status(200).json(resposta);

        } else {
            res.status(200).json(
                {
                    mensagem: "404"
                }
            );
        }
    }
    catch(erro){
        console.log(erro)
        res.status(200).json(
            { 
                mensagem: "500"
            }
        );
    }
}

const buscarTitular = async (req, res) => {
    const { cpf } = req.params;
    try {
        const resultado = await Beneficiario.ehTitularAtivo(cpf)
        if (resultado.rows.length > 0) {
            res.status(200).json(
                { 
                    mensagem:"200",
                    status:{
                        sucesso:"✅"
                    },
                    titular: resultado.rows[0]
                }
            );
        } 
        else {
            res.status(200).json(
                {
                    mensagem: "404",
                } 
            );
        }
    }
    catch(erro) {
        res.status(200).json(
            { 
                mensagem: "500",
            } 
        );
    }
}

const pegaLink = async (req, res) => {
    const destino = shortLinks.get(req.params.id);
    if (destino) {
        console.log('Redirecionando para:', destino);
        return res.redirect(destino);
    }
    res.status(404).send('Link não encontrado');
}

const buscarGuia = async (req, res) => {
    const { numeroGuia } = req.params
    try{
        const resultado = await Guia.pegarDadosGuia(numeroGuia)
        if(resultado.rows.length > 0){
            
            res.status(200).json({ 
                mensagem:"200",
                guia: resultado.rows[0]
             });
        } else{
            res.status(200).json(
                {
                    mensagem:"404",
                }
            )
        }
    }catch(erro){
        console.log(erro)
        res.status(200).json(
            {
                mensagem:"500",
            }
        )
        console.error(erro)

    }

}

const listarGuias = async (req, res) => {
    const { codigoTitular } = req.params
    try{
        const resultado = await Guia.listarGuiasBeneficiario(codigoTitular)
        if(resultado.rows.length > 0){
            resposta = { 
                mensagem:'200',
                status:{
                    guia:"📋"
                } 
            }
            for (let i = 0; i < resultado.rows.length; i++) {
                resposta[`guia${i + 1}`] = resultado.rows[i]
            }
            res.status(200).json(resposta);
        } else{
            res.status(200).json(
                {
                    mensagem:"404",
                }
            )
        }
    }catch(erro){
        console.log(erro)
        res.status(200).json(
            {
                mensagem:"500",
            }
        )
        console.error(erro)

    }

}

// Protocolos
const criarProtocolo = async (req, res) => {
    const {idPessoa} = req.params
    // Tenta criar protocolo
    try {
        const resultado = await Protocolo.criar_protocolo_segunda_via_boleto(idPessoa)
        if(resultado.status == '200') {
            // secesso ao criar protocolo
            res.status(200).json(
                {
                    mensagem:'200',
                    protocolo: {
                        id:resultado.idProtocolo,
                        numero:resultado.numeroProtocolo
                    }
                }
            )  
        }
        else {
            console.error('[Protocolo] > cria_protocolo_segunda_via_boleto: (Erro Status diferente de 200)\n');
            // falha ao criar protocolo
            res.status(200).json(
                {
                    mensagem:'500'
                }
            )
        }
    }
    catch(erro){
        // Erro ao inicar o processo
        console.error('[Protocolo] > cria_protocolo_segunda_via_boleto: (Erro ao criar Protocolo)\n', erro);
        res.status(200).json(
            {
                mensagem:'500'
            }
        )
    }
}

// Atendimento
const adicionaAtendimento = async (req, res) => {
    
    //console.log('Tipo de req.body:', typeof req.body);
    //console.log('req.body:', req.body);

    const {idProtocolo} = req.params
    const {idPessoa} = req.body
    const {tipoAtendimento} = req.body
    
    try{
        const resultado = await Atendimento.criar_atendimento_segunda_via_boleto(idProtocolo, idPessoa, tipoAtendimento)
        if(resultado.status == '200' && resultado.idAtendimento > 0) {
            console.error('[Atendimento] > cria_atendimento_segunda_via_boleto: (Sucesso atendiento criado)\n');
            res.status(200).json(resultado)
        }
        else {
            resposta = {
                id_atendimento: resultado.idAtendimento,
                status: {
                    atendimento: "nao criado"
                }
            }
            res.status(200).json(resposta)
        }
    }
    catch(erro) {
        console.log(erro)
        res.status(500).json(
            {   
                status: 500,
                mensagem: 'Erro ao adicionar atendimento'
            }
        )
    }
}

// mensagem
const adicionaMensagem = async (req, res) => {

    const {idAtendimento} = req.params
    const mensagem = req.body.mensagem;

    try {

        const operacao = await Atendimento.adiciona_mensagem_boletos(idAtendimento, mensagem)

        if(operacao.status == "200") {

            resposta = {
                status: "200",
                mensage: `Mensagem adicionada ao atendimento ${(idAtendimento)}`
            }

            res.status(200).json(resposta)

        }
        else {

            console.log('[Atendimento] > adiciona_mensagem_boletos: (Status diferente de 200)\n')

            res.status(500).json(
                {
                    status: "500",
                    mensage: `Falha ao adicionar mensagem no atendimento ${(idAtendimento)}`
                }
            )
        }
    }
    catch(erro) {

        console.log('[Atendimento] > adiciona_mensagem_boletos: (Excessão lançada)\n')
        res.status(500).json(
            {
                status: "500",
                mensage: `Falha ao adicionar mensagem no atendimento ${(idAtendimento)}`
            }
        )
    }
}

const fecharAtendimento = async (req, res) => {

    const {idAtendimento} = req.params

    try {

        const operacao = await Atendimento.fechar_atendimento(idAtendimento)

        if(operacao.status == "200") {

            resposta = {
                status: "200",
                mensage: `Atendimento Fechado ${(idAtendimento)}`
            }

            res.status(200).json(resposta)

        }
        else {

            console.log('[Atendimento] > fechar_atendimento: (Status diferente de 200)\n')

            res.status(500).json(
                {
                    status: "500",
                    mensage: operacao.mensagem
                }
            )
        }
    }
    catch(erro) {

        console.log(`[Atendimento] fechar_atendimento: (Excessão lançada)\n${erro}`)
        res.status(500).json(
            {
                status: "500",
                mensage: `Falha ao fechar atendimento ${(idAtendimento)}`
            }
        )
    }
}
// EXPORTAÇÃO
module.exports = {
    buscarBoleto,
    buscarTitularBoletoDigitos,
    buscarTitular,
    pegaLink,
    buscarGuia, 
    listarGuias, 
    criarProtocolo,
    adicionaAtendimento,
    adicionaMensagem,
    fecharAtendimento
}