const express = require('express');
const { google } = require('googleapis');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(helmet());
app.use(limiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'gmail-cleaner-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));
app.use(csrf());

// ========== ROTAS DE AUTENTICAÇÃO ==========

// 1. Iniciar OAuth
app.get('/auth/google', (req, res) => {
  const oauth2Client = createOAuthClient();
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ],
    prompt: 'consent',
    state
  });

  res.redirect(authUrl);
});

// 2. Callback do Google
app.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state || state !== req.session.oauthState) {
    console.error('OAuth callback com estado inválido:', { state, expected: req.session.oauthState });
    return res.redirect('/?error=auth_state_mismatch');
  }

  if (!code) {
    return res.redirect('/?error=no_code');
  }

  try {
    const oauth2Client = createOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Salvar tokens na sessão
    req.session.tokens = tokens;
    req.session.authenticated = true;
    delete req.session.oauthState;
    
    res.redirect('/?auth=success');
  } catch (error) {
    console.error('Erro no OAuth callback:', error);
    res.redirect('/?error=auth_failed');
  }
});

// 3. Verificar autenticação
app.get('/auth/status', (req, res) => {
  res.json({ 
    authenticated: !!req.session.authenticated,
    hasTokens: !!req.session.tokens
  });
});

// 4. Logout
app.post('/auth/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro no logout:', err);
      return res.status(500).json({ error: 'Falha ao encerrar sessão' });
    }
    res.json({ success: true });
  });
});

// ========== ROTAS DA GMAIL API ==========

// Middleware de autenticação
const requireAuth = (req, res, next) => {
  if (!req.session.tokens) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  next();
};

app.get('/auth/csrf-token', requireAuth, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

function getAuthClient(req) {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials(req.session.tokens);
  return oauth2Client;
}

function validateSender(sender) {
  return typeof sender === 'string' && /^[a-zA-Z0-9@._%+-]{3,254}$/.test(sender);
}

// 5. Buscar email do usuário
app.get('/api/user', requireAuth, async (req, res) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: getAuthClient(req) });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    res.json({ 
      email: profile.data.emailAddress,
      messagesTotal: profile.data.messagesTotal,
      threadsTotal: profile.data.threadsTotal
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// 6. Analisar caixa de entrada (Top Offenders)
app.get('/api/analyze', requireAuth, async (req, res) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: getAuthClient(req) });
    
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
    console.error('Erro na análise:', error);
    res.status(500).json({ error: 'Erro ao analisar emails' });
  }
});

// 7. Limpar emails de um remetente
app.post('/api/clean', requireAuth, async (req, res) => {
  const { sender } = req.body;
  const sanitizedSender = typeof sender === 'string' ? sender.trim() : '';

  if (!sanitizedSender) {
    return res.status(400).json({ error: 'Remetente não informado' });
  }

  if (!validateSender(sanitizedSender)) {
    return res.status(400).json({ error: 'Remetente inválido' });
  }

  try {
    const gmail = google.gmail({ version: 'v1', auth: getAuthClient(req) });
    
    // Buscar emails do remetente
    const searchQuery = `from:${sanitizedSender}`;
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults: 200
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
      sender: sanitizedSender,
      message: `${messageIds.length} emails movidos para lixeira`
    });

  } catch (error) {
    console.error('Erro ao limpar emails:', error);
    res.status(500).json({ error: 'Erro ao limpar emails' });
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

app.use((req, res) => {
  res.status(404).json({ error: 'Recurso não encontrado' });
});

app.use((err, req, res, next) => {
  console.error('Erro interno no servidor:', err);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

// ========== SERVIDOR ==========

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   🚀 Gmail Cleaner Buddy Backend         ║
║   📡 Servidor rodando em: ${PORT}           ║
║   🌐 http://localhost:${PORT}              ║
╚═══════════════════════════════════════════╝
  `);
});
