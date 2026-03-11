# SafeTrack — Sistema Industrial de Segurança

Plataforma web para gestão de equipes, DDS (Diálogo Diário de Segurança), diário de bordo e controle de conformidade operacional.

## Stack

- **Frontend:** Vue 3 + Vite + Pinia + Vue Router
- **Estilo:** TailwindCSS + Font Awesome
- **Backend:** Supabase (Auth + PostgreSQL + RLS)
- **Extras:** ApexCharts, SweetAlert2, html2pdf.js

## Funcionalidades

- 🔐 Autenticação com login simplificado e troca de senha no primeiro acesso
- 👥 Gestão de usuários com geração automática de login
- 📋 Diário de Bordo com controle de presença e avaliação individual
- 📊 Relatório de apontamentos com exportação CSV
- 🔧 Ações corretivas para Não Conformidades
- 📈 Dashboard de tendências operacionais
- 🔔 Notificações automáticas de alertas
- 🔍 Busca global com atalho Ctrl+K
- 👤 Perfil individual do funcionário
- 📜 Log de auditoria de ações do sistema
- 🛡️ Controle de acesso granular por módulo

## Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/safetrack.git
cd safetrack

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase

# Rode em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Configuração do Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o arquivo `supabase_migrations.sql` no SQL Editor
3. Desative **Confirm email** em Authentication → Settings
4. Adicione a URL do seu deploy em Authentication → URL Configuration

## Deploy (Netlify)

| Campo | Valor |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |

Adicione as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em **Site Settings → Environment Variables**.

## Licença

Projeto privado. Todos os direitos reservados.
