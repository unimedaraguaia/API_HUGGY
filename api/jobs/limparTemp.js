// ======================== IMPORTAÇÕES ================================ //
const fs = require('fs')
const path = require('path')
const hora = 3600

// ============================ FUNCAO ================================ //

function verificarArquivos(pasta, limiteMinutos) {
    setInterval(() => {
        const arquivos = fs.readdirSync(pasta);
        const agora = Date.now();

        arquivos.forEach(arquivo => {
            const caminho = path.join(pasta, arquivo);
            const stats = fs.statSync(caminho);
            const idadeMinutos = (agora - stats.birthtimeMs) / (1000 * 60);

            if (idadeMinutos >= limiteMinutos) {
                fs.unlinkSync(caminho);
                console.log(`[API] Arquivo removido: ${arquivo} em ${agora}`);
            }
        });
    }, hora * 1000); 
}
module.exports = verificarArquivos