const db = require('oracledb')
const banco = require('./banco')

/**
 * +-----------------------------------------------------------------+
 * |  Classe Utilizada para obter dados a respeito do beneficiários  |
 * +-----------------------------------------------------------------+
 */
class Beneficiario {
    
    /**
     * Metodo que verifica se o cpf passado é de um titular simples
     * @param {*} cpf digitos numerico de um cpf
     * @returns 
     */
    async ehTitularAtivo(cpf){

        let conexao
        // Tenta conectar com banco de dados, executar a operação e retornar resultado 
        try {

            conexao = await banco.conectarBanco()
            const resultado = await conexao.execute(
                `
                SELECT U.NNUMETITU, U.CNOMEUSUA, U.NNUMEUSUA
                FROM HSSUSUA U
                WHERE U.C_CPFUSUA = :cpf
                AND U.CSITUUSUA = 'A'
                AND U.CTIPOUSUA = 'T'
                `,
                {cpf},
                {outFormat:db.OUT_FORMAT_OBJECT}
            )
            console.log(`[É titular] Sucesso beneficiário é titular\n`)
            return resultado

        }
        catch(erro) {
            // Exibe a mensagem e lança a exception
            console.log(`[É titular] Falha ao verificar titularidade\n`)
            throw erro
        }
        finally {
            // fecha a conexão com o banco de dados
            banco.desconectarBanco(conexao)
        }
    }
  
    // FUNÇÕES PARA FINS DE 2º VIA DE BOLETOS

    /**
     * Método que verifica se o beneficiário é titular ativo e que pode obter boletos online
     * @param {*} cpf Numero de cpf do beneficiário
     * @returns Json contendo as informações ou lança uma exception
     */
    async buscarTitularBoletoCpf(cpf) {
        
        let conexao 
        // Tenta estabelecer conexão com banco. pegar o dados pelo cpf e retornar o resultado
        try {
            
            conexao = await banco.conectarBanco()
            const resultado = await conexao.execute(
                `
                SELECT U.NNUMETITU, U.CNOMEUSUA, U.NNUMEUSUA, U.NNUMEPESS
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
                {outFormat:db.OUT_FORMAT_OBJECT}
            )
            console.log(`[Buscar Titular CPF] Sucesso ao buscar Titular\n`)
            return resultado

        }
        catch(erro) {
            // Exibe mensagem de log e lança a exception
            console.log(`[Buscar Titular CPF] Erro ao buscar titular pelo cpf (Erro)\n\n${erro}`)
            throw erro
        }
        finally {
            // Fecha conexão com banco
            banco.desconectarBanco(conexao)
        }
    }

    /**
     * Busca o titular de boleto pelo numero de carteirinha
     * @param {*} carteira numero da carteirinha unimed
     * @returns 
     */
    async buscarTitularBoletoCarteira(carteira) {

        let conexao
        // tenta conectar com o banco de dados, fazer a consulta e retornar resultado
        try {

            conexao = await banco.conectarBanco()
            const consulta  = await conexao.execute(
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
                {carteira},
                {outFormat:db.OUT_FORMAT_OBJECT}
            )
            console.log(`[Buscar Titular Carteira] Sucesso ao bucar Titular\n`)
            return consulta

        }
        catch(erro) {
            // Exibe mensagem e lança a exception
            console.log(`[Buscar Titular Carteira] Erro ao buscar titular pela carteira\n`)
            throw erro
        }
        finally {
            // Fecha a conexão com banco
            banco.desconectarBanco(conexao)
        }
    }

    /**
     * Método verifica se os digitos passados são de CPF ou de carteira Unimed
     * @param {*} digitos sequencia de numeros
     * @returns Os dados da consulta ou lança uma exception
     */
    async buscarTitularBoleto(digitos) {

        try {
            // Se os digitos tem 11 caracteres é possível cpf
            if(digitos.length == 11) {
                // tenta buscar pelo cpf e retorna o resultado
                const consulta = await this.buscarTitularBoletoCpf(digitos) 
                return consulta
            }// se caso for 16 digitos é possível carteira
            else if(digitos.length == 16) {
                // tenta buscar pela carteira e retona o resultado
                const consulta = await this.buscarTitularBoletoCarteira(digitos)
                return consulta
            }
        }
        catch(erro) {
            // Exibe a mensagem e lança a exception
            console.log(`[Buscar Titular Boleto] Lançamento de Excessão\n${erro}`)
            throw erro
        }
    }
    
}
// Exporta o modulo
module.exports = {
    Beneficiario
}