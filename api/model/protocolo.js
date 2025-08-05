const banco = require('./banco')
const db = require('oracledb')

/**@class: Protocolo
 * Esta classe contem todos os métodos utilizados asincronos 
 * para criar protocolo no banco de dados ao quais seram vinculado aos
 * atendimentos.
 */

class Protocolo {

    /**
     * Esse método cria um novo portocolo no CRM
     * @param {int} idPessoa O identificiador da pessoa a qual o protocolo se destina
     * @returns O reton pode ser:
     * 500 - Não foi possível criar o protocolo
     * 200 - Protocolo criado
     * Exception: Erro ao tentar criar protocolo
     */

    async criar_protocolo_segunda_via_boleto(idPessoa) {
        let conexao

        try {
            // Estabelece comunicação com o banco de dados e tenta executar a procedure.
            conexao = await banco.conectarBanco()
            const resultado = await conexao.execute(
                `
                BEGIN
                    PKG_ATENDIMENTO_CRM.insere_protocolo(
                        p_id_pessoa => :idPessoa,               --id beneficiario--
                        p_id_operador => 63737,                 --id operado (deve ser trocado) [michael]--
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
                // tenta dar um commit nas alterações feitas no banco (adicionar de fato o protocolo)
                conexao.commit()
            }
            catch (erro) {
                // Captura o erro obtido em caso de falha do commit e tenta dar um desfazer no banco
                console.log(`[Protocolo] > cria_protocolo_segunda_via_boleto: (Erro ao commitar procedure)\n\n${erro}`)
                conexao.rollback()
                // Retona o json com o status de falha
                return {
                    status:"500"
                }
            }
            // Se o erro nao for capturado, ou deu certo o u falhou pois o banco retonar o id -1 em caso de falha 
            if((resultado.outBinds.p_id_protocolo > 0)) {
                // Retorna o Json com status de sucesso e o id e mensagem do mesmo
                console.log(`[Protocolo] > cria_protocolo_segunda_via_boleto: (Sucesso ao commitar procedure)`)
                try {
                    const numeroProtocolo = await this.pegar_numero_protocolo(resultado.outBinds.p_id_protocolo, conexao)
                    return {
                        status:"200",
                        idProtocolo: resultado.outBinds.p_id_protocolo,
                        numeroProtocolo: numeroProtocolo
                    }
                }
                catch(erro) {
                    console.log(`[Protocolo] > cria_protocolo_segunda_via_boleto: (Falha oa pegar numero do protocolo)`)
                    throw erro
                }
                
            } // em caso de falha ou seja o (id < 0)
            else {
                // retorna o json com status de falha
                console.log(`[Protocolo] > cria_protocolo_segunda_via_boleto: (Erro Id < 0, protocolo nao criado)\n\n${resultado.outBinds.p_id_protocolo}`)
                return {
                    status:"500"
                }
            }
        } 
        catch (erro) {
            // lança a exceção
            console.log(`[Protocolo] > cria_protocolo_segunda_via_boleto: (Excessão lançada)\n\n}`)
            throw erro
        } 
        finally {
            // se conexao ativa tenta fechar  
            banco.desconectarBanco(conexao)
        }
    }

    /**
     * Método que pega o numero (codigo) do protocolo para exibir ao usuário
     * @param {int} idProtocolo identificador do protocolo criado
     * @param {db.conector} conector conector do banco de dados
     */

    async pegar_numero_protocolo(idProtocolo, conector) {
        try {
            const resultado = await conector.execute(
                `
                select p.ccodiprot from crmprot p where p.nnumeprot =:idProtocolo
                `,
                {idProtocolo}
            )
            console.log(`[Protocolo] > pegar_numero_protcolo: (Sucesso)`)
            return resultado.rows[0][0]
        }
        catch(erro) {
            console.log(`[Protocolo] > pegar_numero_protcolo: (Excessão lançada)\n\n}`)
            throw erro
        }
    }
}

// Exportando a classe
module.exports = {
    Protocolo
}