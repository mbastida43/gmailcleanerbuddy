# Security Policy and Model — Gmail Cleaner Buddy

This document describes the application's security practices, following
**OWASP Top 10 (2021)**, **OWASP SAMM**, and the **Twelve-Factor App**
methodology.

## Reporting vulnerabilities

Found a vulnerability? Open a private issue (security advisory) in the
repository. Do not disclose publicly before a fix is available.

---

## Mitigations by category — OWASP Top 10 (2021)

### A01 — Broken Access Control
- **Per-request OAuth2 client**: the OAuth2 client is never shared globally.
  Previously, a single global client received `setCredentials()` from any
  session, which allowed concurrent requests from one user to use another
  user's tokens. Now each authenticated request creates its own client from
  its own session's tokens (`createOAuthClient`).
- **Least privilege**: only the `gmail.modify` scope is requested (it already
  includes reading; the redundant `gmail.readonly` scope was removed).
- All `/api/*` routes require an authenticated session (`requireAuth`).

### A02 — Cryptographic Failures
- `SESSION_SECRET` is mandatory, with a minimum of 32 characters; the
  application **does not start** with a missing or weak secret (no hardcoded
  fallback).
- Session cookies: `httpOnly`, `secure` (in production), `sameSite=lax`.
- OAuth `state` comparison with `crypto.timingSafeEqual` (resistant to timing
  attacks).
- HSTS enabled via Helmet in production.

### A03 — Injection
- The `sender` parameter of `/api/clean` is validated against a strict email
  address pattern (no spaces, quotes, parentheses, or wildcards) before being
  interpolated into the Gmail search query, and the search uses a quoted value
  (`from:"..."`). This prevents injection of Gmail search operators that could
  delete arbitrary emails.
- **XSS**: all content derived from emails (the `From` header, controllable by
  an external attacker) is rendered via `textContent`/`createElement`, never
  via `innerHTML` or inline handlers. The old `onclick="cleanSender('${...}')"`
  was vulnerable to stored XSS via single quotes in the `From` header.
- Restrictive Content-Security-Policy (no external scripts, `object-src 'none'`,
  `frame-ancestors 'none'`).

### A04 — Insecure Design
- **Rate limiting**: 100 req/15min on `/api/*` and 10 req/15min on `/auth/*`
  (mitigates brute force and abuse of the Gmail API quota).
- JSON body size limit (10 KB).
- Limited pagination on analysis (max 50 pages) to avoid resource exhaustion.

### A05 — Security Misconfiguration
- **Helmet**: CSP, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, removal of the `X-Powered-By` header, HSTS.
- Generic error messages to the client; details (`error.message`, stack
  traces) stay only in the server logs.
- `trust proxy` configured only in production, so `secure` cookies work behind
  a load balancer.
- Custom session cookie name (`gcb.sid`), without revealing the framework.

### A06 — Vulnerable and Outdated Components
- `googleapis` updated (fixes advisory GHSA-w5hq-g745-h8pq in the transitive
  `uuid`); `npm audit` with no known vulnerabilities.
- `npm run audit` script added; run it regularly and in CI.
- `engines.node >= 18` declared.

### A07 — Identification and Authentication Failures
- **OAuth `state` anti-CSRF** (RFC 6749 §10.12): a random 32-byte value
  generated per request, stored in the session and validated on the callback.
  Without it, an attacker could forge the callback and log the victim into the
  attacker's account (login CSRF).
- **Session regeneration after login** (prevents session fixation).
- `saveUninitialized: false` — no session cookie is issued before login.
- **Complete logout**: revokes the token at Google (`revokeToken`), destroys
  the session, and clears the cookie.
- `/auth/status` no longer exposes internal details (`hasTokens`).

### A08 — Software and Data Integrity Failures
- No third-party scripts on the front end (only Google Fonts via CSS,
  restricted by the CSP).
- Dependencies pinned via `package-lock.json` (Twelve-Factor: II.
  Dependencies).

### A09 — Security Logging and Monitoring Failures
- Logs written to stdout/stderr (Twelve-Factor: XI. Logs) for collection by
  the runtime environment.
