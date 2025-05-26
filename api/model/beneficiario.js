const banco = require('./banco')

class Beneficiario {
    
    // verifica se o cpf passado pertence a um titular ativo
    async ehTitularAtivo(cpf){
        let conexao
        try{
            conexao = await banco.conectarBanco()
            const resultado = await conexao.execute(
                `SELECT U.NNUMETTITU, U.CNOMEUSUA
                 FROM HSSUSUA U
                 WHERE U.C_CPFUSUA = :cpf
                 AND U.CSITUUSUA = 'A'
                 AND U.CTIPOUSUA = 'T'
                `,
                {cpf},
                {outFormat:banco.OUT_FORMAT_OBJECT}
            )
            return resultado
        }catch(erro){
            throw erro
        }finally{
            conexao.desconectarBanco()
        }
    }
  
    // FUNÇÕES PARA FINS DE 2º VIA DE BOLETOS

    // Verifica se o cpf passado é de um titular ativo que pode obter o boleto online
    async buscarTitularBoletoCpf(cpf){
        let conexao 
        try {
            conexao = await banco.conectarBanco()
            const resultado = await conexao.execute(
                `
                SELECT U.NNUMETITU, U.CNOMEUSUA
                FROM HSSUSUA U, HSSPLAN P, HSSTITU T
                WHERE U.C_CPFUSUA = :CPF
                AND U.CTIPOUSUA = 'T'
                AND U.CSITUUSUA = 'A'
                AND U.NNUMEPLAN = P.NNUMEPLAN
                AND (U.NNUMETITU = T.NNUMETITU)
                AND P.CNATUPLAN <> 3
                AND ((T.CBOLETITU = 'S') OR (T.CBOLETITU IS NULL))
                AND T.NNUMELOPG = 82607630
                `,
                {cpf},
                {outFormat:banco.OUT_FORMAT_OBJECT}
            )
            return resultado
        }catch(erro) {
            throw erro
        }finally {
            banco.desconectarBanco(conexao)
        }
    }

    // verifica se o numero de carteirinha passado é um de um titular ativo que pode ter obter boleto online
    async buscarTitularBoletoCarteira(carteira){
        let conexao
        try{
            conexao = await banco.conectarBanco()
            const consulta  = await conexao.execute(
                `
                SELECT U.NNUMETITU, U.CNOMEUSUA
                FROM HSSUSUA U, HSSTITU T, HSSPLAN P
                WHERE U.CCODIUSUA = :carteira 
                AND U.CSITUUSUA = 'A'
                AND U.CTIPOUSUA = 'T'
                AND U.NNUMEPLAN = P.NNUMEPLAN
                AND P.CNATUPLAN <> 3
                AND (U.NNUMETITU = T.NNUMETITU)
                AND ((T.CBOLETITU = 'S') OR (T.CBOLETITU IS NULL))
                AND T.NNUMELOPG = 82607630
                `,
                {carteira},
                {outFormat:banco.OUT_FORMAT_OBJECT}
            )
            return consulta
        }catch(erro){
            throw erro
        }finally{
            banco.desconectarBanco(conexao)
        }
    }

    // verifica se os digitos passados é um cpf ou uma carteirinha de um titular que pode obter o boleto online
    async buscarTitularBoleto(digitos){
        try {
            if(digitos.length == 11) {
                const consulta = await this.buscarTitularBoletoCpf(digitos) 
                return consulta
            }
            else if(digitos.length == 16) {
                const consulta = await this.buscarTitularBoletoCarteira(digitos)
                return consulta
            }
        }
        catch(erro) {
            throw erro
        }
    }
}

module.exports = {
    Beneficiario
}