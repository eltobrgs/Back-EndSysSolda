#!/bin/bash

# Instalar dependências
npm install

# Gerar o cliente do Prisma
npx prisma generate

# Aplicar as migrações do banco de dados
npx prisma migrate dev --name init

# Popular o banco de dados com os dados iniciais
npm run prisma:seed

# Iniciar o servidor em modo de desenvolvimento
npm run dev 