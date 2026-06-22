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

### 1.3 Configurar a Tela de Consentimento

1. **APIs e Serviços** → **Tela de consentimento OAuth**
2. Tipo de usuário: **Externo**
3. Nome do app: `Gmail Cleaner Buddy`, email de suporte: seu email
4. Em **Escopos**, adicione apenas:
   - `https://www.googleapis.com/auth/gmail.modify`
   (não é preciso `gmail.readonly` — o `gmail.modify` já inclui leitura)

### 1.4 Criar Credenciais OAuth 2.0

1. **APIs e Serviços** → **Credenciais**
2. **"+ Criar Credenciais"** → **ID do cliente OAuth**
3. Tipo de aplicação: **Aplicação da Web**, nome: `Gmail Cleaner Web`
4. **URIs de redirecionamento autorizados**, adicione exatamente:
   ```
   http://localhost:3000/auth/google/callback
   ```
5. Copie o **Client ID** e o **Client Secret**

### 1.5 ⚠️ Permitir que QUALQUER conta Gmail conecte

Por padrão, o app fica em **modo "Testing"** no Google Cloud e **somente os
"test users" cadastrados conseguem logar** — qualquer outra conta recebe
`Erro 403: access_denied` ("app não verificado"). Você tem duas opções:

**Opção A — Uso pessoal / poucas pessoas (recomendado para começar):**
1. **Tela de consentimento OAuth** → seção **Test users** → **+ Add users**
2. Adicione o Gmail de cada pessoa que vai usar (até 100 contas)
3. Essas contas já conseguem logar imediatamente; o Google mostra um aviso
   de "app não verificado" que pode ser ignorado clicando em
   **Avançado → Acessar Gmail Cleaner Buddy (não seguro)**

**Opção B — Público geral (produção):**
1. **Tela de consentimento OAuth** → **Publishing status** → **Publish app**
   (muda de "Testing" para "In production")
2. Como `gmail.modify` é um **escopo restrito**, para remover o aviso de
   "app não verificado" e liberar mais de 100 usuários o Google exige o
   processo de **verificação do app** (incluindo avaliação de segurança
   CASA, política de privacidade publicada e domínio próprio com HTTPS).
   Detalhes: https://support.google.com/cloud/answer/9110914

---

## 🔑 Passo 2: Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com seu Client ID/Secret e gere um segredo de sessão forte:

```bash
openssl rand -hex 32   # cole o resultado em SESSION_SECRET
```

> O servidor **não inicia** sem `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
> `GOOGLE_REDIRECT_URI` e um `SESSION_SECRET` com 32+ caracteres.

---

## ▶️ Passo 3: Instalar e executar

```bash
npm install
npm start        # ou npm run dev (hot reload)
```

Abra http://localhost:3000, clique em **Entrar com Google** — o seletor de
contas do Google abre, a pessoa escolhe qualquer conta Gmail (cadastrada como
test user, ou qualquer uma se o app estiver publicado), autoriza, e os Top 10
ofensores aparecem com o botão **Limpar** para mover os emails à lixeira.

---

## 🐛 Problemas comuns

| Erro | Causa | Solução |
|---|---|---|
| `Erro 403: access_denied` no login | Conta não é test user e o app está em "Testing" | Adicione a conta em Test users ou publique o app (Passo 1.5) |
| `redirect_uri_mismatch` | URI de callback diferente do cadastrado | Confira o URI exato no Google Cloud e no `.env` |
| Servidor não inicia | Variável de ambiente faltando | Veja a mensagem no terminal e complete o `.env` |
| `?error=invalid_state` após login | Cookie de sessão bloqueado/expirado durante o fluxo | Tente de novo; verifique se cookies estão habilitados |

---

## 🔐 Segurança

As práticas de segurança (OWASP Top 10, Twelve-Factor, OWASP SAMM) estão
documentadas em [SECURITY.md](SECURITY.md).## 🔧 Passo 1: Configurar Google Cloud Console

### 1.1 Criar Projeto

1. Acesse: https://console.cloud.google.com/
2. Clique em **"Criar Projeto"**
3. Nome: `Gmail Cleaner Buddy`
4. Clique em **"Criar"**

### 1.2 Ativar Gmail API

1. No menu lateral: **APIs e Serviços** → **Biblioteca**
2. Busque: `Gmail API`
3. Clique em **"Ativar"**

### 1.3 Configurar a Tela de Consentimento

1. **APIs e Serviços** → **Tela de consentimento OAuth**
2. Tipo de usuário: **Externo**
3. Nome do app: `Gmail Cleaner Buddy`, email de suporte: seu email
4. Em **Escopos**, adicione apenas:
   - `https://www.googleapis.com/auth/gmail.modify`
   (não é preciso `gmail.readonly` — o `gmail.modify` já inclui leitura)

