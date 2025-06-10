// IMPORTACOES
const banco = require('oracledb')  // biblioteca oracle DB
const crypto = require('crypto');  // biblioteca de cryptografia
const shortLinks = require('../util/encurtador') // arquivo encurtador de links
const { SECRET_KEY, USER, PASS, CONNECT,} = process.env; // constantes de acesso
const { NGINX_PORT } = process.env; // constantes de porta do NGINX

/**
 * Estabelece conexão com o banco de dados
 * @returns um conector para o banco em caso de sucesso ou erro a ser tratado
 */
const conectarBanco = async () => {
    // linha para a ser abilitada para produção
    //banco.initOracleClient({ libDir: process.env.PATH_ORACLE })
    try { 
        const keys = descriptografarDados(SECRET_KEY, USER, PASS, CONNECT)
        const conexao = await banco.getConnection({
            user: keys.USER,
            password: keys.PASS,
            connectString: keys.CONNECT
        })
        return conexao 
    }catch(erro) { 
        throw erro; 
    }   
}

/**
 * Faz a desconexão do conector com o banco de dados
 * @param {} conector 
 */
const desconectarBanco = async (conector) => { 
    if(conector) {
        try {
            await conector.close()
        }catch(erro) {
            throw erro;
        }
    }
}

/**
 * Desencripta as chaves de acesso ao banco
 * @param {*} secretKeyHex 
 * @param {*} userEncrypted 
 * @param {*} passEncrypted 
 * @param {*} connectEncrypted 
 * @returns 
 */
function descriptografarDados(secretKeyHex, userEncrypted, passEncrypted, connectEncrypted) {
    try{
        const algorithm = 'aes-256-cbc';
        const key = Buffer.from(secretKeyHex, 'hex');
    
        function decrypt(encrypted) {
            const [ivHex, dataHex] = encrypted.split(':');
            const iv = Buffer.from(ivHex, 'hex');
            const encryptedText = Buffer.from(dataHex, 'hex');
            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
            return decrypted.toString();
        }

        return {
            USER: decrypt(userEncrypted),
            PASS: decrypt(passEncrypted),
            CONNECT: decrypt(connectEncrypted)
        };
    }catch(erro){
        throw erro;
    }
}

/**
 * Encurta o link de acesso ao boleto
 * @param {*} link 
 * @returns 
 */
function encutardarLink(link) {
    const base = `${process.env.ADDRESS_SERVICE}:${NGINX_PORT}`
    const id = Math.random().toString(36).substring(2, 8)
    shortLinks.set(id, link)
    return `${base}/${id}`
}


// EXPORTANDO FUNCOES
module.exports = {
    conectarBanco,
    desconectarBanco
}