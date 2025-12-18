# Guia de Deploy - Casa Quetzal

## ✅ Checklist Pré-Deploy

- [ ] Código comitado e em repositório Git (GitHub/GitLab)
- [ ] Dependências instaladas e testadas
- [ ] Arquivo `.env.example` atualizado
- [ ] Build local funcionando (`pnpm build`)

## 🚀 Deploy na Vercel - Passo a Passo Detalhado

### 1. Criar Conta e Projeto na Vercel

1. Acesse https://vercel.com e faça login (ou crie conta)
2. Clique em **"Add New..."** → **"Project"**
3. Conecte sua conta GitHub/GitLab se ainda não conectou
4. Selecione o repositório `casa-quetzal`
5. Configure o projeto:
   - **Project Name**: casa-quetzal (ou nome desejado)
   - **Framework Preset**: Next.js ✅ (detectado automaticamente)
   - **Root Directory**: `./`
   - **Build Command**: (deixe padrão)
   - **Output Directory**: (deixe padrão)
6. **NÃO** clique em Deploy ainda!

### 2. Criar Banco de Dados Vercel Postgres

1. Na página do projeto, vá em **Storage** (menu lateral)
2. Clique em **"Create Database"**
3. Selecione **"Postgres"**
4. Configure:
   - **Database Name**: casa-quetzal-db (ou nome desejado)
   - **Region**: Escolha a região mais próxima (ex: Washington, D.C., USA para Brasil)
5. Clique em **"Create"**
6. Aguarde a criação (1-2 minutos)

### 3. Conectar Banco ao Projeto

1. Após criar o banco, você verá a tela de detalhes
2. Clique em **"Connect"** (canto superior direito)
3. Selecione o projeto **casa-quetzal**
4. Clique em **"Connect to Project"**
5. ✅ As seguintes variáveis serão adicionadas automaticamente:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

### 4. Adicionar JWT_SECRET

1. No projeto, vá em **Settings** → **Environment Variables**
2. Clique em **"Add New"**
3. Configure:
   - **Key**: `JWT_SECRET`
   - **Value**: Gere uma chave segura:
     ```bash
     # No terminal local (macOS/Linux)
     openssl rand -base64 32
     
     # Ou use qualquer string aleatória longa e segura
     # Exemplo: "2k9Ls8dF3nM5pQ7wX1vB6yC4eR0tY8uI"
     ```
   - **Environments**: Marque **Production**, **Preview** e **Development**
4. Clique em **"Save"**

### 5. Fazer Deploy Inicial

1. Volte para **Deployments**
2. Clique em **"Redeploy"** (se já tiver deploy) ou faça push no Git
3. Aguarde o build e deploy (2-3 minutos)
4. ✅ Quando aparecer "Ready", clique em **"Visit"**

### 6. Inicializar Banco de Dados (Seed)

Agora você precisa criar as tabelas e o usuário admin.

#### Opção A: Via Terminal Local (Recomendado)

```bash
# 1. Baixar variáveis de ambiente da Vercel
npx vercel env pull .env.local

# 2. Executar seed
pnpm db:seed

# Você verá:
# ✅ Tabelas criadas com sucesso!
# ✅ Usuário admin criado/atualizado:
#    Email: casa@quetzal.com.br
#    Senha: Quetzal25
```

#### Opção B: Via Endpoint Temporário

1. Crie o arquivo `app/api/setup/route.ts`:

```typescript
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Criar tabela users
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        nome VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'vigia')),
        ativo BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Criar tabela vehicle_records
    await sql`
      CREATE TABLE IF NOT EXISTS vehicle_records (
        id SERIAL PRIMARY KEY,
        placa VARCHAR(20) NOT NULL,
        condutor VARCHAR(255),
        tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
        timestamp TIMESTAMP NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id),
        user_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Criar índices
    await sql`CREATE INDEX IF NOT EXISTS idx_vehicle_records_timestamp ON vehicle_records(timestamp DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_vehicle_records_user_id ON vehicle_records(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_vehicle_records_placa ON vehicle_records(placa)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;

    // Criar admin
    const passwordHash = await bcrypt.hash('Quetzal25', 10);
    await sql`
      INSERT INTO users (email, password_hash, nome, role, ativo)
      VALUES (
        'casa@quetzal.com.br',
        ${passwordHash},
        'Administrador',
        'admin',
        TRUE
      )
      ON CONFLICT (email) DO UPDATE SET password_hash = ${passwordHash}
    `;

    return Response.json({ 
      success: true, 
      message: 'Banco inicializado com sucesso!' 
    });
  } catch (error: any) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
```

