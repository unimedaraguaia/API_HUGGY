const swaggerJsdoc = require('swagger-jsdoc');
const localService = process.env.ADDRESS_SERVICE
const porta = process.env.NGINX_PORT

const swaggerSpec = {
    openapi: '3.0.3',
    info: {
      title: 'API HUGGY UNIMED',
      version: '1.2.1',
      description: 'Documentação da API_UNIMED desenvolvida para fluxos HUGGY',
    },
    servers: [{ url: `${localService}:${porta}` }],
    paths: {
        
        // REQUISICOES 
        "/titularBoleto": {
        "get": {
            "tags": ["Beneficiário"],
            "summary": "Identifica um titular ativo que pode ter acesso a boletos online",
            "description": "Por meio do CPF ou Numero de Carteira Unimed faz se a identificação do titular",
            "operationId": "buscar_titular_boleto_digitos",
            "parameters": [
                {
                    "name": "digitos",
                    "required": true,
                    "in": "header",
                    "schema": {
                    "description": "Pode ser cpf ou carteira unimed",
                    "type": "integer",
                    "example": 23523523535
                    }
                }
            ],
            "responses": {
            "200": { "$ref": "#/components/responses/responseTitularBoleto" },
            "404": { "$ref": "#/components/responses/naoEncontrado" },
            "500": { "$ref": "#/components/responses/indisponivel" }
            }
        }
        },
        "/boleto": {
        "get": {
            "tags": ["Boletos"],
            "summary": "Obtem os boletos de um titular",
            "description": "Por meio do codigo do titular pega todos os Boletos não pagos de um titular no periodo da data atual até 3 meses antetiores",
            "operationId": "BuscaBoletos",
            "responses": {
            "200": { "$ref": "#/components/responses/responseBoleto" },
            "404": { "$ref": "#/components/responses/naoEncontrado" },
            "500": { "$ref": "#/components/responses/indisponivel" }
            }
        }
        },
        "/guias": {
        "get": {
            "tags": ["Guias"],
            "summary": "Identifica um titular",
            "description": "Por meio de um número de carteirinha",
            "responses": {
            "200": { "$ref": "#/components/responses/responseGuias" },
            "404": { "$ref": "#/components/responses/naoEncontrado" },
            "500": { "$ref": "#/components/responses/indisponivel" }
            }
        }
        },
        "/listarGuias": {
        "get": {
            "tags": ["Guias"],
            "summary": "Identifica um titular",
            "description": "Por meio de um número de carteirinha",
            "responses": {
            "200": { "$ref": "#/components/responses/responseListaGuias" },
            "404": { "$ref": "#/components/responses/naoEncontrado" },
            "500": { "$ref": "#/components/responses/indisponivel" }
            }
        }
        },
        "/gerarProtocolo": {
        "post": {
            "tags": ["Protocolo"],
            "summary": "Gera um protocolo no CRM para registrar a solicitação do beneficiário",
            "description": "Por meio do identificado do beneficiário a requisição gera um protocolo no CRM",
            "operationId": "criar_protocolo_segunda_via_boleto",
            "parameters": [
            {
                "name": "id_pessoa",
                "required": true,
                "in": "header",
                "schema": {
                "description": "Identificador de pessoa do Titular",
                "type": "number",
                "example": 235000
                }
            }
            ],
            "responses": {
            "200": { "$ref": "#/components/responses/responseProtocolo" },
            "404": { "$ref": "#/components/responses/naoEncontrado" },
            "500": { "$ref": "#/components/responses/indisponivel" }
            }
        }
        },
        "/adicionarAtendimento": {
        "post": {
            "tags": ["Atendimento"],
            "summary": "Gera um atendimento no CRM e vincula ele a um protocolo",
            "description": "Por meio do intentificador de um protocolo, um tipo de atendimento e o id de um usuario cria um atendimento no CRM",
            "operationId": "criar_atendimento_segunda_via_boleto",
            "parameters": [
            {
                "name": "id_protocolo",
                "required": true,
                "in": "header",
                "schema": {
                "description": "Identificador de um protocolo",
                "type": "number",
                "example": 50000
                }
            },
            {
                "name": "tipo_atendimento",
                "required": true,
                "in": "header",
                "schema": {
                "description": "Identificador do tipo de atendimento (ramo da arvore ao qual pertence)",
                "type": "number",
                "example": 80
                }
            },
            {
                "name": "id_usuario",
                "required": true,
                "in": "header",
                "schema": {
                "description": "Identificador do usuario (titular)",
                "type": "number",
                "example": 1100000
                }
            }
            ],
            "responses": {
            "200": { "$ref": "#/components/responses/responseAtendimento" },
            "404": { "$ref": "#/components/responses/naoEncontrado" },
            "500": { "$ref": "#/components/responses/indisponivel" }
            }
        }
        },
        "/insereMensagemAtendimento": {
        "post": {
            "tags": ["Atendimento"],
            "summary": "Insere uma mensagem em um atendimento criado",
            "description": "Por meio do indentificador de um atendimento insere uma mensagem no mesmo.",
            "operationId": "adiciona_mensagem_boletos",
            "parameters": [
            {
                "name": "id_atendimento",
                "required": true,
                "in": "header",
                "schema": {
                "description": "Identificador de um atendimento",
                "type": "number",
                "example": 50000
                }
            },
            {
                "name": "mensagem",
                "required": true,
                "in": "header",
                "schema": {
                "description": "Mensagem a ser adicionada",
                "type": "string",
                "example": "Boleto gerado para beneficiario"
                }
            }
            ],
            "responses": {
            "200": { "$ref": "#/components/responses/responseMensagemAtendimento" },
            "404": { "$ref": "#/components/responses/naoEncontrado" },
            "500": { "$ref": "#/components/responses/indisponivel" }
            }
        }
        },
        "/fecharAtendimento": {
        "post": {
            "tags": ["Atendimento"],
            "summary": "Fecha um atendimento",
            "description": "Por meio de um indentificador de atendimento executa o prodecimento de fechamento e verificação de fechamento",
            "responses": {
            "200": { "$ref": "#/components/responses/responseFecharAtendimento" },
            "404": { "$ref": "#/components/responses/naoEncontrado" },
            "500": { "$ref": "#/components/responses/indisponivel" }
            }
        }
        }
    },
    
    "components": {
        
        // RESPOSTA
        "responses": {
        "responseTitularBoleto": {
            "description": "Detalhes do Titular do Boleto",
            "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/titularBoleto" } }
            }
        },
        "responseBoleto": {
            "description": "Detalhes dos Boletos",
            "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/boletos" } }
            }
        },
        "naoEncontrado": {
            "description": "Não foram encontrado os dados solicitados",
            "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/Erro404" } }
            }
        },
        "indisponivel": {
            "description": "Serviços está indisponivel",
            "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/Erro500" } }
            }
        },
        "responseProtocolo": {
            "description": "Dados Protocolo",
            "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/Protocolo" } }
            }
        },
        "responseAtendimento": {
            "description": "Dados Atendimento",
            "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/Atendimento" } }
            }
        },
        "responseMensagemAtendimento": {
            "description": "Dados da Mensagem adicionada no atendimento",
            "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/InsereMensagemAtendimento" } }
            }
        },
        "responseFecharAtendimento": {
            "description": "Dados da Mensagem adicionada no atendimento",
            "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/FecharAtendimento" } }
            }
        },
        "responseListaGuias": {
            "description": "Lista de guias",
            "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/listaGuias" } }
            }
        },
        "responseGuias": {
            "description": "Dados da guia",
            "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/guias" } }
            }
        }
        },

        // ESQUEMAS
        "schemas": {

            "titularBoleto": {
                "type": "object",
                "properties": {
                    "mensagem": {
                        "type": "string",
                        "description": "codigo de retorno para a requisicao para Huggy",
                        "example": "200"
                    },
                    "titular": {
                        "type": "object",
                        "description": "numero do titular, nome do titular, numero usuário, numero pessoa",
                        "example": {
                            "numerocontrato": 235,
                            "nome": "MARIA APARECIDA",
                            "numerousuario": 1000000,
                            "idpessoa": 10000
                        }
                    }
                }
            },

            "boletos": {
                "type": "object",
                "properties": {
                    "mensagem": { "type": "string", "example": "200" },
                    "boleto1": {
                        "type": "object",
                        "description": "dados do boleto",
                        "example": {
                            "NNUMEPAGA": 123456,
                            "DVENCPAGA": "20/03/2025",
                            "NVENCPAGA": 449.35,
                            "CINSTPAGA": null,
                            "CCOMPPAGA": "04/2025",
                            "LINHA_DIGITAVEL": "00000.00000 00000.000000 00000.000000 0 0000000000000",
                            "LOCAL_BOLETO": "https://apihuggy.unimedaraguaia.coop.br:8009/temp/NF000000B.pdf"
                        }
                    }
                }
            },

            "Protocolo": {
                "type": "object",
                "properties": {
                    "mensagem": { "type": "string", "example": "200" },
                    "protocolo": {
                        "type": "object",
                        "properties": {
                        "id": { "type": "number", "example": 10000 },
                        "numero": { "type": "number", "example": 300010000200003000 }
                        }
                    }
                }
            },

            "Atendimento": {
                "type": "object",
                "properties": {
                "mensagem": { "type": "string", "example": "200" },
                    "Atendimento": {
                        "type": "object",
                        "properties": {
                        "id": { "type": "number", "example": 50000 }
                        }
                    }
                }
            },

            "InsereMensagemAtendimento": {
                "type": "object",
                "properties": {
                "mensagem": { "type": "string", "example": "200" },
                    "info": {
                        "type": "string",
                        "example": "Mensagem adicionada ao atendimento 00000"
                    }
                }
            },

            "FecharAtendimento": {
                "type": "object",
                "properties": {
                "mensagem": { "type": "string", "example": "200" },
                    "info": {
                        "type": "string",
                        "example": "Atendimento Fechado 00000"
                    }
                }
            },

            "listaGuias": {
                "type": "object",
                "properties": {
                "mensagem": { "type": "string", "example": "200" },
                    "guia1": {
                        "type": "object",
                        "example": {
                        "idguia": 5692755,
                        "emissao": "09/04/2025",
                        "tipoguia": "AMBULATORIAL",
                        "status": "Liberada",
                            "numeros": {
                                "numero1":10000,
                                "numero2":20000,
                                "numero3":30000
                            }
                        }
                    }
                }
            },

            "guias": {
                "type": "object",
                "properties": {
                "mensagem": { "type": "string", "example": "200" },
                "guia": {
                    "type": "object",
                    "example": {
                    "ID_GUIA": 5692755,
                    "TIPO_GUIA": "AMBULATORIAL",
                    "NOME_PRESTADOR": "MEDBARRA SERVICOS HOSPITALARES LTDA",
                    "EMISSAO": "2025-04-10T01:14:24.000Z",
                    "VALIDADE": "2025-06-08T03:00:00.000Z",
                    "STATUS": "Liberada",
                    "PROCEDIMENTOS": {
                        "PROCEDIMENTO1": { "name": "CONSULTA CLÍNICA", "status": "Liberada" },
                        "PROCEDIMENTO2": { "name": "EXAME DE SANGUE", "status": "Liberado" }
                    }
                    }
                }
                }
            },

            "Erro404": {
                "type": "object",
                "properties": {
                "mensagem": { "type": "string", "example": 404 }
                }
            },

            "Erro500": {
                "type": "object",
                "properties": {
                "mensagem": { "type": "string", "example": 500 }
                }
            }
        }
  
        
    }     
        
}; 

module.exports = swaggerSpec;