- Errors logged with context on the server, without leaking to the client.
- Tokens and secrets are **never** logged.

### A10 — Server-Side Request Forgery (SSRF)
- The server only makes outbound calls to the Gmail API (`googleapis.com`),
  with fixed URLs from the official SDK; no URL is built from user input.

### CSRF
- The `csurf` package was **removed** (archived/deprecated by its
  maintainers). Protection is now the global `verifySameOrigin` middleware:
  every state-changing method (POST/PUT/PATCH/DELETE) requires an
  `Origin`/`Referer` header belonging to the host itself, combined with
  `sameSite=lax` on the cookies.

---

## Twelve-Factor App

| Factor | Implementation |
|---|---|
| I. Codebase | Single git repository |
| II. Dependencies | Declared in `package.json` + `package-lock.json` |
| III. Config | 100% via environment variables; `.env.example` versioned, `.env` in `.gitignore`; fails fast if mandatory config is missing |
| VII. Port binding | Port via `PORT` |
| IX. Disposability | Graceful shutdown on `SIGTERM`/`SIGINT` |
| X. Dev/prod parity | Same code; differences controlled only by `NODE_ENV` |
| XI. Logs | Event stream to stdout/stderr, no log files |

---

## OWASP SAMM — practices adopted

- **Governance / Policy & Compliance**: this document defines the security
  policy and the reporting process.
- **Design / Threat Assessment**: main threats mapped — OAuth token theft,
  login CSRF, XSS via email headers, injection in the Gmail search, quota
  abuse.
- **Design / Security Requirements**: requirements verified at startup
  (mandatory and strong secrets).
- **Implementation / Secure Build**: CI on GitHub Actions
  (`.github/workflows/security.yml`) runs typecheck + `npm audit` (SCA) on
  every push/PR to `main`; dependencies locked by lockfile.
- **Verification / Security Testing**: review `npm audit` on every dependency
  change; manually test auth flows (invalid state, expired session, malformed
  sender).
- **Operations / Environment Management**: secrets only in the environment;
  rotate `SESSION_SECRET` and the OAuth credentials in case of a suspected
  leak (revoke in the Google Cloud Console).

---

## Hardening of 2026-07-05 (SaaS playbook)

- **`Cache-Control: no-store`** on all `/api/*` and `/auth/*` responses —
  sensitive data (profile, counts, auth redirects) is not cached in the
  browser or by proxies.
- **Rate limit on `/auth/status`** — it was the only dynamic route without a
  limiter.
- **Body-parser errors mapped to 4xx** — invalid JSON responds 400 and a
  payload over 10kb responds 413, instead of falling into the 500 handler and
  polluting the log with a client error.
- **Security CI** — `security.yml` workflow with typecheck and
  `npm audit --omit=dev` on every push/PR.

---

## Known limitations / next steps

1. **In-memory session storage**: `express-session` uses MemoryStore by
   default, which is not recommended for production (leaks memory and does not
   scale horizontally — Twelve-Factor: VI. Processes). For production,
   configure an external store (e.g., `connect-redis`).
2. **CSP with `'unsafe-inline'` for styles**: the CSS is inline in the HTML.
   Migrating to an external file would allow removing this exception.
3. **Refresh token in the session**: tokens live only in the session (expire
   in 24h). If the application evolves toward persistence, encrypt the tokens
   at rest.

---

## Findings from the code review of 2026-06-10 — ALL FIXED

Findings confirmed by the high-effort review and the fixes applied:

1. ✅ **`cleanAll()` swallowed failures silently** — now uses `apiFetch`
   (handles 401), counts successes/failures per sender, and the toast reports
   the real result (`⚠️ X moved; Y failed` when there are failures).
2. ✅ **`isAuthError()` did not recognize all forms of revoked token** — now
   covers `error.status`, `error.response.status`, numeric `error.code`, the
   OAuth code in `error.response.data.error`, and Google's "expired or revoked"
   message.
3. ✅ **Quota errors swallowed in analysis** — auth errors within the batch now
   propagate to the 401; the rest are counted in `failedMessages`, returned in
   the response, and displayed by the front end ("Partial analysis").
