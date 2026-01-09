// ======================== IMPORTAÇÕES =========================== //
const db = require('oracledb')
const banco = require('./banco')

// ==================== CLASSE DE BENEFICIARIO =================== //
class Beneficiario {
    
    async buscar_beneficiario_ativo_guias(numeroCpf){
        let conexaoBanco
        try {
            conexaoBanco = await banco.conectarBanco()
            const resultadoTitular = await conexaoBanco.execute(
                `
                SELECT U.NNUMETITU, U.CNOMEUSUA, U.NNUMEUSUA, U.NNUMEPESS
                FROM HSSUSUA U
                WHERE U.C_CPFUSUA = :numeroCpf
                AND U.CSITUUSUA = 'A'
                `,
                {numeroCpf},
                {outFormat:db.OUT_FORMAT_OBJECT}
            )
            
            return resultadoTitular
        } catch(erro) {
            
            throw erro
        } finally {
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
                AND T.CNATUTITU <> 3
                AND ((T.CBOLETITU = 'S') OR (T.CBOLETITU IS NULL))
                `,
                {numeroCpf},
                {outFormat:db.OUT_FORMAT_OBJECT}
            )
            
            return resultadoTitular
        }
        catch(erro) {
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
                WHERE U.CCODIUSUA = :numeroCarteira 
                AND U.CSITUUSUA = 'A'
                AND U.CTIPOUSUA = 'T'
                AND U.NNUMEPLAN = P.NNUMEPLAN
                AND (U.NNUMETITU = T.NNUMETITU)
                AND T.CNATUTITU <> 3
                AND ((T.CBOLETITU = 'S') OR (T.CBOLETITU IS NULL))
                `,
                {numeroCarteira},
                {outFormat:db.OUT_FORMAT_OBJECT}
            )
            
            return resultadoTitular
        }
        catch(erro) {
            
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
            throw erro
        }
    }
    
}
// ======================== EXPORTANDO =========================== //
module.exports = { Beneficiario }