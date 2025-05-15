const db = require('oracledb')
const banco = require('./banco')
const path = require('path');
const { NGINX_PORT } = process.env; // constantes de porta do NGINX
const pdf = require('./pdf');
const pathPdf = path.join(__dirname, "../temp/")
class Boleto {

    async buscarBoletosTitular(codigoTitular) {
        let conexao
        try {
            conexao = await banco.conectarBanco()
            const boletos = await conexao.execute(
                `
                SELECT P.NNUMEPAGA, TO_CHAR(P.DVENCPAGA, 'DD/MM/YYYY') AS DVENCPAGA, P.NVENCPAGA, P.CINSTPAGA, P.CCOMPPAGA
                FROM HSSPAGA P
                WHERE P.NNUMETITU = :CODIGOTITULAR 
                AND P.DVENCPAGA >= ADD_MONTHS(CURRENT_DATE, -3)
                AND P.CPAGOPAGA = 'N'
                `,
                {codigoTitular},
                {outFormat:db.OUT_FORMAT_OBJECT}
            )
    
            boletos.rows = this.removerBoletosParcelados(boletos.rows)
            
            let listaIds = this.pegarIdBoletos(boletos)
            let listaEndereco = await this.criarBoletos(boletos)
            let linhas = await this.pegarLinhasDigitaveis(listaIds)
            
            boletos.rows = this.adicionaLinhasDigitaveisEendereco(boletos, linhas, listaEndereco)
        
            return boletos
        } 
        catch (erro) {
            throw erro
        }
        finally {
            banco.desconectarBanco(conexao)
        }
    }
    
    async pegarLinhasDigitaveis(listaIds) {
        let conexao
        let linhas = []
        let endereco = []
        try {
            conexao = await banco.conectarBanco()
            for(let id of listaIds) {
                const linhasDigitaveis = await conexao.execute(
                    `
                    SELECT B.LINHA_DIGITAVEL
                    FROM TABLE (PKG_BOLETO_CLASS.BOLETO(P_ID_PAGAMENTO => :id,
                    P_ID_JPAGA     => 0,
                    P_ID_DOCU      => 0)) B
                    `,
                    {id},
                    {outFormat:db.OUT_FORMAT_OBJECT}
                )
                if(linhasDigitaveis.rows.length > 0) {
                    linhas.push(linhasDigitaveis.rows[0])
                }
            }
            return linhas
        }
        catch(erro) {
            console.log(erro)
            throw erro
            
        }
        finally {
            banco.desconectarBanco(conexao)
        }
    }

    async pegarDadosBoleto(idBoleto) {
        let conexao
        try{
            conexao = await banco.conectarBanco()
            const dadosBoleto = await conexao.execute(
                `   
                SELECT A.*,TO_CHAR(A.VENCIMENTO,'DD/MM/YYYY') DATA_VENCIMENTO, DIAS_VALIDADE,
                BANCO, DIGITO_BANCO, RETORNA_NATUREZA_JURIDICA(A.NNUMETITU) NAT_JURIDICA
                FROM TABLE(PKG_BOLETO_CLASS.BOLETO(p_id_pagamento => :idBoleto,
                                        p_id_jpaga     => 0,
                                        p_id_docu      => 0)) A
                `,
                {idBoleto},
                {outFormat:db.OUT_FORMAT_OBJECT}
            )
            console.log(dadosBoleto.rows[0])
            return dadosBoleto.rows[0]
        }
        catch(erro) {
            console.log(erro)
            throw erro
        }
        finally{
            banco.desconectarBanco(conexao)
        }
    }

    async criarBoletos(boletos){
        let endereco = []
        try{
            for(let indice = 0; indice < boletos.rows.length; indice++) {
                let dados = await this.pegarDadosBoleto(boletos.rows[indice].NNUMEPAGA)
                let boleto = new pdf.Pdf(dados)
                let localFile = `${process.env.ADDRESS_SERVICE}:${NGINX_PORT}/temp/${dados.NUMERO_DOCUMENTO.replace(/\s+/g, "")}.pdf`
                
                boleto.salve(pathPdf)
                //localFile = this.encurtarLink(localFile)
                endereco.push(localFile)
            }

            return  endereco
        }
        catch(erro) {
            console.log(erro)
            throw erro
        }
    }

    // FUNCÇÕES AUXILIARES

    /**
     * Remove todo os boletos parcelados da lista de boletos
     * deixa a apenas as parcela ou boletos que são integrais
     */
    removerBoletosParcelados(listaBoletos) {
        for(let indice = 0; indice < listaBoletos.length; indice++) {
            if(listaBoletos[indice]['CINSTPAGA'] != null) {
                for(let posicao = 0; posicao < listaBoletos.length; posicao++) {
                    if(posicao != indice) {
                        if(listaBoletos[posicao]['CCOMPPAGA'] == listaBoletos[indice]['CCOMPPAGA']) {
                            if(listaBoletos[posicao]['CINSTPAGA'] == null) {
                                listaBoletos.splice(posicao, 1)
                            }
                        }
                    }
                }
            }
        }
        return listaBoletos
    }

    /*
     * Pega os indentificadores de cada boleto e coloca em uma lista e a retorna
     */
    pegarIdBoletos(listaBoletos) {
        let listaIds = []
        for(let indice = 0; indice < listaBoletos.rows.length; indice++) {
            listaIds[indice] = listaBoletos.rows[indice]['NNUMEPAGA']
        }
        return listaIds
    }

    adicionaLinhasDigitaveisEendereco(boletos, linhas, localBoletos) {
        let novoRows = []
        for(let indice = 0; indice < boletos.rows.length; indice++) {
            boletos.rows[indice]['LINHA_DIGITAVEL'] = linhas[indice]['LINHA_DIGITAVEL']
            boletos.rows[indice]['LOCAL_BOLETO'] = localBoletos[indice]
            novoRows.push(boletos.rows[indice])
            
        }
        return novoRows
    }
}

module.exports = {
    Boleto
}