### 1.4 Criar Credenciais OAuth 2.0

1. **APIs e Serviços** → **Credenciais**
2. **"+ Criar Credenciais"** → **ID do cliente OAuth**
3. Tipo de aplicação: **Aplicação da Web**, nome: `Gmail Cleaner Web`
4. **URIs de redirecionamento autorizados**, adicione exatamente:
   ```
   http://localhost:3000/auth/google/callback
   ```
5. Copie o **Client ID** e o **Client Secret**
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

### 1.3 Configurar a Tela de Consentimento

1. **APIs e Serviços** → **Tela de consentimento OAuth**
2. Tipo de usuário: **Externo**
3. Nome do app: `Gmail Cleaner Buddy`, email de suporte: seu email
4. Em **Escopos**, adicione apenas:
   - `https://www.googleapis.com/auth/gmail.modify`
   (não é preciso `gmail.readonly` — o `gmail.modify` já inclui leitura)

### 1.4 Criar Credenciais OAuth 2.0

1. **APIs e Serviços** → **Credenciais**
2. **"+ Criar Credenciais"** → **ID do cliente OAuth**
3. Tipo de aplicação: **Aplicação da Web**, nome: `Gmail Cleaner Web`
4. **URIs de redirecionamento autorizados**, adicione exatamente:
   ```
   http://localhost:3000/auth/google/callback
   ```
5. Copie o **Client ID** e o **Client Secret**

### 1.5 ⚠️ Permitir que QUALQUER conta Gmail conecte

Por padrão, o app fica em **modo "Testing"** no Google Cloud e **somente os
"test users" cadastrados conseguem logar** — qualquer outra conta recebe
`Erro 403: access_denied` ("app não verificado"). Você tem duas opções:

**Opção A — Uso pessoal / poucas pessoas (recomendado para começar):**
1. **Tela de consentimento OAuth** → seção **Test users** → **+ Add users**
2. Adicione o Gmail de cada pessoa que vai usar (até 100 contas)
3. Essas contas já conseguem logar imediatamente; o Google mostra um aviso
   de "app não verificado" que pode ser ignorado clicando em
   **Avançado → Acessar Gmail Cleaner Buddy (não seguro)**

**Opção B — Público geral (produção):**
1. **Tela de consentimento OAuth** → **Publishing status** → **Publish app**
   (muda de "Testing" para "In production")
2. Como `gmail.modify` é um **escopo restrito**, para remover o aviso de
   "app não verificado" e liberar mais de 100 usuários o Google exige o
   processo de **verificação do app** (incluindo avaliação de segurança
   CASA, política de privacidade publicada e domínio próprio com HTTPS).
   Detalhes: https://support.google.com/cloud/answer/9110914

---

## 🔑 Passo 2: Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com seu Client ID/Secret e gere um segredo de sessão forte:

```bash
openssl rand -hex 32   # cole o resultado em SESSION_SECRET
```

