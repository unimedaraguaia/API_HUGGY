// IMPORTACOES
const banco = require('../model/banco')

/**
 * Função que busca um usuario no banco pelo cpf
 * @param {*} req requisição com o cpf da pessoa do qual se deseja o nome
 * @param {*} res resposta em JSON para status da consulta
 */
const buscarUsuario = async (req, res) => {
    
    let database
    const { cpf } = req.params;
    // Tenta conectar ao banco
    try {
        // executar SQL
        const resultado = await banco.pegaNomeUsuario(cpf)
        
        if (resultado.rows.length > 0) {
            // caso de sucesso, nome encontrado
            res.status(200).json({ 
                mensagem:"Olá",
                usuario: resultado.rows[0]
             });
        } else {
            // caso de falha, nome não encontrado
            res.status(200).json({
                mensagem: "Desculpe, Usuário não encontrado",
                usuario:{
                    "CNOMEUSUA":""
                } 
            });
            
        }
    }catch(erro){
        console.error("CONEX> ERRO AO ACESSAR BANCO:", erro);
        // caso de erro de acesso ao banco
        res.status(200).json({ 
            mensagem: "Desculpe, serviço indisponível", 
            usuario:{
                "CNOMEUSUA":""
            } 
        });
    }
}


const buscarCodigoTitular = async (req, res) => {
    
    let database
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


// EXPORTAÇÃO
module.exports = {
    buscarUsuario, 
    buscarCodigoTitular
}