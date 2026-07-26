# 🚀 Gmail Cleaner Buddy — OAuth2 Configuration

Connect any Gmail account via OAuth2 (the same Google account picker that
appears when you open gmail.com), see the Top 10 senders taking up the most
space in your inbox, and move their emails to the trash.

## 📋 Prerequisites

Application in testing phase.

- Node.js 18+ installed
- Google account (Gmail)
- Google Cloud Console configured


## ▶️ Install and run

```bash
npm install # Install project dependencies
npm start # Start the application
# or: npm run dev (reloads on save)
```

Open http://localhost:3000, click Sign in with Google, authorize access, and the Top 10 senders will appear with the Clean button to move emails to the trash.

---

# 🚀 Gmail Cleaner Buddy — Configuração OAuth2

Conecte qualquer conta Gmail via OAuth2 (o mesmo seletor de contas do Google
que aparece ao abrir gmail.com), veja os Top 10 remetentes que mais ocupam
sua caixa e mova os emails deles para a lixeira.

## 📋 Pré-requisitos

Aplicação em fase de testes.

- Node.js 18+ instalado
- Conta do Google (Gmail)
- Google Cloud Console configurado

## ▶️ Instale e execute

```bash
npm install # Instala as dependências do projeto
npm start   # Inicia a aplicação
# ou: npm run dev (recarrega ao salvar)
```

Abra http://localhost:3000, clique em Iniciar sessão com o Google, autorize o acesso, e os 10 principais remetentes aparecerão com o botão Limpar para mover os emails para a lixeira.

---

# 🚀 Gmail Cleaner Buddy — Configuración OAuth2
## 📋 Requisitos previos

Aplicación en fase de pruebas.


- Node.js 18+ instalado
- Cuenta de Google (Gmail)
- Google Cloud Console configurado

## ▶️ Instalar y ejecutar

```bash
npm install # Instala las dependencias del proyecto
npm start   # Inicia la aplicación
# o: npm run dev (se recarga al guardar)
```

Abre http://localhost:3000, haz clic en Iniciar sesión con Google, autoriza el acceso, y los 10 principales remitentes aparecerán con el botón Limpiar para mover los correos electrónicos a la papelera.

---

# 🚀 Gmail Cleaner Buddy — Configuration OAuth2

## 📋 Prérequis

Application en phase de test.

- Node.js 18+ installé
- Compte Google (Gmail)
- Google Cloud Console configuré

## ▶️ Installer et exécuter

```bash
npm install # Installe les dépendances du projet
npm start # Démarre l'application
# ou : npm run dev (recharge lors de l'enregistrement)
```

Ouvrez http://localhost:3000, cliquez sur Se connecter avec Google, autorisez l’accès, et les 10 principaux expéditeurs apparaîtront avec le bouton Nettoyer pour déplacer les e-mails vers la corbeille.

---

# 🚀 Gmail Cleaner Buddy — Configurazione OAuth2

Collega qualsiasi account Gmail tramite OAuth2 (lo stesso selettore di account
Google che appare quando apri gmail.com), visualizza i Top 10 mittenti che
occupano più spazio nella tua casella e sposta le loro email nel cestino.

## 📋 Prerequisiti

Applicazione in fase di test.

- Node.js 18+ installato
- Account Google (Gmail)
- Google Cloud Console configurato

## ▶️ Installa ed esegui

```bash
npm install # Installa le dipendenze del progetto
npm start   # Avvia l'applicazione
# oppure: npm run dev (ricarica al salvataggio)
```

Apri http://localhost:3000, clicca su Accedi con Google, autorizza l'accesso, e i Top 10 mittenti appariranno con il pulsante Pulisci per spostare le email nel cestino.

---

# 🚀 Gmail Cleaner Buddy — Настройка OAuth2

Подключите любой аккаунт Gmail через OAuth2 (тот же выбор аккаунта Google,
который появляется при открытии gmail.com), посмотрите 10 главных
отправителей, занимающих больше всего места в вашем почтовом ящике, и
переместите их письма в корзину.

