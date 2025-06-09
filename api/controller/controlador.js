// IMPORTACOES
const banco = require('../model/banco')             // conector de banco
const shortLinks = require('../util/encurtador')    // mapeador de links encurtados
const beneficiario = require('../model/beneficiario')
const boleto = require("../model/boleto")
const guia = require('../model/guia')

const Beneficiario = new beneficiario.Beneficiario()
const Boleto = new boleto.Boleto()
const Guia = new guia.Guia()


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
    }catch(erro){
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

/**
 * Busca a linha editavel de um boleto
 * @param {*} req identificador do boleto as ser buscada a linha digitavel
 * @param {*} res json com a mensagem e o resultado
 */
/*const buscarLinhaEditavel = async (req, res) => {
    const { idBoleto } = req.params;
    try {
        const resultado = await banco.linhaPagamento(idBoleto)
        if (resultado.rows.length > 0) {
            res.status(200).json({ 
                mensagem:"200",
                pagar: resultado.rows[0]
             });
        } else {
            // caso de falha, nome não encontrado
            res.status(200).json({
                mensagem: "404",
                pagar:{
                    "NNUMETITU":""
                } 
            });
            
        }
    }catch(erro){
        res.status(200).json({ 
            mensagem: "500", 
            pagar:{
                "NNUMETITU":""
            } 
        });
    }
}*/

/**
 * Redireciona a para o local onde está ao arquivo
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
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

// EXPORTAÇÃO
module.exports = {
    buscarBoleto,
    buscarTitularBoletoDigitos,
    buscarTitular,
    pegaLink,
    buscarGuia, 
    listarGuias
}