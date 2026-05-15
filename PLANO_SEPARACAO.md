# Plano de Separação: Frontend & Backend 🚀

Este documento detalha a nova estrutura do projeto Ducklab, separando as responsabilidades de interface (Frontend) e lógica de dados (Backend).

## 📂 Nova Estrutura de Pastas

```text
Ducklab/
├── frontend/             # Aplicação Next.js (Interface)
│   ├── src/app           # Páginas e Server Components
│   ├── src/components    # UI Components
│   └── ...
├── backend/              # API e Banco de Dados (Node.js/Express)
│   ├── src/api           # Lógica das rotas (migrado de src/app/api)
│   ├── src/lib           # Prisma, Logger, Validação
│   ├── prisma/           # Schema e Migrations
│   └── ...
└── package.json          # Configuração do Monorepo (Workspaces)
```

## ✅ O que foi feito:

1.  **Criação dos Diretórios**: Separamos fisicamente o código em `frontend` e `backend`.
2.  **Configuração de Workspaces**: O projeto agora é um **Monorepo**. Você pode instalar dependências de ambos com um único `npm install` na raiz.
3.  **Migração do Backend**:
    *   Pasta `prisma/` movida para o backend.
    *   Scripts de infraestrutura e utilitários movidos para o backend.
    *   Rotas de API originais (`src/app/api`) movidas para `backend/src/api`.
4.  **Configuração do Frontend**: O Next.js foi mantido no `frontend/` focado apenas na UI.

## 🛠️ Próximos Passos (Manual):

### 1. Servidor Backend
Como as rotas originais usavam `NextResponse` do Next.js, elas precisam ser adaptadas para um servidor padrão (como Express) ou mantidas em um projeto Next.js separado. No momento, o backend possui a estrutura básica, mas as rotas dentro de `backend/src/api` ainda referenciam tipos do Next.js.

### 2. Conexão Frontend -> Backend
No frontend, as chamadas para `/api/...` agora devem apontar para a URL do seu novo servidor backend (ex: `http://localhost:3001/api/...`).

### 3. Autenticação
O `next-auth` está configurado no frontend. Para que o backend valide as sessões, será necessário compartilhar o segredo do JWT ou usar o `getToken` no backend.

---

> [!IMPORTANT]
> Para rodar o projeto agora:
> 1. `npm install` na raiz.
> 2. `npm run dev:frontend` para a interface.
> 3. `npm run dev:backend` para o servidor (após configurar o `server.ts`).
