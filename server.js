const express = require('express');
const { google } = require('googleapis');
const session = require('express-session');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

// ========== CONFIGURAÇÃO (Twelve-Factor: III. Config) ==========
// Toda configuração vem do ambiente. A aplicação falha rápido na
// inicialização se algum valor obrigatório estiver ausente — nunca
// usa segredos padrão embutidos no código.

const REQUIRED_ENV = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'SESSION_SECRET'
];

const missingEnv = REQUIRED_ENV.filter((name) => !process.env[name]);
if (missingEnv.length > 0) {
  console.error(`Variáveis de ambiente obrigatórias ausentes: ${missingEnv.join(', ')}`);
  console.error('Copie .env.example para .env e preencha os valores. Abortando.');
  process.exit(1);
}

if (process.env.SESSION_SECRET.length < 32) {
  console.error('SESSION_SECRET deve ter pelo menos 32 caracteres. Gere com: openssl rand -hex 32');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Necessário para cookies "secure" funcionarem atrás de proxy/load balancer
if (IS_PRODUCTION) {
  app.set('trust proxy', 1);
}

// ========== MIDDLEWARE DE SEGURANÇA ==========

// Headers de segurança (OWASP A05 — Security Misconfiguration):
// CSP, X-Content-Type-Options, X-Frame-Options, HSTS, etc.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Scripts apenas de arquivos próprios; nenhum script inline é permitido
      scriptSrc: ["'self'"],
      // 'unsafe-inline' apenas para estilos, pois o CSS está inline no HTML

      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'", 'https://accounts.google.com']
    }
  }
}));

// Limite no corpo da requisição evita payloads abusivos
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  name: 'gcb.sid', // não expor o nome padrão do framework
  secret: process.env.SESSION_SECRET,
  resave: false,
  // false: não cria sessão (nem cookie) antes do login — evita fixação
  // de sessão e reduz superfície (OWASP A07)
  saveUninitialized: false,
  cookie: {
    secure: IS_PRODUCTION,
    httpOnly: true,    // inacessível a JavaScript (mitiga roubo via XSS)
    sameSite: 'lax',   // mitiga CSRF em requisições cross-site
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Rate limiting (OWASP A04 — Insecure Design / força bruta e abuso)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente mais tarde.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de autenticação. Tente novamente mais tarde.' }
});

app.use('/api/', apiLimiter);
// Limite estrito só no fluxo OAuth (/auth/google e /auth/google/callback);
// /auth/status é chamado a cada carregamento de página e usa o limite geral
app.use('/auth/google', authLimiter);
app.use('/auth/status', apiLimiter);
app.use('/auth/logout', apiLimiter);

// Defesa em profundidade contra CSRF em rotas que mudam estado:
// além de SameSite=lax, rejeita requisições cujo Origin não bata com o host.
function verifySameOrigin(req, res, next) {
  const origin = req.get('Origin');
  if (origin) {
    let originHost;
    try {
      originHost = new URL(origin).host;
    } catch {
      return res.status(403).json({ error: 'Origem inválida' });
    }
    if (originHost !== req.get('Host')) {
      return res.status(403).json({ error: 'Origem não permitida' });
    }
  }
  next();
}

// ========== OAUTH2 ==========

// IMPORTANTE: o cliente OAuth2 é criado POR REQUISIÇÃO, nunca compartilhado
// globalmente. Um cliente global com setCredentials() faria as credenciais de
// um usuário vazarem para requisições concorrentes de outros usuários
// (OWASP A01 — Broken Access Control).
function createOAuthClient(tokens) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  if (tokens) {
    client.setCredentials(tokens);
  }
  return client;
}

// ========== ROTAS DE AUTENTICAÇÃO ==========

// 1. Iniciar OAuth — com parâmetro "state" anti-CSRF (RFC 6749 §10.12)
app.get('/auth/google', (req, res) => {
  const state = crypto.randomBytes(32).toString('hex');
  req.session.oauthState = state;

  const authUrl = createOAuthClient().generateAuthUrl({
    access_type: 'offline',
    // Escopo mínimo necessário (gmail.modify já inclui leitura) — princípio
    // do menor privilégio (OWASP A01)
    scope: ['https://www.googleapis.com/auth/gmail.modify'],
    // select_account: mostra sempre o seletor de contas do Google (a mesma
    // caixa de diálogo de quem abre gmail.com), permitindo entrar com
    // qualquer conta; consent: garante a emissão do refresh token
    prompt: 'select_account consent',
    state
  });
  res.redirect(authUrl);
});

