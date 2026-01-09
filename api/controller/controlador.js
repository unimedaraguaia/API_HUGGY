// ===================== IMPORTACOES ========================== //
const shortLinks = require('../util/encurtador')
const logger = require('../src/logger')         
const beneficiario = require('../model/beneficiario')
const boleto = require("../model/boleto")
const guia = require('../model/guia')
const protocolo = require('../model/protocolo')
const atendimento = require('../model/atendimento')

// ============================== FUNÇÕES =========================================================== //

const buscar_titular_boleto_digitos = async (req, res) => { 
    const {digitos} = req.headers
    try {
        const Beneficiario = new beneficiario.Beneficiario()
        const dadosTitular = await Beneficiario.buscar_titular_boleto(digitos)
        if (dadosTitular.rows.length > 0) {
            res.status(200).json(
                { 
                    mensagem:"200",
                    titular: {
                        numerocontrato: dadosTitular.rows[0].NNUMETITU,
                        nome: dadosTitular.rows[0].CNOMEUSUA,
                        numerousuario:dadosTitular.rows[0].NNUMEUSUA,
                        idpessoa:dadosTitular.rows[0].NNUMEPESS
                    }
                }
            )
            logger.info(`[API]> titular de boleto encontrado :[${digitos}]`)
        } else {
            res.status(200).json(
                { 
                    mensagem: "404" 
                }
            )
            logger.warn(`[API]> titular de boleto nao encontado:[${digitos}]`)
        }
    } catch(erro) {
        res.status(200).json(
            { 
                mensagem: "500" 
            }
        )
        logger.error(`[API]> busca de titular falhou :[${digitos}]\n${erro}`)
    }
}

const buscar_beneficiario_guias = async (req, res) => {
    const { cpf } = req.headers
    try {
        const Beneficiario = new beneficiario.Beneficiario()
        const dadosTitular = await Beneficiario.buscar_beneficiario_ativo_guias(cpf)
        if (dadosTitular.rows.length > 0) {
            res.status(200).json(
                { 
                    mensagem:"200",
                    titular: {
                       
                        nome: dadosTitular.rows[0].CNOMEUSUA,
                        numerousuario:dadosTitular.rows[0].NNUMEUSUA,
                        idpessoa:dadosTitular.rows[0].NNUMEPESS
                    }
                }
            )
            logger.info(`[API]> beneficiario da guia encontrado :[${cpf}]\n`)
        } 
        else {
            res.status(200).json(
                {
                    mensagem: "404"
                } 
            )
            logger.warn(`[API]> beneficiário da guia não encontrado :[${cpf}]\n`)
        }
    }
    catch(erro) {
        res.status(200).json(
            { 
                mensagem: "500"
            } 
        )
        logger.error(`[API]> ao buscar beneficio da guia :[${cpf}]${erro}\n`)
    }
}

const buscar_boletos = async (req, res) => {
    const {numerousuario, numerocontrato} = req.headers;
    try {
        const Boleto = new boleto.Boleto()
        const dadosBoletos = await Boleto.buscar_boletos_titular(numerousuario, numerocontrato)
        if (dadosBoletos.rows.length > 0) {
            resposta = {
                mensagem:'200',
                arquivos: dadosBoletos.rows.arquivos,
            }
            for (let i = 0; i < dadosBoletos.rows.length; i++) {
                resposta[`boleto${i + 1}`] = dadosBoletos.rows[i]
            }
            res.status(200).json(resposta);
            logger.info(`[API]> ao buscar boleto contrato: [${numerocontrato}]`)
        } else {
            console.log("[API] > Boletos nao encontrados")
            res.status(200).json(
                {
                    mensagem: "404"
                }
            )
            logger.warn(`[API]> boleto nao encontado do contrato: [${numerocontrato}]`)
        }
    } catch(erro) {
        console.log("[API] Erro ao buscar boletos")
        console.log(erro)
        res.status(200).json(
            {
                mensagem: "500"
            }
        )
        logger.error(`[API]> ao buscar boleto do contrato :[${numerocontrato}]\n${erro}`)
    }
}