## 📋 Предварительные требования

Приложение находится в фазе тестирования.

- Установлен Node.js 18+
- Аккаунт Google (Gmail)
- Настроенная Google Cloud Console

## ▶️ Установка и запуск

```bash
npm install # Устанавливает зависимости проекта
npm start   # Запускает приложение
# или: npm run dev (перезагрузка при сохранении)
```

Откройте http://localhost:3000, нажмите «Войти через Google», предоставьте доступ, и появятся 10 главных отправителей с кнопкой «Очистить» для перемещения писем в корзину.

---

# 🚀 Gmail Cleaner Buddy — OAuth2 配置

通过 OAuth2 连接任意 Gmail 账号（与打开 gmail.com 时出现的 Google 账号选择器
相同），查看占用收件箱空间最多的前 10 名发件人，并将他们的邮件移至垃圾箱。

## 📋 前提条件

应用程序处于测试阶段。

- 已安装 Node.js 18+
- Google 账号（Gmail）
- 已配置 Google Cloud Console

## ▶️ 安装与运行

```bash
npm install # 安装项目依赖
npm start   # 启动应用程序
# 或：npm run dev（保存时自动重载）
```

打开 http://localhost:3000，点击"使用 Google 登录"，授权访问，前 10 名发件人将显示"清理"按钮，可将其邮件移至垃圾箱。

---

# ⚙️ Detailed setup guide (English)

## 🔧 Step 1: Configure the Google Cloud Console

### 1.1 Create the project

1. Go to https://console.cloud.google.com
2. Create a new project (e.g., `Gmail Cleaner Buddy`)

### 1.2 Enable the Gmail API

1. **APIs & Services** → **Library**
2. Search for **Gmail API** and click **Enable**

### 1.3 Configure the Consent Screen

1. **APIs & Services** → **OAuth consent screen**
2. User type: **External**
3. App name: `Gmail Cleaner Buddy`, support email: your email
4. Under **Scopes**, add only:
   - `https://www.googleapis.com/auth/gmail.modify`
   (no need for `gmail.readonly` — `gmail.modify` already includes reading)

### 1.4 Create OAuth 2.0 Credentials

1. **APIs & Services** → **Credentials**
2. **"+ Create Credentials"** → **OAuth client ID**
3. Application type: **Web application**, name: `Gmail Cleaner Web`
4. Under **Authorized redirect URIs**, add exactly:
   ```
   http://localhost:3000/auth/google/callback
   ```
5. Copy the **Client ID** and the **Client Secret**

### 1.5 ⚠️ Allow ANY Gmail account to connect

By default, the app stays in **"Testing" mode** in Google Cloud and **only the
registered "test users" can log in** — any other account receives
`Error 403: access_denied` ("app not verified"). You have two options:

**Option A — Personal use / few people (recommended to start):**
1. **OAuth consent screen** → **Test users** section → **+ Add users**
2. Add the Gmail of each person who will use it (up to 100 accounts)
3. Those accounts can log in immediately; Google shows an "app not verified"
   warning that can be bypassed by clicking
   **Advanced → Go to Gmail Cleaner Buddy (unsafe)**

**Option B — General public (production):**
1. **OAuth consent screen** → **Publishing status** → **Publish app**
   (changes from "Testing" to "In production")
2. Because `gmail.modify` is a **restricted scope**, to remove the
   "app not verified" warning and allow more than 100 users, Google requires
   the **app verification** process (including a CASA security assessment, a
   published privacy policy, and your own domain with HTTPS).
   Details: https://support.google.com/cloud/answer/9110914

---

## 🔑 Step 2: Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your Client ID/Secret and generate a strong session secret:

```bash
openssl rand -hex 32   # paste the result into SESSION_SECRET
```