2. Faça commit e push:
```bash
git add .
git commit -m "Add setup endpoint"
git push
```

3. Aguarde o deploy
4. Acesse `https://seu-projeto.vercel.app/api/setup`
5. Você verá: `{"success":true,"message":"Banco inicializado com sucesso!"}`
6. **IMPORTANTE**: Delete o arquivo `app/api/setup/route.ts`, commit e push novamente

### 7. Testar o Sistema

1. Acesse sua URL: `https://seu-projeto.vercel.app`
2. Você será redirecionado para `/login`
3. Faça login com:
   - Email: `casa@quetzal.com.br`
   - Senha: `Quetzal25`
4. ✅ Se aparecer o painel admin, está funcionando!

### 8. Gerar QR Code

```bash
# Opção 1: Via CLI
npx qrcode https://seu-projeto.vercel.app/login -o qrcode.png

# Opção 2: Online
# Acesse https://www.qr-code-generator.com/
# Cole: https://seu-projeto.vercel.app/login
# Baixe em alta resolução
```

### 9. Testar Fluxo Completo

1. **Como Admin:**
   - Crie um vigia de teste em "Gestão de Vigias"
   - Crie um registro em "Gestão de Registros"
   - Edite e delete um registro
   
2. **Como Vigia:**
   - Faça logout
   - Escaneie o QR Code (ou acesse /login)
   - Faça login com o vigia criado
   - Registre uma entrada de veículo
   - Verifique que aparece na lista

## 🔧 Configurações Adicionais

### Domínio Customizado (Opcional)

1. Em **Settings** → **Domains**
2. Clique em **"Add"**
3. Digite seu domínio (ex: `casa-quetzal.com.br`)
4. Configure DNS conforme instruções
5. Aguarde propagação (pode levar até 48h)

### Variáveis de Ambiente por Ambiente

Você pode ter valores diferentes para cada ambiente:
- **Production**: Variáveis de produção
- **Preview**: Para branches de PR
- **Development**: Para desenvolvimento local

## 📊 Monitoramento

### Analytics
- **Settings** → **Analytics** → Habilite para ver:
  - Número de acessos
  - Performance
  - Erros

### Logs
- **Deployments** → Selecione um deploy → **View Function Logs**
- Veja logs de API routes e erros

## 🔄 Atualizações Futuras

Quando fizer mudanças no código:

```bash
git add .
git commit -m "Descrição da mudança"
git push
```

A Vercel fará deploy automático! ✅

## ⚠️ Problemas Comuns

### Deploy falha com erro de build
- Verifique os logs do deploy
- Certifique-se de que `pnpm build` funciona localmente
- Verifique se todas as dependências estão no `package.json`

### Erro ao conectar com banco
- Verifique se as variáveis `POSTGRES_*` estão configuradas
- Confirme que o banco está na mesma região do projeto

### Erro de autenticação
- Verifique se `JWT_SECRET` está configurado
- Confirme que o seed foi executado

### QR Code não funciona
- Certifique-se de que aponta para `/login`
- Verifique se a URL está correta

## 📞 Suporte

- **Documentação Vercel**: https://vercel.com/docs
- **Documentação Next.js**: https://nextjs.org/docs
- **Dashboard Vercel**: https://vercel.com/dashboard

## ✅ Checklist Pós-Deploy

- [ ] Login admin funciona
- [ ] Criar vigia funciona
- [ ] Login vigia funciona
- [ ] Registrar entrada/saída funciona
- [ ] Admin pode editar/deletar registros
- [ ] QR Code gerado e testado
- [ ] Domínio customizado configurado (se aplicável)
- [ ] Analytics habilitado
- [ ] Backup das credenciais salvo em local seguro

