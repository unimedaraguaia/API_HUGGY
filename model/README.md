# __Funções de Banco__

## __conectarBanco__

### __Descrição__:

Essa é uma função assincrona que tenta fazer conexão com o banco de dados Oracle.

### __Parâmetros__:

De fato essa função não recebe parâmetros mas utiliza tags do arquivo .env que neste caso podemos considerar como parametros dados que a falta ou erro em algum deles pode compromenter o funcionamento <br>

_port_: Porta onde o serviço estará executando (exemplo: 3000, normalemente é um numero inteiro) <br>
_user_: Usuario para acesso ao banco de dados <br>
_pass_: Senha de acesso ao banco de dados<br>
_conect_: linha de conexão com banco no padrão: IP:porta/servico (0.0.0.0:000/service) <br>
_path oracle_: Endereço de instace_client da oracle (para o caso de acesso ao banco de produção)<br>

Exemplo do aquivo .env

```.env
PORT = 
USER = 
PASS =
CONNECT = 
PATH_ORACLE =
```
### __Retorno__

A função retorna um conector do banco de dados oracle, este pode ser utilizado por outras funções para fazer operações no banco de dados. Em caso de falha o função lançará uma exceção para a função chamadora.

---

## __desconectarBanco__
### __Descrição__:

Essa é uma função assincrona que tentar fecha a conexão com o banco de dados.<br>

### __Parâmetro__:

Essa função recebe como parâmetro um conector do banco de dados e tenta fechar o mesmo.

### __Retorno__:

Em caso de falha o função lançará uma exeção para  ser tratada na função chamadora. 

---

## __pegaNomeUsuario__

### __Descrição__:

Essa é uma função assincrona que consulta o nome de um beneficiário no banco de dados.

### __Parâmetros__:

Essa função recebe como parâmetros o CPF de um possível beneficiário cadastrado no banco de dados. Sendo este um número inteiro de 11 digitos sem traço ou pontos

```shell
12345678901
```
### __Retorno__:

A função retorno um JSON com o nome do usuário como no exemplo, em caso de falha lança uma excesão para a função chamadora. Em ambos os caso ela fecha a conexão com o banco de dados. 

```JSON
{
    "CNOMEUSUA":"nome",
}
```
---

## __buscarTitularCarteira__
### __Descrição__:
Essa é uma função assincrona que consulta se um beneficiário é titular de um plano, que esteja ativo cujo o plano nao seja empersarial ou MEI que esteja consfigurado para receber cobrança por boleto.

### __Parâmetros__:
Essa função recebe como parâmetro o código da carteira do beneficiário, cujo numero consiste em um inteiro de cujo consiste de 16 dígitos como segue no exemplo.

```shell
2350000000000000
```
### __Retorno__:
O retorno dessa função é um JSON contendo o código do status da solicitação e informações do titular sendo essas o número do titular juntamente com seu nome. Em caso de falha ele lança uma exceção para a função chamadora.

```JSON
{
    "NNUMETITU":"0000",
    "CNOMEUSUA":"nome beneficiario"
}
``` 
---

## __buscaIdBoleto2__
### __Descrição__:
Essa é uma função assincrona que consulta os boletos não pagos de um beneficiário de até dois meses atrás em diante excluindo boletos que esteja parcelados e exibindo apenas as parcelas. Além disso exibe com suas linha digitáveis para o caso de pagamento.

### __Parâmetro__:
Essa função recebe como parâmetro o número de um beneficiário titular sendo este do tipo interio que pode variar na quantidade de digitos.
```shell
00000
```

### __Retorno__:

Com retorno em caso de sucesso ele retorna um JSON contendo o número do boleto, a data de vencimento, se o boleto é uma parcela ou integral, no caso de parcela a qual competêcia ele pertênce (em forma de data) e por fim a linha digitavel para pagamento.