> O servidor **não inicia** sem `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
> `GOOGLE_REDIRECT_URI` e um `SESSION_SECRET` com 32+ caracteres.

---

## ▶️ Passo 3: Instalar e executar

```bash
npm install
npm start        # ou npm run dev (hot reload)
```

Abra http://localhost:3000, clique em **Entrar com Google** — o seletor de
contas do Google abre, a pessoa escolhe qualquer conta Gmail (cadastrada como
test user, ou qualquer uma se o app estiver publicado), autoriza, e os Top 10
ofensores aparecem com o botão **Limpar** para mover os emails à lixeira.

---

## 🐛 Problemas comuns

| Erro | Causa | Solução |
|---|---|---|
| `Erro 403: access_denied` no login | Conta não é test user e o app está em "Testing" | Adicione a conta em Test users ou publique o app (Passo 1.5) |
| `redirect_uri_mismatch` | URI de callback diferente do cadastrado | Confira o URI exato no Google Cloud e no `.env` |
| Servidor não inicia | Variável de ambiente faltando | Veja a mensagem no terminal e complete o `.env` |
| `?error=invalid_state` após login | Cookie de sessão bloqueado/expirado durante o fluxo | Tente de novo; verifique se cookies estão habilitados |

---

## 🔐 Segurança

As práticas de segurança (OWASP Top 10, Twelve-Factor, OWASP SAMM) estão
documentadas em [SECURITY.md](SECURITY.md).
### 1.5 ⚠️ Permitir que QUALQUER conta Gmail conecte

Por padrão, o app fica em **modo "Testing"** no Google Cloud e **somente os
"test users" cadastrados conseguem logar** — qualquer outra conta recebe
`Erro 403: access_denied` ("app não verificado"). Você tem duas opções:

**Opção A — Uso pessoal / poucas pessoas (recomendado para começar):**
1. **Tela de consentimento OAuth** → seção **Test users** → **+ Add users**
2. Adicione o Gmail de cada pessoa que vai usar (até 100 contas)
3. Essas contas já conseguem logar imediatamente; o Google mostra um aviso
   de "app não verificado" que pode ser ignorado clicando em
   **Avançado → Acessar Gmail Cleaner Buddy (não seguro)**

**Opção B — Público geral (produção):**
1. **Tela de consentimento OAuth** → **Publishing status** → **Publish app**
   (muda de "Testing" para "In production")
2. Como `gmail.modify` é um **escopo restrito**, para remover o aviso de
   "app não verificado" e liberar mais de 100 usuários o Google exige o
   processo de **verificação do app** (incluindo avaliação de segurança
   CASA, política de privacidade publicada e domínio próprio com HTTPS).
   Detalhes: https://support.google.com/cloud/answer/9110914

---

## 🔑 Passo 2: Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com seu Client ID/Secret e gere um segredo de sessão forte:

```bash
openssl rand -hex 32   # cole o resultado em SESSION_SECRET
```

> O servidor **não inicia** sem `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
> `GOOGLE_REDIRECT_URI` e um `SESSION_SECRET` com 32+ caracteres.

---

## ▶️ Passo 3: Instalar e executar

```bash
npm install
npm start        # ou npm run dev (hot reload)
```

Abra http://localhost:3000, clique em **Entrar com Google** — o seletor de
contas do Google abre, a pessoa escolhe qualquer conta Gmail (cadastrada como
test user, ou qualquer uma se o app estiver publicado), autoriza, e os Top 10
ofensores aparecem com o botão **Limpar** para mover os emails à lixeira.

---

## 🐛 Problemas comuns

| Erro | Causa | Solução |
|---|---|---|
| `Erro 403: access_denied` no login | Conta não é test user e o app está em "Testing" | Adicione a conta em Test users ou publique o app (Passo 1.5) |
| `redirect_uri_mismatch` | URI de callback diferente do cadastrado | Confira o URI exato no Google Cloud e no `.env` |
| Servidor não inicia | Variável de ambiente faltando | Veja a mensagem no terminal e complete o `.env` |
| `?error=invalid_state` após login | Cookie de sessão bloqueado/expirado durante o fluxo | Tente de novo; verifique se cookies estão habilitados |

---

## 🔐 Segurança

As práticas de segurança (OWASP Top 10, Twelve-Factor, OWASP SAMM) estão
documentadas em [SECURITY.md](SECURITY.md).