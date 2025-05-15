const { jsPDF } = require("jspdf")
const fs = require("fs")
const path = require('path');

class Pdf {
    // COnstrutor
    constructor(dados){
        this.doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        })
        // Posições iniciais para desenho do código de barras
        this.posX = 10
        this.posY = 268
        this.fileName = dados.NUMERO_DOCUMENTO
        this.fonte = 'helvetica'
        // Desenha o boleto e adicioan informações
        this.desenhaGrade(this.doc)
        this.instrucoes(this.doc)
        this.nomeCampos(this.doc)
        this.carregaLogo(this.doc)
        this.addInfo(this.doc, dados)
        this.gerarCodigoBarra(this.doc, dados.CODIGO_BARRAS)
    }
    // configura a fonte  
    fonteConfig(doc, fonte, tamanho, estilo){
        doc.setFont(this.fonte)              //define a fonte
        doc.setFontSize(tamanho)        //define o tamanho da fonte
        doc.setFont(undefined, estilo)  //define o estilo com negrito
    }
    // formata os cpf e o anonimiza
    formataCPF(cpf, anonimizaValores = true) {
        cpf = String(cpf);
      
        if (cpf.length === 11) {
          if (anonimizaValores) {
            cpf = `${cpf.substring(0, 3)}.XXX.XXX-XX`;
          } else {
            cpf = `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-${cpf.substring(9, 11)}`;
          }
        }
      
        return cpf;
    }
    // formata os valores
    formatarValor(valor) {
        return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    // formada dados nulos
    formataNull(info){
        if(info == null){
            return ""
        }else{
            return info
        }
    }
    // formata a data
    formatarData(dataISO) {
        const data = new Date(dataISO);
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0'); // mês começa em 0
        const ano = data.getFullYear();
        return `${dia}/${mes}/${ano}`;
    }
    // desenha o layout do PDF
    desenhaGrade(doc){
        doc.setFillColor(200);
        //linha 1
        doc.rect(55, 53, 0.5, 6, 'F')
        doc.rect(75, 53, 0.5, 6, 'F')

        doc.rect(10, 61, 190, 0.5, 'F')
        // linha 2
        doc.rect(10, 62, 0.5, 6, 'F')
        doc.rect(100, 62, 0.5, 6, 'F')
        doc.rect(140, 62, 0.5, 6, 'F')
        doc.rect(150, 62, 0.5, 6, 'F')
        doc.rect(165, 62, 0.5, 6, 'F')

        doc.rect(10, 69, 190, 0.2, 'F')
        // linha 3
        doc.rect(10, 70, 0.5, 6, 'F')
        doc.rect(40, 70, 0.5, 6, 'F')
        doc.rect(60, 70, 0.5, 6, 'F')
        doc.rect(100, 70, 0.5, 6, 'F')
        doc.rect(140, 70, 0.5, 6, 'F')

        doc.rect(10, 78, 190, 0.2, 'F')
        // linha 4
        doc.rect(10, 79, 0.5, 6, 'F')
        doc.rect(40, 79, 0.5, 6, 'F')
        doc.rect(75, 79, 0.5, 6, 'F')
        doc.rect(110, 79, 0.5, 6, 'F')
        doc.rect(140, 79, 0.5, 6, 'F')

        doc.rect(10, 87, 190, 0.2, 'F')
        //linha 5
        doc.rect(10, 88, 0.5, 6, 'F')

        doc.rect(10, 96, 190, 0.2, 'F')
        
        // segunda parte documento
        //linha 1
        doc.rect(55, 146, 0.5, 6, 'F')
        doc.rect(75, 146, 0.5, 6, 'F')
        
        doc.rect(10, 154, 190, 0.5, 'F')
        //linha 2
        doc.rect(10, 155, 0.5, 6, 'F')
        doc.rect(140, 155, 0.5, 6, 'F')

        doc.rect(10, 162, 190, 0.2, 'F')
        // linha 3
        doc.rect(10, 163, 0.5, 6, 'F')
        doc.rect(140, 163, 0.5, 6, 'F')

        doc.rect(10, 171, 190, 0.2, 'F')
        // linha 4
        doc.rect(10, 172, 0.5, 6, 'F')
        doc.rect(40, 172, 0.5, 6, 'F')
        doc.rect(85, 172, 0.5, 6, 'F')
        doc.rect(100, 172, 0.5, 6, 'F')
        doc.rect(110, 172, 0.5, 6, 'F')
        doc.rect(140, 172, 0.5, 6, 'F')
        
        doc.rect(10, 180, 190, 0.2, 'F')
        // linha 5
        doc.rect(10, 181, 0.5, 6, 'F')
        doc.rect(40, 181, 0.5, 6, 'F')
        doc.rect(70, 181, 0.5, 6, 'F')
        doc.rect(80, 181, 0.5, 6, 'F')
        doc.rect(110, 181, 0.5, 6, 'F')
        doc.rect(140, 181, 0.5, 6, 'F')

        doc.rect(10, 189, 190, 0.2, 'F')
        //linha 6
        doc.rect(140, 190, 0.5, 6, 'F')
        doc.rect(140, 198, 60, 0.2, 'F')
        //linha 7
        doc.rect(140, 199, 0.5, 6, 'F')
        doc.rect(140, 207, 60, 0.2, 'F')
        //linha 8
        doc.rect(140, 208, 0.5, 6, 'F')
        doc.rect(140, 216, 60, 0.2, 'F')
        //linha 9
        doc.rect(140, 217, 0.5, 6, 'F')
        doc.rect(140, 225, 60, 0.2, 'F')
        //linha 10
        doc.rect(140, 226, 0.5, 6, 'F')
        doc.rect(140, 234, 60, 0.2, 'F')
        // divisoria
        doc.rect(10, 239, 190, 0.2, 'F')

        doc.rect(10, 240, 0.5, 15, 'F')
        doc.rect(10, 257, 0.5, 10, 'F')
        doc.rect(140, 262, 0.5, 5, 'F')
        // linha final
        doc.rect(10, 267, 190, 0.2, 'F')
    }
    // carrega os nome dos campos
    nomeCampos(doc) {
        this.fonteConfig(doc, this.fonte, 6, 'normal')
        doc.text('Beneficiário', 11, 64);
        doc.text('Coop. contratante / Cód. Beneficiário', 101, 64);
        doc.text('Espécie', 141, 64);
        doc.text('Quantidade', 151, 64);
        doc.text('Nosso Número', 166, 64);
    
        doc.text('Número do documento', 11, 72);
        doc.text('Contrato', 41, 72);
        doc.text('CPF/CEI/CNPJ', 61, 72);
        doc.text('Vencimento', 101, 72);
        doc.text('Valor', 141, 72);
    
        doc.text('(-) Desconto / Abatimento', 11, 81);
        doc.text('(-) Outras deduções', 41, 81);
        doc.text('(+) Mora / Multa', 76, 81);
        doc.text('(+) Outros Acréscimos', 111, 81);
        doc.text('(=) Valor cobrado', 141, 81);
    
        doc.text('Pagador / CPF', 11, 90);
    
    
        doc.text("Autenticação mecânica", 151, 98)
    
    
        doc.text("Local de Pagamento", 11, 157)
        doc.text("Vencimento", 141, 157)
        
        doc.text("Beneficiário", 11, 165)
        doc.text("Coop. contratante / Cód. Beneficiário", 141, 165)
    
        doc.text("Data do documento", 11, 174)
        doc.text("Nº do documento", 41, 174)
        doc.text("Espécie doc.", 86, 174)
        doc.text("Aceite", 101, 174)
        doc.text("Data process", 111, 174)
        doc.text("Nosso número", 141, 174)
    
        doc.text("Uso do banco", 11, 183)
        doc.text("Carteira", 41, 183)
        doc.text("Espécie", 71, 183)
        doc.text("Quantidade", 81, 183)
        doc.text("Valor", 111, 183)
        doc.text("(=) Valor documento", 141, 183)
        
        doc.text("(-) Desconto / Abatimento", 141, 192)
    
        doc.text("(-) Outras deduções", 141, 201)
    
        doc.text("(+) Mora / Multa", 141, 210)
    
        doc.text("(+) Outros acréscimos", 141, 219)
    
        doc.text("(=) Valor cobrado", 141, 228)
        
        doc.text("Pagador", 11, 242)
    
        doc.text("Sacador avalista", 11, 259)
    
        doc.text("Cód. baixa", 141, 264)
    
        doc.text("Autenticação mecânica - Ficha de Compensação", 158, 269)
    }
    // carrega instruções
    instrucoes(doc){
        const linha = '-'.repeat(260);
        //Cabeçalho 
        this.fonteConfig(doc, this.fonte, 10, 'bold')
        doc.text('Instruções', 10, doc.previousAutoTable ? doc.lastAutoTable.finalY + 6 : 20); // posição X=10, Y=20 (exemplo)
    
        //Itens cabeçalho 
        this.fonteConfig(doc, this.fonte, 10, 'normal')
        doc.text('1. Imprima em impressora jato de tinta (ink jet) ou laser em qualidade normal ou alta. Não use modo econômico.', 10, 24);
        doc.text('2. Utilize folha A4 (210 x 297 mm) e margens mínimas à esquerda e à direita do formulário.', 10, 28);
    
        //Linha pontilhada 
        this.fonteConfig(doc, this.fonte, 6, 'normal')
        doc.text('Corte na linha pontilhada', 10, 40);
        doc.text(linha, 10, 44);
    
        this.fonteConfig(doc, this.fonte, 10, 'normal')
        doc.text('2ª VIA', 10, 100)
        doc.text('Este documento é somente para fins de pagamento, para mais informações consultar o demonstrativo.', 10, 105)
    
        this.fonteConfig(doc, this.fonte, 6, 'normal')
        doc.text('Corte na linha pontilhada', 10, 120);
        doc.text(linha, 10, 124);
    
    
        this.fonteConfig(doc, this.fonte, 6, 'bold')
        doc.text('Instruções (Texto de responsabilidade do cedente)', 11, 192)
    
        
    }
    // carrega a logo (Problema)
    carregaLogo(doc){
        let logoBanco = path.join(__dirname, '../img/sicredi.jpg')
        let logoANS = path.join(__dirname,'../img/Registro ANS.png')
    
        const logoBanco64 = fs.readFileSync(logoBanco, { encoding: 'base64' })
        const logoANS64 = fs.readFileSync(logoANS, { encoding: 'base64' })
    
        const banco = `data:image/png;base64,${logoBanco64}`
        const ANS = `data:image/png;base64,${logoANS64}`
        
        let larguraImagem = 30
        let alturaImagem = 10
    
        if (banco && larguraImagem && alturaImagem) {
            doc.addImage(banco, 'JPG', 10, 49, larguraImagem, alturaImagem)
            doc.addImage(banco, 'JPG', 10, 142, larguraImagem, alturaImagem)
        }
    
        if(ANS){
            doc.addImage(ANS, 'PNG', 176, 89, 20, 6)
            doc.addImage(ANS, 'PNG', 115, 228, 20, 6)
        }
    }
    addInfo(doc, dados){
        
        doc.setFont(this.fonte, 'bold')             //define a fonte
        doc.setFontSize(12)
        doc.text(`${dados.BANCO}-${dados.DIGITO_BANCO}`, 56.5, 58 )
        doc.text(`${dados.LINHA_DIGITAVEL}`, 78, 58)
        
        doc.setFont(this.fonte, 'bold')             //define a fonte
        doc.setFontSize(7)
        
        doc.text(`${dados.CEDENTE}`, 11, 68)
        doc.text(`${dados.AGENCIA_BOLETO}`, 101, 68)
        doc.text(`${dados.ESPECIE}`, 141, 68)
        doc.text(`${this.formataNull(dados.QUANTIDADE)}`, 151, 68)
        doc.text(`${dados.NOSSO_NUMERO}`, 166, 68)
    
        doc.text(`${dados.NUMERO_DOCUMENTO}`, 11, 76)
        doc.text(`${dados.CONTRATO}`, 41, 76)
        doc.text(`${dados.CNPJ_CEDENTE}`, 61, 76)
        doc.text(`${this.formatarData(dados.VENCIMENTO)}`, 101, 76)
        doc.text(`${this.formatarValor(dados.VALOR)}`, 141, 76)
        
        doc.text(`${dados.NOME_SACADO} / ${this.formataCPF(dados.CNPJ_CPF_SACADO)}`, 11, 94)
       
        doc.setFont(this.fonte, 'bold')             //define a fonte
        doc.setFontSize(12)
        doc.text(`${dados.BANCO}-${dados.DIGITO_BANCO}`, 56.5, 150 )
        doc.text(`${dados.LINHA_DIGITAVEL}`, 78, 150)
    
        doc.setFont(this.fonte, 'bold')             //define a fonte
        doc.setFontSize(7)
    
        doc.text(`${dados.LOCAL_PAGAMENTO}`, 11, 161)
        doc.text(`${dados.DATA_VENCIMENTO}`, 141, 161)
        
        doc.text(`${dados.CEDENTE} - ${dados.CNPJ_CEDENTE}`, 11, 169)
        doc.text(`${dados.AGENCIA_BOLETO}`, 141, 169)
    
        doc.text(`${this.formatarData(dados.DATA_DOCUMENTO)}`, 11, 178)
        doc.text(`${dados.NUMERO_DOCUMENTO}`, 41, 178)
        doc.text(`${dados.ESPECIE_DOCUMENTO}`, 86, 178)
        doc.text(`${dados.ACEITE}`, 101, 178)
        doc.text(`${this.formatarData(dados.DATA_PROCESSAMENTO)}`, 111, 178)
        doc.text(`${dados.NOSSO_NUMERO}`, 141, 178)
    
        doc.text(`${this.formataNull(dados.USO_BANCO)}`, 11, 187)
        doc.text(`${dados.CARTEIRA}`, 41, 187)
        doc.text(`${dados.ESPECIE}`, 71, 187)
        doc.text(`${this.formataNull(dados.QUANTIDADE)}`, 81, 187)
        doc.text(`${this.formatarValor(dados.VALOR)}`, 111, 187)
        doc.text(`${this.formatarValor(dados.VALOR_NOTA)}`, 141, 187)
    
        doc.setFont(this.fonte, 'bold')             //define a fonte
        doc.setFontSize(4.5)
        doc.text(`${dados.INSTRUCOES}`, 11, 194)
        
        doc.setFontSize(6)
        doc.text(`${dados.PLANO_SACADO}`, 71, 192)
        doc.text(`Competênica: ${dados.COMPETENCIA}`, 111, 194)
    
        doc.setFont(this.fonte, 'bold')             //define a fonte
        doc.setFontSize(10)
        doc.text(`${dados.DESC_JUROS}`, 10, 230)
    
        doc.setFont(this.fonte, 'bold')             //define a fonte
        doc.setFontSize(8)
        doc.text(`${dados.NOME_SACADO}`, 11, 246)
        doc.text(`${dados.ENDERECO1}`, 11, 250)
        doc.text(`${dados.ENDERECO2}`, 11, 254)
    
        //doc.text(`CPF${boleto[0].CNPJ_CPF_SACADO}`)
        doc.text(`CPF: ${this.formataCPF(dados.CNPJ_CPF_SACADO)}`, 165, 246)
        doc.text(`Contrato: ${dados.CONTRATO}`,165, 250 )
    }
    // carrega codigo de barra
    desenharBarra(doc, largura, altura, preenchido) {
        try{

            if (preenchido) {
                doc.setFillColor(0, 0, 0); // Preto
            } else {
                doc.setFillColor(255, 255, 255); // Branco
            }

            doc.rect(this.posX, this.posY, largura, altura, 'F');
            doc.internal.write('BT 0 0 Td ET'); // Move o cursor (pequeno ajuste técnico)

            this.posX += largura;

        }catch(erro){
            console.log("Erro ao desenhar Barras:", erro)
        }
    }
    // cria o codigo de barra
    gerarCodigoBarra(doc, valor) {
        
        let codigo = '';
        const a = 0.27;
        const b = 0.81;
        const c = 14;
        const vetor = [];
      
        vetor[0] = "00110";
        vetor[1] = "10001";
        vetor[2] = "01001";
        vetor[3] = "11000";
        vetor[4] = "00101";
        vetor[5] = "10100";
        vetor[6] = "01100";
        vetor[7] = "00011";
        vetor[8] = "10010";
        vetor[9] = "01010";
      
        for (let i = 9; i >= 0; i--) {
          for (let j = 9; j >= 0; j--) {
            const x = (i * 10) + j;
            let y = "";
            for (let barra = 1; barra < 6; barra++) {
              y += vetor[i].charAt(barra - 1) + vetor[j].charAt(barra - 1);
            }
            vetor[x] = y;
          }
        }
      
        // Primeiro traço de abertura
        this.desenharBarra(doc, a, c, true);
        this.desenharBarra(doc, a, c, false);
        this.desenharBarra(doc, a, c, true);
        this.desenharBarra(doc, a, c, false);
      
        let y = valor;
      
        while (y.length > 0) {
          let barra = parseInt(y.substring(0, 2));
          y = y.substring(2);
          let x = vetor[barra];
      
          for (let i = 0; i < 10; i += 2) {
            let largura1 = (x.charAt(i) === "0") ? a : b;
            this.desenharBarra(doc, largura1, c, true);
      
            let largura2 = (x.charAt(i + 1) === "0") ? a : b;
            this.desenharBarra(doc, largura2, c, false);
          }
        }
      
        // Final traço de fechamento
        this.desenharBarra(doc, b, c, true);
        this.desenharBarra(doc, a, c, false);
        this.desenharBarra(doc, a, c, true);
      
        return codigo;
    }
    // Salva o arquivo em pdf
    salve(path){
        this.doc.save(`${path}${this.fileName.replace(/\s+/g, "")}.pdf`)
    }
}
// exporta o objeto
module.exports = {
    Pdf
}