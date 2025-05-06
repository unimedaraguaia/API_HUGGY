// IMPORTACOES
const banco = require('oracledb')  // biblioteca oracle DB
const crypto = require('crypto');  // biblioteca de cryptografia
const path = require('path');      // biblioteca para path
const shortLinks = require('../util/encurtador') // arquivo encurtador de links
const pdf = require('./boleto')    // arquivo que gera boleto
const { SECRET_KEY, USER, PASS, CONNECT,} = process.env; // constantes de acesso
const { NGINX_PORT } = process.env; // constantes de porta do NGINX


/**
 * Estabelece conexão com o banco de dados
 * @returns um conector para o banco em caso de sucesso ou erro a ser tratado
 */

const conectarBanco = async () => {
    // linha para a ser abilitada para produção
    //banco.initOracleClient({ libDir: process.env.PATH_ORACLE })
    try { 
        const keys = descriptografarDados(SECRET_KEY, USER, PASS, CONNECT)
        const conexao = await banco.getConnection({
            user: keys.USER,
            password: keys.PASS,
            connectString: keys.CONNECT
        })
        return conexao 
    }catch(erro) { 
        throw erro; 
    }   
}

/**
 * Faz a desconexão com o banco de dados
 * @param {} conector conector do banco de dados
 */
const desconectarBanco = async (conector) => { 
    if(conector) {
        try {
            await conector.close()
        }catch(erro) {
            throw erro;
        }
    }
}

/**
 * Função que pega o nome de um usuário do banco pelo cpf
 * @param {*} cpf cpf do usuário que se deseja o nome 
 * @returns nome do benficiario em caso de sucesso e um erro caso não seja encontrado
 */
const pegaNomeUsuario = async (cpf) => {
    let DB 
    try {
        DB = await conectarBanco()
        const resultado = await DB.execute(
            `select u.nnumetitu, u.cnomeusua
            from hssusua u, hssplan p, hsstitu t
            where u.c_cpfusua = :cpf
            and u.ctipousua = 'T'
            and u.csituusua = 'A'
            and u.nnumeplan = p.nnumeplan
            and (u.nnumetitu = t.nnumetitu)
            and p.cnatuplan <> 3
            and ((t.cboletitu = 's') or (t.cboletitu is null))
            and t.nnumelopg = 82607630`,
            {cpf},
            {outFormat:banco.OUT_FORMAT_OBJECT}
        )
        return resultado
    }catch(erro) {
        throw erro
    }finally {
        desconectarBanco(DB)
    }
}

/**
 * Função busca o codigo do titular pelo numero da carteira passada
 * @param {*} carteira string com o numero de carteira do beneficiário
 * @returns JSON do resultado da consulta do banco
 */
const buscarTitularCarteira = async (carteira) => {
    let BD
    try {
        BD = await conectarBanco()
        const consulta = await BD.execute(
            `select u.nnumetitu, u.cnomeusua
             from hssusua u, hsstitu t, hssplan p
             where u.ccodiusua = :carteira 
             and u.csituusua = 'A'
             and u.ctipousua = 'T'
             and u.nnumeplan = p.nnumeplan
             and p.cnatuplan <> 3
             and (u.nnumetitu = t.nnumetitu)
             and ((t.cboletitu = 's') or (t.cboletitu is null))
             and t.nnumelopg = 82607630`,
             {carteira},
             {outFormat:banco.OUT_FORMAT_OBJECT}
        )
        return consulta
    }catch(erro) {
        throw erro
    }finally {
        desconectarBanco(BD)
    }
} 

// FUNÇÃO OBSOLETA (APAGAR)
/**
 * Busca o id do boleto de um titular apartir da data corrente
 * @param {*} codigoTitular 
 */
const buscaIdBoleto = async (codigoTitular) => {
    let BD
    try {
        BD = await conectarBanco()
        const consulta = await BD.execute(
            `select P.nnumepaga, P.dvencpaga, P.nvencpaga
             from hsspaga P
             where P.nnumetitu = :codigoTitular and P.Dvencpaga >= '05/10/2024' and P.cpagopaga = 'N'`,
             {codigoTitular},
             {outFormat:banco.OUT_FORMAT_OBJECT}
        )
        // 
        //console.log(consulta.rows[0]['DVENCPAGA'])
        const data = new Date(consulta.rows[0]['DVENCPAGA'])
        const DataFormatada = data.toLocaleDateString('pt-BR')
        //console.log(DataFormatada)
        consulta.rows[0]['DVENCPAGA'] = DataFormatada

        return consulta

    }catch(erro) {
        throw erro

    }finally {
        // desconecta o banco
        desconectarBanco(BD)
    }
}