// 2. Callback do Google — valida o "state" antes de trocar o código
app.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.redirect('/?error=no_code');
  }

  // timingSafeEqual exige buffers do mesmo tamanho — sem o guard de
  // comprimento, um state malformado lançaria exceção e derrubaria o processo
  const expectedState = req.session.oauthState;
  const providedState = Buffer.from(String(state || ''));
  const stateIsValid = typeof expectedState === 'string' &&
    providedState.length === Buffer.byteLength(expectedState) &&
    crypto.timingSafeEqual(providedState, Buffer.from(expectedState));

  if (!stateIsValid) {
    return res.redirect('/?error=invalid_state');
  }
  delete req.session.oauthState;

  try {
    const { tokens } = await createOAuthClient().getToken(String(code));

    // Regenerar a sessão após autenticação previne fixação de sessão
    req.session.regenerate((err) => {
      if (err) {
        console.error('Erro ao regenerar sessão:', err);
        return res.redirect('/?error=auth_failed');
      }
      req.session.tokens = tokens;
      req.session.authenticated = true;
      res.redirect('/?auth=success');
    });
  } catch (error) {
    console.error('Erro no OAuth callback:', error.message);
    res.redirect('/?error=auth_failed');
  }
});

// 3. Verificar autenticação
app.get('/auth/status', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.authenticated) });
});

// 4. Logout — revoga os tokens no Google e destrói a sessão
app.post('/auth/logout', verifySameOrigin, async (req, res) => {
  const tokens = req.session && req.session.tokens;
  if (tokens && tokens.access_token) {
    try {
      await createOAuthClient().revokeToken(tokens.access_token);
    } catch (err) {
      // Revogação é melhor esforço; a sessão é destruída de qualquer forma
      console.error('Erro ao revogar token:', err.message);
    }
  }
  req.session.destroy(() => {
    res.clearCookie('gcb.sid');
    res.json({ success: true });
  });
});

// ========== ROTAS DA GMAIL API ==========

// Middleware de autenticação — anexa um cliente OAuth próprio à requisição
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.tokens) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  req.oauthClient = createOAuthClient(req.session.tokens);
  // O access token expira em ~1h; o SDK o renova sozinho usando o refresh
  // token. Persistimos os tokens renovados na sessão para o usuário não
  // precisar logar de novo.
  req.oauthClient.on('tokens', (tokens) => {
    req.session.tokens = { ...req.session.tokens, ...tokens };
  });
  next();
};

// Detecta credenciais expiradas/revogadas para pedir novo login em vez de
// devolver um erro 500 genérico
function isAuthError(error) {
  const status = (error.response && error.response.status) || error.code;
  return status === 401 || status === '401' ||
         /invalid_grant|invalid_credentials/i.test(error.message || '');
}

function handleGmailError(req, res, error, fallbackMessage) {
  if (isAuthError(error)) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: 'Sessão expirada. Conecte-se novamente.' });
  }
  res.status(500).json({ error: fallbackMessage });
}

// 5. Buscar email do usuário
app.get('/api/user', requireAuth, async (req, res) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: req.oauthClient });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    res.json({
      email: profile.data.emailAddress,
      messagesTotal: profile.data.messagesTotal,
      threadsTotal: profile.data.threadsTotal
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error.message);
    handleGmailError(req, res, error, 'Erro ao buscar perfil');
  }
});

// 6. Analisar caixa de entrada (Top Offenders)
app.get('/api/analyze', requireAuth, async (req, res) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: req.oauthClient });

    // Buscar todos os emails (paginado)
    let allMessages = [];
    let pageToken = null;
    let maxPages = 50; // Limitar para não travar (50 páginas = ~5000 emails)
    let pagesProcessed = 0;

    console.log('🔍 Iniciando análise da caixa postal...');

    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 100,
        pageToken: pageToken
      });

      if (response.data.messages) {
        allMessages = allMessages.concat(response.data.messages);
      }

      pageToken = response.data.nextPageToken;
      pagesProcessed++;

      console.log(`📬 Processadas ${allMessages.length} mensagens...`);

    } while (pageToken && pagesProcessed < maxPages);

    console.log(`✅ Total de mensagens encontradas: ${allMessages.length}`);

    // Buscar detalhes dos emails (em lotes)
    const senderCounts = {};
    const senderSizes = {};
    const senderCategories = {};

    const batchSize = 50;
    for (let i = 0; i < Math.min(allMessages.length, 1000); i += batchSize) {
      const batch = allMessages.slice(i, i + batchSize);

      await Promise.all(batch.map(async (message) => {
        try {
          const details = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'metadata',
            metadataHeaders: ['From', 'Subject']
          });

          const headers = details.data.payload.headers;
          const fromHeader = headers.find(h => h.name === 'From');

          if (fromHeader) {
            // Extrair email do remetente
            const emailMatch = fromHeader.value.match(/<(.+?)>/) ||
                               fromHeader.value.match(/([^\s]+@[^\s]+)/);
            const senderEmail = emailMatch ? emailMatch[1] : fromHeader.value;

            // Contar mensagens
            senderCounts[senderEmail] = (senderCounts[senderEmail] || 0) + 1;

            // Estimar tamanho (sizeEstimate em bytes)
            const size = details.data.sizeEstimate || 0;
            senderSizes[senderEmail] = (senderSizes[senderEmail] || 0) + size;

            // Categorizar
            if (!senderCategories[senderEmail]) {
              senderCategories[senderEmail] = categorizeSender(senderEmail);
            }
          }
        } catch (err) {
          console.error(`Erro ao processar mensagem ${message.id}:`, err.message);
        }
      }));

      console.log(`📊 Analisados ${Math.min(i + batchSize, allMessages.length)} de ${Math.min(allMessages.length, 1000)} emails...`);
    }

    // Converter para array e ordenar
    const offenders = Object.keys(senderCounts).map(email => ({
      domain: email,
      count: senderCounts[email],
      size: senderSizes[email] || 0,
      category: senderCategories[email]
    }));

    offenders.sort((a, b) => b.count - a.count);

    console.log('✅ Análise concluída!');

    res.json({
      totalMessages: allMessages.length,
      uniqueSenders: offenders.length,
      offenders: offenders,
      top10: offenders.slice(0, 10)
    });

  } catch (error) {
    console.error('Erro na análise:', error.message);
    handleGmailError(req, res, error, 'Erro ao analisar emails');
  }
});

