# 🚀 Gmail Cleaner Buddy — Installation guide

This guide takes anyone from zero to the application running at
`http://localhost:3000`, without exposing any sensitive data.

> ⚠️ **Important:** this is a **server + browser** application. It only works
> when the Node server is running and you access it through the URL
> `http://localhost:3000`. **Opening `public/index.html` with a double click
> (`file://...`) will NOT work** — login and routes depend on the server.

---

## 📋 Prerequisites

- Node.js **18+** installed (`node --version`)
- A Google account (Gmail)
- Access to the [Google Cloud Console](https://console.cloud.google.com/)

---

## 🔧 Step 1 — Configure the Google Cloud Console

### 1.1 Create the project
1. Go to https://console.cloud.google.com/
2. **Create project** → name `Gmail Cleaner Buddy` → **Create**

### 1.2 Enable the Gmail API
1. **APIs & Services → Library**
2. Search for `Gmail API` → **Enable**

### 1.3 Configure the OAuth consent screen
1. **APIs & Services → OAuth consent screen**
2. User type: **External**
3. App name: `Gmail Cleaner Buddy`; support email: yours
4. Under **Scopes**, add **only**:
   `https://www.googleapis.com/auth/gmail.modify`
   (already includes reading — no need for `gmail.readonly`)

### 1.4 Create the OAuth 2.0 credentials
1. **APIs & Services → Credentials**
2. **+ Create credentials → OAuth client ID**
3. Type: **Web application**; name: `Gmail Cleaner Web`
4. Under **Authorized redirect URIs**, add **exactly**:
   ```
   http://localhost:3000/auth/google/callback
   ```
5. Copy the **Client ID** and the **Client Secret** (you'll use them in `.env`)

### 1.5 Allow your account to log in
By default the app stays in **"Testing"** mode, and only accounts registered as
*test users* can log in (the rest receive `403: access_denied`).

- **Personal use:** Consent screen → **Test users → + Add users** → add your
  Gmail (up to 100 accounts). Google shows an "app not verified" warning; click
  **Advanced → Go to (unsafe)** to proceed.
- **Production / general public:** publish the app. Because `gmail.modify` is a
  restricted scope, Google requires verification (CASA assessment, privacy
  policy, and a domain with HTTPS). Details:
  https://support.google.com/cloud/answer/9110914

---

## 🔑 Step 2 — Environment variables (without exposing secrets)

```bash
cp .env.example .env
```

Open `.env` and fill in `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and
`GOOGLE_REDIRECT_URI`. Then generate a strong session secret:

```bash
openssl rand -hex 32      # paste the result into SESSION_SECRET
```

> 🔐 The `.env` is in `.gitignore` and must **never** be versioned or shared.
> Only `.env.example` (with placeholders) goes to GitHub. If you suspect a
> leak, **revoke the credentials** in the Google Cloud Console and generate a
> new `SESSION_SECRET`.

The server **will not start** if any required variable is missing or if the
`SESSION_SECRET` has fewer than 32 characters — it warns you in the terminal.

---

## ▶️ Step 3 — Install and run

```bash
npm install
npm start        # or: npm run dev  (reloads on save)
```

Open **http://localhost:3000**, click **Sign in with Google**, authorize, and
the Top 10 senders appear with the **Clean** button to move emails to the
trash.

---

## 🐛 Common problems

| Error | Cause | Solution |
|---|---|---|
| Page `C:/...` or `ERR_FILE_NOT_FOUND` | You opened the HTML as a file (`file://`) | Run `npm start` and go to `http://localhost:3000` |
| Server won't start, complains about a variable | Missing value in `.env` | Complete the `.env` according to the terminal message |
| `403: access_denied` on login | Account is not a *test user* and the app is in "Testing" | Add the account under Test users (Step 1.5) |
| `redirect_uri_mismatch` | Callback URI differs from the registered one | The `GOOGLE_REDIRECT_URI` in `.env` must be identical to the one in Cloud Console |
| `?error=auth_state_mismatch` after login | Session cookie blocked/expired | Try again; make sure cookies are enabled |

---

## 🔐 Security

The practices adopted (OWASP Top 10, Twelve-Factor, OWASP SAMM) are documented
in [SECURITY.md](SECURITY.md). Run `npm run audit` on every dependency change.

---

# 🚀 Gmail Cleaner Buddy — Guia de instalação

Este guia leva qualquer pessoa do zero até a aplicação rodando em
`http://localhost:3000`, sem expor nenhum dado sensível.

> ⚠️ **Importante:** esta é uma aplicação **servidor + navegador**. Ela só
> funciona quando o servidor Node está rodando e você acessa pela URL
> `http://localhost:3000`. **Abrir o `public/index.html` com duplo clique
> (`file://...`) NÃO funciona** — o login e as rotas dependem do servidor.

---

## 📋 Pré-requisitos

- Node.js **18+** instalado (`node --version`)
- Uma conta Google (Gmail)
- Acesso ao [Google Cloud Console](https://console.cloud.google.com/)

---

## 🔧 Passo 1 — Configurar o Google Cloud Console

### 1.1 Criar o projeto
1. Acesse https://console.cloud.google.com/
2. **Criar projeto** → nome `Gmail Cleaner Buddy` → **Criar**

### 1.2 Ativar a Gmail API
1. **APIs e Serviços → Biblioteca**
2. Busque `Gmail API` → **Ativar**

### 1.3 Configurar a tela de consentimento OAuth
1. **APIs e Serviços → Tela de consentimento OAuth**
2. Tipo de usuário: **Externo**
3. Nome do app: `Gmail Cleaner Buddy`; e-mail de suporte: o seu
4. Em **Escopos**, adicione **apenas**:
   `https://www.googleapis.com/auth/gmail.modify`
   (já inclui leitura — não precisa de `gmail.readonly`)

### 1.4 Criar as credenciais OAuth 2.0
1. **APIs e Serviços → Credenciais**
2. **+ Criar credenciais → ID do cliente OAuth**
3. Tipo: **Aplicação da Web**; nome: `Gmail Cleaner Web`
4. Em **URIs de redirecionamento autorizados**, adicione **exatamente**:
   ```
   http://localhost:3000/auth/google/callback
   ```
5. Copie o **Client ID** e o **Client Secret** (você vai usá-los no `.env`)

### 1.5 Permitir que sua conta faça login
Por padrão o app fica em modo **"Testing"**, e só contas cadastradas como
*test users* conseguem logar (as demais recebem `403: access_denied`).

- **Uso pessoal:** Tela de consentimento → **Test users → + Add users** →
  adicione seu Gmail (até 100 contas). O Google mostra um aviso de "app não
  verificado"; clique em **Avançado → Acessar (não seguro)** para prosseguir.
- **Produção / público geral:** publique o app. Como `gmail.modify` é escopo
  restrito, o Google exige verificação (avaliação CASA, política de
  privacidade e domínio com HTTPS). Detalhes:
  https://support.google.com/cloud/answer/9110914

---

## 🔑 Passo 2 — Variáveis de ambiente (sem expor segredos)

```bash
cp .env.example .env
```

Abra o `.env` e preencha `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e
`GOOGLE_REDIRECT_URI`. Depois gere um segredo de sessão forte:

```bash
openssl rand -hex 32      # cole o resultado em SESSION_SECRET
```

> 🔐 O `.env` está no `.gitignore` e **nunca** deve ser versionado nem
> compartilhado. Só o `.env.example` (com placeholders) vai para o GitHub.
> Se suspeitar de vazamento, **revogue as credenciais** no Google Cloud
> Console e gere um novo `SESSION_SECRET`.

O servidor **não inicia** se faltar qualquer variável obrigatória ou se o
`SESSION_SECRET` tiver menos de 32 caracteres — ele avisa no terminal.

---

## ▶️ Passo 3 — Instalar e executar

```bash
npm install
npm start        # ou: npm run dev  (recarrega ao salvar)
```

Abra **http://localhost:3000**, clique em **Entrar com Google**, autorize, e
os Top 10 remetentes aparecem com o botão **Limpar** para mover emails à
lixeira.

---

## 🐛 Problemas comuns

| Erro | Causa | Solução |
|---|---|---|
| Página `C:/...` ou `ERR_FILE_NOT_FOUND` | Você abriu o HTML como arquivo (`file://`) | Rode `npm start` e acesse `http://localhost:3000` |
| Servidor não inicia, reclama de variável | Falta valor no `.env` | Complete o `.env` conforme a mensagem do terminal |
| `403: access_denied` no login | Conta não é *test user* e o app está em "Testing" | Adicione a conta em Test users (Passo 1.5) |
| `redirect_uri_mismatch` | URI de callback diferente do cadastrado | O `GOOGLE_REDIRECT_URI` do `.env` deve ser idêntico ao do Cloud Console |
| `?error=auth_state_mismatch` após login | Cookie de sessão bloqueado/expirado | Tente de novo; verifique se os cookies estão habilitados |

---

## 🔐 Segurança

As práticas adotadas (OWASP Top 10, Twelve-Factor, OWASP SAMM) estão
documentadas em [SECURITY.md](SECURITY.md). Rode `npm run audit` a cada
mudança de dependência.
