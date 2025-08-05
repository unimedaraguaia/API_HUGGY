// IMPORTACOES
const banco = require('../model/banco')             // conector de banco
const shortLinks = require('../util/encurtador')    // mapeador de links encurtados
const beneficiario = require('../model/beneficiario')
const boleto = require("../model/boleto")
const guia = require('../model/guia')
const protocolo = require('../model/protocolo')
const atendimento = require('../model/atendimento')

// Classes necessárias
const Beneficiario = new beneficiario.Beneficiario()
const Boleto = new boleto.Boleto()
const Guia = new guia.Guia()
const Protocolo = new protocolo.Protocolo()
const Atendimento = new atendimento.Atendimento()


// Por meio dos digitos passado verifica se é um titular com acesso aos boletos
// Retorna [id, nome] caso encontre.

/**
 * Função que busca o titular que pode obter boletos Online
 * @param {*} req requisição que contem os digitos que podem ser CPF ou numero de carteira
 * @param {*} res resposta para a rota sobre o status da operção executada
 */
const buscarTitularBoletoDigitos = async (req, res) => { 
    // Obtendo os dados
    //const { digitos } = req.params;
    const {digitos} = req.headers

    try {
        // Faz a consulta
        const resultado = await Beneficiario.buscarTitularBoleto(digitos)
        // se a contem dados nas linhas
        if (resultado.rows.length > 0) {
            // retona o JSON de sucesso
            res.status(200).json(
                { 
                    mensagem:"200",
                    status:{
                        sucesso:"✅"
                    }, 
                    titular: {
                        numero_titular: resultado.rows[0].NNUMETITU,
                        nome: resultado.rows[0].CNOMEUSUA,
                        numero_usua:resultado.rows[0].NNUMEUSUA,
                        id_pessoa:resultado.rows[0].NNUMEPESS
                    }
                }
            );
        } // sem dados nas linhas
        else {
            // retorna JSON de falha
            res.status(200).json(
                {
                    mensagem: "404",
                    status: {
                        falha: "⚠️"
                    }
                } 
            );
        }
    }
    catch(erro) {
        // No caso de erro ou lançamento de exception
        res.status(200).json(
            { 
                mensagem: "500", 
                status: {
                    erro: "🛑"
                }
            } 
        );
    }
}

