> ⚠️ **DOCUMENTO HISTÓRICO — NÃO USE ESTE CÓDIGO**

> Este guia descreve a PRIMEIRA versão do projeto e contém código com
> vulnerabilidades já corrigidas (cliente OAuth2 global, segredo de sessão com
> fallback, XSS via onclick inline, dependências desatualizadas). A referência
> atual é o código do repositório + README.md + SECURITY.md.

---

  Gmail Cleaner Buddy - Guia Completo OAuth2  \* { margin: 0; padding: 0; box-sizing: border-box; } :root { --bg: #0d1117; --card: #161b22; --border: #30363d; --text: #c9d1d9; --muted: #8b949e; --blue: #58a6ff; --green: #3fb950; --red: #f85149; --yellow: #d29922; --purple: #bc8cff; } body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; padding: 20px; } .container { max-width: 1200px; margin: 0 auto; } header { text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #4285f4, #34a853, #fbbc05, #ea4335); border-radius: 16px; margin-bottom: 40px; } header h1 { font-size: 42px; font-weight: 900; color: white; margin-bottom: 10px; } header p { font-size: 18px; color: rgba(255,255,255,0.9); } .section { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 30px; margin-bottom: 30px; } .section h2 { font-size: 28px; margin-bottom: 20px; color: var(--blue); display: flex; align-items: center; gap: 10px; } .section h3 { font-size: 22px; margin: 25px 0 15px; color: var(--green); } .section h4 { font-size: 18px; margin: 20px 0 10px; color: var(--yellow); } .code-block { background: #0d1117; border: 1px solid var(--border); border-radius: 8px; padding: 20px; margin: 15px 0; position: relative; overflow-x: auto; } .code-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid var(--border); } .code-title { font-family: 'Fira Code', monospace; font-size: 14px; font-weight: 700; color: var(--purple); } .copy-btn { background: var(--blue); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700; transition: 0.2s; } .copy-btn:hover { background: #1f6feb; transform: scale(1.05); } .copy-btn.copied { background: var(--green); } pre { margin: 0; font-family: 'Fira Code', monospace; font-size: 14px; line-height: 1.6; overflow-x: auto; } code { font-family: 'Fira Code', monospace; color: var(--text); } .step-list { list-style: none; counter-reset: step-counter; } .step-list li { counter-increment: step-counter; margin: 20px 0; padding-left: 50px; position: relative; } .step-list li::before { content: counter(step-counter); position: absolute; left: 0; top: 0; background: var(--blue); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; } .warning { background: rgba(248, 81, 73, 0.1); border-left: 4px solid var(--red); padding: 15px; border-radius: 6px; margin: 15px 0; } .info { background: rgba(88, 166, 255, 0.1); border-left: 4px solid var(--blue); padding: 15px; border-radius: 6px; margin: 15px 0; } .success { background: rgba(63, 185, 80, 0.1); border-left: 4px solid var(--green); padding: 15px; border-radius: 6px; margin: 15px 0; } .file-structure { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 15px; font-family: 'Fira Code', monospace; font-size: 14px; line-height: 1.8; } .folder::before { content: "📁 "; } .file::before { content: "📄 "; } a { color: var(--blue); text-decoration: none; font-weight: 600; } a:hover { text-decoration: underline; } .toc { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 25px; margin-bottom: 30px; } .toc h2 { color: var(--purple); margin-bottom: 15px; } .toc ul { list-style: none; } .toc li { margin: 10px 0; padding-left: 20px; } .toc a { color: var(--text); transition: 0.2s; } .toc a:hover { color: var(--blue); } .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; margin: 5px 5px 5px 0; } .badge-blue { background: rgba(88, 166, 255, 0.2); color: var(--blue); } .badge-green { background: rgba(63, 185, 80, 0.2); color: var(--green); } .badge-red { background: rgba(248, 81, 73, 0.2); color: var(--red); } .badge-yellow { background: rgba(210, 153, 34, 0.2); color: var(--yellow); } @media (max-width: 768px) { header h1 { font-size: 32px; } .section { padding: 20px; } .section h2 { font-size: 24px; } }

🚀 Gmail Cleaner Buddy
======================

Guia Completo — OAuth2 + Gmail API + Backend Node.js

📑 Índice
---------

*   [📁 Estrutura do Projeto](#estrutura)
*   [⚙️ Backend (server.js)](#backend)
*   [🎨 Frontend (index.html)](#frontend)
*   [📦 package.json](#package)
*   [🔑 Variáveis de Ambiente (.env)](#env)
*   [☁️ Configurar Google Cloud](#google-cloud)
*   [🛠️ Instalação](#instalacao)
*   [▶️ Como Executar](#execucao)
*   [🐛 Resolução de Problemas](#troubleshooting)

📁 Estrutura do Projeto
-----------------------

gmail-cleaner-buddy/ ├── server.js → Backend Node.js + Express ├── package.json → Dependências npm ├── .env → Credenciais (NÃO COMMITAR!) ├── .env.example → Template de configuração ├── .gitignore → Ignorar .env no Git ├── public/ │ └── index.html → Frontend da aplicação └── README.md → Documentação

⚙️ Backend — server.js
----------------------

Backend completo com OAuth2, Gmail API e endpoints para análise/limpeza.

server.js Copiar

    const express = require('express');
    const { google } = require('googleapis');
    const session = require('express-session');
    const path = require('path');
    require('dotenv').config();
    
    const app = express();
    const PORT = process.env.PORT || 3000;
    
    // Configuração do OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    // Middleware
    app.use(express.json());
    app.use(express.static('public'));
    app.use(session({
      secret: process.env.SESSION_SECRET || 'gmail-cleaner-secret-2024',
      resave: false,
      saveUninitialized: true,
      cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }
    }));
    
    // ========== ROTAS DE AUTENTICAÇÃO ==========
    
    // 1. Iniciar OAuth
    app.get('/auth/google', (req, res) => {
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/gmail.modify'
        ],
        prompt: 'consent'
      });
      res.redirect(authUrl);
    });
    
    // 2. Callback do Google
    app.get('/auth/google/callback', async (req, res) => {
      const { code } = req.query;
      
      if (!code) {
        return res.redirect('/?error=no_code');
      }
    
      try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        
        // Salvar tokens na sessão
        req.session.tokens = tokens;
        req.session.authenticated = true;
        
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
    app.post('/auth/logout', (req, res) => {
      req.session.destroy();
      res.json({ success: true });
    });
    
    // ========== ROTAS DA GMAIL API ==========
    
    // Middleware de autenticação
    const requireAuth = (req, res, next) => {
      if (!req.session.tokens) {
        return res.status(401).json({ error: 'Não autenticado' });
      }
      oauth2Client.setCredentials(req.session.tokens);
      next();
    };
    
    // 5. Buscar email do usuário
    app.get('/api/user', requireAuth, async (req, res) => {
      try {
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
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
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        
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
        res.status(500).json({ error: 'Erro ao analisar emails', details: error.message });
      }
    });
    
    // 7. Limpar emails de um remetente
    app.post('/api/clean', requireAuth, async (req, res) => {
      const { sender } = req.body;
      
      if (!sender) {
        return res.status(400).json({ error: 'Remetente não informado' });
      }
    
      try {
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        
        // Buscar emails do remetente
        const searchQuery = `from:${sender}`;
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
        console.error('Erro ao limpar emails:', error);
        res.status(500).json({ error: 'Erro ao limpar emails', details: error.message });
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

🎨 Frontend — public/index.html
-------------------------------

Interface moderna com autenticação OAuth2 e análise em tempo real.

public/index.html Copiar

    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Gmail Cleaner Buddy — OAuth2</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    
    <style>
    :root{
      --bg:#f4f7fb;
      --card:#ffffff;
      --line:#e6eaf0;
      --text:#172033;
      --muted:#667085;
      --blue:#4285f4;
      --green:#34a853;
      --red:#ea4335;
      --yellow:#fbbc05;
    }
    
    *{margin:0;padding:0;box-sizing:border-box;}
    
    body{
      font-family:'Inter',system-ui,sans-serif;
      background:radial-gradient(circle at top left, rgba(66,133,244,.12), transparent 25%),
                 radial-gradient(circle at top right, rgba(234,67,53,.10), transparent 25%),
                 var(--bg);
      color:var(--text);
      min-height:100vh;
    }
    
    .container{width:min(1100px,100%);margin:auto;padding:30px 18px;}
    
    .topbar{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:24px;flex-wrap:wrap;}
    
    .brand{display:flex;gap:14px;align-items:center;}
    
    .logo{
      width:58px;height:58px;border-radius:18px;
      background:linear-gradient(135deg,var(--blue),var(--green),var(--yellow),var(--red));
      display:grid;place-items:center;color:white;font-size:26px;font-weight:900;
      box-shadow:0 16px 40px rgba(66,133,244,.25);
    }
    
    h1{font-size:34px;font-weight:900;}
    
    .subtitle{color:var(--muted);margin-top:6px;font-size:14px;}
    
    .card{
      background:rgba(255,255,255,.92);border:1px solid var(--line);
      border-radius:28px;overflow:hidden;box-shadow:0 20px 50px rgba(16,24,40,.08);
    }
    
    .auth{padding:34px;text-align:center;}
    .auth h2{font-size:24px;margin-bottom:12px;}
    .auth p{color:var(--muted);line-height:1.6;margin-bottom:24px;}
    
    .btn{
      border:none;border-radius:16px;padding:15px 24px;font-weight:900;
      cursor:pointer;transition:.2s;font-size:14px;font-family:inherit;
    }
    
    .btn:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,0,0,.12);}
    
    .btn-google{
      background:white;color:var(--text);border:2px solid var(--line);
      display:inline-flex;align-items:center;gap:12px;
    }
    
    .btn-google img{width:24px;height:24px;}
    
    .btn.danger{background:linear-gradient(135deg,#ea4335,#d92d20);color:white;}
    .btn.secondary{background:white;border:1px solid var(--line);color:var(--text);}
    
    .results{display:none;}
    
    .panel-head{
      padding:26px;border-bottom:1px solid var(--line);
      display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px;
    }
    
    .panel-head h2{font-size:26px;}
    .panel-head p{color:var(--muted);margin-top:6px;font-size:14px;}
    
    .actions{display:flex;gap:10px;flex-wrap:wrap;}
    
    .stats{
      padding:24px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px;
    }
    
    .stat{
      background:white;border:1px solid var(--line);border-radius:20px;
      padding:18px;text-align:center;
    }
    
    .stat strong{display:block;font-size:28px;font-weight:900;}
    .stat span{font-size:11px;color:var(--muted);font-weight:800;text-transform:uppercase;}
    
    .content{display:grid;grid-template-columns:1fr;gap:18px;padding:0 24px 24px;}
    
    .list{background:white;border:1px solid var(--line);border-radius:22px;overflow:hidden;}
    .list-title{padding:18px;border-bottom:1px solid var(--line);font-weight:900;font-size:14px;}
    
    .offender{
      padding:16px 18px;border-bottom:1px solid #f2f4f7;
      display:grid;grid-template-columns:50px 1fr 140px 80px;gap:14px;align-items:center;
    }
    
    .offender:last-child{border-bottom:none;}
    .offender:hover{background:#fafbfc;}
    
    .rank{
      width:38px;height:38px;border-radius:14px;display:grid;place-items:center;
      font-weight:900;background:#f2f4f7;font-size:14px;
    }
    
    .r1{background:linear-gradient(135deg,#ea4335,#ff6b6b);color:white;}
    .r2{background:linear-gradient(135deg,#fbbc05,#ffe070);}
    .r3{background:linear-gradient(135deg,#4285f4,#6ea8fe);color:white;}
    
    .domain{font-weight:900;font-size:13px;}
    .cat{margin-top:4px;color:var(--muted);font-size:12px;}
    
    .count{text-align:right;font-weight:900;}
    .count small{display:block;color:var(--muted);font-size:11px;font-weight:600;}
    
    .btn-clean-single{
      padding:8px 12px;font-size:12px;border-radius:8px;
      background:var(--red);color:white;border:none;cursor:pointer;
      font-weight:800;transition:.2s;
    }
    
    .btn-clean-single:hover{transform:scale(1.05);}
    
    .loading{
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:rgba(0,0,0,.7);display:none;place-items:center;z-index:9999;
    }
    
    .loading.show{display:grid;}
    
    .spinner{
      width:60px;height:60px;border:6px solid rgba(255,255,255,.2);
      border-top-color:white;border-radius:50%;animation:spin 1s linear infinite;
    }
    
    @keyframes spin{to{transform:rotate(360deg);}}
    
    .toast{
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(90px);
      background:#172033;color:white;padding:14px 22px;border-radius:16px;
      font-weight:900;font-size:14px;transition:.3s;opacity:0;z-index:9999;
    }
    
    .toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
    
    @media(max-width:900px){
      .stats{grid-template-columns:repeat(2,1fr);}
      h1{font-size:26px;}
      .offender{grid-template-columns:40px 1fr 100px 70px;}
    }
    </style>
    </head>
    <body>
    
    <div class="container">
    
      <div class="topbar">
        <div class="brand">
          <div class="logo">G</div>
          <div>
            <h1>Gmail Cleaner Buddy</h1>
            <div class="subtitle">🔐 Conectado ao Gmail real via OAuth2</div>
          </div>
        </div>
      </div>
    
      <!-- AUTH -->
      <div class="card auth" id="authScreen">
        <h2>🔒 Conectar ao Gmail</h2>
        <p>Autorize o acesso seguro à sua conta Gmail para analisar e limpar emails em tempo real.</p>
        <button class="btn btn-google" onclick="loginGoogle()">
          <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTcuNiA5LjJsLS4xLTEuOEg5djMuNGg0LjhDMTMuNiAxMiAxMyAxMyAxMiAxMy42djIuMmgzYTguOCA4LjggMCAwIDAgMi42LTYuNnoiIGZpbGw9IiM0Mjg1RjQiIGZpbGwtcnVsZT0ibm9uemVybyIvPjxwYXRoIGQ9Ik05IDE4YzIuNCAwIDQuNS0uOCA2LTIuMmwtMy0yLjJhNS40IDUuNCAwIDAgMS04LTIuOUgxVjEzYTkgOSAwIDAgMCA4IDV6IiBmaWxsPSIjMzRBODUzIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNNCAxMC43YTUuNCA1LjQgMCAwIDEgMC0zLjRWNUgxYTkgOSAwIDAgMCAwIDhsMy0yLjN6IiBmaWxsPSIjRkJCQzA1IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48cGF0aCBkPSJNOSAzLjZjMS4zIDAgMi41LjQgMy40IDEuM0wxNSAyLjNBOSA5IDAgMCAwIDEgNWwzIDIuNGE1LjQgNS40IDAgMCAxIDUtMy43eiIgZmlsbD0iI0VBNDMzNSIgZmlsbC1ydWxlPSJub256ZXJvIi8+PHBhdGggZD0iTTAgMGgxOHYxOEgweiIvPjwvZz48L3N2Zz4=" alt="Google">
          Entrar com Google
        </button>
        <p style="margin-top:20px;font-size:12px;color:var(--muted);">
          ✅ Acesso read-only seguro<br>
          🔐 Autenticação OAuth2 oficial do Google
        </p>
      </div>
    
      <!-- RESULTS -->
      <div class="card results" id="resultsScreen">
        <div class="panel-head">
          <div>
            <h2>🏆 Top 10 ofensores reais</h2>
            <p id="userEmail"></p>
          </div>
          <div class="actions">
            <button class="btn secondary" onclick="refreshAnalysis()">🔄 Atualizar</button>
            <button class="btn danger" onclick="cleanAll()">🗑️ Limpar Top 10</button>
            <button class="btn secondary" onclick="logout()">🚪 Sair</button>
          </div>
        </div>
    
        <div class="stats">
          <div class="stat">
            <strong id="totalEmails">0</strong>
            <span>Total (Emails)</span>
          </div>
          <div class="stat">
            <strong id="totalSize">0</strong>
            <span>Espaço Total</span>
          </div>
          <div class="stat">
            <strong id="uniqueSenders">0</strong>
            <span>Remetentes Únicos</span>
          </div>
          <div class="stat">
            <strong id="top10Count">0</strong>
            <span>Top 10 (Emails)</span>
          </div>
        </div>
    
        <div class="content">
          <div class="list">
            <div class="list-title">📬 Remetentes com mais emails</div>
            <div id="offendersList"></div>
          </div>
        </div>
      </div>
    
    </div>
    
    <div class="loading" id="loading">
      <div class="spinner"></div>
    </div>
    
    <div class="toast" id="toast"></div>
    
    <script>
    let currentData = null;
    
    window.addEventListener('DOMContentLoaded', async () => {
      const params = new URLSearchParams(window.location.search);
      
      if (params.get('auth') === 'success') {
        toast('✅ Autenticado com sucesso!');
        window.history.replaceState({}, '', '/');
        await checkAuth();
      } else if (params.get('error')) {
        toast('❌ Erro na autenticação');
      } else {
        await checkAuth();
      }
    });
    
    async function checkAuth() {
      try {
        const res = await fetch('/auth/status');
        const data = await res.json();
        
        if (data.authenticated) {
          await loadUserData();
        }
      } catch (error) {
        console.error('Erro ao verificar auth:', error);
      }
    }
    
    function loginGoogle() {
      window.location.href = '/auth/google';
    }
    
    async function logout() {
      await fetch('/auth/logout', { method: 'POST' });
      location.reload();
    }
    
    async function loadUserData() {
      showLoading();
      
      try {
        const userRes = await fetch('/api/user');
        const userData = await userRes.json();
        
        document.getElementById('userEmail').textContent = `📧 ${userData.email}`;
        
        await refreshAnalysis();
        
        document.getElementById('authScreen').style.display = 'none';
        document.getElementById('resultsScreen').style.display = 'block';
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast('❌ Erro ao carregar dados');
      } finally {
        hideLoading();
      }
    }
    
    async function refreshAnalysis() {
      showLoading();
      toast('🔍 Analisando caixa postal...');
      
      try {
        const res = await fetch('/api/analyze');
        const data = await res.json();
        
        currentData = data;
        renderResults(data);
        toast('✅ Análise concluída!');
        
      } catch (error) {
        console.error('Erro na análise:', error);
        toast('❌ Erro ao analisar');
      } finally {
        hideLoading();
      }
    }
    
    function renderResults(data) {
      document.getElementById('totalEmails').textContent = formatNumber(data.totalMessages);
      document.getElementById('totalSize').textContent = formatSize(data.offenders.reduce((s, o) => s + o.size, 0));
      document.getElementById('uniqueSenders').textContent = formatNumber(data.uniqueSenders);
      document.getElementById('top10Count').textContent = formatNumber(data.top10.reduce((s, o) => s + o.count, 0));
      
      const list = document.getElementById('offendersList');
      list.innerHTML = '';
      
      data.top10.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'offender';
        div.innerHTML = `
          <div class="rank ${i===0?'r1':i===1?'r2':i===2?'r3':''}">${i+1}</div>
          <div>
            <div class="domain">${escapeHtml(item.domain)}</div>
            <div class="cat">${item.category}</div>
          </div>
          <div class="count">
            ${formatNumber(item.count)}
            <small>${formatSize(item.size)}</small>
          </div>
          <button class="btn-clean-single" onclick="cleanSender('${escapeHtml(item.domain)}')">Limpar</button>
        `;
        list.appendChild(div);
      });
    }
    
    async function cleanSender(sender) {
      if (!confirm(`Mover ${sender} para lixeira?`)) return;
      
      showLoading();
      
      try {
        const res = await fetch('/api/clean', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sender })
        });
        
        const data = await res.json();
        toast(`✅ ${data.removed} emails movidos para lixeira`);
        
        setTimeout(() => refreshAnalysis(), 1000);
        
      } catch (error) {
        console.error('Erro ao limpar:', error);
        toast('❌ Erro ao limpar emails');
      } finally {
        hideLoading();
      }
    }
    
    async function cleanAll() {
      if (!confirm('Mover TODOS os Top 10 para lixeira?')) return;
      
      showLoading();
      
      for (const item of currentData.top10) {
        try {
          await fetch('/api/clean', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender: item.domain })
          });
        } catch (error) {
          console.error(`Erro ao limpar ${item.domain}:`, error);
        }
      }
      
      toast('✅ Limpeza concluída!');
      setTimeout(() => refreshAnalysis(), 1000);
      hideLoading();
    }
    
    function showLoading() { document.getElementById('loading').classList.add('show'); }
    function hideLoading() { document.getElementById('loading').classList.remove('show'); }
    
    function toast(msg) {
      const el = document.getElementById('toast');
      el.textContent = msg;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 3000);
    }
    
    function formatNumber(n) { return Number(n).toLocaleString('pt-BR'); }
    
    function formatSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
    
    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
    </script>
    </body>
    </html>

📦 package.json
---------------

package.json Copiar

    {
      "name": "gmail-cleaner-buddy",
      "version": "2.0.0",
      "description": "Gmail Cleaner Buddy com OAuth2 e Gmail API",
      "main": "server.js",
      "scripts": {
        "start": "node server.js",
        "dev": "nodemon server.js"
      },
      "keywords": ["gmail", "cleaner", "oauth2", "google-api"],
      "author": "Seu Nome",
      "license": "MIT",
      "dependencies": {
        "express": "^4.18.2",
        "express-session": "^1.17.3",
        "googleapis": "^128.0.0",
        "dotenv": "^16.3.1"
      },
      "devDependencies": {
        "nodemon": "^3.0.1"
      }
    }

🔑 Variáveis de Ambiente — .env
-------------------------------

**⚠️ IMPORTANTE:** Nunca commite o arquivo `.env` no Git! Adicione ao `.gitignore`.

.env.example Copiar

    # Google OAuth2 Credentials
    GOOGLE_CLIENT_ID=seu-client-id-aqui.apps.googleusercontent.com
    GOOGLE_CLIENT_SECRET=seu-client-secret-aqui
    GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
    
    # Server
    PORT=3000
    NODE_ENV=development
    SESSION_SECRET=gmail-cleaner-secret-change-this-in-production
    
    # IMPORTANTE: Nunca commite o arquivo .env no Git!
    # Adicione ao .gitignore

### Criar arquivo .gitignore

.gitignore Copiar

    node_modules/
    .env
    .DS_Store
    *.log

☁️ Configurar Google Cloud Console
----------------------------------

**🔗 Link direto:** [https://console.cloud.google.com/](https://console.cloud.google.com/)

### Passo 1: Criar Projeto

1.  Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2.  Clique em **"Selecionar projeto"** → **"Novo Projeto"**
3.  Nome do projeto: `Gmail Cleaner Buddy`
4.  Clique em **"Criar"**

### Passo 2: Ativar Gmail API

1.  No menu lateral: **APIs e Serviços** → **Biblioteca**
2.  Busque: `Gmail API`
3.  Clique no resultado **"Gmail API"**
4.  Clique em **"Ativar"**

### Passo 3: Configurar Tela de Consentimento OAuth

1.  **APIs e Serviços** → **Tela de consentimento OAuth**
2.  Tipo de usuário: **Externo**
3.  Clique em **"Criar"**
4.  Preencha:
    *   **Nome do app:** Gmail Cleaner Buddy
    *   **Email de suporte:** seu@email.com
    *   **Domínio da página inicial:** localhost (para testes)
5.  Clique em **"Salvar e continuar"**
6.  Em **Escopos**, adicione:
    *   `https://www.googleapis.com/auth/gmail.readonly`
    *   `https://www.googleapis.com/auth/gmail.modify`
7.  Clique em **"Salvar e continuar"** até o fim

### Passo 4: Criar Credenciais OAuth 2.0

1.  **APIs e Serviços** → **Credenciais**
2.  Clique em **"+ Criar Credenciais"** → **"ID do cliente OAuth"**
3.  Tipo de aplicação: **Aplicação da Web**
4.  Nome: `Gmail Cleaner Web Client`
5.  **URIs de redirecionamento autorizados:** Adicione:
    
    http://localhost:3000/auth/google/callback
    
6.  Clique em **"Criar"**
7.  **🚨 COPIE o Client ID e Client Secret!**

**✅ Pronto!** Agora você tem:

*   **Client ID:** `123456-abc.apps.googleusercontent.com`
*   **Client Secret:** `GOCSPX-xyz123`

Cole esses valores no arquivo `.env`

🛠️ Instalação
--------------

### 1\. Criar estrutura do projeto

Terminal / CMD Copiar

    # Criar pasta do projeto
    mkdir gmail-cleaner-buddy
    cd gmail-cleaner-buddy
    
    # Criar pasta public
    mkdir public

### 2\. Criar arquivos

Crie os seguintes arquivos na raiz do projeto:

*   `server.js` — Cole o código do backend
*   `package.json` — Cole o código do package.json
*   `.env` — Cole e configure com suas credenciais
*   `.gitignore` — Cole o código do gitignore

Dentro da pasta `public/`:

*   `index.html` — Cole o código do frontend

### 3\. Instalar dependências

Terminal / CMD Copiar

    # Instalar dependências do Node.js
    npm install
    
    # Ou com Yarn
    yarn install

### 4\. Configurar credenciais

Edite o arquivo `.env` e cole suas credenciais do Google Cloud:

.env Copiar

    GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
    GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz
    GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
    PORT=3000
    NODE_ENV=development
    SESSION_SECRET=mude-isso-em-producao-use-senha-forte

▶️ Como Executar
----------------

### Iniciar servidor

Terminal / CMD Copiar

    # Modo produção
    npm start
    
    # Ou modo desenvolvimento (hot reload com nodemon)
    npm run dev

**✅ Servidor rodando!**

Abra no navegador: