// ==================================== IMPORTACOES ============================ //
const banco = require('./banco')
const db = require('oracledb')

// ================================= CLASSE GUIAS ================================ //
class Guia{
    
    async listar_guias_beneficiario(idTitular) {
        let conexaoBanco
        let listaGuia = []
        try{
            conexaoBanco = await banco.conectarBanco()
            const listaGuias = await conexaoBanco.execute(
                `
                SELECT 
                G.NNUMEGUIA
                FROM HSSGUIA G
                WHERE G.NNUMEUSUA = :idTitular
                ORDER BY G.NNUMEGUIA DESC
                FETCH FIRST 3 ROWS ONLY
                `,
                {idTitular},
                {outFormat:db.OUT_FORMAT_OBJECT}
            )
            // Pega somente guias liberadas
            for (let i = 0; i < listaGuias.rows.length; i++) {
                let dadosGuia = await this.pegar_dados_guia_listada(listaGuias.rows[i]['NNUMEGUIA'], conexaoBanco) 
                if(dadosGuia.rows[0].STATUS == 'Liberada') {
                    listaGuia.push(dadosGuia.rows[0])
                }
            }
            listaGuias.rows = listaGuia
            return listaGuias
        }
        catch(erro) {
            console.log("[API] Erro ao listar guias do beneficiário")
            throw erro
        }
        finally {
            banco.desconectarBanco(conexaoBanco)
        }
    }
    
    async pegar_dados_guia(numeroGuia) {
        let conexaoBanco
        try{
            conexaoBanco = await banco.conectarBanco()
            const dadosGuia = await conexaoBanco.execute(
                `
                SELECT 
                ID_GUIA, 
                STATUS, 
                TIPO_GUIA, 
                NOME_PRESTADOR,
                NOME_OPERADOR,
                ID_USUARIO,
                TO_CHAR(EMISSAO, 'DD/MM/YYYY') AS EMISSAO, 
                TO_CHAR(VALIDADE, 'DD/MM/YYYY') AS VALIDADE,
                TO_CHAR(PROCEDIMENTOS) AS PROCEDIMENTOS
                FROM TABLE(PKG_GUIA.DADOS_GUIA(:numeroGuia))
                `,
                {numeroGuia},
                {outFormat:db.OUT_FORMAT_OBJECT}
            )
            //delete dadosGuia.rows[0]['PROCEDIMENTOS'];
            const procedimentos = await this.pegar_procedimentos_guia(numeroGuia, conexaoBanco)
            if(dadosGuia.rows[0]['NOME_OPERADOR'] == null){
                dadosGuia.rows[0]['NOME_OPERADOR'] = " "
            }
            dadosGuia.rows[0]['PROCEDIMENTOS'] = procedimentos
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
            //delete dadosGuia.rows[0]['PROCEDIMENTOS'];
            //console.log(dadosGuia.rows[0])
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
            //console.log(procedimentos.rows)
            const dadosProcedimento = this.pegar_dados_procedimentos(procedimentos.rows)
            return dadosProcedimento

        } catch(erro) {
            console.log("[API] Erro ao pegar os procedimentos das guias")
            throw erro
        }
    }

    pegar_dados_procedimentos(listaProcedimentos) {
        let procedimentos = {}
        for(let indice = 0; indice < listaProcedimentos.length; indice++) {
            let status
            if(listaProcedimentos[indice].CSTATPGUI == 'N'){
                status = "Não Liberado"
            } else {
                status = "Liberado"
            }
            procedimentos[`procedimento${indice + 1}`] = {
                "nome": listaProcedimentos[indice].CNOMEPMED,
                "status": `${status}`
            }
        }
        return procedimentos
    }
}

// =============================== EXPORTANDO =================================== //
module.exports = { Guia }
