// IMPORTACOES
require('dotenv').config({path: '.env'})
const banco = require('oracledb')

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

// EXPORTANDO FUNCOES
module.exports = {
    pegaNomeUsuario
}