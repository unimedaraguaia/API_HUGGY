// IMPORTACOES
const banco = require('../model/banco')             // conector de banco
const shortLinks = require('../util/encurtador')    // mapeador de links encurtados
const beneficiario = require('../model/beneficiario')
const boleto = require("../model/boleto")

const Beneficiario = new beneficiario.Beneficiario()
const Boleto = new boleto.Boleto()

/**
 * Busca um usuario no banco pelo cpf
 * @param {*} req requisição com o cpf da pessoa do qual se deseja o nome
 * @param {*} res resposta em JSON para status da consulta
 */
const buscarUsuarioCpf = async (req, res) => {
    const { cpf } = req.params;
    try {
        const resultado = await Beneficiario.buscarTitularCpf(cpf)
        if (resultado.rows.length > 0) {
            res.status(200).json(
                { 
                    mensagem:"200",
                    titular: resultado.rows[0]
                }
            );
        } 
        else {
            res.status(200).json(
                {
                    mensagem: "404"
                }
            );
        }
    }
    catch(erro) {
        res.status(200).json(
            { 
                mensagem: "500"
            }
        );
    }
}

/**
 * Busca um titular por meio do numero de carteirinha
 * @param {*} req numero da cateirinha
 * @param {*} res json com a mensagem e o resultado
 */
const buscarCodigoTitular = async (req, res) => {
    const { carteira } = req.params;
    try {
        const resultado = await Beneficiario.pegarNomeUsuario(carteira)
        if (resultado.rows.length > 0) {
            res.status(200).json(
                { 
                    mensagem:"200",
                    titular: resultado.rows[0]
                }
            );
        } 
        else {
            res.status(200).json(
                {
                    mensagem: "404"
                }
            );
            
        }
    }
    catch(erro) {
        res.status(200).json(
            { 
                mensagem: "500"
            }
        );
    }
}

/**
 * Busca um beneficiário por meio dos digitos passados.
 * @param {*} req são os digitos que podem ser cpf ou o codigo de carteirinha
 * @param {*} res json com a mensagem e o resultado.
 */
const buscarBeneficiarioDigitos = async (req, res) => { 
    const { digitos } = req.params;
    try {
        const resultado = await Beneficiario.buscarBeneficiarioTitularBoleto(digitos)
        if (resultado.rows.length > 0) {
            res.status(200).json(
                { 
                    mensagem:"200",
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
 * Busca todos os boletos em aberto de um beneficiario titular
 * @param {*} req codigo do beneficiário titular
 * @param {*} res json com a mensagem e o resultado
 */
const buscarBoleto = async (req, res) => {
    const { codigoTitular } = req.params;
    try {
        
        const resultado = await Boleto.buscarBoletosTitular(codigoTitular)
        if (resultado.rows.length > 0) {
            resposta = { mensagem:'200' }
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
        const resultado = await banco.pegarStatusGuia(numeroGuia)
        if(resultado.rows.length > 0){
            res.status(200).json({ 
                mensagem:"200",
                guia: resultado.rows[1]
             });
        } else{
            res.status(200).json(
                {
                    mensagem:"404",
                }
            )
        }
    }catch(erro){
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
    buscarBeneficiarioDigitos, 
    pegaLink,
    buscarGuia, 
    buscarCodigoTitular, 
    buscarUsuarioCpf
}