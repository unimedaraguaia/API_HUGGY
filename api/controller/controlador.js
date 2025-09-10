// ===================== IMPORTACOES ========================== //
const shortLinks = require('../util/encurtador')        
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
                        numerotitular: dadosTitular.rows[0].NNUMETITU,
                        nome: dadosTitular.rows[0].CNOMEUSUA,
                        numerousua:dadosTitular.rows[0].NNUMEUSUA,
                        idpessoa:dadosTitular.rows[0].NNUMEPESS
                    }
                }
            )
        } else {
            res.status(200).json(
                { 
                    mensagem: "404" 
                }
            )
        }
    } catch(erro) {
        res.status(200).json(
            { 
                mensagem: "500" 
            }
        )
    }
}

const buscar_titular_guias = async (req, res) => {
    const { cpf } = req.headers
    try {
        const Beneficiario = new beneficiario.Beneficiario()
        const dadosTitular = await Beneficiario.buscar_titular_ativo_guias(cpf)
        if (dadosTitular.rows.length > 0) {
            res.status(200).json(
                { 
                    mensagem:"200",
                    status:{
                        sucesso:"✅"
                    },
                    titular: {
                        numerotitular: dadosTitular.rows[0].NNUMETITU,
                        nome: dadosTitular.rows[0].CNOMEUSUA,
                        numerousua:dadosTitular.rows[0].NNUMEUSUA,
                        idpessoa:dadosTitular.rows[0].NNUMEPESS
                    }
                }
            )
        } 
        else {
            res.status(200).json(
                {
                    mensagem: "404"
                } 
            )
        }
    }
    catch(erro) {
        res.status(200).json(
            { 
                mensagem: "500"
            } 
        )
    }
}

const buscar_boletos = async (req, res) => {
    const {numerotitular} = req.headers;
    try {
        const Boleto = new boleto.Boleto()
        const dadosBoletos = await Boleto.buscar_boletos_titular(numerotitular)
        if (dadosBoletos.rows.length > 0) {
            resposta = {
                mensagem:'200',
                status:{
                   data:"🗓️",
                   money:"💵",
                   doc:"📄", 
                   link:"🔗"
                },
                arquivos: dadosBoletos.rows.arquivos,
            }
            for (let i = 0; i < dadosBoletos.rows.length; i++) {
                resposta[`boleto${i + 1}`] = dadosBoletos.rows[i]
            }
            res.status(200).json(resposta);
        } else {
            console.log("[API] > Boletos nao encontrados")
            res.status(200).json(
                {
                    mensagem: "404"
                }
            )
        }
    } catch(erro) {
        console.log("[API] Erro ao buscar boletos")
        console.log(erro)
        res.status(200).json(
            {
                mensagem: "500"
            }
        )
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
                        prestador: resultado.rows[0]['NOME_PRESTADOR'],
                        operador: resultado.rows[0]['NOME_OPERADOR'],
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
        } else {
            res.status(200).json(
                {
                    mensagem:"404"
                }
            )
        }
    } catch(erro) {
        console.log("[API] falha ao buscar guia", erro)
        res.status(200).json(
            {
                mensagem:"500"
            }
        )
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
                    guia:"📋"
                } 
            }
            
            for (let i = 0; i < resultado.rows.length; i++) {
                resposta[`guia${i + 1}`] = resultado.rows[i]
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
            console.log("[API] Guias encontradas")
            res.status(200).json(resposta);
        } else {
            console.log('[API] nenhuma guia encontrada')
            res.status(200).json(
                {
                    mensagem:"404"
                }
            )
        }
    } catch(erro) {
        console.log('[API] Erro ao lista guias', erro)
        res.status(200).json(
            {
                mensagem:"500"
            }
        )
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
        } else {
            console.error('[API] Erro ao criar protocolo status diferente de 200')
            res.status(200).json(
                {
                    mensagem:'500'
                }
            )
        }
    } catch(erro) {
        console.error('[API] Erro ao criar protocolo erro do catch')
        res.status(200).json(
            {
                mensagem:'500'
            }
        )
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
            console.log(`[API] Sucesso ao criar atendimento`)
            res.status(200).json(
                {
                    mensagem:"200",
                    atendimento: {
                        id: resultado.atendimento.id
                    }
                }
            )
        } else {
            console.error(`[API] Erro, não foi possivel criar atendimento status diferente de 200`)
            res.status(200).json(
                {
                    mensagem: "500"
                }
            )
        }
    } catch(erro) {
        console.error(`[API] Erro a criar atendimento Lançamento de exception`)
        res.status(500).json(
            {   
                mensagem: "500"
            }
        )
    }
}

const adicionar_mensagem_atendimento_boleto = async (req, res) => {
    const { idatendimento, mensagem } = req.headers
    try {
        const Atendimento = new atendimento.Atendimento()
        const operacao = await Atendimento.adicionar_mensagem_atendimento_segunda_via_boleto(idatendimento, mensagem)
        if(operacao.status == "200") {
            console.log(`[API] Mensagem adicionada`)
            res.status(200).json(
                {
                    mensagem: "200",
                    info: `Mensagem adicionada ao atendimento ${idatendimento}`
                }
            )
        } else {
            console.error(`[API] Erro ao adicionar mensagem boletos (Status diferente de 200)`)
            res.status(500).json(
                {
                    mensagem: "500",
                    info: `Falha ao adicionar mensagem no atendimento ${idatendimento}`
                }
            )
        }
    } catch(erro) {
        console.error(`[API] Erro ao adicionar mensagem (Excessão lançada)\n${erro}`)
        res.status(500).json(
            {
                mensagem: "500",
                info: `Falha ao adicionar mensagem no atendimento ${idatendimento}`
            }
        )
    }
}

const fechar_atendimento = async (req, res) => {
    const { idatendimento } = req.headers
    try {
        const Atendimento = new atendimento.Atendimento()
        const operacao = await Atendimento.fechar_atendimento_crm(idatendimento)
        if(operacao.status == "200") {
            console.log(`[API] Atendimento fechado`)
            res.status(200).json(
                {
                    mensagem: "200",
                    info: `Atendimento Fechado ${idatendimento}`
                }
            )
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
        console.log(`[API] Atendimento não fechado (excessao)\n${erro}`)
        res.status(500).json(
            {
                mensagem: "500",
                info: `Falha ao fechar atendimento ${idatendimento}`
            }
        )
    }
}
// =========================================== EXPORTAÇÃO ============================================== //
module.exports = {
    buscar_boletos,
    buscar_titular_boleto_digitos,
    buscar_titular_guias,
    pegar_link,
    buscar_guia, 
    listar_guias, 
    criar_protocolo,
    adicionar_atendimento, 
    adicionar_mensagem_atendimento_boleto,
    fechar_atendimento
}