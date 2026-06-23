const express = require('express');
const { google } = require('googleapis');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
require('dotenv').config();

// ========== VALIDAÇÃO DE CONFIGURAÇÃO (Twelve-Factor: falha rápida) ==========
// O servidor NÃO inicia se faltar qualquer variável obrigatória ou se o
// SESSION_SECRET for fraco. Nada de fallback hardcoded.
const REQUIRED_ENV = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'SESSION_SECRET'
];

const missing = REQUIRED_ENV.filter((name) => !process.env[name] || !process.env[name].trim());
if (missing.length > 0) {
  console.error(`\n❌ Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`);
  console.error('   Copie .env.example para .env e preencha os valores. Veja INSTRUCTIONS.md.\n');
  process.exit(1);
}

if (process.env.SESSION_SECRET.length < 32) {
  console.error('\n❌ SESSION_SECRET muito curto. Use 32+ caracteres.');
  console.error('   Gere um com: openssl rand -hex 32\n');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  app.set('trust proxy', 1);
}

function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// ========== RATE LIMITING (OWASP A04) ==========
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});

// ========== HELMET / CSP (OWASP A05) ==========
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  hsts: isProd
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.static('public'));

app.use(session({
  name: 'gcb.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProd,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// ========== CSRF (defesa em profundidade via verificação de Origin) ==========
// Substitui o pacote `csurf` (arquivado/deprecado). Todo método que muda
// estado precisa de Origin/Referer pertencente ao próprio host.
function verifySameOrigin(req, res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) return next();

  const origin = req.get('origin') || req.get('referer');
  if (!origin) {
    return res.status(403).json({ error: 'Origem ausente' });
  }

  let originHost;
  try {
    originHost = new URL(origin).host;
  } catch (_) {
    return res.status(403).json({ error: 'Origem inválida' });
  }

  if (originHost !== req.get('host')) {
    return res.status(403).json({ error: 'Requisição não autorizada' });
  }
  next();
}
app.use(verifySameOrigin);

// ========== AUTENTICAÇÃO ==========
function requireAuth(req, res, next) {
  if (!req.session.tokens) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  next();
}

function getAuthClient(req) {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials(req.session.tokens);
  return oauth2Client;
}

function validateSender(sender) {
  return typeof sender === 'string' && /^[a-zA-Z0-9@._%+-]{3,254}$/.test(sender);
}

// 1. Iniciar OAuth
app.get('/auth/google', authLimiter, (req, res) => {
  const oauth2Client = createOAuthClient();
  const state = crypto.randomBytes(32).toString('hex');
  req.session.oauthState = state;

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.modify'],
    prompt: 'consent',
    state
  });

  res.redirect(authUrl);
});

// 2. Callback do Google
app.get('/auth/google/callback', authLimiter, async (req, res) => {
  const { code, state } = req.query;
  const expectedState = req.session.oauthState;

  // Comparação resistente a timing attacks (OWASP A07)
  const stateOk =
    typeof state === 'string' &&
    typeof expectedState === 'string' &&
    state.length === expectedState.length &&
    crypto.timingSafeEqual(Buffer.from(state), Buffer.from(expectedState));

  if (!code || !stateOk) {
    return res.redirect('/?error=auth_state_mismatch');
  }

  try {
    const oauth2Client = createOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    // Regenera a sessão para prevenir fixação de sessão (OWASP A07)
    req.session.regenerate((err) => {
      if (err) {
        console.error('Erro ao regenerar sessão:', err);
        return res.redirect('/?error=auth_failed');
      }
      req.session.tokens = tokens;
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error('Erro ao salvar sessão:', saveErr);
          return res.redirect('/?error=auth_failed');
        }
        res.redirect('/?auth=success');
      });
    });
  } catch (error) {
    console.error('Erro no OAuth callback:', error.message);
    res.redirect('/?error=auth_failed');
  }
});

// 3. Status (sem expor detalhes internos)
app.get('/auth/status', (req, res) => {
  res.json({ authenticated: !!req.session.tokens });
});

// 4. Logout — revoga token no Google e destrói sessão
app.post('/auth/logout', requireAuth, async (req, res) => {
  try {
    const oauth2Client = getAuthClient(req);
    if (req.session.tokens.access_token) {
      await oauth2Client.revokeToken(req.session.tokens.access_token).catch(() => {});
    }
  } catch (error) {
    console.error('Erro ao revogar token:', error.message);
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('Erro no logout:', err);
      return res.status(500).json({ error: 'Falha ao encerrar sessão' });
    }
    res.clearCookie('gcb.sid');
    res.json({ success: true });
  });
});

// ========== GMAIL API ==========

// 5. Perfil do usuário
app.get('/api/user', apiLimiter, requireAuth, async (req, res) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: getAuthClient(req) });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    res.json({
      email: profile.data.emailAddress,
      messagesTotal: profile.data.messagesTotal,
      threadsTotal: profile.data.threadsTotal
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error.message);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// 6. Analisar caixa de entrada (Top Offenders)
const MAX_ANALYZE = 1000;

app.get('/api/analyze', apiLimiter, requireAuth, async (req, res) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: getAuthClient(req) });

    let allMessages = [];
    let pageToken = null;

    // Para de paginar assim que tiver mensagens suficientes para a análise
    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 100,
        pageToken
      });
      if (response.data.messages) {
        allMessages = allMessages.concat(response.data.messages);
      }
      pageToken = response.data.nextPageToken;
    } while (pageToken && allMessages.length < MAX_ANALYZE);

    const toAnalyze = allMessages.slice(0, MAX_ANALYZE);

    const senderCounts = {};
    const senderSizes = {};
    const senderCategories = {};
    let failedMessages = 0;

    const batchSize = 50;
    for (let i = 0; i < toAnalyze.length; i += batchSize) {
      const batch = toAnalyze.slice(i, i + batchSize);

      await Promise.all(batch.map(async (message) => {
        try {
          const details = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'metadata',
            metadataHeaders: ['From']
          });

          const headers = details.data.payload.headers || [];
          const fromHeader = headers.find((h) => h.name === 'From');
          if (!fromHeader) return;

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

    const offenders = Object.keys(senderCounts).map((email) => ({
      domain: email,
      count: senderCounts[email],
      size: senderSizes[email] || 0,
      category: senderCategories[email]
    }));
    offenders.sort((a, b) => b.count - a.count);

    res.json({
      totalMessages: toAnalyze.length,
      analyzedMessages: toAnalyze.length - failedMessages,
      failedMessages,
      uniqueSenders: offenders.length,
      offenders,
      top10: offenders.slice(0, 10)
    });
  } catch (error) {
    if (isAuthError(error)) {
      return res.status(401).json({ error: 'Sessão expirada. Entre novamente.' });
    }
    console.error('Erro na análise:', error.message);
    res.status(500).json({ error: 'Erro ao analisar emails' });
  }
});

// 7. Limpar emails de um remetente (move para lixeira)
app.post('/api/clean', apiLimiter, requireAuth, async (req, res) => {
  const sanitizedSender = typeof req.body.sender === 'string' ? req.body.sender.trim() : '';

  if (!sanitizedSender) {
    return res.status(400).json({ error: 'Remetente não informado' });
  }
  if (!validateSender(sanitizedSender)) {
    return res.status(400).json({ error: 'Remetente inválido' });
  }

  try {
    const gmail = google.gmail({ version: 'v1', auth: getAuthClient(req) });

    // Valor entre aspas impede injeção de operadores de busca do Gmail
    const searchQuery = `from:"${sanitizedSender}"`;
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults: 200
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      return res.json({ removed: 0, message: 'Nenhum email encontrado' });
    }

    const messageIds = response.data.messages.map((m) => m.id);

    // messages.trash move corretamente para a Lixeira (diferente de só
    // adicionar o label TRASH via batchModify, que é incompleto).
    let removed = 0;
    let failed = 0;
    for (const id of messageIds) {
      try {
        await gmail.users.messages.trash({ userId: 'me', id });
        removed++;
      } catch (err) {
        if (isAuthError(err)) throw err;
        failed++;
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
  } catch (error) {
    if (isAuthError(error)) {
      return res.status(401).json({ error: 'Sessão expirada. Entre novamente.' });
    }
    console.error('Erro ao limpar emails:', error.message);
    res.status(500).json({ error: 'Erro ao limpar emails' });
  }
});

// ========== AUXILIARES ==========
function isAuthError(error) {
  const status = error?.status || error?.response?.status || error?.code;
  if (status === 401 || status === 403) return true;
  const oauthCode = error?.response?.data?.error;
  if (oauthCode === 'invalid_grant' || oauthCode === 'invalid_token') return true;
  const msg = String(error?.message || '').toLowerCase();
  return msg.includes('expired or revoked') || msg.includes('invalid credentials');
}

function categorizeSender(email) {
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
app.use((req, res) => {
  res.status(404).json({ error: 'Recurso não encontrado' });
});

// Handler de erro genérico (não vaza detalhes ao cliente)
app.use((err, req, res, next) => {
  console.error('Erro interno no servidor:', err.message);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

// ========== SERVIDOR ==========
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Gmail Cleaner Buddy rodando em http://localhost:${PORT}\n`);
});

// Encerramento gracioso (Twelve-Factor IX)
function shutdown(signal) {
  console.log(`\n${signal} recebido. Encerrando...`);
  server.close(() => process.exit(0));
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