4. ✅ **Non-email senders broke the Clean button** — the analysis now
   normalizes (trim/lowercase) and aggregates only senders that pass the same
   validation as `/api/clean`; rows impossible to clean do not appear.
5. ✅ **Misleading statistics / wasted calls** — pagination stops when reaching
   the analysis limit (1000); `totalMessages` now matches the set actually
   analyzed and the response includes `analyzedMessages`/`failedMessages`.
6. ✅ **Per-route Origin opt-in** — `verifySameOrigin` became global middleware
   for all unsafe methods (POST/PUT/PATCH/DELETE); future mutating routes are
   protected automatically.
7. ✅ **Outdated playbooks at the root** — `index2.html` renamed to
   `index.html.old` and `INTRUÇÕES.md` received a prominent historical-document
   warning ("do not use this code").

### State of the npm modules (`node_modules` folder)

- `npm audit`: **0 known vulnerabilities** (after upgrading `googleapis`
  128→173, which fixed the GHSA-w5hq-g745-h8pq advisory of the transitive
  `uuid`).
- `node_modules/` was **removed from versioning** (it was committed on `main`):
  dependencies are reproducibly installable via `npm ci` + `package-lock.json`.
  Never recommit the folder.
- Run `npm run audit` in CI and on every dependency change.

---

# Política e Modelo de Segurança — Gmail Cleaner Buddy

Este documento descreve as práticas de segurança da aplicação, seguindo
**OWASP Top 10 (2021)**, **OWASP SAMM** e a metodologia **Twelve-Factor App**.

## Reporte de vulnerabilidades

Encontrou uma vulnerabilidade? Abra uma issue privada (security advisory) no
repositório. Não divulgue publicamente antes da correção.

---

## Mitigações por categoria — OWASP Top 10 (2021)

### A01 — Broken Access Control
- **Cliente OAuth2 por requisição**: o cliente OAuth2 nunca é compartilhado
  globalmente. Antes, um único cliente global recebia `setCredentials()` de
  qualquer sessão, o que permitia que requisições concorrentes de um usuário
  usassem os tokens de outro. Agora cada requisição autenticada cria seu
  próprio cliente a partir dos tokens da própria sessão (`createOAuthClient`).
- **Menor privilégio**: somente o escopo `gmail.modify` é solicitado
  (já inclui leitura; o escopo `gmail.readonly` redundante foi removido).
- Todas as rotas `/api/*` exigem sessão autenticada (`requireAuth`).

### A02 — Cryptographic Failures
- `SESSION_SECRET` é obrigatório, com mínimo de 32 caracteres; a aplicação
  **não inicia** com segredo ausente ou fraco (sem fallback hardcoded).
- Cookies de sessão: `httpOnly`, `secure` (em produção), `sameSite=lax`.
- Comparação do `state` OAuth com `crypto.timingSafeEqual` (resistente a
  timing attacks).
- HSTS habilitado via Helmet em produção.

### A03 — Injection
- O parâmetro `sender` de `/api/clean` é validado contra um padrão estrito de
  endereço de email (sem espaços, aspas, parênteses ou curingas) antes de ser
  interpolado na query de busca do Gmail, e a busca usa valor entre aspas
  (`from:"..."`). Isso impede a injeção de operadores de busca do Gmail que
  poderiam apagar emails arbitrários.
- **XSS**: todo conteúdo derivado de emails (cabeçalho `From`, controlável por
  atacante externo) é renderizado via `textContent`/`createElement`, nunca por
  `innerHTML` ou handlers inline. O antigo `onclick="cleanSender('${...}')"`
  era vulnerável a XSS armazenado via aspas simples no cabeçalho `From`.
- Content-Security-Policy restritiva (sem scripts externos, `object-src 'none'`,
  `frame-ancestors 'none'`).

### A04 — Insecure Design
- **Rate limiting**: 100 req/15min em `/api/*` e 10 req/15min em `/auth/*`
  (mitiga força bruta e abuso de quota da API do Gmail).
- Limite de tamanho do corpo JSON (10 KB).
- Paginação limitada na análise (máx. 50 páginas) para evitar exaustão de
  recursos.

