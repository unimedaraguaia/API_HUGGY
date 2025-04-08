// IMPORTACOES
const banco = require('oracledb')
require('dotenv').config()
const crypto = require('crypto');
//require('dotenv').config()

/**
 * Funçao que conecta com o banco de dados
 * @returns um conector para o banco em caso de sucesso ou erro a ser tratado
 */
const conectarBanco = async () => {
    
    //banco.initOracleClient({ libDir: process.env.PATH_ORACLE })
    
    // Tenta estabelecer conexao no banco
    try {
        //descritando chave
        const keys = descriptografarDados(process.env.SECRET_KEY, process.env.USER, process.env.PASS, process.env.CONNECT)
        // conecta no banco
        const conexao = await banco.getConnection({
            user: keys.USER,
            password: keys.PASS,
            connectString: keys.CONNECT
        })
        // retorna o conector
        return conexao
    }catch(erro) {
        
        throw erro; // Lançando erro para tratamento externo
    }   
}

/**
 * Faz a desconexão com o banco de dados
 * @param {} conector conector do banco de dados
 */
const desconectarBanco = async (conector) => {
    // Se a conexão ainda existe
    if(conector) {
        // tenta fechar a conexao
        try {
            // fecha a conexao
            await conector.close()
        }catch(erro){
            // lanca excessão caso nao consiga fechar a conexão
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
    // variavel de conexao
    let DB 
    //tenta
    try {
        // estabelece conexao com banco
        DB = await conectarBanco()
        // executa a consulta no banco
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
        // retorna resultado
        return resultado

    }catch(erro) {
        // caso de erro  lanca a excessão para ser tratada externamente
        throw erro

    }finally {
        // desconecta o banco
        desconectarBanco(DB)
    }
}

/**
 * Função busca o codigo do titular pelo numero da carteira passada
 * @param {*} carteira string com o numero de carteira do beneficiário
 * @returns JSON do resultado da consulta do banco
 */
const buscarTitularCarteira = async (carteira) => {
    // variaveis
    let BD
    // tenta conectar ao banco
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
        // desconecta o banco
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
    // tenta conectar ao banco
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
 * @param {*} digitos pode ser o numero de carteira ou pode ser o CPF
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
 * @param {*} codigoTitular codigo do titular
 * @returns retorna a consulta no banco ou lança um excessão no caso de falha
 */
const buscaIdBoleto2 = async (codigoTitular) => {
    // variaveis
    let BD
    let linhas = []

    // tenta conectar ao banco
    try {
        // conecta para o banco
        BD = await conectarBanco()

        // executa consulta com o banco
        const boletos = await BD.execute(
            `select P.nnumepaga, P.dvencpaga, P.nvencpaga, P.cinstpaga, P.ccomppaga
             from hsspaga P
             where P.nnumetitu = :codigoTitular 
             and P.Dvencpaga >= '10/06/2024'
             and P.cpagopaga = 'N'`,
             {codigoTitular},
             {outFormat:banco.OUT_FORMAT_OBJECT}
        )
        
        // formata a data de vencimento dos boletos para o padrão brasileiro
        formataData(boletos)
        boletos.rows = removerParcelados(boletos.rows)

        // pega os id dos boletos
        let idBoletos = pegarIdBoleto(boletos)

        //consulta cada linha digitavel de cada boleto
        for (let id of idBoletos) {

            // consulta as linhas digitaveis
            const linhasDigitaveis = await BD.execute(
                `select B.linha_digitavel
                from table (pkg_boleto_class.boleto(p_id_pagamento => :id,
                                        p_id_jpaga     => 0,
                                        p_id_docu      => 0)) B`,
                {id},
                {outFormat:banco.OUT_FORMAT_OBJECT}
            )
            // caso haja retonos
            if (linhasDigitaveis.rows.length > 0) {
                // adiciona as linhas no vetor de linhas
                linhas.push(linhasDigitaveis.rows[0])
            }
    
        }
        // adiciona as linhas digitaveis e modifica os rows do boleto
        boletos.rows = adicionaLinhasDigitaveis(boletos, linhas)
        // retorna os boletos
        console.log(boletos.rows)
        return boletos

    }catch(erro) {
        // lanca exeção para chamador
        throw erro

    }finally {
        // desconecta o banco
        desconectarBanco(BD)
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
 * Pega os identificadores dos boletos passado 
 * @param {*} consulta consulta do banco contendo dados dos boletos
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
function adicionaLinhasDigitaveis(boletos, linhas){
    // variavel
    let resposta = {}
    let vetor = []
    // percorre pelos boletos 
    for (let i = 0; i < boletos.rows.length; i++) {
        // adicionando as linhas digitaveis
        boletos.rows[i]['LINHA_DIGITAVEL'] = linhas[i]['LINHA_DIGITAVEL']
        // formatando campo de boletos
        //resposta[`boleto${i + 1}`] = boletos.rows[i]
        vetor.push(boletos.rows[i])
    }
    // adicona resposta ao vetor
    //vetor.push(resposta)

    // retorna resultados
    //console.log(vetor)
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

function descriptografarDados(secretKeyHex, userEncrypted, passEncrypted, connectEncrypted) {
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