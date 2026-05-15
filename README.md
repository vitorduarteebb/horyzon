# Horyzonn OS

Sistema interno para operação da **Horyzonn**: leads, clientes, projetos, tarefas (kanban), QA, agenda, chat, metas, biblioteca e relatórios — com **MySQL + Prisma**, **NextAuth (Auth.js)** com e-mail/senha e **bcryptjs** (puro JS, compatível com alojamento Linux sem compilar nativos).

## Requisitos

- Node.js 20+
- MySQL 8+ (com base de dados criada, ex.: `horyzonn_os`)

## Setup

1. Copie o exemplo de variáveis e ajuste os valores:

```bash
cp .env.example .env
```

2. Instale dependências e gere o cliente Prisma:

```bash
npm install
npx prisma generate
```

3. Aplique as migrações ao banco (precisa de `DATABASE_URL` válida):

```bash
npx prisma migrate dev
```

Se preferir aplicar o SQL já gerado sem modo interativo:

```bash
npx prisma migrate deploy
```

4. Carregue dados iniciais (usuários e cenário demo utilizável):

```bash
npx prisma db seed
```

5. Suba o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) e faça login com um dos utilizadores do seed:

| Papel   | E-mail                      | Senha        |
|---------|-----------------------------|-------------|
| Admin   | admin@horyzonn.com.br       | admin123    |
| Gustavo | gustavo@horyzonn.com.br    | gustavo123  |
| Angel   | angel@horyzonn.com.br      | angel123    |
| Xavier  | xavier@horyzonn.com.br     | xavier123   |

**Importante:** troque `NEXTAUTH_SECRET` por um valor seguro em produção.

## Scripts úteis

- `npm run dev` — desenvolvimento  
- `npm run build` / `npm run start` — produção  
- `npm run db:studio` — Prisma Studio  

## Stack

Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui, lucide-react, Prisma 5, NextAuth v5 (beta), bcryptjs, Zod, React Hook Form, date-fns, Recharts, `@hello-pangea/dnd`.

## PWA

Há `manifest.json` em `public/` para facilitar instalação futura no dispositivo ou empacotamento como app.

## Problemas comuns

### Erro `No native build was found` com `bcrypt` em Linux/Node 22

O pacote **`bcrypt`** usa binários nativos; em alojamento partilhado o `npm install` pode não gerar o módulo certo para a plataforma. Este projeto usa **`bcryptjs`** (JavaScript puro), compatível com hashes `$2a$` / `$2b$` existentes na base.

### Erro Prisma «Authentication failed … credentials … are not valid» (Hostinger)

O Node está a ligar ao MySQL com **`DATABASE_URL`** errada para o servidor:

1. No **hPanel → Databases → MySQL**, abre o utilizador **`u494944867_vitorduarteebb`** (confirma o nome **exactamente** como lá aparece).
2. **Redefine a palavra-passe** desse utilizador e grava.
3. Monta outra vez o URL (sem espaços, sem aspas):

   `mysql://UTILIZADOR_EXACTO:SENHA_ENCODIDA@localhost:3306/NOME_DA_BASE`

   • Cada **`@`** dentro da senha deve ser **`%40`** (uma vez só — não codificar duas vezes).  
   • Outros caracteres especiais também podem precisar de encoding na URL.

4. Cola em **Environment variables → DATABASE_URL** na app Node e **guarda**.
5. **Reinicia / redeploy** da app.

Confirma também que o **nome da base** é **`u494944867_horyzonn`** como no painel. Abre **`/api/health`**: se devolver erro de autenticação, o problema é só esta URL até ficar igual ao utilizador MySQL real.

**Montagem automática da URL (sem `%40` manual):** nas env vars da app Node define `DATABASE_USE_COMPONENTS=true`, `DATABASE_USER`, `DATABASE_PASSWORD` (senha **exactamente** como no painel, pode ter `@`), `DATABASE_NAME`, `DATABASE_HOST` (ex.: `localhost`) e opcionalmente `DATABASE_PORT`. Remove ou esvazia `DATABASE_URL` para não misturar. Reinicia a app.

### Erro `Unknown authentication plugin 'sha256_password'`

O cliente Node usado pelo Prisma não suporta o plugin legado `sha256_password`. No MySQL 8, prefira **`caching_sha2_password`** (predefinição) ou **`mysql_native_password`** para o utilizador da aplicação:

```sql
ALTER USER 'usuario'@'localhost' IDENTIFIED WITH mysql_native_password BY 'sua_senha';
FLUSH PRIVILEGES;
```

Ou crie o utilizador já com `mysql_native_password`. Confirme também que o servidor aceita ligações TCP na porta da `DATABASE_URL`.

### `npm run build` sem base de dados

As rotas autenticadas estão em modo dinâmico (`force-dynamic`); o build **não** deve falhar só por o MySQL estar desligado. Para desenvolvimento normal, mantenha o MySQL a correr antes de `npm run dev`.
