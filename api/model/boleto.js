const { jsPDF } = require("jspdf")
const fs = require("fs")

class Boleto {
    constructor(dados){
        this.doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        })

        console.log(dados)
    }

    salve(path){
        this.doc.save(`${path}teste.pdf`)
    }
}

module.exports = {
    Boleto
}