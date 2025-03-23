# GreenList - Aplicativo de Lista de Compras

GreenList é uma aplicação web para gerenciamento de listas de compras, permitindo aos usuários criar, editar e compartilhar suas listas de compras com outras pessoas.

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

- **Frontend**: Desenvolvido com React e Vite
- **Backend**: API RESTful desenvolvida com Node.js, Express e MongoDB

## Pré-requisitos

- Node.js (v14 ou superior)
- MongoDB (local ou Atlas)
- Conta no SendGrid (para funcionalidade de recuperação de senha)

## Configuração

1. Clone o repositório

   ```
   git clone https://github.com/seu-usuario/greenlist.git
   cd greenlist
   ```

2. Instale as dependências

   ```
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. Configure as variáveis de ambiente

   - Crie um arquivo `.env` na pasta raiz do projeto baseado no arquivo `.env.example`
   - Crie um arquivo `.env` na pasta `server` baseado no arquivo `.env.example` da pasta server

4. Inicie o servidor de desenvolvimento
   ```
   npm run start
   ```

## Deploy

### Frontend (Vercel)

1. Faça login na Vercel e importe o projeto do GitHub
2. Configure as variáveis de ambiente necessárias
3. Deploy!

### Backend (Render ou similar)

1. Faça login no Render e crie um novo Web Service
2. Conecte ao repositório GitHub
3. Configure as variáveis de ambiente conforme o arquivo `.env.example`
4. Configure o comando de inicialização: `cd server && npm start`

## Segurança

- Nunca comite arquivos `.env` para o repositório
- Sempre use o `.gitignore` para excluir arquivos sensíveis
- Rotacione as chaves de API periodicamente

## Licença

MIT
