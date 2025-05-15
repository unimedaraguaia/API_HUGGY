const banco = require('./banco')

class Beneficiario {
    
    /*
        Verifica se o cpf passado é de um titular ativo
        -> Em caso positivo retorna o numero do titular e o nome
    */
    async ehTitularAtivo(cpf){
        let conexao
        try{
            conexao = await banco.conectarBanco()
            const resultado = await conexao.execute(
                `SELECT U.NNUMETTITU, U.CNOMEUSUA
                 FROM HSSUSUA U
                 WHERE U.C_CPFUSUA = :cpf
                 AND U.CSITUUSUA = 'A'
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

    /**
     * Bucar dados do titular por meiro de um cpf passado
     * -> retorna o numero e nome do titular
     */
    async buscarTitularCpf(cpf){
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

    /**
     * Bucar dados do titular por meiro de um cpf passado
     * -> retorna o numero e nome do titular
     */
    async buscarTitularCarteira(carteira){
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

    /**
     * Pega dados do beneficiario para fins de segunda via de boletos
     * Por meio dos digitos passados identifca se é carteira ou cpf
     */
    async buscarBeneficiarioTitularBoleto(digitos){
        try {
            if(digitos.length == 11) {
                const consulta = await this.buscarTitularCpf(digitos) 
                return consulta
            }
            else if(digitos.length == 16) {
                const consulta = await this.buscarTitularCarteira(digitos)
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