// Por meio do codigo do titular busca os boletos não pagos do mesmo.
const buscarBoleto = async (req, res) => {
    const { numero_titular } = req.headers;
    try {
        const resultado = await Boleto.buscarBoletosTitular(numero_titular)
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

/**
 * Função que cria um protocolo pegando apenas o id pessoa do titular
 * @param {*} req identificador pessoa do titular
 * @param {*} res json contendo o status da operação ou uma exception
 */
const criarProtocolo = async (req, res) => {
    // Obtem o id pesso da requisição
    //const {idPessoa} = req.params
    const {id_pessoa} = req.headers

    // Tenta criar protocolo
    try {
        const resultado = await Protocolo.criar_protocolo_segunda_via_boleto(id_pessoa)
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
        } // Se resposta diferente de 200
        else {
            // Exibe mensagem e retorna json de falha
            console.error('[Protocolo] > cria_protocolo_segunda_via_boleto: (Erro Status diferente de 200)\n');
            res.status(200).json(
                {
                    mensagem:'500'
                }
            )
        }
    } // em caso de erro
    catch(erro) {
        // Exibe mensagem e retorna json de falha
        console.error('[Protocolo] > cria_protocolo_segunda_via_boleto: (Erro ao criar Protocolo)\n', erro);
        res.status(200).json(
            {
                mensagem:'500'
            }
        )
    }
}

/**
 * Função que cria um atendimento 
 * @param {*} req requisição que contem o dados nescessários para criar o atendimento
 * @param {*} res resposta a ser enviada para a requisição
 */
const adicionaAtendimento = async (req, res) => {
    // Obtendo os dados do header da requisição
    const { id_protocolo, 
            tipo_atendimento, 
            id_usuario 
          } = req.headers
    console.log(id_protocolo, tipo_atendimento, id_usuario)
    try {
        // tenta criar o atendimento
        const resultado = await Atendimento.criar_atendimento_segunda_via_boleto(id_protocolo, id_usuario, tipo_atendimento)
        // verifica o resultado obtido, se caso o status for 200 e o id > 0 responde sucesso
        if(resultado.status == "200" && resultado.atendimento.id > 0) {  
            console.log(
                `[Controler.adicionaAtendimento] \n
                > cria_atendimento_segunda_via_boleto \n 
                (Sucesso atendiento criado)\n`
            )
            res.status(200).json(
                {
                    mensagem:"200",
                    atendimento: {
                        id: resultado.atendimento.id
                    }
                }
            )
        }// caso contrário responde 500 para falha
        else {
            console.error(
                `[Controler.adicionaAtendimento]
                > cria_atendimento_segunda_via_boleto
                Erro: não foi possivel criar atendimento status diferente de 200\n`
            )
            res.status(200).json(
                {
                    mensagem: "500"
                }
            )
        }
    }// em caso de erro 
    catch(erro) {
        console.error(
            `[Controler.adicionaAtendimento]
            > cria_atendimento_segunda_via_boleto
            Erro: Lançamento de exception:\n ${erro}`
        )
        res.status(500).json(
            {   
                mensagem: "500"
            }
        )
    }
}

/**
 * Função para adicionar uma mensagem a um atendimento
 * @param {*} req requsiçao conetendo os dados para ser inseridos no atendimento
 * @param {*} res resposta de retorno para a chamada
 */
const adicionaMensagem = async (req, res) => {
    // obtendo os dados do body
    const { id_atendimento } = req.headers
    const { mensagem } = req.body
    // Tenta adicionar as informações no atendimento
    try {
        const operacao = await Atendimento.adiciona_mensagem_boletos(id_atendimento, mensagem)
        // caso o obtenha sucesso 
        if(operacao.status == "200") {
            console.log(
                `[Atendimento] 
                > adiciona_mensagem_boletos: 
                (Sucesso ao inserir mensagem)\n`
            )
            res.status(200).json(
                {
                    mensagem: "200",
                    info: `Mensagem adicionada ao atendimento ${id_atendimento}`
                }
            )
        }// no caso de falha
        else {
            console.error(
                `[Atendimento] 
                > adiciona_mensagem_boletos: 
                (Status diferente de 200)\n`
            )
            res.status(500).json(
                {
                    mensagem: "500",
                    info: `Falha ao adicionar mensagem no atendimento ${id_atendimento}`
                }
            )
        }
    }// caso uma exceptions seja lançada
    catch(erro) {
        console.error(
            `[Atendimento] 
            > adiciona_mensagem_boletos: 
            (Excessão lançada)\n${erro}`
        )
        res.status(500).json(
            {
                mensagem: "500",
                info: `Falha ao adicionar mensagem no atendimento ${id_atendimento}`
            }
        )
    }
}

/**
 * Função para fechar um determinado atendimento
 * @param {*} req requisição que contem a informação do atendimento a ser fechado
 * @param {*} res resposta de retorno para a chamada
 */
const fecharAtendimento = async (req, res) => {
    // Obtendo dados 
    const {id_atendimento} = req.headers
    // Tenta fechar o atendimento
    try {
        const operacao = await Atendimento.fechar_atendimento(id_atendimento)
        // em caso de sucesso 
        if(operacao.status == "200") {
            console.log(
                `[Controler] 
                > fechar_atendimento: 
                (Status diferente de 200)\n`
            )
            res.status(200).json(
                {
                    mensagem: "200",
                    info: `Atendimento Fechado ${id_atendimento}`
                }
            )
        } // em caso de falha
        else {
            console.log(
                `[Atendimento] 
                > fechar_atendimento: 
                (Status diferente de 200)\n`
            )
            res.status(500).json(
                {
                    mensagem: "500",
                    info: operacao.mensagem
                }
            )
        }
    }
    catch(erro) {

        console.log(
            `[Atendimento] 
            > fechar_atendimento: 
            (Excessão lançada)\n${erro}`
        )
        res.status(500).json(
            {
                mensagem: "500",
                info: `Falha ao fechar atendimento ${id_atendimento}`
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