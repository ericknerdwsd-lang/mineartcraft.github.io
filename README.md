# Catálogo de Produtos Mineartcraft 🧶

Bem-vindo ao repositório do **Catálogo de Produtos Mineartcraft**. Este é um projeto de vitrine virtual moderna criada usando React e Next.js, contando com um painel administrativo completo para gestão de imagens e produtos, desenvolvido focando em navegação rápida e SEO.

## 🚀 Tecnologias Integradas
- **Framework Frontend**: [Next.js](https://nextjs.org/) (App Router, Server Components)
- **Estilização**: CSS Modules puro + Variáveis CSS e Google Fonts (Cormorant & Inter)
- **Banco de Dados**: PostgreSQL servido pela Vercel Postgres e manipulado via **Prisma ORM**
- **Autenticação Administrativa**: `next-auth` (Credentials Provider via JWT)
- **Storage de Imagens**: `@vercel/blob` (Hospedagem nativa de fotos rápidas sem infraestrutura pesada)

## 📂 Estrutura de Pastas e Rotas Principais
A aplicação adota as convenções do "App Router" do Next.js padrão dentro da pasta `/src`. 

- `src/app/`
  - `page.tsx`: A vitrine global. Trata leitura do banco, queries de busca e filtro de categorias através de "Search Parameters" diretamente no lado do servidor.
  - `layout.tsx`: Estrutura do documento HTML e tags Meta base do site.
  - `/api/`: Controladores backend organizados em pastas para:
    - `/auth`: Handles de permissões.
    - `/carousel`: CRUD das 4 imagens destaque no topo do projeto.
    - `/products`: CRUD total dos itens (preço, fotos array, id e categoria).
    - `/upload`: Endpoint voltado para injetar buffers na cloud Vercel Blob e retornar as URLs definitivas.
  - `/gestor/`: Todas as páginas fechadas. Rotas filhas como `/novo` e `/editar` dependem de estar em sessão no sistema.

- `src/components/`: Pedaços isolados de interface que compõem o painel e a Home (HeroCarousel, ProductGrid, ProductModal, ProductCard). Protegem a tela garantindo que hooks e comportamentos "Client Side" não poluam o HTML do Server.
- `src/lib/`: Instâncias reutilizáveis externas, contendo essencialmente o aquecedor cacheado do `prisma`.

## ⚙️ Instalação e Execução (Para Desenvolvedores)

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure o Arquivo `.env` na raiz do projeto:**
   É altamente necessário ter variáveis setadas para rodar localmente com sucesso:
   ```env
   # BANCO DE DADOS
   POSTGRES_URL="..."
   POSTGRES_PRISMA_URL="..."
   POSTGRES_URL_NON_POOLING="..."
   
   # STORAGE DE IMAGENS 
   BLOB_READ_WRITE_TOKEN="..."
   
   # CONTATO E SEGURANÇA
   WHATSAPP_NUMBER="55DDDXXXXXXXXX"
   NEXTAUTH_SECRET="uma-string-complexa-e-aleatoria"
   NEXTAUTH_URL="http://localhost:3000" # Mudar na Vercel para dominio.com
   
   # USUÁRIO DO PAINEL ADMIN
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="sua_senha_segura"
   ```

3. **Sincronize o Banco de Dados (Prisma)**
   Sempre que baixar novas atualizações, ou em primeiro deploy:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Inicie o Ambiente de Desenvolvimento**
   ```bash
   npm run dev
   ```
   Acesse a visualização em http://localhost:3000

## 📝 Como usar o Gestor 
**Painel**: Acesse o site em `/gestor/login` e coloque o Login e Senha ditados no `.env`.
Neste painel administrativo é possível:
1. Cadastrar novos produtos, enviando até 4 fotos por produto, preços e determinando se ele é um *Amigurumi, Roupa, Bolsa ou Acessório*.
2. Apagar produtos, ou editar seus dados.
3. Personalizar o layout de introdução do site subindo fotos únicas que se movem sozinhas na página principal na opção **Imagens do Destaque (Carrossel)** (máximo de 4 imagens).

---
*Este documento reflete a arquitetura atualizada contendo otimizações de componentização, correções de tipo em TypeScript e modularização de estilos.*
