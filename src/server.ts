import express, { NextFunction, Request, Response } from 'express';
import { google } from 'googleapis';
import session from 'express-session';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { OAuth2Client, exchangeCodeForTokens } from './types/google';
import 'dotenv/config';

// ========== VALIDAÇÃO DE CONFIGURAÇÃO (Twelve-Factor: falha rápida) ==========
// O servidor NÃO inicia se faltar qualquer variável obrigatória ou se o
// SESSION_SECRET for fraco. Nada de fallback hardcoded.
const REQUIRED_ENV = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'SESSION_SECRET'
] as const;

const missing = REQUIRED_ENV.filter((name) => !process.env[name] || !process.env[name]?.trim());
if (missing.length > 0) {
  console.error(`\n❌ Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`);
  console.error('   Copie .env.example para .env e preencha os valores. Veja INSTRUCTIONS.md.\n');
  process.exit(1);
}

if (process.env.SESSION_SECRET!.length < 32) {
  console.error('\n❌ SESSION_SECRET muito curto. Use 32+ caracteres.');
  console.error('   Gere um com: openssl rand -hex 32\n');
  process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  app.set('trust proxy', 1);
}

function createOAuthClient(): OAuth2Client {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// ========== RATE LIMITING (OWASP A04) ==========
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false
});

// ========== HELMET / CSP (OWASP A05) ==========
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://cdn.jsdelivr.net'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  hsts: isProd,
  referrerPolicy: { policy: 'no-referrer' }
}));

// Permissions-Policy: desabilita APIs de navegador que este app não usa,
// reduzindo a superfície de ataque caso um XSS futuro tente acessá-las.
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()'
  );
  next();
});

app.use(express.json({ limit: '10kb' }));
app.use(express.static('public'));

// Respostas de auth/API carregam dados sensíveis (perfil, contagens) e não
// devem ficar em cache de navegador nem de proxies intermediários.
app.use(['/api', '/auth'], (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

app.use(session({
  name: 'gcb.sid',
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProd,
    httpOnly: true,
    // 'lax' (não 'strict'): o retorno do OAuth é uma navegação top-level vinda
    // de accounts.google.com — com 'strict' o navegador omite o cookie e o
    // state salvo na sessão se perde. CSRF segue coberto pelo verifySameOrigin.
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ========== CSRF (defesa em profundidade via verificação de Origin) ==========
// Substitui o pacote `csurf` (arquivado/deprecado). Todo método que muda
// estado precisa de Origin/Referer pertencente ao próprio host.
function verifySameOrigin(req: Request, res: Response, next: NextFunction): void {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) return next();

  const origin = req.get('origin') || req.get('referer');
  if (!origin) {
    res.status(403).json({ error: 'Origem ausente' });
    return;
  }

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    res.status(403).json({ error: 'Origem inválida' });
    return;
  }

  if (originHost !== req.get('host')) {
    res.status(403).json({ error: 'Requisição não autorizada' });
    return;
  }
  next();
}
app.use(verifySameOrigin);

// ========== AUTENTICAÇÃO ==========
function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.tokens) {
    res.status(401).json({ error: 'Não autenticado' });
    return;
  }
  next();
}

function getAuthClient(req: Request): OAuth2Client {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials(req.session.tokens!);
  return oauth2Client;
}

function validateSender(sender: unknown): sender is string {
  return typeof sender === 'string' && /^[a-zA-Z0-9@._%+-]{3,254}$/.test(sender);
}

// 1. Iniciar OAuth
app.get('/auth/google', authLimiter, (req: Request, res: Response) => {
  const oauth2Client = createOAuthClient();
  const state = crypto.randomBytes(32).toString('hex');
  req.session.oauthState = state;

  // Minimização de credenciais (segurança): pedimos acesso 'online', então o
  // Google emite APENAS um access token de curta duração (~1h) e NENHUM refresh
  // token. Como o app nunca usa refresh token, não faz sentido guardar uma
  // credencial de longa duração — se a store de sessão vazar, o dano expira em
  // ~1h em vez de ser renovável indefinidamente. A sessão expira naturalmente e
  // o usuário reautentica.
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'online',
    scope: ['https://www.googleapis.com/auth/gmail.modify'],
    state
  });

  res.redirect(authUrl);
});

// 2. Callback do Google
app.get('/auth/google/callback', authLimiter, async (req: Request, res: Response) => {
  const { code, state } = req.query;
  const expectedState = req.session.oauthState;

  // Comparação resistente a timing attacks (OWASP A07)
  const stateOk =
    typeof state === 'string' &&
    typeof expectedState === 'string' &&
    state.length === expectedState.length &&
    crypto.timingSafeEqual(Buffer.from(state), Buffer.from(expectedState));

  if (!code || typeof code !== 'string' || !stateOk) {
    console.error(
      `OAuth callback rejeitado: code=${!!code} stateRecebido=${typeof state === 'string'} stateNaSessao=${typeof expectedState === 'string'}`
    );
    res.redirect('/?error=auth_state_mismatch');
    return;
  }

  try {
    const oauth2Client = createOAuthClient();
    const tokens = await exchangeCodeForTokens(oauth2Client, code);

    // Regenera a sessão para prevenir fixação de sessão (OWASP A07)
    req.session.regenerate((err) => {
      if (err) {
        console.error('Erro ao regenerar sessão:', err);
        res.redirect('/?error=auth_failed');
        return;
      }
      req.session.tokens = tokens;
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Erro ao salvar sessão:', saveErr);
          res.redirect('/?error=auth_failed');
          return;
        }
        res.redirect('/?auth=success');
      });
    });
  } catch (error: any) {
    console.error('Erro no OAuth callback:', error?.message);
    res.redirect('/?error=auth_failed');
  }
});

// 3. Status (sem expor detalhes internos)
app.get('/auth/status', apiLimiter, (req: Request, res: Response) => {
  res.json({ authenticated: !!req.session.tokens });
});

// 4. Logout — revoga token no Google e destrói sessão
app.post('/auth/logout', requireAuth, async (req: Request, res: Response) => {
  try {
    const oauth2Client = getAuthClient(req);
    if (req.session.tokens?.access_token) {
      await oauth2Client.revokeToken(req.session.tokens.access_token).catch(() => {});
    }
  } catch (error: any) {
    console.error('Erro ao revogar token:', error?.message);
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('Erro no logout:', err);
      res.status(500).json({ error: 'Falha ao encerrar sessão' });
      return;
    }
    res.clearCookie('gcb.sid');
    res.json({ success: true });
  });
});

// ========== GMAIL API ==========

// 5. Perfil do usuário
app.get('/api/user', apiLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: getAuthClient(req) });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    res.json({
      email: profile.data.emailAddress,
      messagesTotal: profile.data.messagesTotal,
      threadsTotal: profile.data.threadsTotal
    });
  } catch (error: any) {
    console.error('Erro ao buscar perfil:', error?.message);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// 6. Analisar caixa de entrada (Top Offenders)
const MAX_ANALYZE = 1000;

interface Offender {
  domain: string;
  count: number;       // contagem real (toda a conta) — usada para exibir/ordenar
  sampleCount: number;  // contagem dentro da amostra analisada — usada só como fallback
  size: number;
  category: string;
}

interface AnalyzeResponse {
  totalMessages: number;
  analyzedMessages: number;
  failedMessages: number;
  uniqueSenders: number;
  offenders: Offender[];
  top10: Offender[];
}

app.get('/api/analyze', apiLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: getAuthClient(req) });

    async function fetchMessagePage(token: string | undefined) {
      return gmail.users.messages.list({
        userId: 'me',
        maxResults: 100,
        pageToken: token
      });
    }

    let allMessages: { id?: string | null }[] = [];
    let pageToken: string | undefined;

    // Para de paginar assim que tiver mensagens suficientes para a análise
    do {
      const response = await fetchMessagePage(pageToken);
      if (response.data.messages) {
        allMessages = allMessages.concat(response.data.messages);
      }
      pageToken = response.data.nextPageToken ?? undefined;
    } while (pageToken && allMessages.length < MAX_ANALYZE);

    const toAnalyze = allMessages.slice(0, MAX_ANALYZE);

    const senderCounts: Record<string, number> = {};
    const senderSizes: Record<string, number> = {};
    const senderCategories: Record<string, string> = {};
    let failedMessages = 0;

    const batchSize = 50;
    for (let i = 0; i < toAnalyze.length; i += batchSize) {
      const batch = toAnalyze.slice(i, i + batchSize);

      await Promise.all(batch.map(async (message) => {
        try {
          const details = await gmail.users.messages.get({
            userId: 'me',
            id: message.id!,
            format: 'metadata',
            metadataHeaders: ['From']
          });

          const headers = details.data.payload?.headers || [];
          const fromHeader = headers.find((h) => h.name === 'From');
          if (!fromHeader || !fromHeader.value) return;

          const emailMatch =
            fromHeader.value.match(/<(.+?)>/) ||
            fromHeader.value.match(/([^\s]+@[^\s]+)/);
          const raw = emailMatch ? emailMatch[1] : fromHeader.value;
          const senderEmail = String(raw).trim().toLowerCase();

          // Só agrega remetentes que conseguem passar pela mesma validação
          // usada no /api/clean — assim o botão Limpar nunca fica inerte.
          if (!validateSender(senderEmail)) return;

          senderCounts[senderEmail] = (senderCounts[senderEmail] || 0) + 1;
          senderSizes[senderEmail] = (senderSizes[senderEmail] || 0) + (details.data.sizeEstimate || 0);
          if (!senderCategories[senderEmail]) {
            senderCategories[senderEmail] = categorizeSender(senderEmail);
          }
        } catch (err) {
          // Erro de auth no meio do lote: propaga como 401
          if (isAuthError(err)) throw err;
          failedMessages++;
        }
      }));
    }

    const offenders: Offender[] = Object.keys(senderCounts).map((email) => ({
      domain: email,
      count: senderCounts[email],
      sampleCount: senderCounts[email],
      size: senderSizes[email] || 0,
      category: senderCategories[email]
    }));
    offenders.sort((a, b) => b.count - a.count);

    // Contagem REAL para a LISTA INTEIRA: roda a mesma busca `from:"..."` que
    // o Gmail faz e lê o total da conta inteira (todas as pastas), em vez de
    // contar só dentro da amostra. É isto que faz o número bater com o filtro
    // digitado direto no Gmail.
    //
    // São ~1 busca por remetente. Para não estourar a quota da API
    // (rate limit por usuário/segundo), processamos em lotes pequenos com um
    // respiro entre eles.
    const CONCURRENCY = 8;
    const PAUSE_MS = 150;
    for (let i = 0; i < offenders.length; i += CONCURRENCY) {
      const batch = offenders.slice(i, i + CONCURRENCY);
      await Promise.all(batch.map(async (item) => {
        try {
          item.count = await countMessagesFrom(gmail, item.domain);
        } catch (err) {
          if (isAuthError(err)) throw err;
          // mantém a contagem da amostra como fallback em caso de falha
        }
      }));
      if (i + CONCURRENCY < offenders.length) {
        await sleep(PAUSE_MS);
      }
    }

    // Reordena pelo total real (a amostra pode ter ordenado diferente)
    offenders.sort((a, b) => b.count - a.count);

    const responseBody: AnalyzeResponse = {
      totalMessages: toAnalyze.length,
      analyzedMessages: toAnalyze.length - failedMessages,
      failedMessages,
      uniqueSenders: offenders.length,
      offenders,
      top10: offenders.slice(0, 10)
    };
    res.json(responseBody);
  } catch (error: any) {
    if (isAuthError(error)) {
      res.status(401).json({ error: 'Sessão expirada. Entre novamente.' });
      return;
    }
    console.error('Erro na análise:', error?.message);
    res.status(500).json({ error: 'Erro ao analisar emails' });
  }
});

// 7. Limpar emails de um remetente (move para lixeira)
app.post('/api/clean', apiLimiter, requireAuth, async (req: Request, res: Response) => {
  const sanitizedSender = typeof req.body.sender === 'string' ? req.body.sender.trim() : '';

  if (!sanitizedSender) {
    res.status(400).json({ error: 'Remetente não informado' });
    return;
  }
  if (!validateSender(sanitizedSender)) {
    res.status(400).json({ error: 'Remetente inválido' });
    return;
  }

  try {
    const gmail = google.gmail({ version: 'v1', auth: getAuthClient(req) });

    // Mesma busca usada na contagem (entre aspas, evita injeção de operadores).
    // Pagina até o fim para coletar TODOS os ids, não só os 200 primeiros.
    const searchQuery = `from:"${sanitizedSender}"`;
    let messageIds: string[] = [];
    let pageToken: string | undefined;
    let pages = 0;
    const MAX_CLEAN_PAGES = 50;

    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: searchQuery,
        maxResults: 500,
        pageToken,
        fields: 'messages/id,nextPageToken',
        includeSpamTrash: true
      });
      messageIds = messageIds.concat((response.data.messages || []).map((m) => m.id!));
      pageToken = response.data.nextPageToken ?? undefined;
      pages++;
    } while (pageToken && pages < MAX_CLEAN_PAGES);

    if (messageIds.length === 0) {
      res.json({ removed: 0, message: 'Nenhum email encontrado' });
      return;
    }

    // messages.trash move corretamente para a Lixeira (diferente de só
    // adicionar o label TRASH via batchModify, que é incompleto).
    // Em paralelo por lotes: trash custa 5 unidades de quota e o limite é
    // ~250 unidades/s por usuário, então ~40 chamadas/s fica dentro da cota.
    let removed = 0;
    let failed = 0;
    const TRASH_CONCURRENCY = 10;
    const TRASH_PAUSE_MS = 120;
    for (let i = 0; i < messageIds.length; i += TRASH_CONCURRENCY) {
      const batch = messageIds.slice(i, i + TRASH_CONCURRENCY);
      await Promise.all(batch.map(async (id) => {
        try {
          await gmail.users.messages.trash({ userId: 'me', id });
          removed++;
        } catch (err) {
          if (isAuthError(err)) throw err;
          failed++;
        }
      }));
      if (i + TRASH_CONCURRENCY < messageIds.length) {
        await sleep(TRASH_PAUSE_MS);
      }
    }

    res.json({
      removed,
      failed,
      sender: sanitizedSender,
      message: failed
        ? `${removed} movidos para a lixeira; ${failed} falharam`
        : `${removed} emails movidos para a lixeira`
    });
  } catch (error: any) {
    if (isAuthError(error)) {
      res.status(401).json({ error: 'Sessão expirada. Entre novamente.' });
      return;
    }
    console.error('Erro ao limpar emails:', error?.message);
    res.status(500).json({ error: 'Erro ao limpar emails' });
  }
});

// ========== AUXILIARES ==========
type Gmail = ReturnType<typeof google.gmail>;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Conta threads exatas via paginação — mesma semântica do Gmail UI (conversas,
// não mensagens individuais). Spam e Lixeira são excluídos pelo padrão da API,
// assim como o Gmail exclui do total exibido quando ambos estão limpos.
async function countMessagesFrom(gmail: Gmail, sender: string): Promise<number> {
  const query = `from:"${sender}"`;
  let total = 0;
  let pageToken: string | undefined;
  let pages = 0;
  const MAX_COUNT_PAGES = 50;

  do {
    const resp = await gmail.users.threads.list({
      userId: 'me',
      q: query,
      maxResults: 500,
      pageToken,
      fields: 'threads/id,nextPageToken'
    });
    total += (resp.data.threads || []).length;
    pageToken = resp.data.nextPageToken ?? undefined;
    pages++;
  } while (pageToken && pages < MAX_COUNT_PAGES);

  return total;
}

function isAuthError(error: any): boolean {
  const status = error?.status || error?.response?.status || error?.code;
  if (status === 401 || status === 403) return true;
  const oauthCode = error?.response?.data?.error;
  if (oauthCode === 'invalid_grant' || oauthCode === 'invalid_token') return true;
  const msg = String(error?.message || '').toLowerCase();
  return msg.includes('expired or revoked') || msg.includes('invalid credentials');
}

function categorizeSender(email: string): string {
  const domain = email.toLowerCase();
  if (domain.includes('linkedin')) return 'Rede Social';
  if (domain.includes('facebook') || domain.includes('instagram')) return 'Rede Social';
  if (domain.includes('google') || domain.includes('youtube')) return 'Google';
  if (domain.includes('github') || domain.includes('gitlab')) return 'DevOps';
  if (domain.includes('ifood') || domain.includes('uber')) return 'Delivery';
  if (domain.includes('amazon')) return 'Compras';
  if (domain.includes('canva') || domain.includes('figma')) return 'Design';
  if (domain.includes('cloudflare') || domain.includes('aws')) return 'Infraestrutura';
  if (domain.includes('slack') || domain.includes('teams')) return 'Colaboração';
  if (domain.includes('news') || domain.includes('nytimes')) return 'Notícias';
  if (domain.includes('medium') || domain.includes('substack')) return 'Conteúdo';
  return 'Outros';
}

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Recurso não encontrado' });
});

// Handler de erro genérico (não vaza detalhes ao cliente)
app.use((err: Error & { type?: string }, req: Request, res: Response, next: NextFunction) => {
  // Erros do body-parser são culpa do cliente, não do servidor
  if (err.type === 'entity.too.large') {
    res.status(413).json({ error: 'Corpo da requisição grande demais' });
    return;
  }
  if (err.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'JSON inválido' });
    return;
  }
  console.error('Erro interno no servidor:', err.message);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

// ========== SERVIDOR ==========
const server = app.listen(PORT, 'localhost', () => {
  console.log(`\n🚀 Gmail Cleaner Buddy rodando em http://localhost:${PORT}\n`);
});

// Erro ao subir o servidor (ex.: porta ocupada) com mensagem amigável
server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\n❌ A porta ${PORT} já está em uso. ` +
        `Encerre o processo que a está usando ou defina outra porta com ` +
        `a variável de ambiente PORT (ex.: PORT=3001 npm start).\n`
    );
  } else {
    console.error('\n❌ Erro ao iniciar o servidor:', err.message, '\n');
  }
  process.exit(1);
});

// Encerramento gracioso (Twelve-Factor IX)
function shutdown(signal: string): void {
  console.log(`\n${signal} recebido. Encerrando...`);
  server.close(() => process.exit(0));
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