```JSON

{
    "NNUMEPAGA": 0000000,
    "DVENCPAGA": "00/00/0000",
    "NVENCPAGA": 0000.00,
    "CINSTPAGA": null,
    "CCOMPPAGA": "00/0000",
    "LINHA_DIGITAVEL": "00000.00000 00000.000000 00000.000000 0 00000000000000"
}

```
---
## __buscaIdBoleto__

 > Obs: função obsoleta.

### __Descrição__:
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
---

## __linhaPagamento__

### __Descrição__:
> Obs: função obsoleta

Essa é uma função assincrona que pega a linha de pagamento de um boleto.

### __Parâmetro__:
Essa função tem como parâmetro o numero do boleto do qual desejamos obter a linha digitavel. Normalmente é um inteiro com a quantidade de digitos variável.

```shell
0000
```
### __Retorno__:
Essa função retorna um JSON contendo a linha digitavel do boleto passado 
```JSON
{
    "LINHA_DIGITAVEL":"00000.00000 00000.000000 00000.000000 0 00000000000000",
}
```
---
## __formataData__
### __Descrição__:
Essa função pega as data de vencimento dos boletos encontrado e passa para o formato de apresentação brasileiro (dia/mes/ano) uma vez que o mesmo é de padrão americano (year-mouth-day: time hours:minutes:secunds:Z).

### __Parâmetros__:
Recebe como parametro a linha de consulta que tem todos os boletos, daí ela converte a data de cada um deles, colocando as em seus respectivos lugares.

### __Rertono__:
A função retona as linhas da consulta com todos os datas de vencimento dos boletos formatadas para o padrão brasileiro.

---

## __pegarIdBoleto__

### __Descrição__:
Essa função faz a extração do identificador dos boletos de uma consulta, colocando os indentificadores em um vetor. 

### __Parâmetros__:

Recebe como parametro linha da consulta contendo todos os boletos obtidos. 

### __Retorna__:
Retorna um vetor contendo todos os identificadores extraidos dos boletos.

```JSON
["0000", "0000", ...]
```
---

## __adicionaLinhasDigitaveis__
### __Descrição__:
Essa função constroi um JSON novo adicionado a cada boleto sua linha digitavel de pagamentos, juntamente com a indetificaçaõ do boleto (boleto1, boleto2, ...).

### __Parâmetros__:
Essa função recebe como parâmetro dois vetores, (boletos, linhas digitaveis) o vetor de boletos possui todos os boletos encontrados no banco e o vetor linhas digitaveis são as linhas de cada boleto encontrado.

### __Retorno__:
A função retorna o JSON com as informações dos boletos e suas respectivas linhas digitaveis.
```JSON
{
    "boleto1":{
        "NNUMEPAGA": 0000000,
        "DVENCPAGA": "00/00/0000",
        "NVENCPAGA": 0000.00,
        "CINSTPAGA": null,
        "CCOMPPAGA": "00/0000",
        "LINHA_DIGITAVEL": "00000.00000 00000.000000 00000.000000 0 00000000000000"
    }, 
    "boleto2":{
        "NNUMEPAGA": 0000000,
        "DVENCPAGA": "00/00/0000",
        "NVENCPAGA": 0000.00,
        "CINSTPAGA": null,
        "CCOMPPAGA": "00/0000",
        "LINHA_DIGITAVEL": "00000.00000 00000.000000 00000.000000 0 00000000000000"
    },
    .
    .
    .
}
```
---
## __removerParcelados__:

### __Descrição__: 
Essa função remove todos os boletos que estão parcelados da consulta obtida exibindo apenas as parcela em sí. Uma vez que os boletos integrais ficam com status de não pagos e são exibidos na consulta.

### __Parâmetros__:
Como parâmetro a função recebe um vetor contendo todos os boletos encotrados na pesquisa. 

### __Retorna__:
Ela retorna uma vetor contendo apenas os boletos integrais (não parcelado) as parcelas de boletos parcelados. 