const pegar_link = async (req, res) => {
    const destino = shortLinks.get(req.params.id);
    if (destino) {
        console.log('Redirecionando para:', destino);
        return res.redirect(destino);
    }
    res.status(404).send('Link não encontrado');
}

const buscar_guia = async (req, res) => {
    const { numero, numerousuario } = req.headers
    try {
        const Guia = new guia.Guia()
        const resultado = await Guia.pegar_dados_guia(numero, numerousuario)
        if(resultado.rows.length > 0) {
            res.status(200).json(
                { 
                    mensagem:"200",
                    guia: {
                        idguia : resultado.rows[0]['ID_GUIA'],
                        status : resultado.rows[0]['STATUS'],
                        tipoguia: resultado.rows[0]['TIPO_GUIA'],
                        solicitante: resultado.rows[0]['NOME_SOLICITANTE'],
                        executante: resultado.rows[0]['NOME_PRESTADOR'],
                        idusuario: resultado.rows[0]['ID_USUARIO'],
                        emissao: resultado.rows[0]['EMISSAO'],
                        validade: resultado.rows[0]['VALIDADE']
                    },
                    numeros: {
                        numero1: resultado.rows[0]['ID_GUIA'],
                        numero2: '',
                        numero3: ''
                    }
                   
                }
            )
            logger.info(`[API]> guia encontrada :[${numero}]`)
        } else {
            res.status(200).json(
                {
                    mensagem:"404"
                }
            )
            logger.warn(`[API]> não encontrada a guia de numero :[${numero}]$`)
        }
    } catch(erro) {
        console.log("[API] falha ao buscar guia", erro)
        res.status(200).json(
            {
                mensagem:"500"
            }
        )
        logger.error(`[API]> falha ao buscar guia numero:[${numero}]\n${erro}`)
    }
}

const listar_guias = async (req, res) => {
    const {numerousuario} = req.headers
    try {
        const Guia = new guia.Guia()
        const resultado = await Guia.listar_guias_beneficiario(numerousuario)
        
        if(resultado.rows.length > 0) {
            resposta = { 
                mensagem:'200',
                status:{
                    guia:'OK'
                } 
            }
            
            for (let i = 0; i < resultado.rows.length; i++) {
                resposta[`guia${i + 1}`] = {
                    idguia:resultado.rows[i]['ID_GUIA'],
                    emissao:resultado.rows[i]['EMISSAO'],
                    tipoguia:resultado.rows[i]['TIPO_GUIA'],
                    status:resultado.rows[i]['STATUS']
                }
            }
            
            let numeroGuias = {}

            for (let indice = 0; indice < 3; indice++) {
                if(indice < resultado.rows.length) {
                    numeroGuias[`numero${indice+1}`] = resultado.rows[indice]['ID_GUIA']
                } else {
                    numeroGuias[`numero${indice+1}`] = ''
                }
            }
            resposta[`numeros`] = numeroGuias
            res.status(200).json(resposta);
            logger.info(`[API]> guias encontrada :[${numeroGuias}]${numero}]`)
        } else {
            res.status(200).json(
                {
                    mensagem:"404"
                }
            )
            logger.warn(`[API]> nenhuma guia encontrada : [${numeroGuias}]\n`)
        }
    } catch(erro) {
        console.log('[API] Erro ao lista guias', erro)
        res.status(200).json(
            {
                mensagem:"500"
            }
        )
        logger.error(`[API] Erro: na listagem de guias: [${numeroGuias}]\n${erro}\n`)
    }
}

const criar_protocolo = async (req, res) => {
    const { idpessoa } = req.headers
    try {
        const Protocolo = new protocolo.Protocolo()
        const resultado = await Protocolo.criar_protocolo(idpessoa)
        if(resultado.status == '200') {
            res.status(200).json(
                {
                    mensagem:'200',
                    protocolo: {
                        id:resultado.idProtocolo,
                        numero:resultado.numeroProtocolo
                    }
                }
            )
            logger.info(`[API]> protocolo criado\n`)  
        } else {
            res.status(200).json(
                {
                    mensagem:'500'
                }
            )
            logger.warn(`[API]> Erro ao criar protocolo status diferente de 200\n`)
        }
    } catch(erro) {
        res.status(200).json(
            {
                mensagem:'500'
            }
        )
        logger.error(`[API]> ao criar protocolo erro capturado\n ${erro}\n`)
    }
}

