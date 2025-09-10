// ============================  IMPORTAÇÕES ========================== //
const banco = require('./banco')
const db = require('oracledb')

// ========================== CLASSE DE ATENDIMENTO ==================== //
class Atendimento {
    
    async criar_atendimento(idProtocolo, idPessoa, tipoAtendimento) {
        let conexaoBanco
        try {
            conexaoBanco = await banco.conectarBanco()
            const resultadoOperacao = await conexaoBanco.execute(
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
                    idProtocolo:        Number(idProtocolo),
                    tipoAtendimento:    Number(tipoAtendimento),
                    idPessoa:           Number(idPessoa),
                    p_id_atendimento:   { dir: db.BIND_OUT, type: db.NUMBER},
                    p_msg_retorno:      { dir: db.BIND_OUT, type: db.STRING, maxSize: 4000 }
                }
            )
            try {
                conexaoBanco.commit()
            } catch(erro) {
                console.log(`[API] Erro ao criar atendimento para segunda via de boleto (commit)`)
                conexaoBanco.rollback()
                throw erro
            }
            if(resultadoOperacao.outBinds.p_id_atendimento > 0) {
                console.log(`[API] Sucesso ao criar atendimento para segunda via de boleto`)
                return {
                    status: "200",
                    atendimento: {
                        id: resultadoOperacao.outBinds.p_id_atendimento
                    }  
                }
            } else {
                console.log(`[API] Erro ao criar atendimento para segunda via de boleto (id < 0)`)
                return {
                    status: "500" 
                }
            }
        } catch (erro) {
            console.log(`[API] Erro ao criar atendimento para segunda via de boleto (Excessão lançada)`)
            throw erro
        }
        finally {
            banco.desconectarBanco(conexaoBanco)
        }
    }

    async adicionar_mensagem_atendimento_segunda_via_boleto(idAtendimento, mensagem) {
        let conexaoBanco
        try {
            conexaoBanco = await banco.conectarBanco()
            const resultadoOperacao = await conexaoBanco.execute(
                `
                BEGIN
                    PKG_ATENDIMENTO_CRM.insere_mensagem_atendimento(
                    pIdAtendimento => :idAtendimento,
                    pTexto => :mensagem,
                    pIdTipoMensagem => 4,
                    pIdOperador => 2432482,
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
                    idAtendimento: Number(idAtendimento),
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
                conexaoBanco.commit()
            } catch (erro) {
                console.log(`[API] Erro ao adicionar mensagem no atendimento segunda via de boleto (commit)`)
                conexaoBanco.rollback()
                return {
                    status:"500"
                }
            }

           if(resultadoOperacao.outBinds.pMensagemRetorno == null || resultadoOperacao.outBinds.pMensagemRetorno == '') {
                console.log(`[API] Sucesso ao adicionar mensagem no atendimento segunda via de boleto`)
                return {
                    status:"200"
                }
           } else {
                console.log(`[API] Erro ao adicionar mensagem no atendimento segunda via de boleto (bad return)`)
                return {
                    status:"500"
                }
            }
        } catch(erro) {
            console.log(`[API] Erro ao adicionar mensagem no atendimento segunda via de boleto (excessao)`)
            throw erro
        }
        finally {
            banco.desconectarBanco(conexaoBanco)
        } 
    }

    async fechar_atendimento_crm(idAtendimento) {
        let conexaoBanco
        try {
            conexaoBanco = await banco.conectarBanco()
            const resultadoOperacao = await conexaoBanco.execute(
                `
                BEGIN
                    -- Call the procedure
                    PKG_ATENDIMENTO_CRM.finalizar_crm(
                        p_atendimento => :idAtendimento,
                        p_operador => 2432482,
                        p_guia => :p_guia
                    );
                END;
                `,
                {
                    idAtendimento:Number(idAtendimento),
                    p_guia: { val: null, type: db.STRING }
                }
            )
            try {
                conexaoBanco.commit()
            } catch (erro) {
                console.log(`[API] > fecha_atendimento: (Erro ao commitar procedure)\n${erro}`)
                conexaoBanco.rollback()
                return {
                    status:"500"
                }
            }
            
            try {
                const status = await this.verificar_atendimento_fechado(idAtendimento, conexaoBanco)
                if(status == true) {
                    console.error(`[API] Sucesso a fechar atendimento`)
                    return {
                        status: "200",
                        mensagem: "Atendimento Fechado"
                    }
                } else {
                    console.log(`[API] Erro atendimento nao fechado`)
                    return {
                        status: "500",
                        mensagem: "Atendimento ainda aberto"
                    }
                }
            } catch(erro) {
                console.log(`[API] Erro ao verificar se atendimento esta fechado`)
                throw erro
            } 
        } catch(erro) {
            console.log(`[API] Erro ao tentar fechar atendimento`)
            throw erro
        }
    }

    async verificar_atendimento_fechado(idAtendimento, conector) {
        try {
            const resultadoOperacao = await conector.execute(
                `
                select A.cstatatend from crmatend A where A.Nnumeatend =: idAtendimento
                `,
                {
                    idAtendimento
                }
            )
            let status = resultadoOperacao.rows[0][0]
            if(status == "F") {
                return true
            } else {
                return false
            }
        } catch(erro) {
            console.log(`[API] Erro ao conferir fechamento de atendimento (excessao)`)
            throw erro
        }
    }
}

// ========================= EXPORTANDO ================================== //
module.exports = { Atendimento }