// IMPORTACOES
const { response } = require('express');
const banco = require('../model/banco')
const shortLinks = require('../util/encurtador')

/**
 * Função que busca um usuario no banco pelo cpf
 * @param {*} req requisição com o cpf da pessoa do qual se deseja o nome
 * @param {*} res resposta em JSON para status da consulta
 */
const buscarUsuario = async (req, res) => {
    
    const { cpf } = req.params;
    // Tenta conectar ao banco
    try {
        // executar SQL
        const resultado = await banco.pegaNomeUsuario(cpf)
        
        if (resultado.rows.length > 0) {
            // caso de sucesso, nome encontrado
            res.status(200).json({ 
                mensagem:"200",
                titular: resultado.rows[0]
             });
        } else {
            // caso de falha, nome não encontrado
            res.status(200).json({
                mensagem: "404",
                titular:{
                    "NNUMETITU":""
                } 
            });
            
        }
    }catch(erro){
        // caso de erro de acesso ao banco
        res.status(200).json({ 
            mensagem: "500", 
            titular:{
                "NNUMETITU":""
            } 
        });
    }
}

/**
 * Busca um titular por meio do numero de carteirinha
 * @param {*} req numero da cateirinha
 * @param {*} res json com a mensagem e o resultado
 */
const buscarCodigoTitular = async (req, res) => {
    
    const { carteira } = req.params;
    // Tenta conectar ao banco
    try {
        // executar SQL
        const resultado = await banco.buscarTitularCarteira(carteira)
        
        if (resultado.rows.length > 0) {
            // caso de sucesso, nome encontrado
            res.status(200).json({ 
                mensagem:"200",
                titular: resultado.rows[0]
             });
        } else {
            // caso de falha, nome não encontrado
            res.status(200).json({
                mensagem: "404",
                titular:{
                    "NNUMETITU":""
                } 
            });
            
        }
    }catch(erro){
        console.error("CONEX> ERRO AO ACESSAR BANCO:", erro);
        // caso de erro de acesso ao banco
        res.status(200).json({ 
            mensagem: "500", 
            titular:{
                "NNUMETITU":""
            } 
        });
    }
}

/**
 * Busca um beneficiário por meio dos digitos passados.
 * @param {*} req são os digitos que podem ser cpf ou o codigo de carteirinha
 * @param {*} res json com a mensagem e o resultado.
 */
const buscarBeneficiario = async (req, res) => {
    
    const { digitos } = req.params;
    // Tenta conectar ao banco
    try {
        // executar SQL
        const resultado = await banco.buscaBeneficiario(digitos)
        
        if (resultado.rows.length > 0) {
            // caso de sucesso, nome encontrado
            res.status(200).json({ 
                mensagem:"200",
                titular: resultado.rows[0]
             });
        } else {
            // caso de falha, nome não encontrado
            res.status(200).json({
                mensagem: "404",
                titular:{
                    "NNUMETITU":""
                } 
            });
            
        }
    }catch(erro){
        // caso de erro de acesso ao banco
        res.status(200).json({ 
            mensagem: "500", 
            titular:{
                "NNUMETITU":""
            } 
        });
    }
}

/**
 * Busca todos os boletos em aberto de um beneficiario titular
 * @param {*} req codigo do beneficiário titular
 * @param {*} res json com a mensagem e o resultado
 */
const buscarBoleto = async (req, res) => {
    
    const { codigoTitular } = req.params;
    // Tenta conectar ao banco
    try {
        // executar SQL
        const resultado = await banco.buscaIdBoleto2(codigoTitular)
        
        if (resultado.rows.length > 0) {
            // caso de sucesso, nome encontrado
            resposta = {mensagem:'200'}
            for (let i = 0; i < resultado.rows.length; i++) {
                resposta[`boleto${i + 1}`] = resultado.rows[i]
            }
            res.status(200).json(resposta);

        } else {
            // caso de falha, nome não encontrado
            res.status(200).json({
                mensagem: "404",
                boletos:{
                    "NNUMETITU":""
                } 
            });
            
        }
    }catch(erro){
        //console.error("CONEX> ERRO AO ACESSAR BANCO:", erro);
        // caso de erro de acesso ao banco
        res.status(200).json({ 
            mensagem: "500", 
            boletos:{
                "NNUMETITU":""
            } 
        });
    }
}

/**
 * Busca a linha editavel de um boleto
 * @param {*} req identificador do boleto as ser buscada a linha digitavel
 * @param {*} res json com a mensagem e o resultado
 */
const buscarLinhaEditavel = async (req, res) => {
    
    const { idBoleto } = req.params;
    // Tenta conectar ao banco
    try {
        // executar SQL
        const resultado = await banco.linhaPagamento(idBoleto)
        
        if (resultado.rows.length > 0) {
            // caso de sucesso, nome encontrado
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
        //console.error("CONEX> ERRO AO ACESSAR BANCO:", erro);
        // caso de erro de acesso ao banco
        res.status(200).json({ 
            mensagem: "500", 
            pagar:{
                "NNUMETITU":""
            } 
        });
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

// EXPORTAÇÃO
module.exports = {
    buscarUsuario, 
    buscarCodigoTitular, 
    buscarBoleto,
    buscarLinhaEditavel,
    buscarBeneficiario, 
    pegaLink
}