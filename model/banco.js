// IMPORTACOES
require('dotenv').config({path: '.env'})
const banco = require('oracledb')

// FUNCAO DE CONEXAO COM BANCO
const conectarBanco = async () => {
    // Estabelece conexao no banco
    try {
        // conecta no banco
        const conexao = await banco.getConnection({
            user: process.env.USER,
            password: process.env.PASS,
            connectString: process.env.CONNECT
        })
        console.log("Conectado ao Banco")
        // retonra o conector
        return conexao
    }catch(erro) {
        throw erro; // Lançando erro para tratamento externo
    }   
}
