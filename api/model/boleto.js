// ======================== IMPORTAÇÕES =============================== //
const db = require('oracledb')
const banco = require('./banco')
const path = require('path');
const { NGINX_PORT } = process.env; // constantes de porta do NGINX
const pdf = require('./pdf');
const pathPdf = path.join(__dirname, "../temp/")

// ============================ CLASSE PARA BOLETO ================================= //
class Boleto {

    async buscar_boletos_titular(codigoUsuarioTitular, codigoContrato) {
        let conexao
        try {
            conexao = await banco.conectarBanco()
            
            let boletos = await conexao.execute(
                `
                SELECT P.NNUMEPAGA, TO_CHAR(P.DVENCPAGA, 'DD/MM/YYYY') AS DVENCPAGA, P.NVENCPAGA, P.CINSTPAGA, P.CCOMPPAGA
                FROM HSSPAGA P
                WHERE P.NNUMEUSUA = :codigoUsuarioTitular
                AND P.DVENCPAGA >= ADD_MONTHS(CURRENT_DATE, -3)
                AND P.CPAGOPAGA = 'N'
                `,
                {codigoUsuarioTitular},
                {outFormat:db.OUT_FORMAT_OBJECT}
            )

            if(boletos.rows.length  <= 0) {
                boletos = await conexao.execute(
                    `
                    SELECT P.NNUMEPAGA, TO_CHAR(P.DVENCPAGA, 'DD/MM/YYYY') AS DVENCPAGA, P.NVENCPAGA, P.CINSTPAGA, P.CCOMPPAGA
                    FROM HSSPAGA P
                    WHERE P.NNUMETITU = :codigoContrato
                    AND P.DVENCPAGA >= ADD_MONTHS(CURRENT_DATE, -3)
                    AND P.CPAGOPAGA = 'N'
                    `,
                    {codigoContrato},
                    {outFormat:db.OUT_FORMAT_OBJECT}
                )
            }

            boletos.rows = this.remover_boletos_parcelados(boletos.rows)

            let listaIdsBoletos = this.pegar_id_boletos(boletos)
            let listaEndereco = await this.criar_boletos_pegar_local_arquivo(boletos, conexao)

            if(listaEndereco.length == 0) {
                boletos.rows = []
            } else {
                let linhasDigitaveis = await this.pegar_linhas_digitaveis(listaIdsBoletos, conexao)
                boletos.rows = this.adicionar_linhas_digitaveis_enderecos(boletos, linhasDigitaveis, listaEndereco)
                let arquivos = this.pega_nomes_arquivos(listaEndereco, boletos)
                boletos.rows[`arquivos`] = arquivos
            }
            return boletos
            
        } catch (erro) {
            throw erro
        } finally {
            banco.desconectarBanco(conexao)
        }
    }
    
    async pegar_linhas_digitaveis(listaIdsBoletos, conectorBanco) {
        let linhas = []
        try {
            for(let id of listaIdsBoletos) {
                const linhaDigitavel = await conectorBanco.execute(
                    `
                    SELECT B.LINHA_DIGITAVEL
                    FROM TABLE (PKG_BOLETO_CLASS.BOLETO(P_ID_PAGAMENTO => :id,
                    P_ID_JPAGA     => 0,
                    P_ID_DOCU      => 0)) B
                    `,
                    {id},
                    {outFormat:db.OUT_FORMAT_OBJECT}
                )
                if(linhaDigitavel.rows.length > 0) {
                    linhas.push(linhaDigitavel.rows[0])
                }
            }
            return linhas
        } catch(erro) {
            throw erro
        }
    }

