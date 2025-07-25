//const { stat } = require('fs')
const banco = require('./banco')
const db = require('oracledb')

/**@class: Atendimento
 * Esta classe contem todos os métodos utilizando para 
 * Criar e manipula atendimentos.
 */

class Atendimento {
    
    /**
     * Este Metodo criar um atendimento e o vincula a um protocolo ja aberto
     * @param {*} idProtocolo identificador do protocolo ao qual será vinculado
     * @param {*} idPessoa identificador da pessa que está sendo atendida
     * @returns O retono pode ser um json com os status:
     * 500 - Erro ao criar atendimento
     * 200 - Sucesso ao criar atendimento
     * Exception
     */
    async criar_atendimento_segunda_via_boleto(idProtocolo, idPessoa, tipoAtendimento) {

        let conexao

        try {
            // Estabelece conexão e tenta executar a procedure
            conexao = await banco.conectarBanco()
            const resultado = await conexao.execute(
                `
                BEGIN
                    PKG_ATENDIMENTO_CRM.insere_atendimento(
                        p_id_protocolo      =>  :idProtocolo,        
                        p_id_classificacao  =>  :tipoAtendimento,                 
                        p_id_operador       =>  63737,              
                        p_id_status         =>  18,                 
                        p_id_beneficiario   =>  :idPessoa,           
                        p_id_atendimento    =>  :p_id_atendimento,
                        p_msg_retorno       =>  :p_msg_retorno   
                    );
                END;
                `,
                {   
                    idProtocolo,
                    tipoAtendimento,
                    idPessoa,
                    p_id_atendimento:   { dir: db.BIND_OUT, type: db.NUMBER},
                    p_msg_retorno:      { dir: db.BIND_OUT, type: db.STRING, maxSize: 4000 }
                }
            )
            try {
                // tenta dar um commit  nas alterações de banco
                conexao.commit()
            }
            catch(erro) {
                // capture o erro obtido em caso de falha do commit e tentar dar um desfazer no banco
                console.log('[Atendimento] > cria_atendimento_segunda_via_boleto: (Erro ao commitar procedure)\n', erro)
                conexao.rollback()
            }
            // Se o erro não for capturado, verifica se o o id do atendimento é maior que zero
            if(resultado.outBinds.p_id_atendimento > 0) {
                // Retorna o estatus de sucesso, e o id do atendimento
                return {
                    status: "200",
                    idAtendimento: resultado.outBinds.p_id_atendimento   
                }
            }
            else {
                // retorna o json  com status de falha
                console.log(`[Atendimento] > cria_atendimento_segunda_via_boleto: (Erro id < 0, atendimento nao criado)\n`)
                return {
                    status: "500" 
                }
            }
        }
        catch (erro) {
            //lança exceção
            console.log(`[Atendimento] > cria_atendimento_segunda_via_boleto: (Excessão lançada)\n`)
            throw erro
        }
        finally {
            // se conexão ativa, tenta fechar
            banco.desconectarBanco(conexao)
        }
    }

    /**
     * Metodo que adiciona uma mensagem em uma tendimento criado
     * @param {*} idAtendimento identificador do atendimento criado
     * @param {*} mensagem mensagem a ser adiconada no atendimento
     * @returns um json contendo status de sucesso ou falha, ou uma excesão.
     */