> The server **will not start** without `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
> `GOOGLE_REDIRECT_URI`, and a `SESSION_SECRET` with 32+ characters.

---

## ▶️ Step 3: Install and run

```bash
npm install
npm start        # or npm run dev (hot reload)
```

Open http://localhost:3000, click **Sign in with Google** — the Google account
picker opens, the person chooses any Gmail account (registered as a test user,
or any account if the app is published), authorizes, and the Top 10 offenders
appear with the **Clean** button to move emails to the trash.

---

## 🐛 Common problems

| Error | Cause | Solution |
|---|---|---|
| `Error 403: access_denied` on login | Account is not a test user and the app is in "Testing" | Add the account under Test users or publish the app (Step 1.5) |
| `redirect_uri_mismatch` | Callback URI differs from the registered one | Check the exact URI in Google Cloud and in `.env` |
| Server won't start | Missing environment variable | See the message in the terminal and complete `.env` |
| `?error=invalid_state` after login | Session cookie blocked/expired during the flow | Try again; make sure cookies are enabled |

---

## 🔐 Security

The security practices (OWASP Top 10, Twelve-Factor, OWASP SAMM) are
documented in [SECURITY.md](SECURITY.md).

---

# ⚙️ Guia detalhado de configuração (Português)

## 🔧 Passo 1: Configurar o Google Cloud Console

### 1.1 Criar o projeto

1. Acesse https://console.cloud.google.com
2. Crie um novo projeto (ex.: `Gmail Cleaner Buddy`)

### 1.2 Ativar a Gmail API

1. **APIs e Serviços** → **Biblioteca**
2. Busque por **Gmail API** e clique em **Ativar**

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

---

# ⚙️ Guía detallada de configuración (Español)

## 🔧 Paso 1: Configurar la Google Cloud Console

### 1.1 Crear el proyecto

1. Ve a https://console.cloud.google.com
2. Crea un nuevo proyecto (ej.: `Gmail Cleaner Buddy`)

### 1.2 Activar la Gmail API

1. **APIs y Servicios** → **Biblioteca**
2. Busca **Gmail API** y haz clic en **Activar**

### 1.3 Configurar la Pantalla de Consentimiento

1. **APIs y Servicios** → **Pantalla de consentimiento de OAuth**
2. Tipo de usuario: **Externo**
3. Nombre de la app: `Gmail Cleaner Buddy`, correo de asistencia: tu correo
4. En **Ámbitos**, añade solo:
   - `https://www.googleapis.com/auth/gmail.modify`
   (no hace falta `gmail.readonly` — `gmail.modify` ya incluye la lectura)

### 1.4 Crear Credenciales OAuth 2.0

1. **APIs y Servicios** → **Credenciales**
2. **"+ Crear Credenciales"** → **ID de cliente de OAuth**
3. Tipo de aplicación: **Aplicación web**, nombre: `Gmail Cleaner Web`
4. En **URIs de redireccionamiento autorizados**, añade exactamente:
   ```
   http://localhost:3000/auth/google/callback
   ```
5. Copia el **Client ID** y el **Client Secret**

### 1.5 ⚠️ Permitir que CUALQUIER cuenta de Gmail se conecte

De forma predeterminada, la app permanece en **modo "Testing"** en Google Cloud
y **solo los "test users" registrados pueden iniciar sesión** — cualquier otra
cuenta recibe `Error 403: access_denied` ("app no verificada"). Tienes dos
opciones:

**Opción A — Uso personal / pocas personas (recomendado para empezar):**
1. **Pantalla de consentimiento de OAuth** → sección **Test users** → **+ Add users**
2. Añade el Gmail de cada persona que la vaya a usar (hasta 100 cuentas)
3. Esas cuentas ya pueden iniciar sesión de inmediato; Google muestra un aviso
   de "app no verificada" que se puede omitir haciendo clic en
   **Avanzado → Ir a Gmail Cleaner Buddy (no seguro)**