/**
 * Busca dados do beneficiário no banco de dados
 * @param {*} digitos pode ser o numero de carteira com 16 digitos ou pode ser o CPF com 11 digitos
 * @returns lança uma exceção de nao for nem um do dois ou retorna a consulta no caso de sucesso.
 */
const buscaBeneficiario = async (digitos) => {
    try{
        if(digitos.length == 11) {
            const consulta = await pegaNomeUsuario(digitos)
            return consulta
        }else if(digitos.length == 16){
            const consulta = await buscarTitularCarteira(digitos)
            return consulta
        }
    }catch(erro) {
        throw erro
    }
}

/**
 * Busca todos os boletos de um titular
 * Conecta com o banco de dados, 
 * pega todo os boletos não pagos de um titular de até 3 mese atrás apartir da data corrente.
 * formata os boletos e remove os parcelados (deixando apenas as parcelas dos mesmo) 
 * @param {*} codigoTitular codigo do titular
 * @returns retorna a consulta no banco ou lança um excessão no caso de falha
 */
const buscaIdBoleto2 = async (codigoTitular) => {
    
    let BD              
    let linhas = []     
    let enderecos = []
    let pathPdf = path.join(__dirname, "../temp/")
    
    try {
        BD = await conectarBanco()
        const boletos = await BD.execute(
            `select P.nnumepaga, P.dvencpaga, P.nvencpaga, P.cinstpaga, P.ccomppaga
             from hsspaga P
             where P.nnumetitu = :codigoTitular 
             and P.Dvencpaga >= ADD_MONTHS(CURRENT_DATE, -3)
             and P.cpagopaga = 'N'`,
             {codigoTitular},
             {outFormat:banco.OUT_FORMAT_OBJECT}
        )
        formataData(boletos)
        boletos.rows = removerParcelados(boletos.rows)

        let idBoletos = pegarIdBoleto(boletos)
        let contador = 0

        /** 
            Consulta cada linha digitavel de cada boleto
            e adiciona aos boletos respectivamente alem de criar os boletos
            e adiciona-los a pasta temporária.
        */
        for (let id of idBoletos) {
            
            const linhasDigitaveis = await BD.execute(
               `select B.linha_digitavel
                from table (pkg_boleto_class.boleto(p_id_pagamento => :id,
                p_id_jpaga     => 0,
                p_id_docu      => 0)) B`,
                {id},
                {outFormat:banco.OUT_FORMAT_OBJECT}
            )
            
            if (linhasDigitaveis.rows.length > 0) {
                let dados = await pegadarDadosBoleto(boletos.rows[contador].NNUMEPAGA)
                let boleto = new pdf.Boleto(dados)

                boleto.salve(pathPdf)
                linhas.push(linhasDigitaveis.rows[0])

                let localFile = `${process.env.ADDRESS_SERVICE}:${NGINX_PORT}/temp/${dados.NUMERO_DOCUMENTO.replace(/\s+/g, "")}.pdf`
                localFile = encutardarLink(localFile)
               
                enderecos.push(localFile)
            }
            contador++ 
        }
        
        boletos.rows = adicionaLinhasDigitaveis(boletos, linhas, enderecos)
        console.log(enderecos)
        return boletos
    }catch(erro) {
        throw erro 
    }finally {   
        desconectarBanco(BD) // desconecta o banco
    }
}

//  FUNÇÃO OBSOLETA (APAGAR)
/**
 * Pega as linha digitável de um boleto.
 * @param {} idPagamento identificados do boleto a ser pago
 * @returns retorna a consulta no banco ou ou lança uma excessão no caso de falha 
 */
const linhaPagamento = async (idPagamento) => {
    // variável
    let DB

    // tenta conectar ao banco
    try {
        // conecta com o banco
        BD = await conectarBanco()

        // faz a consulta no banco
        const consulta = await BD.execute(
            `select B.linha_digitavel
             from table (pkg_boleto_class.boleto(p_id_pagamento => :idPagamento,
                                      p_id_jpaga     => 0,
                                      p_id_docu      => 0)) B`,
             {idPagamento},
             {outFormat:banco.OUT_FORMAT_OBJECT}
        )

        // exibe
        console.log(consulta.rows)

        // retorna
        return consulta

    }catch(erro) {
        throw erro

    }finally {
         // Se a conexão ainda existe
         if(BD) {
            // tenta fechar a conexao
            try {
                // fecha a conexao
                await BD.close()
            }catch(erro){
                // lanca excessão caso nao consiga fechar a conexão
                throw erro;
            }
        }
    }
}

/**
 * Converte as datas da consulta para o formato PT-BR
 * @param {} consulta 
 */
const formataData = (consulta) => {
    consulta.rows.forEach(row => {
        const data = new Date(row['DVENCPAGA'])
        const DataFormatada = data.toLocaleDateString('pt-BR')
        row['DVENCPAGA'] = DataFormatada
    });
}