    async adiciona_mensagem_boletos(idAtendimento, mensagem) {

        let conexao

        try {
            // Estabelece comunicação com o banco de dados e tenta excutar a procedure
            conexao = await banco.conectarBanco()
            const resultado = await conexao.execute(
                `
                BEGIN
                    PKG_ATENDIMENTO_CRM.insere_mensagem_atendimento(
                    pIdAtendimento => :idAtendimento,
                    pTexto => :mensagem,
                    pIdTipoMensagem => 4,
                    pIdOperador => 63737,
                    pPtu => :pPtu,
                    pTipoMensagem => 'E',
                    pIdTransacaoPrestadora => :pIdTransacaoPrestadora,
                    pNomeSolicitante => :pNomeSolicitante,
                    pFlagGpu => :pFlagGpu,
                    pManifestacao => :pManifestacao,
                    pCategoria => :pCategoria,
                    pVersao => :pVersao,
                    pExibeMsgNaWeb => 'N',
                    pMensagemRetorno => :pMensagemRetorno
                    );
                END;
                `,
                {
                    idAtendimento,
                    mensagem,
                    pPtu: { val: '', type: db.STRING },
                    pIdTransacaoPrestadora: { val: null, type: db.NUMBER },
                    pNomeSolicitante: { val: null, type: db.STRING },
                    pFlagGpu: { val: null, type: db.STRING },
                    pManifestacao: { val: null, type: db.STRING },
                    pCategoria: { val: null, type: db.STRING },
                    pVersao: { val: null, type: db.STRING },
                    pMensagemRetorno: { dir: db.BIND_OUT, type: db.STRING, maxSize: 4000 }
                }
            )
            try {
                // tenta dar um commit nas alterações de banco
                conexao.commit()
            }
            catch (erro) {
                // Captura o erro obtido em caso de falha do commit e tenta dar um desfazer no banco
                console.log('[Atendimento] > adiciona_mensagem_boletos: (Erro ao commitar procedure)\n', erro)
                conexao.rollback()
                return {
                    status:"500"
                }
            }

           if(resultado.outBinds.pMensagemRetorno == null || resultado.outBinds.pMensagemRetorno == '') {
             // se nenhum erro foi capturado retorna mensagem de sucesso
             console.log('[Atendimento] > adiciona_mensagem_boletos: (Sucesso)\n')
             return {
                 status:"200", 
                 mensagem:"Mensagem adicionada ao atendimento"
             }
           }
           else {
            console.log(`[Atendimento] > adiciona_mensagem_boletos: (Erro ao adiciona mensagem)\n\n${resultado.outBinds.pMensagemRetorno}`)
             return {
                 status:"500"
             }
           }
        }
        catch(erro) {
            // lança uma excessão
            console.log('[Atendimento] > adiciona_mensagem_boletos: (Excessão lançada)\n', erro)
            throw erro
        }
        finally{
            //se conxão ativa, desabilita
            banco.desconectarBanco(conexao)
        } 
    }

    /**
     * Esse método fecha um atendimento
     * @param {*} idAtendimento identificador do atendimento
     * @returns podendo ser um json com status:
     * 500 - Erro ao fechar atendimento
     * 200 - Sucesso ao fechar atendimento
     * Exception - no caso de uma execeção
     */

    async fechar_atendimento(idAtendimento) {
        // Tenta executar a  procedure
        let conexao
        try {
            // tenta fecahr o atendimento
            conexao = await banco.conectarBanco()
            const resultado = await conexao.execute(
                `
                BEGIN
                    -- Call the procedure
                    PKG_ATENDIMENTO_CRM.finalizar_crm(
                        p_atendimento => :idAtendimento,
                        p_operador => 63737,
                        p_guia => :p_guia
                    );
                END;
                `,
                {
                    idAtendimento,
                    p_guia: { val: null, type: db.STRING }
                }
            )
            // tenta commitar as mudanças no banco
            try {
                conexao.commit()
            }
            catch (erro) {
                // Captura o erro obtido em caso de falha do commit e tenta dar um desfazer no banco
                console.log(`[Atendimento] fecha_atendimento: (Erro ao commitar procedure)\n\n${erro}`)
                conexao.rollback()
                return {
                    status:"500"
                }
            }
            // tenta verificar se o atendimento foi fechado
            try {
                const operacao = await this.verificar_atendimento_fechado(idAtendimento, conexao)
                // se fechado retorno o j
                if(operacao == true) {
                    return {
                        status: "200",
                        mensagem: "Atendimento Fechado"
                    }
                }else{
                    return {
                        status: "500",
                        mensagem: "Atendimento ainda aberto"
                    }
                }
            }
            catch(erro) {
                console.log(`[Atendimento] fechar_atendimento (Erro ao verificar fechamento) ${erro}`)
                throw erro
            } 
        }
        catch(erro) {
            console.log(`[Atendimento] fechar_atendimento (Erro ao tentar fecahr atendimento)\n${erro}`)
            throw erro
        }
    }

    /**
     * Metodo para verificar se atendimento realmente foi fechado no CRM
     * @param {*} idAtendimento identificador do atendimento
     * @param {*} conector conexão com o banco de dados.
     * @returns O retornos possiveis são
     * true - em caso de o atendimento esta fechado
     * false - no caso do atendimento ainda estar aberto ou com status inconclusivo
     * Exception em cado de erro ao fazer a busca
     */

    async verificar_atendimento_fechado(idAtendimento, conector) {
        // tenta executar a consulta no banco de dados
        try{
            const resultado = await conector.execute(
                `
                select A.cstatatend from crmatend A where A.Nnumeatend =: idAtendimento
                `,
                {
                    idAtendimento
                }
            )
            let status = resultado.rows[0][0]
            //verifica se o atendimento foi fechado
            if(status == "F") {
                console.log(status)
                return true
            }
            else {
                console.log(status)
                return false
            }
        }
        catch(erro) {
            // lanca a execption no caso de erro
            console.log("[Atendimento] verificar_atendimento_fechado (Lançamento de Exceção)")
            throw erro
        }
    }
}
   


module.exports = {
    Atendimento
}