**Opción B — Público general (producción):**
1. **Pantalla de consentimiento de OAuth** → **Publishing status** → **Publish app**
   (cambia de "Testing" a "In production")
2. Como `gmail.modify` es un **ámbito restringido**, para eliminar el aviso de
   "app no verificada" y habilitar más de 100 usuarios, Google exige el
   proceso de **verificación de la app** (incluida una evaluación de seguridad
   CASA, una política de privacidad publicada y un dominio propio con HTTPS).
   Detalles: https://support.google.com/cloud/answer/9110914

---

## 🔑 Paso 2: Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el `.env` con tu Client ID/Secret y genera un secreto de sesión fuerte:

```bash
openssl rand -hex 32   # pega el resultado en SESSION_SECRET
```

> El servidor **no inicia** sin `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
> `GOOGLE_REDIRECT_URI` y un `SESSION_SECRET` con 32+ caracteres.

---

## ▶️ Paso 3: Instalar y ejecutar

```bash
npm install
npm start        # o npm run dev (hot reload)
```

Abre http://localhost:3000, haz clic en **Iniciar sesión con Google** — se abre
el selector de cuentas de Google, la persona elige cualquier cuenta de Gmail
(registrada como test user, o cualquiera si la app está publicada), autoriza, y
los 10 principales remitentes aparecen con el botón **Limpiar** para mover los
correos a la papelera.

---

## 🐛 Problemas comunes

| Error | Causa | Solución |
|---|---|---|
| `Error 403: access_denied` al iniciar sesión | La cuenta no es test user y la app está en "Testing" | Añade la cuenta en Test users o publica la app (Paso 1.5) |
| `redirect_uri_mismatch` | El URI de callback difiere del registrado | Verifica el URI exacto en Google Cloud y en `.env` |
| El servidor no inicia | Falta una variable de entorno | Mira el mensaje en la terminal y completa el `.env` |
| `?error=invalid_state` tras el login | Cookie de sesión bloqueada/caducada durante el flujo | Inténtalo de nuevo; verifica que las cookies estén habilitadas |

---

## 🔐 Seguridad

Las prácticas de seguridad (OWASP Top 10, Twelve-Factor, OWASP SAMM) están
documentadas en [SECURITY.md](SECURITY.md).

---

# ⚙️ Guide de configuration détaillé (Français)

## 🔧 Étape 1 : Configurer la Google Cloud Console

### 1.1 Créer le projet

1. Accédez à https://console.cloud.google.com
2. Créez un nouveau projet (ex. : `Gmail Cleaner Buddy`)

### 1.2 Activer l'API Gmail

1. **API et Services** → **Bibliothèque**
2. Recherchez **Gmail API** et cliquez sur **Activer**

### 1.3 Configurer l'écran de consentement

1. **API et Services** → **Écran de consentement OAuth**
2. Type d'utilisateur : **Externe**
3. Nom de l'app : `Gmail Cleaner Buddy`, e-mail d'assistance : votre e-mail
4. Dans **Champs d'application**, ajoutez uniquement :
   - `https://www.googleapis.com/auth/gmail.modify`
   (pas besoin de `gmail.readonly` — `gmail.modify` inclut déjà la lecture)

### 1.4 Créer des identifiants OAuth 2.0

1. **API et Services** → **Identifiants**
2. **"+ Créer des identifiants"** → **ID client OAuth**
3. Type d'application : **Application Web**, nom : `Gmail Cleaner Web`
4. Dans **URI de redirection autorisés**, ajoutez exactement :
   ```
   http://localhost:3000/auth/google/callback
   ```
5. Copiez le **Client ID** et le **Client Secret**

### 1.5 ⚠️ Autoriser N'IMPORTE QUEL compte Gmail à se connecter

Par défaut, l'app reste en **mode « Testing »** dans Google Cloud et **seuls les
« test users » enregistrés peuvent se connecter** — tout autre compte reçoit
`Erreur 403 : access_denied` (« app non vérifiée »). Vous avez deux options :

