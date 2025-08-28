// ========================= IMPORTAÇÕES ============================= //
require('dotenv').config()
const express = require('express')
const swaggerParaExpress = require('swagger-ui-express')
const arquivoSwagger = require('../doc/swagger')
const rotas = require('../routes/rotas')
const path = require('path')
const limparArquivosAntigos = require('../jobs/limparTemp');
const localServico = process.env.ADDRESS_SERVICE
const porta = process.env.PORT
const cores = {
    reseta: "\x1b[0m",
    verde: "\x1b[32m",
    ciano: "\x1b[36m",
    amarelo: "\x1b[33m",
    magenta: "\x1b[35m",
    vermelho: "\x1b[31m"
}

const API  = express()

API.use(express.json())
API.use('/api-docs', swaggerParaExpress.serve, swaggerParaExpress.setup(arquivoSwagger));
API.use(rotas)
API.use('/temp', express.static(path.join(__dirname, '../temp')));

// ===================== FUNCAO UTILITARIA ================================= //
function iniciarServidor(API, portaServico) {
    return new Promise((resolve, rejeita) => {
        const servidor = API.listen(portaServico, () => resolve(servidor))
        servidor.on("ERRO", rejeita)
    })
}

// ==================== INICIALIZAÇÃO DO SERVIDOR ========================= //
iniciarServidor(API, porta)
    .then(() => {
        const dataHora = new Date().toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "medium"
        })

        console.log(
            `${cores.verde}[API_UNIMED_HUGGY] Servidor iniciado com sucesso${cores.reseta}\n` +
            `${cores.verde}> Endereço: ${localServico}:${porta}${cores.reseta}\n` +
            `${cores.amarelo}> Ambiente: ${process.env.NODE_ENV || "desenvolvimento"}${cores.reseta}\n` +
            `${cores.verde}> Iniciado em: ${dataHora}${cores.reseta}`
        )

        limparArquivosAntigos(path.join(__dirname, '../temp'), 60)
    })
    .catch((err) => {
        if (err.code === "EADDRINUSE") {
            console.error(`${cores.vermelho}[API_UNIMED_HUGGY] Erro: a porta ${porta} já está em uso.${cores.reseta}`)
        } else {
            console.error(`${cores.vermelho}[API_UNIMED_HUGGY] Erro ao iniciar o servidor:${cores.reseta}`, err)
        }
        process.exit(1)
    })
