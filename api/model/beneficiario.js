// ======================== IMPORTAÇÕES =========================== //
const db = require('oracledb')
const banco = require('./banco')

// ==================== CLASSE DE BENEFICIARIO =================== //
class Beneficiario {
    
    async buscar_titular_ativo_guias(numeroCpf){
        let conexaoBanco
        try {
            conexaoBanco = await banco.conectarBanco()
            const resultadoTitular = await conexaoBanco.execute(
                `
                SELECT U.NNUMETITU, U.CNOMEUSUA, U.NNUMEUSUA
                FROM HSSUSUA U
                WHERE U.C_CPFUSUA = :numeroCpf
                AND U.CSITUUSUA = 'A'
                AND U.CTIPOUSUA = 'T'
                `,
                {numeroCpf},
                {outFormat:db.OUT_FORMAT_OBJECT}
            )
            console.log(`[API] Sucesso ao buscar beneficiário titular\n`)
            return resultadoTitular
        }
        catch(erro) {
            // Exibe a mensagem e lança a exception
            console.log(`[API] Falha ao buscar beneficiario titular\n`)
            throw erro
        }
        finally {
            // fecha a conexão com o banco de dados
            banco.desconectarBanco(conexaoBanco)
        }
    }
  
    async buscar_titular_boleto_cpf(numeroCpf) {
        let conexaoBanco 
        try {
            conexaoBanco = await banco.conectarBanco()
            const resultadoTitular = await conexaoBanco.execute(
                `
                SELECT U.NNUMETITU, U.CNOMEUSUA, U.NNUMEUSUA, U.NNUMEPESS
                FROM HSSUSUA U, HSSPLAN P, HSSTITU T
                WHERE U.C_CPFUSUA = :numeroCpf
                AND U.CTIPOUSUA = 'T'
                AND U.CSITUUSUA = 'A'
                AND U.NNUMEPLAN = P.NNUMEPLAN
                AND (U.NNUMETITU = T.NNUMETITU)
                AND P.CNATUPLAN <> 3
                AND ((T.CBOLETITU = 'S') OR (T.CBOLETITU IS NULL))
                AND T.NNUMELOPG = 82607630
                `,
                {numeroCpf},
                {outFormat:db.OUT_FORMAT_OBJECT}
            )
            console.log(`[API] Sucesso ao buscar titular pelo CPF\n`)
            return resultadoTitular
        }
        catch(erro) {
            console.error(` > Erro ao buscar titular do bolero pelo cpf\n`)
            throw erro
        }
        finally {
            banco.desconectarBanco(conexaoBanco)
        }
    }

    async buscar_titular_boleto_carteira(numeroCarteira) {
        let conexaoBanco
        try {
            conexaoBanco = await banco.conectarBanco()
            const resultadoTitular  = await conexaoBanco.execute(
                `
                SELECT U.NNUMETITU, U.CNOMEUSUA, U.NNUMEUSUA, U.NNUMEPESS
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
                {numeroCarteira},
                {outFormat:db.OUT_FORMAT_OBJECT}
            )
            console.log(`[API] Sucesso ao buscar titular por meio da carteira\n`)
            return resultadoTitular
        }
        catch(erro) {
            console.log(`[API] Erro ao buscar titular por meio da carteira\n`)
            throw erro
        }
        finally {
            banco.desconectarBanco(conexaoBanco)
        }
    }

    async buscar_titular_boleto(digitos) {
        try {
            if(digitos.length == 11) {
                const consultaTitular = await this.buscar_titular_boleto_cpf(digitos) 
                return consultaTitular
            }
            else if(digitos.length == 16) {
                const consultaTitular = await this.buscar_titular_boleto_carteira(digitos)
                return consultaTitular
            }
        }
        catch(erro) {
            console.log(`[API] Erro ao buscar titular do boleto\n`)
            throw erro
        }
    }
    
}
// ======================== EXPORTANDO =========================== //
module.exports = { Beneficiario }