const adicionar_atendimento = async (req, res) => {
    const { idprotocolo, 
            tipoatendimento, 
            idusuario 
    } = req.headers

    try {
        const Atendimento = new atendimento.Atendimento()
        const resultado = await Atendimento.criar_atendimento(idprotocolo, idusuario, tipoatendimento)  
        if(resultado.status == "200" && resultado.atendimento.id > 0) {  
            res.status(200).json(
                {
                    mensagem:"200",
                    atendimento: {
                        id: resultado.atendimento.id
                    }
                }
            )
            logger.info(`[API]> criado atendimento para: ${idusuario}`)
        } else {
            res.status(200).json(
                {
                    mensagem: "500"
                }
            )
            logger.warn(`[API]> erro ao criar atendimento para: ${idusuario} codigo de retorno diferente de 200`)
        }
    } catch(erro) {
        console.error(`[API] Erro a criar atendimento Lançamento de exception`)
        res.status(500).json(
            {   
                mensagem: "500"
            }
        )
        logger.error(`[API]>  ao criado atendimento para: [${idusuario}]´\n ${erro}`)
    }
}

const adicionar_mensagem_atendimento_boleto = async (req, res) => {
    const { idatendimento, mensagem } = req.headers
    try {
        const Atendimento = new atendimento.Atendimento()
        const operacao = await Atendimento.adicionar_mensagem_atendimento_segunda_via_boleto(idatendimento, mensagem)
        if(operacao.status == "200") {
            res.status(200).json(
                {
                    mensagem: "200",
                    info: `Mensagem adicionada ao atendimento ${idatendimento}`
                }
            )
            logger.info(`[API] Mensagem adicionada ao atendimento ${idatendimento}`)
        } else {
            res.status(500).json(
                {
                    mensagem: "500",
                    info: `Falha ao adicionar mensagem no atendimento ${idatendimento}`
                }
            )
            logger.warn(`[API] Erro ao adicionar mensagem no atendimento ${idatendimento} Status diferente de 200`)
        }
    } catch(erro) {
        console.error(`[API] Erro ao adicionar mensagem (Excessão lançada)\n${erro}`)
        res.status(500).json(
            {
                mensagem: "500",
                info: `Falha ao adicionar mensagem no atendimento ${idatendimento}`
            }
        )
        logger.error(`[API] Erro ao adicionar mensagem no atendimento ${idatendimento} ${erro}`)
    }
}

const fechar_atendimento = async (req, res) => {
    const { idatendimento } = req.headers
    try {
        const Atendimento = new atendimento.Atendimento()
        const operacao = await Atendimento.fechar_atendimento_crm(idatendimento)
        if(operacao.status == "200") {
            res.status(200).json(
                {
                    mensagem: "200",
                    info: `Atendimento Fechado ${idatendimento}`
                }
            )
            logger.info(`$[API] Atendimento ${idatendimento} fechado`)
        } else {
            console.log(`[API] Atendimento nao fechado`)
            res.status(500).json(
                {
                    mensagem: "500",
                    info: operacao.mensagem
                }
            )
        }
    } catch(erro) {
        res.status(500).json(
            {
                mensagem: "500",
                info: `Falha ao fechar atendimento ${idatendimento}`
            }
        )
        logger.error(`[API] Atendimento não fechado (excessao)\n${erro}`)
    }
}
// =========================================== EXPORTAÇÃO ============================================== //
module.exports = {
    buscar_boletos,
    buscar_titular_boleto_digitos,
    buscar_beneficiario_guias,
    pegar_link,
    buscar_guia, 
    listar_guias, 
    criar_protocolo,
    adicionar_atendimento, 
    adicionar_mensagem_atendimento_boleto,
    fechar_atendimento
}