### A05 — Security Misconfiguration
- **Helmet**: CSP, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy`, remoção do header `X-Powered-By`, HSTS.
- Mensagens de erro genéricas para o cliente; detalhes (`error.message`,
  stack traces) ficam apenas nos logs do servidor.
- `trust proxy` configurado apenas em produção, para cookies `secure`
  funcionarem atrás de load balancer.
- Nome do cookie de sessão customizado (`gcb.sid`), sem revelar o framework.

### A06 — Vulnerable and Outdated Components
- `googleapis` atualizado (corrige advisory GHSA-w5hq-g745-h8pq no `uuid`
  transitivo); `npm audit` sem vulnerabilidades conhecidas.
- Script `npm run audit` adicionado; rode-o regularmente e no CI.
- `engines.node >= 18` declarado.

### A07 — Identification and Authentication Failures
- **OAuth `state` anti-CSRF** (RFC 6749 §10.12): valor aleatório de 32 bytes
  gerado por requisição, guardado na sessão e validado no callback. Sem isso,
  um atacante poderia forjar o callback e logar a vítima na conta dele
  (login CSRF).
- **Regeneração da sessão após login** (previne fixação de sessão).
- `saveUninitialized: false` — nenhum cookie de sessão é emitido antes do
  login.
- **Logout completo**: revoga o token no Google (`revokeToken`), destrói a
  sessão e limpa o cookie.
- `/auth/status` não expõe mais detalhes internos (`hasTokens`).

### A08 — Software and Data Integrity Failures
- Sem scripts de terceiros no front-end (apenas fontes do Google Fonts via
  CSS, restritas pela CSP).
- Dependências fixadas via `package-lock.json` (Twelve-Factor: II.
  Dependencies).

### A09 — Security Logging and Monitoring Failures
- Logs escritos em stdout/stderr (Twelve-Factor: XI. Logs) para coleta pelo
  ambiente de execução.
- Erros logados com contexto no servidor, sem vazar para o cliente.
- Tokens e segredos **nunca** são logados.

### A10 — Server-Side Request Forgery (SSRF)
- O servidor só faz chamadas de saída para a API do Gmail
  (`googleapis.com`), com URLs fixas do SDK oficial; nenhuma URL é construída
  a partir de entrada do usuário.

### CSRF
- O pacote `csurf` foi **removido** (arquivado/deprecado pelos mantenedores).
  A proteção agora é o middleware global `verifySameOrigin`: todo método que
  altera estado (POST/PUT/PATCH/DELETE) precisa de cabeçalho `Origin`/`Referer`
  pertencente ao próprio host, somado a `sameSite=lax` nos cookies.

---

## Twelve-Factor App

| Fator | Implementação |
|---|---|
| I. Codebase | Repositório git único |
| II. Dependencies | Declaradas em `package.json` + `package-lock.json` |
| III. Config | 100% via variáveis de ambiente; `.env.example` versionado, `.env` no `.gitignore`; falha rápida se config obrigatória faltar |
| VII. Port binding | Porta via `PORT` |
| IX. Disposability | Encerramento gracioso em `SIGTERM`/`SIGINT` |
| X. Dev/prod parity | Mesmo código; diferenças controladas só por `NODE_ENV` |
| XI. Logs | Fluxo de eventos em stdout/stderr, sem arquivos de log |

---

## OWASP SAMM — práticas adotadas

- **Governance / Policy & Compliance**: este documento define a política de
  segurança e o processo de reporte.
- **Design / Threat Assessment**: principais ameaças mapeadas — roubo de
  tokens OAuth, CSRF de login, XSS via cabeçalhos de email, injeção na busca
  do Gmail, abuso de quota.
- **Design / Security Requirements**: requisitos verificados na inicialização
  (segredos obrigatórios e fortes).
- **Implementation / Secure Build**: CI no GitHub Actions
  (`.github/workflows/security.yml`) roda typecheck + `npm audit` (SCA) em
  todo push/PR para `main`; dependências travadas por lockfile.
- **Verification / Security Testing**: revisar `npm audit` a cada mudança de
  dependência; testar manualmente fluxos de auth (state inválido, sessão
  expirada, sender malformado).
- **Operations / Environment Management**: segredos só no ambiente; rotação
  do `SESSION_SECRET` e das credenciais OAuth em caso de suspeita de
  vazamento (revogar no Google Cloud Console).

---

## Endurecimentos de 2026-07-05 (playbook SaaS)

- **`Cache-Control: no-store`** em todas as respostas de `/api/*` e
  `/auth/*` — dados sensíveis (perfil, contagens, redirects de auth) não
  ficam em cache de navegador nem de proxies.
- **Rate limit em `/auth/status`** — era a única rota dinâmica sem limiter.
- **Erros de body-parser mapeados para 4xx** — JSON inválido responde 400 e
  payload acima de 10kb responde 413, em vez de cair no handler 500 e
  poluir o log com erro de cliente.
- **CI de segurança** — workflow `security.yml` com typecheck e
  `npm audit --omit=dev` em cada push/PR.

---

## Limitações conhecidas / próximos passos

1. **Armazenamento de sessão em memória**: `express-session` usa MemoryStore
   por padrão, que não é recomendado para produção (vaza memória e não escala
   horizontalmente — Twelve-Factor: VI. Processes). Para produção, configure
   um store externo (ex.: `connect-redis`).
2. **CSP com `'unsafe-inline'` para estilos**: o CSS está inline no HTML.
   Migrar para arquivo externo permitiria remover essa exceção.
3. **Refresh token na sessão**: os tokens vivem apenas na sessão (expiram em
   24h). Se a aplicação evoluir para persistência, criptografe os tokens em
   repouso.

---

## Achados da revisão de código de 2026-06-10 — TODOS CORRIGIDOS

Achados confirmados pela revisão de alto esforço e as correções aplicadas:

1. ✅ **`cleanAll()` engolia falhas silenciosamente** — agora usa `apiFetch`
   (trata 401), conta sucessos/falhas por remetente e o toast reporta o
   resultado real (`⚠️ X movidos; Y falharam` quando há falhas).
2. ✅ **`isAuthError()` não reconhecia todas as formas de token revogado** —
   agora cobre `error.status`, `error.response.status`, `error.code`
   numérico, o código OAuth em `error.response.data.error` e a mensagem
   "expired or revoked" do Google.
3. ✅ **Erros de cota engolidos na análise** — erros de auth dentro do lote
   agora propagam para o 401; os demais são contados em `failedMessages`,
   retornados na resposta e exibidos pelo front-end ("Análise parcial").
4. ✅ **Remetentes não-email quebravam o botão Limpar** — a análise agora
   normaliza (trim/lowercase) e agrega apenas remetentes que passam na mesma
   validação do `/api/clean`; linhas impossíveis de limpar não aparecem.
5. ✅ **Estatísticas enganosas / chamadas desperdiçadas** — a paginação para
   ao atingir o limite de análise (1000); `totalMessages` agora corresponde
   ao conjunto realmente analisado e a resposta inclui
   `analyzedMessages`/`failedMessages`.
6. ✅ **Origin opt-in por rota** — `verifySameOrigin` virou middleware global
   para todos os métodos não seguros (POST/PUT/PATCH/DELETE); rotas mutantes
   futuras ficam protegidas automaticamente.
7. ✅ **Playbooks desatualizados na raiz** — `index2.html` renomeado para
   `index.html.old` e `INTRUÇÕES.md` recebeu um aviso destacado de documento
   histórico ("não use este código").

### Estado dos módulos npm (pasta `node_modules`)

- `npm audit`: **0 vulnerabilidades conhecidas** (após upgrade do
  `googleapis` 128→173, que corrigiu o advisory GHSA-w5hq-g745-h8pq do
  `uuid` transitivo).
- `node_modules/` foi **removido do versionamento** (estava commitado no
  `main`): dependências são instaláveis de forma reprodutível via
  `npm ci` + `package-lock.json`. Nunca recommite a pasta.
- Rode `npm run audit` no CI e a cada mudança de dependência.
