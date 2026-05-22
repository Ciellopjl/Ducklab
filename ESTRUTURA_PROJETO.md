# Estrutura do Projeto 📂

Organizei as pastas para facilitar o entendimento de onde fica cada parte do seu sistema. Abaixo está o "mapa" da hamburgueria:

---

## 🏛️ Divisão de Responsabilidades

### 🖥️ Frontend (O que o usuário vê)
Localizado principalmente em `src/app` e `src/components`:

- **`src/app/(rest)`**: Contém as páginas visíveis para os clientes (Home, Cardápio, Checkout).
- **`src/app/admin`**: Contém todas as páginas do Painel Administrativo (Dashboard, Pedidos, Produtos, etc).
- **`src/components`**: Peças reutilizáveis da interface (Botões, Cards, Sidebar, Header).
- **`public`**: Arquivos de imagem, logos e ícones estáticos.

### ⚙️ Backend (A lógica por trás)
O "cérebro" do sistema que conversa com o banco de dados:

- **`src/app/api`**: Aqui ficam as **Rotas de API**. Toda vez que o site precisa salvar um pedido ou deletar um produto, ele chama uma dessas rotas.
- **`prisma/schema.prisma`**: A estrutura oficial do seu Banco de Dados.
- **`src/lib`**: Configurações centrais, como a conexão com o banco (`prisma.ts`) e o sistema de login (`auth.ts`).
- **`src/store`**: Gerenciamento de estado (Carrinho e AdminStore), que guarda o que o usuário está fazendo na sessão atual.

---

## 🛠️ Organização de Infraestrutura
- **`infra/debug`**: Movi para cá os scripts de teste e arquivos de log que estavam bagunçando a raiz do projeto. Você não precisa mexer aqui no dia a dia.
- **Configurações**: Arquivos na raiz como `tailwind.config.js` e `next.config.mjs` são as engrenagens que fazem o sistema compilar corretamente.

---

> [!TIP]
> **Onde eu mexo?**
> - Se quiser mudar o texto de uma página: `src/app`
> - Se quiser mudar como um botão aparece: `src/components`
> - Se quiser mudar como o pedido é salvo: `src/app/api/pedidos`
