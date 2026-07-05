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