**Option A — Usage personnel / peu de personnes (recommandé pour commencer) :**
1. **Écran de consentement OAuth** → section **Test users** → **+ Add users**
2. Ajoutez le Gmail de chaque personne qui l'utilisera (jusqu'à 100 comptes)
3. Ces comptes peuvent se connecter immédiatement ; Google affiche un
   avertissement « app non vérifiée » que l'on peut ignorer en cliquant sur
   **Avancé → Accéder à Gmail Cleaner Buddy (non sécurisé)**

**Option B — Grand public (production) :**
1. **Écran de consentement OAuth** → **Publishing status** → **Publish app**
   (passe de « Testing » à « In production »)
2. Comme `gmail.modify` est un **champ d'application restreint**, pour supprimer
   l'avertissement « app non vérifiée » et autoriser plus de 100 utilisateurs,
   Google exige le processus de **vérification de l'app** (y compris une
   évaluation de sécurité CASA, une politique de confidentialité publiée et
   votre propre domaine en HTTPS).
   Détails : https://support.google.com/cloud/answer/9110914

---

## 🔑 Étape 2 : Configurer les variables d'environnement

```bash
cp .env.example .env
```

Modifiez le `.env` avec votre Client ID/Secret et générez un secret de session fort :

```bash
openssl rand -hex 32   # collez le résultat dans SESSION_SECRET
```

> Le serveur **ne démarre pas** sans `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
> `GOOGLE_REDIRECT_URI` et un `SESSION_SECRET` d'au moins 32 caractères.

---

## ▶️ Étape 3 : Installer et exécuter

```bash
npm install
npm start        # ou npm run dev (hot reload)
```

Ouvrez http://localhost:3000, cliquez sur **Se connecter avec Google** — le
sélecteur de comptes Google s'ouvre, la personne choisit n'importe quel compte
Gmail (enregistré comme test user, ou n'importe lequel si l'app est publiée),
autorise, et les 10 principaux expéditeurs apparaissent avec le bouton
**Nettoyer** pour déplacer les e-mails vers la corbeille.

---

## 🐛 Problèmes courants

| Erreur | Cause | Solution |
|---|---|---|
| `Erreur 403 : access_denied` à la connexion | Le compte n'est pas test user et l'app est en « Testing » | Ajoutez le compte dans Test users ou publiez l'app (Étape 1.5) |
| `redirect_uri_mismatch` | L'URI de callback diffère de celui enregistré | Vérifiez l'URI exact dans Google Cloud et dans `.env` |
| Le serveur ne démarre pas | Variable d'environnement manquante | Consultez le message dans le terminal et complétez le `.env` |
| `?error=invalid_state` après la connexion | Cookie de session bloqué/expiré pendant le flux | Réessayez ; vérifiez que les cookies sont activés |

---

## 🔐 Sécurité

Les pratiques de sécurité (OWASP Top 10, Twelve-Factor, OWASP SAMM) sont
documentées dans [SECURITY.md](SECURITY.md).

---

# ⚙️ Подробное руководство по настройке (Русский)

## 🔧 Шаг 1: Настройка Google Cloud Console

### 1.1 Создание проекта

1. Перейдите на https://console.cloud.google.com
2. Создайте новый проект (например, `Gmail Cleaner Buddy`)

### 1.2 Включение Gmail API

1. **API и сервисы** → **Библиотека**
2. Найдите **Gmail API** и нажмите **Включить**

### 1.3 Настройка экрана согласия

1. **API и сервисы** → **Экран согласия OAuth**
2. Тип пользователя: **Внешний**
3. Название приложения: `Gmail Cleaner Buddy`, эл. почта поддержки: ваша почта
4. В разделе **Области доступа** добавьте только:
   - `https://www.googleapis.com/auth/gmail.modify`
   (не нужен `gmail.readonly` — `gmail.modify` уже включает чтение)

### 1.4 Создание учётных данных OAuth 2.0