// Validação do remetente (OWASP A03 — Injection): o valor é interpolado na
// query de busca do Gmail, então só aceitamos um endereço de email estrito,
// sem espaços, aspas, parênteses ou curingas que alterariam a busca.
const SENDER_PATTERN = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

function isValidSender(sender) {
  return typeof sender === 'string' &&
         sender.length <= 254 &&
         SENDER_PATTERN.test(sender);
}

// 7. Limpar emails de um remetente
app.post('/api/clean', verifySameOrigin, requireAuth, async (req, res) => {
  const { sender } = req.body || {};

  if (!sender) {
    return res.status(400).json({ error: 'Remetente não informado' });
  }

  if (!isValidSender(sender)) {
    return res.status(400).json({ error: 'Remetente inválido' });
  }

  try {
    const gmail = google.gmail({ version: 'v1', auth: req.oauthClient });

    // Buscar emails do remetente (valor entre aspas para busca exata)
    const searchQuery = `from:"${sender}"`;
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults: 500
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      return res.json({ removed: 0, message: 'Nenhum email encontrado' });
    }

    const messageIds = response.data.messages.map(m => m.id);

    // Mover para lixeira (batch)
    await gmail.users.messages.batchModify({
      userId: 'me',
      requestBody: {
        ids: messageIds,
        addLabelIds: ['TRASH']
      }
    });

    res.json({
      removed: messageIds.length,
      sender: sender,
      message: `${messageIds.length} emails movidos para lixeira`
    });

  } catch (error) {
    console.error('Erro ao limpar emails:', error.message);
    handleGmailError(req, res, error, 'Erro ao limpar emails');
  }
});

// ========== FUNÇÕES AUXILIARES ==========

function categorizeSender(email) {
  const domain = email.toLowerCase();

  if (domain.includes('linkedin')) return 'Rede Social';
  if (domain.includes('facebook') || domain.includes('instagram')) return 'Rede Social';
  if (domain.includes('google') || domain.includes('youtube')) return 'Google';
  if (domain.includes('github') || domain.includes('gitlab')) return 'DevOps';
  if (domain.includes('ifood') || domain.includes('uber')) return 'Delivery';
  if (domain.includes('amazon') || domain.includes('security')) return 'Segurança';
  if (domain.includes('canva') || domain.includes('figma')) return 'Design';
  if (domain.includes('cloudflare') || domain.includes('aws')) return 'Infraestrutura';
  if (domain.includes('slack') || domain.includes('teams')) return 'Colaboração';
  if (domain.includes('news') || domain.includes('nytimes')) return 'Notícias';
  if (domain.includes('medium') || domain.includes('substack')) return 'Conteúdo';

  return 'Outros';
}

// Tratador de erros final: nunca vaza stack trace ou detalhes internos
// para o cliente (OWASP A05)
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err.message);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({ error: 'Erro interno do servidor' });
});

// ========== SERVIDOR ==========

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   🚀 Gmail Cleaner Buddy Backend         ║
║   📡 Servidor rodando em: ${PORT}           ║
║   🌐 http://localhost:${PORT}              ║
╚═══════════════════════════════════════════╝
  `);
});

// Encerramento gracioso (Twelve-Factor: IX. Disposability)
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    console.log(`Recebido ${signal}, encerrando...`);
    server.close(() => process.exit(0));
  });
}