    async pegar_dados_boleto(idBoleto, conectorBanco) {
        try {
            const dadosBoleto = await conectorBanco.execute(
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
            
            return dadosBoleto.rows[0]

        } catch(erro) {
            throw erro
        }
    }

    async criar_boletos_pegar_local_arquivo(boletos, conectorBanco) {
        let endereco = []
        try {
            for(let indice = 0; indice < boletos.rows.length; indice++) {
                let dadosBoleto = await this.pegar_dados_boleto(boletos.rows[indice].NNUMEPAGA, conectorBanco)
                
                let numeroDocumentoPago = dadosBoleto.NDOCUPAGA
                let idPagamento = dadosBoleto.ID_PAGAMENTO
                //console.log(dadosBoleto)

                let valor = await this.verifica_homologacao(numeroDocumentoPago, idPagamento, conectorBanco)
                console.log(valor)
                if(valor) {
                    let boleto = new pdf.Pdf(dadosBoleto)
                    //console.log(dadosBoleto)
                    let localArquivo = `${process.env.ADDRESS_SERVICE}:${NGINX_PORT}/temp/${dadosBoleto.NUMERO_DOCUMENTO.replace(/\s+/g, "")}.pdf`
                    boleto.salve(pathPdf)
                    //localFile = this.encurtarLink(localFile)
                    endereco.push(localArquivo)
                }
            }
            
            return endereco
            
        } catch(erro) {
            throw erro
        }
    }

    remover_boletos_parcelados(listaBoletos) {
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

    pegar_id_boletos(listaBoletos) {
        let listaIds = []
        for(let indice = 0; indice < listaBoletos.rows.length; indice++) {
            listaIds[indice] = listaBoletos.rows[indice]['NNUMEPAGA']
        }
        return listaIds
    }

    adicionar_linhas_digitaveis_enderecos(boletos, linhas, enderecoBoletos) {
        let novoRows = []
        for(let indice = 0; indice < boletos.rows.length; indice++) {
            boletos.rows[indice]['LINHA_DIGITAVEL'] = linhas[indice]['LINHA_DIGITAVEL']
            boletos.rows[indice]['LOCAL_BOLETO'] = enderecoBoletos[indice]
            //boletos.rows[indice]['ARQUIVO'] = arquivos[indice]
            novoRows.push(boletos.rows[indice])
        }
        return novoRows
    }
    
    pega_nomes_arquivos(enderecosBoletos) {
        let nomeArquivos = {}
        for(let indice = 0; indice < 3; indice++) {
            if(indice < enderecosBoletos.length) {
                nomeArquivos[`nome${indice+1}`] = enderecosBoletos[indice].split('/').pop()
            } else {
                nomeArquivos[`nome${indice+1}`] = ''
            }
        }
        return nomeArquivos
    }

    async verifica_homologacao(numeroDocumentoPago, idPagamento, conectorBanco) {
        try {
            const homologado = await conectorBanco.execute(
                `
                SELECT PKG_BOLETO_CLASS.LAYOUT_HOMOLOGADO(HSSLOPG.CLREMLOPG) HOMOLOGADO
                FROM HSSPAGA,HSSLOPG
                WHERE (:idPagamento > 0 and HSSPAGA.NNUMEPAGA = :idPagamento)
                AND HSSPAGA.NNUMELOPG = HSSLOPG.NNUMELOPG
                UNION
                SELECT PKG_BOLETO_CLASS.LAYOUT_HOMOLOGADO(HSSLOPG.CLREMLOPG) HOMOLOGADO
                FROM FINDOCU, HSSLOPG
                WHERE (:numeroDocumentoPago > 0 and FINDOCU.NNUMEDOCU = :numeroDocumentoPago)
                AND FINDOCU.NNUMECONT = HSSLOPG.NNUMECONT
                AND HSSLOPG.CMODALOPG <> 'D'
                `,
                {
                    idPagamento: idPagamento,
                    numeroDocumentoPago: numeroDocumentoPago
                }
            )

            //console.log(idPagamento, numeroDocumentoPago, homologado.rows[0][0])
            if (homologado.rows[0][0] === 'S') {
                return true;
            } else {
                return false;
            }
    
        } catch(erro) {
            throw erro
        } 
    }
}

// ============================EXPORTANDO======================================= //
module.exports = { Boleto }