1. **API и сервисы** → **Учётные данные**
2. **«+ Создать учётные данные»** → **Идентификатор клиента OAuth**
3. Тип приложения: **Веб-приложение**, название: `Gmail Cleaner Web`
4. В **Разрешённые URI перенаправления** добавьте точно:
   ```
   http://localhost:3000/auth/google/callback
   ```
5. Скопируйте **Client ID** и **Client Secret**

### 1.5 ⚠️ Разрешить подключение ЛЮБОГО аккаунта Gmail

По умолчанию приложение остаётся в **режиме «Testing»** в Google Cloud, и
**входить могут только зарегистрированные «test users»** — любой другой аккаунт
получает `Ошибка 403: access_denied` («приложение не проверено»). У вас есть два
варианта:

**Вариант A — Личное использование / несколько человек (рекомендуется для старта):**
1. **Экран согласия OAuth** → раздел **Test users** → **+ Add users**
2. Добавьте Gmail каждого, кто будет пользоваться (до 100 аккаунтов)
3. Эти аккаунты смогут войти сразу; Google показывает предупреждение
   «приложение не проверено», которое можно обойти, нажав
   **Дополнительно → Перейти к Gmail Cleaner Buddy (небезопасно)**

**Вариант B — Широкая публика (продакшн):**
1. **Экран согласия OAuth** → **Publishing status** → **Publish app**
   (меняется с «Testing» на «In production»)
2. Так как `gmail.modify` является **ограниченной областью доступа**, чтобы
   убрать предупреждение «приложение не проверено» и разрешить более 100
   пользователей, Google требует процесс **верификации приложения** (включая
   оценку безопасности CASA, опубликованную политику конфиденциальности и
   собственный домен с HTTPS).
   Подробности: https://support.google.com/cloud/answer/9110914

---

## 🔑 Шаг 2: Настройка переменных окружения

```bash
cp .env.example .env
```

Отредактируйте `.env`, указав ваш Client ID/Secret, и сгенерируйте надёжный секрет сессии:

```bash
openssl rand -hex 32   # вставьте результат в SESSION_SECRET
```

> Сервер **не запустится** без `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
> `GOOGLE_REDIRECT_URI` и `SESSION_SECRET` длиной от 32 символов.

---

## ▶️ Шаг 3: Установка и запуск

```bash
npm install
npm start        # или npm run dev (горячая перезагрузка)
```

Откройте http://localhost:3000, нажмите **«Войти через Google»** — откроется
выбор аккаунтов Google, человек выбирает любой аккаунт Gmail (зарегистрированный
как test user или любой, если приложение опубликовано), предоставляет доступ, и
10 главных отправителей появляются с кнопкой **«Очистить»** для перемещения
писем в корзину.

---

## 🐛 Частые проблемы

| Ошибка | Причина | Решение |
|---|---|---|
| `Ошибка 403: access_denied` при входе | Аккаунт не является test user, а приложение в режиме «Testing» | Добавьте аккаунт в Test users или опубликуйте приложение (Шаг 1.5) |
| `redirect_uri_mismatch` | URI обратного вызова отличается от зарегистрированного | Проверьте точный URI в Google Cloud и в `.env` |
| Сервер не запускается | Отсутствует переменная окружения | Смотрите сообщение в терминале и заполните `.env` |
| `?error=invalid_state` после входа | Cookie сессии заблокирован/истёк во время потока | Попробуйте снова; убедитесь, что cookie включены |

---

## 🔐 Безопасность

Практики безопасности (OWASP Top 10, Twelve-Factor, OWASP SAMM)
задокументированы в [SECURITY.md](SECURITY.md).

---

# ⚙️ 详细配置指南（中文 / 普通话）

## 🔧 第 1 步：配置 Google Cloud Console

### 1.1 创建项目

1. 访问 https://console.cloud.google.com
2. 创建一个新项目（例如：`Gmail Cleaner Buddy`）

### 1.2 启用 Gmail API

1. **API 和服务** → **库**
2. 搜索 **Gmail API** 并点击 **启用**

### 1.3 配置同意屏幕

1. **API 和服务** → **OAuth 同意屏幕**
2. 用户类型：**外部**
3. 应用名称：`Gmail Cleaner Buddy`，支持邮箱：你的邮箱
4. 在 **范围** 中，仅添加：
   - `https://www.googleapis.com/auth/gmail.modify`
   （无需 `gmail.readonly` —— `gmail.modify` 已包含读取权限）

### 1.4 创建 OAuth 2.0 凭据

1. **API 和服务** → **凭据**
2. **"+ 创建凭据"** → **OAuth 客户端 ID**
3. 应用类型：**Web 应用**，名称：`Gmail Cleaner Web`
4. 在 **已获授权的重定向 URI** 中，准确添加：
   ```
   http://localhost:3000/auth/google/callback
   ```
5. 复制 **Client ID** 和 **Client Secret**

### 1.5 ⚠️ 允许任意 Gmail 账号连接

默认情况下，应用在 Google Cloud 中保持 **"Testing"（测试）模式**，**只有已注册
的 "test users"（测试用户）才能登录** —— 任何其他账号都会收到
`错误 403：access_denied`（"应用未验证"）。你有两个选择：

**选项 A —— 个人使用 / 少数人（建议起步时使用）：**
1. **OAuth 同意屏幕** → **Test users** 部分 → **+ Add users**
2. 添加每位使用者的 Gmail（最多 100 个账号）
3. 这些账号可立即登录；Google 会显示"应用未验证"警告，可通过点击
   **高级 → 前往 Gmail Cleaner Buddy（不安全）** 绕过

**选项 B —— 面向公众（生产环境）：**
1. **OAuth 同意屏幕** → **Publishing status** → **Publish app**
   （从 "Testing" 变为 "In production"）
2. 由于 `gmail.modify` 是 **受限范围**，要移除"应用未验证"警告并允许超过 100
   名用户，Google 要求进行 **应用验证** 流程（包括 CASA 安全评估、已发布的
   隐私政策以及带 HTTPS 的自有域名）。
   详情：https://support.google.com/cloud/answer/9110914

---

## 🔑 第 2 步：配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，填入你的 Client ID/Secret，并生成一个强会话密钥：

```bash
openssl rand -hex 32   # 将结果粘贴到 SESSION_SECRET
```

> 如果缺少 `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`、`GOOGLE_REDIRECT_URI`
> 以及一个 32 个以上字符的 `SESSION_SECRET`，服务器 **将无法启动**。

---

## ▶️ 第 3 步：安装与运行

```bash
npm install
npm start        # 或 npm run dev（热重载）
```

打开 http://localhost:3000，点击 **"使用 Google 登录"** —— Google 账号选择器
打开，用户选择任意 Gmail 账号（已注册为 test user，或在应用已发布时选择任意
账号），授权后，前 10 名占用空间最多的发件人会显示 **"清理"** 按钮，可将邮件
移至垃圾箱。

---

## 🐛 常见问题

| 错误 | 原因 | 解决方法 |
|---|---|---|
| 登录时出现 `错误 403：access_denied` | 账号不是 test user 且应用处于 "Testing" | 将账号添加到 Test users 或发布应用（第 1.5 步） |
| `redirect_uri_mismatch` | 回调 URI 与注册的不一致 | 核对 Google Cloud 和 `.env` 中的确切 URI |
| 服务器无法启动 | 缺少环境变量 | 查看终端中的消息并补全 `.env` |
| 登录后出现 `?error=invalid_state` | 流程中会话 Cookie 被阻止/过期 | 重试；确认已启用 Cookie |

---

## 🔐 安全

安全实践（OWASP Top 10、Twelve-Factor、OWASP SAMM）记录在
[SECURITY.md](SECURITY.md) 中。
