## Análise de dados

Uma aplicação web fullstack que faz o cálculo de indicadores financeiros baseado-se em planilhas, e faz a demonstração desses dados utilizando gráficos.

A aplicação foi desenvolvida em ambiente docker. O desenvolvimento do backend foi feito seguindo uma prática de TDD com `Jest`.

Para a leitura das planilhas foi utilizado a biblioteca `Exceljs`.

## Setup

1. Instale as dependências
```
# na pasta raiz
$ npm run build:app

# ou

$ cd frontend
$ npm install
$ cd ..
$ cd backend
$ npm install
```

2. Inicie a aplicação - development
```
# na pasta frontend/
$ npm run dev

# na pasta backend/
$ npm run start:dev
```
## Docker for development

1. Crie as imagens
```
# imagem do client
$ cd frontend
$ docker build -t sa-client .

# imagem do server
$ cd backend
$ docker build -t sa-server .
```

2. Inicie a aplicação
```
# start application with docker engine
$ docker compose up -d

# stop application with docker engine
$ docker compose down

# start application with npm command
$ npm run docker:up

# stop application with npm command
$ npm run docker:down
```
## Testes 
*NOTE: apenas para o backend*

1. Testando rotas
```
$ npm run test:e2e
```