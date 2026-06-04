# 🚀 Gmail Cleaner Buddy — Configuração OAuth2

## 📋 Pré-requisitos

- Node.js 16+ instalado
- Conta Google (Gmail)
- Google Cloud Console configurado

---

## 🔧 Passo 1: Configurar Google Cloud Console

### 1.1 Criar Projeto

1. Acesse: https://console.cloud.google.com/
2. Clique em **"Criar Projeto"**
3. Nome: `Gmail Cleaner Buddy`
4. Clique em **"Criar"**

### 1.2 Ativar Gmail API

1. No menu lateral: **APIs e Serviços** → **Biblioteca**
2. Busque: `Gmail API`
3. Clique em **"Ativar"**

### 1.3 Criar Credenciais OAuth 2.0

1. **APIs e Serviços** → **Credenciais**
2. Clique em **"+ Criar Credenciais"** → **ID do cliente OAuth**
3. Configure a tela de consentimento:
   - Tipo: **Externo**
   - Nome do app: `Gmail Cleaner Buddy`
   - Email de suporte: seu email
   - Domínio autorizado: `localhost`
   - Escopos: adicione `gmail.readonly` e `gmail.modify`
4. Tipo de aplicação: **Aplicação da Web**
5. Nome: `Gmail Cleaner Web`
6. **URIs de redirecionamento autorizados**:
