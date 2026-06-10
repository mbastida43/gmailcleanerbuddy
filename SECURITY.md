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

### CSRF (defesa em profundidade)
- `sameSite=lax` nos cookies + verificação de cabeçalho `Origin` nas rotas
  que mudam estado (`/api/clean`, `/auth/logout`).

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
- **Implementation / Secure Build**: `npm run audit` deve rodar no CI;
  dependências travadas por lockfile.
- **Verification / Security Testing**: revisar `npm audit` a cada mudança de
  dependência; testar manualmente fluxos de auth (state inválido, sessão
  expirada, sender malformado).
- **Operations / Environment Management**: segredos só no ambiente; rotação
  do `SESSION_SECRET` e das credenciais OAuth em caso de suspeita de
  vazamento (revogar no Google Cloud Console).

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
