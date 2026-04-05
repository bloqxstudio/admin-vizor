# Admin Panel — POC

Painel admin para gerenciar projetos Astro via Supabase.

## Setup em 3 passos

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com os valores do seu projeto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dzuceyudiuaeaijnrnax.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

Onde achar:
- Supabase Dashboard → Settings → API → URL e anon key

### 3. Rodar

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## Criar usuário admin no Supabase

No Supabase Dashboard → Authentication → Users → Add user:
- Email: seu email
- Password: sua senha

Esse usuário vai logar no painel.

---

## O que a POC valida

- [ ] Login com Supabase Auth funciona
- [ ] Tabela `products` carrega corretamente
- [ ] Busca/filtro funciona
- [ ] Edição de produto salva no Supabase
- [ ] Dados editados aparecem no Supabase Studio

## Estrutura

```
src/
├── app/
│   ├── login/page.tsx              ← tela de login
│   ├── dashboard/
│   │   ├── page.tsx                ← seletor de projetos
│   │   └── vizor/products/page.tsx ← tabela de produtos
│   └── globals.css
├── components/
│   ├── Sidebar.tsx                 ← navegação + logout
│   └── ProductsTable.tsx           ← tabela + modal de edição
├── lib/supabase/
│   ├── client.ts                   ← cliente browser
│   └── server.ts                   ← cliente servidor
└── middleware.ts                   ← proteção de rotas
```
