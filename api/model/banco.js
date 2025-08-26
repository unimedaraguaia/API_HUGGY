// ========================= IMPORTACOES ========================================= //
const banco = require('oracledb')
const crypto = require('crypto')
const shortLinks = require('../util/encurtador') 
const { SECRET_KEY, USER, PASS, CONNECT,} = process.env
const { NGINX_PORT } = process.env

// ================================ FUNCOES DE BANCO ============================= //
const conectarBanco = async () => {
    // linha para a ser abilitada para produção
    //banco.initOracleClient({ libDir: process.env.PATH_ORACLE })
    try { 
        const keys = descriptografar_dados(SECRET_KEY, USER, PASS, CONNECT)
        const conexao = await banco.getConnection(
            {
                user: keys.USER,
                password: keys.PASS,
                connectString: keys.CONNECT
            }
        )
        return conexao 
    } catch(erro) { 
        throw erro
    }   
}

const desconectarBanco = async (conector) => { 
    if(conector) {
        try {
            await conector.close()
        } catch(erro) {
            throw erro
        }
    }
}

function descriptografar_dados(chaveSecreta, usuarioEncriptado, senhaEncriptado, conexaoEncriptada) {
    try {
        const algoritmo = 'aes-256-cbc';
        const chave = Buffer.from(chaveSecreta, 'hex');
    
        function descriptografa(dadoEncriptado) {
            const [ivHex, dataHex] = dadoEncriptado.split(':');
            const iv = Buffer.from(ivHex, 'hex');
            const textoEncriptado = Buffer.from(dataHex, 'hex');
            const decifrador = crypto.createDecipheriv(algoritmo, chave, iv);
            const descriptado = Buffer.concat([decifrador.update(textoEncriptado), decifrador.final()]);
            return descriptado.toString();
        }

        return {
            USER: descriptografa(usuarioEncriptado),
            PASS: descriptografa(senhaEncriptado),
            CONNECT: descriptografa(conexaoEncriptada)
        }
    } catch(erro) {
        throw erro
    }
}

function encutardarLink(link) {
    const base = `${process.env.ADDRESS_SERVICE}:${NGINX_PORT}`
    const id = Math.random().toString(36).substring(2, 8)
    shortLinks.set(id, link)
    return `${base}/${id}`
}

// =================================== EXPORTANDO ======================================= //
module.exports = {
    conectarBanco,
    desconectarBanco
}