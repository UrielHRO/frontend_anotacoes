
# Frontend - Aplicação de Anotações

Este é o projeto frontend para a aplicação de Anotações. É uma aplicação web moderna construída com **React**, **TypeScript** e **Vite**, permitindo que os usuários se registrem, façam login e gerenciem suas anotações pessoais com um CRUD completo.

O grande diferencial deste frontend é sua **arquitetura flexível**: ele é capaz de se conectar e funcionar perfeitamente com dois backends diferentes (um em **PostgreSQL/Prisma** e outro em **MongoDB/Mongoose**) com base apenas nas variáveis de ambiente.

-----

## ✨ Funcionalidades Principais

  * **Autenticação de Usuário (JWT):** Sistema completo de Registro e Login.
  * **Gerenciamento de Anotações (CRUD):** Crie, Leia, Atualize e Delete suas anotações.
  * **Busca Dinâmica:** Filtre anotações por título em tempo real, com *debounce* para otimização de performance.
  * **Rotas Protegidas:** O dashboard e as anotações só são acessíveis para usuários autenticados.
  * **Notificações (Toasts):** Feedback visual para o usuário (ex: "Anotação criada com sucesso\!").
  * **Design Responsivo:** Layout de cartões que se adapta a diferentes tamanhos de tela.
  * **Conexão Dupla:** Capacidade de apontar para um backend **Postgres** ou **Mongo** via scripts.

## 🚀 Tecnologias Utilizadas

  * **Vite:** Build tool de frontend moderna e ultrarrápida.
  * **React 18:** Biblioteca principal para a construção da interface.
  * **TypeScript:** Para um código mais robusto e seguro.
  * **React Router (v6):** Para o gerenciamento de rotas.
  * **Axios:** Para fazer as requisições HTTP para a API.
  * **React Context API:** Para gerenciamento de estado global (autenticação).
  * **React Toastify:** Para exibir notificações (toasts).
  * **jwt-decode:** Para decodificar o token JWT e obter dados do usuário.
  * **ESLint / Prettier:** Para manter a qualidade e o padrão do código.

-----

## 🏁 Começando (Instalação e Uso Local)

Siga os passos abaixo para rodar o projeto localmente.

### 1\. Pré-requisitos

  * [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
  * [NPM](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)
  * Um dos [backends](https://www.google.com/search?q=link-para-o-repo-do-backend) rodando (seja o Mongo ou o Postgres).

### 2\. Instalação

Clone o repositório e instale as dependências:

```bash
# 1. Clone o repositório
git clone https://github.com/UrielHRO/frontend-anotacoes-ts.git

# 2. Entre na pasta do projeto
cd frontend-anotacoes-ts

# 3. Instale os pacotes
npm install
```

### 3\. Variáveis de Ambiente (Obrigatório)

Este projeto usa arquivos `.env` para saber para qual API apontar. Você **precisa** criar os arquivos de ambiente para que o Vite funcione.

É uma boa prática adicionar `.env.*` ao seu `.gitignore` para nunca enviar seus segredos para o Git.

Na raiz do projeto, crie **dois** arquivos:

**Arquivo 1: `.env.postgres`**

```env
# Configuração para apontar para o backend de PostgreSQL
VITE_API_URL=sua variavel de ambiente local para o backend
VITE_API_TYPE=postgres
```

*(Substitua a URL se necessário)*

**Arquivo 2: `.env.mongo`**

```env
# Configuração para apontar para o backend de MongoDB
VITE_API_URL=sua variavel de ambiente local para o backend
VITE_API_TYPE=mongo
```

*(Substitua a URL se necessário)*

### 4\. Rodando a Aplicação

Nós configuramos scripts no `package.json` para facilitar a troca de backends:

**Para rodar conectado ao backend de PostgreSQL:**

```bash
npm run dev:postgres
```

**Para rodar conectado ao backend de MongoDB:**

```bash
npm run dev:mongo
```

Após rodar um dos comandos, abra seu navegador em `http://localhost:5173`.

-----

## Scripts Disponíveis

  * `npm run dev:postgres`: Inicia o servidor de desenvolvimento apontando para o backend **Postgres**.
  * `npm run dev:mongo`: Inicia o servidor de desenvolvimento apontando para o backend **Mongo**.
  * `npm run build`: Gera os arquivos de produção otimizados na pasta `dist/`.
  * `npm run lint`: Executa o linter (ESLint) para encontrar problemas no código.
  * `npm run preview`: Inicia um servidor local para testar os arquivos de produção (após o `build`).

## 📁 Estrutura de Pastas

```
/src
├── /components       # Componentes reutilizáveis (ex: ProtectedRoute.tsx)
├── /context          # Contexto de autenticação (AuthContext.tsx)
├── /hooks            # Hooks customizados (useAuth.ts, useDebounce.ts)
├── /pages            # "Telas" da aplicação (Login.tsx, Register.tsx, Dashboard.tsx)
├── /services         # Configuração do Axios (api.ts)
├── /types            # Definições de tipos do TypeScript (index.ts)
├── App.tsx           # Roteador principal
├── main.tsx          # Ponto de entrada do React
└── index.css         # Estilos globais
```

## 🔗 Backend

Este projeto é **apenas o frontend** e não funcionará sem uma API. Os backends correspondentes estão em repositórios separados:

  * **Backend PostgreSQL:** `github.com/UrielHRO/backend-express-postgressql`
  * **Backend MongoDB:** `github.com/UrielHRO/backend-express-mongoDB`
