// IMPORTACOES
const banco = require('oracledb')
//require('dotenv').config()

/**
 * Funçao que conecta com o banco de dados
 * @returns um conector para o banco em caso de sucesso ou erro a ser tratado
 */
const conectarBanco = async () => {
    
    banco.initOracleClient({ libDir: process.env.PATH_ORACLE })
    
    // Tenta estabelecer conexao no banco
    try {
        // conecta no banco
        const conexao = await banco.getConnection({
        
            user: process.env.USER,
            password: process.env.PASS,
            connectString: process.env.CONNECT
        

        })
        // retorna o conector
        return conexao
    }catch(erro) {
        throw erro; // Lançando erro para tratamento externo
    }   
}

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
            `SELECT U.CNOMEUSUA
             FROM HSSUSUA U
             WHERE U.C_CPFUSUA = :cpf`,
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
             from hssusua u
             where u.ccodiusua = :carteira and u.csituusua = 'A'`,
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
    let DB
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

        console.log(consulta)
        return consulta

    }catch(erro) {
        throw erro

    }finally {
        // desconecta o banco
        desconectarBanco(DB)
    }
}


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
             where P.nnumetitu = :codigoTitular and P.Dvencpaga >= ADD_MONTHS(CURRENT_DATE, -3) and P.cpagopaga = 'N'`,
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
        }else{
            console.log("Noa parcelado")
        }
    }
    return vetor
}
//buscaIdBoleto2('62463946')

//linhaPagamento2('6398517')

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
    desconectarBanco
}