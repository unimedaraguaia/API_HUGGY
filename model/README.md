# Funções de Banco

## __conectarBanco__

---
### __Descrição__:
Essa é uma função assincrona que tenta fazer conexão com o banco de dados e retorna um conector em caso de sucesso ou um exceção em caso de falha.
### __Parâmetros__:
_usuario_: usuario para acesso ao banco de dados<br>
_senha_: senha de acesso ao banco de dados<br>
_endereco_: linha de conexão com banco no padrão: IP:porta/servico (0.0.0.0:000/service) <br>
_path_: Endereço de instace_client da<br>
---

__desconectarBanco__
### _Descrição_:
Essa é uma função assincron que tem como finalidade fazer a desconexão do banco de dados. Recebe com parâmetro um conector de banco de dados e tenta fechar a conexão retorna uma excessão para a chamadora em caso de erro.
___
__pegaNomeUsuario__
### _Descrição_:
Essa é uma função assincrona que consulta o nome de um beneficiário no banco de dados caso ele exista. Tem como parametro o cpf do beneficiário. Retorna um objeto JSON em caso de sucesso, uma excessão é lançada no caso de falha
```JSON
{
    "CNOMEUSUA":"nome",
}
```

__buscarTitularCarteira__
### _Descrição_:
Essa é uma função assincrona que consulta o titular de uma carteira cadastrada. Tem como parametro a caterinha do beneficiario. Retorna um JSON em caso de sucesso ou lança uma excessão em caso de falha.
```JSON
{
    "NNUMETITU":"0000",
    "CNOMEUSUA":"nome"
}
``` 

__buscaIdBoleto__
### _Descrição_:
Essa é uma função assincrona que consulta os boletos não pagos de um beneficiário. Tem como parametro o codigo do beneficiário titular do plano. Retorna um JSON em caso de sucesso ou lança uma excessão no caso de falha.
```JSON
{
    "NNUMERPAGA":"00000",
    "DVENCPAGA":"0000/00/00 : 00:00:00Z",
    "NVENCPAGA":"000.00"
}
```

__buscaIdBoleto2__
### _Descrição_:
Essa é uma função assincrona que consulta os boletos não pagos de um beneficiário, além disso adiciona as linha digitaveis para pagamento de cada boleto na resposta, além de formatar a data de vencimento para para p padrão pt-BR. Tem como parametro o codigo do beneficiário titular do plano. Retorna um JSON em caso de sucesso ou lança uma excessão no caso de falha.
```JSON
[
    {
        "NNUMERPAGA":"00000",
        "DVENCPAGA":"00/00/0000",
        "NVENCPAGA":"000.00",
        "LINHA_DIGITAVEL":"000 00000 0000 0000 000 000"
    }, 
    {
        "NNUMERPAGA":"00000",
        "DVENCPAGA":"00/00/0000",
        "NVENCPAGA":"000.00",
        "LINHA_DIGITAVEL":"000 00000 0000 0000 000 000"
    },
    .
    .
    .
]
```

__linhaPagamento__
### _Descrição_:
Essa é uma função assincrona que pega a linha de pagamento de uma boleto passado. Tem como parametro o identificador de um boleto, retorna um json contendo a linha digitavel ou lança um excessão em caso de erro.

```JSON
{
    "LINHA_DIGITAVEL1":"000 000 0000 000 000",
    "LINHA_DIGITAVEL2":"000 000 0000 000 000",
    "LINHA_DIGITAVEL3":"000 000 0000 000 000",
    .
    .
    .

}
```

__formataData__
### _Descrição_:
Essa função pega as data de vencimento dos boletos encontrado e passa para o formato de apresentação BR. Recebe como parametro os boletos encontrado na consulta com o banco de dados

__pegaIdBoleto__
_Descrição_
Essa função faz a extração do identificador do boleto colocando em um vetor. Recebe como parametro os boletos obtidos de um consulta. Retorna um vetor contendo todos os identificadores dos boletos.
```JSON
["0000", "0000", ...]
```


__adicionaLinhasDigitaveis__
_Descrição_
Essa função constroi um JSON novo adicionado a cada boleto sua linha digitavel de pagamentos.
```JSON
{
    "boleto1":{
        "NNUMERPAGA":"00000",
        "DVENCPAGA":"00/00/0000",
        "NVENCPAGA":"000.00",
        "LINHA_DIGITAVEL":"000 00000 0000 0000 000 000"
    }, 
    "boleto2":{
        "NNUMERPAGA":"00000",
        "DVENCPAGA":"00/00/0000",
        "NVENCPAGA":"000.00",
        "LINHA_DIGITAVEL":"000 00000 0000 0000 000 000"
    },
    .
    .
    .
}
```
