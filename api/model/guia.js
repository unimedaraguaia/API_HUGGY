const banco = require('./banco')
const db = require('oracledb')

class Guia{
    // lista as ultimas 3 guias de um titular pelo o identificador dos mesmo
    async listarGuiasBeneficiario(idTitular) {
        let conexao
        let listaGuia = []
        try{
            conexao = await banco.conectarBanco()
            const listaGuias = await conexao.execute(
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
                let dadosGuia = await this.pegarDadosGuiaListadas(listaGuias.rows[i]['NNUMEGUIA']) 
                if(dadosGuia.rows[0].STATUS == 'Liberada') {
                    listaGuia.push(dadosGuia.rows[0])
                }
            }
            
            listaGuias.rows = listaGuia
            return listaGuias
        }
        catch(erro) {
            throw erro
        }
        finally {
            banco.desconectarBanco(conexao)
        }
    }
    // pega os dado da guia pelo numero de identificação da mesma
    async pegarDadosGuia(numeroGuia) {
        let conexao
        try{
            conexao = await banco.conectarBanco()
            const dadosGuia = await conexao.execute(
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
            const procedimentos = await this.pegarProcedimentosGuia(numeroGuia)
            
            if(dadosGuia.rows[0]['NOME_OPERADOR'] == null){
                dadosGuia.rows[0]['NOME_OPERADOR'] = " "
            }

            dadosGuia.rows[0]['PROCEDIMENTOS'] = procedimentos

            return dadosGuia
        }catch(erro){
            //console.log(erro)
            throw erro
        }finally{
            banco.desconectarBanco(conexao)
        }
    }

    /* PROCEDIMENTO AUXILIAR */
    async pegarDadosGuiaListadas(numeroGuia) {
        let conexao
        try{
            conexao = await banco.conectarBanco()
            const dadosGuia = await conexao.execute(
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
        }catch(erro){
            console.log(erro)
        }finally{
            banco.desconectarBanco(conexao)
        }
    }

    async pegarProcedimentosGuia(numeroGuia) {
        let conexao
        try { 
            conexao = await banco.conectarBanco()
            const procedimentos = await conexao.execute(
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
            const dadosProcedimento = this.pegaDadosProcedimentos(procedimentos.rows)
            return dadosProcedimento

        }
        catch(erro){
            
            throw erro
        }
        finally{
            banco.desconectarBanco(conexao)
        }
    }

    pegaDadosProcedimentos(listaProcedimentos) {
        let procedimentos = {}
        let status
        for(let index = 0; index < listaProcedimentos.length; index++) {

            if(listaProcedimentos[index].CSTATPGUI == 'N'){
                status = "Não Liberado"
            }
            else {
                status = "Liberado"
            }

            procedimentos[`procedimento${index+1}`] = {
                "nome": listaProcedimentos[index].CNOMEPMED,
                "status": `${status}`
            }
        }

        return procedimentos
    }
}

module.exports = {
    Guia
}
