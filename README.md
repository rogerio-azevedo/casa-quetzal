# Casa Quetzal - Sistema de Controle de Veículos

Sistema completo de controle de entrada e saída de veículos com autenticação, gestão de usuários e auditoria.

## 🚀 Tecnologias

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Vercel Postgres** (Banco de dados)
- **JWT** (Autenticação)
- **bcryptjs** (Hash de senhas)

## 📋 Funcionalidades

### Para Vigias
- ✅ Autenticação segura com JWT (sessão de 30 dias)
- ✅ Registro de entrada e saída de veículos
- ✅ Interface mobile-friendly otimizada
- ✅ Modal de confirmação antes de registrar
- ✅ Lista de registros em tempo real
- ✅ Totalizadores (Total, Entradas, Saídas)
- ✅ Acesso via QR Code

### Para Administradores
- ✅ Dashboard administrativo completo
- ✅ Gestão de vigias (criar, editar, desativar)
- ✅ Gestão de registros (editar, deletar)
- ✅ Auditoria completa (quem registrou cada entrada/saída)
- ✅ Estatísticas em tempo real

## 🔐 Credenciais Padrão

**Admin:**
- Email: `casa@quetzal.com.br`
- Senha: `Quetzal25`

## 🏃 Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- pnpm (ou npm)
- Conta Vercel (para banco de dados)

### Setup

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
# Copie .env.example para .env.local e configure

# 3. Criar banco de dados Vercel Postgres
# - Acesse https://vercel.com/dashboard
# - Crie um projeto
# - Storage → Create Database → Postgres
# - Copie as variáveis de ambiente para .env.local

# 4. Executar seed do banco (criar tabelas e admin)
pnpm db:seed

# 5. Executar em desenvolvimento
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📦 Deploy na Vercel

### Passo a Passo Completo

#### 1. Preparar Repositório
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <seu-repositorio>
git push -u origin main
```

#### 2. Criar Projeto na Vercel
1. Acesse https://vercel.com/dashboard
2. Clique em **"New Project"**
3. Importe seu repositório do GitHub/GitLab
4. Configure:
   - **Framework Preset**: Next.js (detectado automaticamente)
   - **Root Directory**: `./`
   - **Build Command**: `next build` (padrão)

#### 3. Criar Banco de Dados Postgres
1. No dashboard do projeto na Vercel
2. Vá em **Storage** → **Create Database**
3. Selecione **Postgres**
4. Escolha a região mais próxima
5. Clique em **Create**

#### 4. Conectar Banco ao Projeto
1. Após criar o banco, vá em **Connect**
2. Selecione seu projeto
3. As variáveis de ambiente serão adicionadas automaticamente

#### 5. Adicionar JWT_SECRET
1. No projeto, vá em **Settings** → **Environment Variables**
2. Adicione:
   - **Key**: `JWT_SECRET`
   - **Value**: Use um valor seguro (ex: resultado de `openssl rand -base64 32`)
   - **Environments**: Production, Preview, Development

#### 6. Executar Seed do Banco
```bash
# Localmente, com as variáveis de produção
# Ou via terminal da Vercel
vercel env pull
pnpm db:seed
```

Ou crie um endpoint temporário `/api/setup` para executar o seed:
```typescript
// app/api/setup/route.ts
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export async function GET() {
  // Execute o conteúdo do scripts/seed-admin.ts aqui
  // Depois delete esta rota!
}
```

#### 7. Deploy Final
```bash
git push
# Ou no dashboard da Vercel: Deployments → Redeploy
```

#### 8. Gerar QR Code
1. Copie a URL do seu projeto (ex: `https://casa-quetzal.vercel.app/login`)
2. Gere o QR Code:
   - Online: https://www.qr-code-generator.com/
   - Via CLI: `npx qrcode https://casa-quetzal.vercel.app/login -o qrcode.png`
3. Imprima ou compartilhe o QR Code

## 📁 Estrutura do Projeto

```
app/
├── api/                    # API Routes
│   ├── auth/              # Autenticação
│   │   ├── login/
│   │   ├── logout/
│   │   └── me/
│   ├── users/             # CRUD de usuários
│   │   └── [id]/
│   └── records/           # CRUD de registros
│       └── [id]/
├── admin/                 # Dashboard admin
│   └── page.tsx
├── login/                 # Página de login
│   └── page.tsx
├── components/            # Componentes React
│   ├── admin/
│   │   ├── UserManagement.tsx
│   │   └── RecordManagement.tsx
│   ├── VehicleForm.tsx
│   ├── ConfirmModal.tsx
│   ├── VehicleList.tsx
│   └── StatsSummary.tsx
├── hooks/                 # React Hooks
│   └── useAuth.ts
├── lib/                   # Utilitários
│   ├── auth.ts           # Funções de autenticação
│   └── db.ts             # Tipos do banco
├── types/                 # Definições TypeScript
│   ├── vehicle.ts
│   └── user.ts
├── page.tsx              # Página principal (vigia)
└── layout.tsx            # Layout global
middleware.ts             # Middleware de autenticação
scripts/
└── seed-admin.ts         # Script de inicialização
```

## 🔒 Segurança

- ✅ Senhas com hash bcrypt (10 rounds)
- ✅ JWT em cookie httpOnly (não acessível via JavaScript)
- ✅ Middleware protege todas as rotas
- ✅ Validação de permissões em todas as APIs
- ✅ Tokens expiram em 30 dias
- ✅ Soft delete de usuários (desativação)
- ✅ Auditoria completa de ações

## 📊 Banco de Dados

### Tabelas

**users**
- id, email, password_hash, nome, role, ativo, created_at

**vehicle_records**
- id, placa, condutor, tipo, timestamp, user_id, user_name, created_at

### Índices
- Otimizados para queries frequentes
- Ordenação por timestamp
- Busca por placa e usuário

## 🐛 Troubleshooting

### Erro: "Cannot find module @vercel/postgres"
```bash
pnpm install
```

### Erro: "JWT_SECRET not defined"
Configure a variável `JWT_SECRET` no `.env.local` ou nas variáveis de ambiente da Vercel

### Erro ao fazer login
Verifique se o seed do banco foi executado corretamente

### QR Code não funciona
Certifique-se de que aponta para `/login`, não para a raiz

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação do Next.js e Vercel:
- https://nextjs.org/docs
- https://vercel.com/docs

## 📄 Licença

Uso interno - Casa Quetzal
