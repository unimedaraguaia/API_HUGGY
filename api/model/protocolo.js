// ================================ IMPORTAÇÕES ======================================== //
const banco = require('./banco')
const db = require('oracledb')

// ================================ CLASSE PROTOCOLO ======================================== //
class Protocolo {
    
    async criar_protocolo(idPessoa) {
        let conexao
        try {
            conexao = await banco.conectarBanco()
            const resultado = await conexao.execute(
                `
                BEGIN
                    PKG_ATENDIMENTO_CRM.insere_protocolo(
                        p_id_pessoa => :idPessoa,               --id beneficiario--
                        p_id_operador => 2482550,               --id operado [API]--
                        p_tipo_vinculo => 'B',                  --vinculo beneficiario--
                        p_id_forma_contato => 12,               --contato whatsApp--
                        p_id_protocolo => :p_id_protocolo,
                        p_msg_retorno => :p_msg_retorno
                    );
                END;
                `,
                {   
                    idPessoa:Number(idPessoa),
                    p_id_protocolo:  { dir: db.BIND_OUT, type: db.NUMBER },
                    p_msg_retorno:   { dir: db.BIND_OUT, type: db.STRING, maxSize: 4000 }
                }
            )
            try {
                conexao.commit()
            } catch (erro) {
                console.log(`[API] Erro ao criar protocolo (commitar)`)
                conexao.rollback()
                return {
                    status:"500"
                }
            } 
            if((resultado.outBinds.p_id_protocolo > 0)) {
                console.log(`[API] Sucesso ao commitar procedure `)
                try {
                    const numeroProtocolo = await this.pegar_numero_protocolo(resultado.outBinds.p_id_protocolo, conexao)
                    return {
                        status:"200",
                        idProtocolo: resultado.outBinds.p_id_protocolo,
                        numeroProtocolo: numeroProtocolo
                    }
                } catch(erro) {
                    console.log(`[API] Falha oa pegar numero do protocolo`)
                    throw erro
                }
                
            } else {
                console.log(`[API] Erro ao cria protocolo segunda via boleto (Erro Id < 0, protocolo nao criado`)
                return {
                    status:"500"
                }
            }
        } 
        catch (erro) {
            console.log(`[API] Erro ao criar protocolo de boletos (Excessão lançada)\n\n}`)
            throw erro
        } finally {  
            banco.desconectarBanco(conexao)
        }
    }

    async pegar_numero_protocolo(idProtocolo, conectorBanco) {
        try {
            const resultado = await conectorBanco.execute(
                `
                select p.ccodiprot from crmprot p where p.nnumeprot =:idProtocolo
                `,
                {idProtocolo}
            )
            console.log(`[API] Sucesso ao pegar numero do protocolo`)
            return resultado.rows[0][0]
        }
        catch(erro) {
            console.log(`[API] Falha ao pegar numero do protocolo Excessão lançada`)
            throw erro
        }
    }
}

// =========================================== EXPORTANDO =============================================== //
module.exports = { Protocolo }