/**
 * Obtem todas as informações necessárias de um boleto para montar o PDF
 * @param {*} idBoleto identificador do boleto
 * @returns retorna os dados do boleto ou lança uma excessão
 */
const pegadarDadosBoleto = async (idBoleto) => {
    let BD
    try{
        BD = await conectarBanco()
        const dadosBoleto = await BD.execute(
            `SELECT A.*,TO_CHAR(A.VENCIMENTO,'DD/MM/YYYY') DATA_VENCIMENTO, DIAS_VALIDADE,
            BANCO, DIGITO_BANCO, RETORNA_NATUREZA_JURIDICA(A.NNUMETITU) NAT_JURIDICA
            FROM TABLE(PKG_BOLETO_CLASS.BOLETO(p_id_pagamento => :idBoleto,
                                        p_id_jpaga     => 0,
                                        p_id_docu      => 0)) A `,
            {idBoleto},
            {outFormat:banco.OUT_FORMAT_OBJECT}
        )
        return dadosBoleto.rows[0]
    }catch(erro) {
        throw erro
    }finally {
        desconectarBanco(BD)
    }
}

/**
 * Pega os identificadores dos boletos consultados
 * @param {*} consulta consulta do banco contendo os boletos
 * @returns vetor contendo os numeros dos identificadores dos boletos
 */
function pegarIdBoleto(consulta){
    vetor = []
    for(let i = 0; i < consulta.rows.length; i++) {
        vetor[i] = consulta.rows[i]['NNUMEPAGA']
    }
    return vetor
}

/**
 * Adiciona as linhas digitaveis de cada boleto
 * @param {*} boletos consulta do banco com dados dos boletos
 * @param {*} linhas vetor co linhas digitaveis de cada boleto
 * @returns // vetor com os dados formatados
 */
function adicionaLinhasDigitaveis(boletos, linhas, localBoletos){
    // variavel
    let vetor = []
    for (let i = 0; i < boletos.rows.length; i++) {
        boletos.rows[i]['LINHA_DIGITAVEL'] = linhas[i]['LINHA_DIGITAVEL']
        boletos.rows[i]['LOCAL_BOLETO'] = localBoletos[i]
        vetor.push(boletos.rows[i])
    }
    return vetor
}

/**
 * Remove todos os boletos parcelados deixando apenas as parcelas ou as mensalidades
 * @param {} vetor array contendo todos os boletos
 * @returns arrayu contendo apenas o  boletos integrais ou parcelas.
 */
function removerParcelados(vetor) {
    for(let i = 0; i < vetor.length; i++) {
        //console.log(vetor[i])
        if(vetor[i]['CINSTPAGA'] != null){
            for(let k = 0; k < vetor.length; k++){
                if(k != i){
                    if(vetor[k]['CCOMPPAGA'] == vetor[i]['CCOMPPAGA']){
                        if(vetor[k]['CINSTPAGA'] == null){
                            vetor.splice(k, 1)
                        }
                    }
                }
            }
        }
    }
    return vetor
}

/**
 * Desencripta as chaves de acesso ao banco
 * @param {*} secretKeyHex 
 * @param {*} userEncrypted 
 * @param {*} passEncrypted 
 * @param {*} connectEncrypted 
 * @returns 
 */
function descriptografarDados(secretKeyHex, userEncrypted, passEncrypted, connectEncrypted) {
    try{
        const algorithm = 'aes-256-cbc';
        const key = Buffer.from(secretKeyHex, 'hex');
    
        function decrypt(encrypted) {
            const [ivHex, dataHex] = encrypted.split(':');
            const iv = Buffer.from(ivHex, 'hex');
            const encryptedText = Buffer.from(dataHex, 'hex');
            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
            return decrypted.toString();
        }

        return {
            USER: decrypt(userEncrypted),
            PASS: decrypt(passEncrypted),
            CONNECT: decrypt(connectEncrypted)
        };
    }catch(erro){
        throw erro;
    }
}

/**
 * Encurta o link de acesso ao boleto
 * @param {*} link 
 * @returns 
 */
function encutardarLink(link) {
    const base = `${process.env.ADDRESS_SERVICE}:${NGINX_PORT}`
    const id = Math.random().toString(36).substring(2, 8)
    shortLinks.set(id, link)
    return `${base}/${id}`
}

// EXPORTANDO FUNCOES
module.exports = {
    conectarBanco,
    pegaNomeUsuario,
    buscarTitularCarteira,
    buscaIdBoleto,
    buscaIdBoleto2, 
    linhaPagamento,
    formataData,
    pegarIdBoleto,
    adicionaLinhasDigitaveis,
    desconectarBanco, 
    buscaBeneficiario
}