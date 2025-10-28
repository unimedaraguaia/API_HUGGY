// ==================================== IMPORTACOES ============================ //
const rotas = require('../routes/rotas')
const banco = require('./banco')
const db = require('oracledb')

// ================================= CLASSE GUIAS ================================ //
class Guia{
    
    async listar_guias_beneficiario(numeroUsuario) {
        let conexaoBanco
        let listaGuia = []
        try{
            conexaoBanco = await banco.conectarBanco()
            const listaGuias = await conexaoBanco.execute(
                `
                SELECT 
                G.NNUMEGUIA
                FROM HSSGUIA G
                WHERE G.NNUMEUSUA = :numeroUsuario
                ORDER BY G.NNUMEGUIA DESC
                FETCH FIRST 3 ROWS ONLY
                `,
                {numeroUsuario},
                {outFormat:db.OUT_FORMAT_OBJECT}
            )
            for (let i = 0; i < listaGuias.rows.length; i++) {

                let dadosGuia = await this.pegar_dados_guia_listada(listaGuias.rows[i]['NNUMEGUIA'], conexaoBanco) 
                
                switch(dadosGuia.rows[0].STATUS) {
                    case 'Liberada':
                        listaGuia.push(dadosGuia.rows[0])
                        break
                    case 'Pedido de exame':
                        listaGuia.push(dadosGuia.rows[0])
                        break
                    case 'Negada':
                        listaGuia.push(dadosGuia.rows[0])
                        break
                    case 'Sob-auditoria':
                        listaGuia.push(dadosGuia.rows[0])
                        break
               }
            }
            
            listaGuias.rows = listaGuia
            
            return listaGuias
        }
        catch(erro) {
            console.log("[API] Erro ao listar guias do beneficiário", erro)
            throw erro
        }
        finally {
            banco.desconectarBanco(conexaoBanco)
        }
    }
    
    async pegar_dados_guia(numeroGuia, numeroUsuario) {
        let conexaoBanco
        try{
            conexaoBanco = await banco.conectarBanco()
            const dadosGuia = await conexaoBanco.execute(
                `
                SELECT 
                ID_GUIA, 
                STATUS, 
                TIPO_GUIA, 
                NOME_SOLICITANTE,
                NOME_PRESTADOR,
                ID_USUARIO,
                TO_CHAR(EMISSAO, 'DD/MM/YYYY') AS EMISSAO, 
                TO_CHAR(VALIDADE, 'DD/MM/YYYY') AS VALIDADE
                FROM TABLE(PKG_GUIA.DADOS_GUIA(:numeroGuia))
                `,
                {numeroGuia},
                {outFormat:db.OUT_FORMAT_OBJECT}
            )
            //const procedimentos = await this.pegar_procedimentos_guia(numeroGuia, conexaoBanco)
            if(dadosGuia.rows[0]['NOME_OPERADOR'] == null){
                dadosGuia.rows[0]['NOME_OPERADOR'] = " "
            }
            if(dadosGuia.rows[0]['ID_USUARIO'] != Number(numeroUsuario)) {
                dadosGuia.rows = []
                return dadosGuia
            }
            
            return dadosGuia

        }catch(erro){
            console.log("[API] Erro ao pegar dados da guia")
            throw erro
        }finally{
            banco.desconectarBanco(conexaoBanco)
        }
    }

    async pegar_dados_guia_listada(numeroGuia, conectorBanco) {
        try {
            const dadosGuia = await conectorBanco.execute(
                `
                SELECT 
                    ID_GUIA, 
                    TO_CHAR(EMISSAO, 'DD/MM/YYYY') AS EMISSAO,
                    TIPO_GUIA, 
                    STATUS
                FROM TABLE(PKG_GUIA.DADOS_GUIA(:numeroGuia))
                `,
                {numeroGuia},
                {outFormat:db.OUT_FORMAT_OBJECT}
            )
            return dadosGuia
        } catch(erro) {
            console.log("[API] Erro ao pegar dados da guia listada")
        }
    }

    async pegar_procedimentos_guia(numeroGuia, conectorBanco) {
        try { 
            const procedimentos = await conectorBanco.execute(
                `
                SELECT PR.CNOMEPMED, PG.CSTATPGUI
                FROM HSSPGUI PG, HSSPMED PR
                WHERE NNUMEGUIA = :numeroGuia
                AND PG.CCODIPMED = PR.CCODIPMED
                `,
                {numeroGuia},
                {outFormat:db.OUT_FORMAT_OBJECT}
            )
            
            const dadosProcedimento = this.pegar_dados_procedimentos(procedimentos.rows)
            return dadosProcedimento

        } catch(erro) {
            console.log("[API] Erro ao pegar os procedimentos das guias")
            throw erro
        }
    }

    pegar_numeros_guias(listaGuias) {
        let numeroGuia = {}
        for(let indice = 0; indice < 3; indice++) {
           if(indice < listaGuias.length) {
                numeroGuia[`numeros${indice+1}`] = listaGuias[indice]['NNUMEGUIA']
           } else {
            numeroGuia[`numeros${indice+1}`] = ''
           }
        }
        return numeroGuia
    }
}
// =============================== EXPORTANDO =================================== //
module.exports = { Guia }
