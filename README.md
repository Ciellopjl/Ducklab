<div align="center">
  <img src="https://raw.githubusercontent.com/Ducklab-Studio/Ducklab/main/public/duck.png" alt="Ducklab Studio Logo" width="120" />
  <h1>Ducklab Studio</h1>
  <p><strong>Transformamos ideias em impérios digitais</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  </p>
</div>

---

## 🚀 Sobre o Projeto

O **Ducklab Studio** é uma plataforma e portfólio de alta performance desenvolvida para uma agência de tecnologia de elite. Projetado com um design "dark mode premium", animações fluidas (Framer Motion) e uma arquitetura robusta Full-Stack.

### ✨ Funcionalidades Principais

- **Design Premium & Glassmorphism:** UI/UX de alto nível com tema dark e detalhes neon (`#00EB69`).
- **Painel Administrativo Seguro (`/hacker-duck`):** 
  - Autenticação JWT avançada, rate-limiting, proteção CSRF e ReCAPTCHA v3.
  - Gerenciamento de Projetos (C.R.U.D completo) com suporte a **Vídeos em Autoplay** e Imagens.
  - Gerenciamento de Membros da Equipe.
  - Galeria de Mídias integrada ao **Cloudinary**.
- **Assistente IA Integrada:** Chatbot inteligente movido pela API Groq (LLaMA 3) respondendo como um especialista da Ducklab.
- **Segurança de Nível Bancário:** Content Security Policy (CSP) dinâmico via Middleware, headers restritos (HSTS, X-Frame-Options) e sanitização de inputs.
- **Rastreamento de Pedidos:** Interface elegante para clientes consultarem o status de projetos via token.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** Next.js 15 (App Router), React 19, TailwindCSS, Framer Motion, Lucide Icons
- **Backend:** Next.js API Routes, Prisma ORM, Neon PostgreSQL
- **Integrações:** Cloudinary (Upload de Imagens e Vídeos), Groq API (Chatbot IA), Google ReCAPTCHA v3
- **Segurança:** Jose (JWT), Bcryptjs, Rate-Limiting customizado em Memória, Tokens CSRF dinâmicos

## ⚙️ Como Rodar Localmente

### 1. Pré-requisitos
- Node.js 18+
- PostgreSQL (ou Neon.tech)
- Conta no Cloudinary e Groq Cloud

### 2. Configurando o Ambiente
Clone o repositório e instale as dependências:
```bash
git clone https://github.com/Ducklab-Studio/Ducklab.git
cd Ducklab-main
npm install
```

Crie um arquivo `.env.local` na raiz e preencha com base no `.env.example`:
```env
DATABASE_URL="postgres://user:password@host/db"
NEXT_PUBLIC_ADMIN_PATH="/hacker-duck"
JWT_SECRET="seu-segredo-jwt-aqui"
CLOUDINARY_URL="cloudinary://apikey:apisecret@cloudname"
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="sua-chave-site"
RECAPTCHA_SECRET_KEY="sua-chave-secreta"
GROQ_API_KEY="sua-chave-groq"
```

### 3. Banco de Dados
Gere os artefatos do Prisma e rode as migrações:
```bash
npx prisma generate
npx prisma db push
```
Para criar o usuário administrador inicial, rode:
```bash
node seedAdmin.js
```

### 4. Iniciando o Servidor
```bash
npm run dev
```
O projeto estará rodando em `http://localhost:3000`. 
Acesse o painel em `http://localhost:3000/hacker-duck` (ou a rota definida em sua variável de ambiente).

## 🔒 Postura de Segurança

A Ducklab emprega as melhores práticas do OWASP:
- **Middleware Global:** Valida a origem da requisição, bloqueia acesso a rotas sensíveis sem `x-admin-verified`.
- **Proteção contra Força Bruta:** Implementação rigorosa de Rate Limiting (ex: max 5 tentativas de login por minuto).
- **Double Submit Cookie Pattern:** Toda rota mutável (POST/PUT/DELETE) é blindada com validação CSRF rigorosa.
- **Headers HSTS & Nonce CSP:** Impedem Cross-Site Scripting (XSS) injetando tags seguras dinamicamente a cada renderização.

---
<div align="center">
  <sub>Feito com 💚 pela Ducklab Studio. Inove. Escale. Domine.</sub>
</div>