// IMPORTACOES
const banco = require('oracledb')
//require('dotenv').config()
/**
 * Funçao que conecta com o banco de dados
 * @returns um conector para o banco em caso de sucesso ou erro a ser tratado
 */
const conectarBanco = async () => {
    // Tenta estabelecer conexao no banco
    try {
        // conecta no banco
        const conexao = await banco.getConnection({
            user: process.env.USER,
            password: process.env.PASS,
            connectString: process.env.CONNECT
        })
        // retorna o conector
        return conexao
    }catch(erro) {
        throw erro; // Lançando erro para tratamento externo
    }   
}

/**
 * Funcção que pega o nome de um usuário do banco pelo cpf
 * @param {*} cpf cpf do usuário que se deseja o nome 
 * @returns nome do benficiario em caso de sucesso e um erro caso não seja encontrado
 */
const pegaNomeUsuario = async (cpf) => {
    // variavel de conexao
    let DB 
    //tenta
    try {
        // estabelece conexao com banco
        DB = await conectarBanco()
        // executa a consulta no banco
        const resultado = await DB.execute(
            `SELECT U.CNOMEUSUA
             FROM HSSUSUA U
             WHERE U.C_CPFUSUA = :cpf`,
            {cpf},
            {outFormat:banco.OUT_FORMAT_OBJECT}
        )
        // retorna resultado
        return resultado

    }catch(erro) {
        // caso de erro  lanca a excessão para ser tratada externamente
        throw erro

    }finally {
        // Se a conexão ainda existe
        if(DB) {
            // tenta fechar a conexao
            try {
                // fecha a conexao
                await DB.close()
            }catch(erro){
                // lanca excessão caso nao consiga fechar a conexão
                throw erro;
            }
        }
    }
}


/**
 * Função busca o codigo do titular pelo numero da carteira passada
 * @param {*} carteira string com o numero de carteira do beneficiário
 * @returns JSON do resultado da consulta do banco
 */
const buscarTitularCarteira = async (carteira) => {
    // variaveis
    let BD
    // tenta conectar ao banco
    try {
        BD = await conectarBanco()

        const consulta = await BD.execute(
            `select u.nnumetitu
             from hssusua u
             where u.ccodiusua = :carteira and u.csituusua = 'A'`,
             {carteira},
             {outFormat:banco.OUT_FORMAT_OBJECT}
        )

        return consulta

    }catch(erro) {
        throw erro

    }finally {
         // Se a conexão ainda existe
         if(BD) {
            // tenta fechar a conexao
            try {
                // fecha a conexao
                await BD.close()
            }catch(erro){
                // lanca excessão caso nao consiga fechar a conexão
                throw erro;
            }
        }
    }
} 

//buscarTitularCarteira('2357001018378221')

// EXPORTANDO FUNCOES
module.exports = {
    pegaNomeUsuario,
    buscarTitularCarteira
}