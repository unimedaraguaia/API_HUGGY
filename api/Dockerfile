FROM node:latest

WORKDIR /api

COPY . . 

RUN rm -rf node_modules
RUN npm i  

# Instala dependências do sistema
RUN apt-get update && apt-get install -y wget unzip libaio1

# Copie o instantclient do seu projeto (coloque o .zip na pasta do projeto)
COPY instantclient-basic-linux.x64-21.20.0.0.0dbru.zip /tmp/

# Instalar o Oracle Instant Client (versão leve)
RUN unzip instantclient-basic-linux.x64-21.20.0.0.0dbru.zip -d /opt/oracle && \
    rm instantclient-basic-linux.x64-21.20.0.0.0dbru.zip && \
    echo /opt/oracle/instantclient_21_20 > /etc/ld.so.conf.d/oracle-instantclient.conf && \
    ldconfig

RUN mkdir -p /api/temp 

CMD ["node", "src/index.js"]

EXPOSE 3000