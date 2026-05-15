# 🍔 M.E BURGER — SaaS Fullstack Delivery Ecosystem

[![Vercel Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js_14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma_7.5-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Neon](https://img.shields.io/badge/Neon_PostgreSQL-00E599?style=for-the-badge&logo=neon)](https://neon.tech/)

> **Arquitetura Sênior Multi-Tenant**: Um sistema de cardápio digital de alto desempenho integrado a um ecossistema administrativo blindado, focado em conversão e gestão em tempo real.

---

## 💎 Diferenciais Técnicos (Senior Engineering)

Este projeto não é apenas um "CRUD". Ele foi construído com padrões de engenharia de software de ponta:

*   **⚡ Edge Computing Middleware**: Segurança e controle de acesso (RBAC) processados na borda (Edge Runtime), garantindo latência zero e bloqueio de usuários revogados em tempo real sem sobrecarregar o banco de dados.
*   **🔌 Prisma Neon Adapter**: Utiliza `driverAdapters` para conexões via HTTP (WebSocket), otimizando o pool de conexões em ambientes Serverless e eliminando erros de exaustão de pool no Neon.
*   **🏗️ Singleton Database Pattern**: Implementação de singleton via `globalThis` para evitar múltiplas instâncias de conexão durante o Hot Reload em desenvolvimento e reuso eficiente de instâncias na Vercel.
*   **🤖 IA Background Removal**: Micro-serviço integrado via API para remoção de fundos de imagens de produtos, garantindo uma estética de catálogo profissional automática.
*   **📊 Real-time Demand Flow**: Dashboard com polling inteligente (SWR) e visualizações de dados com Recharts para monitoramento de faturamento e fluxo de pedidos ao vivo.

---

## 🔥 Funcionalidades de Elite

### 🚀 Storefront (Customer Experience)
- **Fluid UI/UX**: Animações suaves com Framer Motion e design focado em mobile-first.
- **Dynamic Pricing**: Suporte a preços promocionais, badges de desconto automáticos e variações por tamanho/sabor.
- **Smart Checkout**: Validação de cupons, cálculo de frete dinâmico e integração nativa com WhatsApp Business.

### 🔐 Admin Panel (Management Suite)
- **RBAC Security**: Diferenciação total entre `BOSS` (Proprietário) e `STAFF` (Operacional).
- **Financial Analytics**: Calendário de faturamento interativo para controle de ROI diário/mensal.
- **Audit Logs**: Sistema de rastreabilidade para todas as alterações críticas no sistema.
- **Media Center**: Galeria de imagens centralizada com compressão automática.

---

## 🛠️ Stack Tecnológica

| Tecnologia | Finalidade |
| :--- | :--- |
| **Next.js 14** | App Router, Server Actions e ISR |
| **Tailwind CSS** | Estilização utilitária de alta performance |
| **Framer Motion** | Micro-interações e transições fluidas |
| **Zustand** | Gerenciamento de estado global ultra-leve |
| **SWR** | Data fetching, cache e revalidação optimista |
| **PostgreSQL (Neon)** | Armazenamento relacional escalável e serverless |
| **NextAuth.js** | Autenticação robusta via Google OAuth |

---

## ⚙️ Guia de Instalação e Deploy

### 1. Clonagem e Dependências
```bash
git clone https://github.com/seu-usuario/m-e-burger.git
cd m-e-burger
npm install
```

### 2. Configuração das Variáveis de Ambiente
Crie um arquivo `.env` na raiz:

```env
# Database (Neon Connection String)
DATABASE_URL="postgres://user:password@host/db?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu_segredo_de_32_caracteres"

# Google OAuth
GOOGLE_CLIENT_ID="seu_id_no_google_cloud"
GOOGLE_CLIENT_SECRET="seu_secret_no_google_cloud"

# Segurança & IA
MIDDLEWARE_SECRET="segredo_interno_middleware"
ADMIN_EMAIL="seu-email@admin.com"
REMOVE_BG_API_KEY="sua_chave_remove_bg"
```

### 3. Preparação do Banco de Dados
```bash
npx prisma generate  # Gera o cliente tipado
npx prisma db push   # Sincroniza o schema sem migrações pesadas
npx prisma db seed   # Alimenta o sistema com dados iniciais
```

---

## 🚀 Deploy na Vercel

Este projeto está pronto para a Vercel. Lembre-se de adicionar todas as variáveis acima nas **Environment Variables** do dashboard e ativar a opção `framework preset: Next.js`.

**Nota de Engenheiro**: O projeto já possui as configurações necessárias no `next.config.mjs` para otimizar os Server Components e o binário do Prisma em ambiente Serverless.

---

## 📄 Licença

Projeto privado e proprietário — **M.E BURGER © 2026**.  
Desenvolvido com ❤️ por **[ciello dev](https://ciello-dev.vercel.app/)**