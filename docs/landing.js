"use strict";
// GitHub Pages landing page — language switcher.
// Authored in TypeScript; compiled to docs/landing.js (tsconfig.landing.json).
// Default language: English, with a cascading menu for all README languages.
const LANGS = [
    { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
    { code: 'pt', label: 'PT', flag: '🇧🇷', name: 'Português' },
    { code: 'es', label: 'ES', flag: '🇪🇸', name: 'Español' },
    { code: 'fr', label: 'FR', flag: '🇫🇷', name: 'Français' },
    { code: 'it', label: 'IT', flag: '🇮🇹', name: 'Italiano' },
    { code: 'ru', label: 'RU', flag: '🇷🇺', name: 'Русский' },
    { code: 'zh', label: '中文', flag: '🇨🇳', name: '中文' }
];
const I18N = {
    en: {
        nav_features: 'Features', nav_how: 'How it works', nav_sec: 'Security', nav_code: 'Code',
        hero_badge: '✦ Open source · OAuth2 · Privacy-first',
        hero_title: 'Take back your Gmail inbox',
        hero_tag: 'Connect any Gmail account via OAuth2, see the Top 10 senders taking up the most space, and move their emails to the trash — in one click.',
        cta_github: '★ View on GitHub', cta_start: 'Get started',
        st1_l: 'Interface languages', st2_l: 'Google scope requested',
        st3_l: 'Data stored on servers', st4_l: 'Open-source license',
        feat_title: 'Why Gmail Cleaner Buddy',
        feat_sub: 'A small, self-hosted tool that does one thing well: find who is clogging your inbox and clear them out.',
        feat1_t: 'Secure OAuth2 login', feat1_d: "Sign in with Google's official account picker. No passwords are ever seen or stored by the app.",
        feat2_t: 'Top 10 offenders', feat2_d: 'Instantly see the senders taking up the most space and message count in your mailbox.',
        feat3_t: 'One-click cleanup', feat3_d: 'Move every email from a noisy sender straight to the trash with a single click.',
        feat4_t: 'Privacy-first', feat4_d: 'Your data is never stored on any server. Everything runs in your own session, hardened per OWASP Top 10.',
        prev_title: 'A look at the app',
        prev_sub: 'Once you sign in, the whole app is a single screen: your mailbox stats and the senders filling it up.',
        pv_analyzed: 'Emails analyzed', pv_space: 'Total space',
        pv_senders: 'Unique senders', pv_top10: 'Top 10 (emails)',
        pv_list: '📬 Senders with the most emails', pv_clean: 'Clean',
        pv_note: 'Illustration with sample data — the real app shows your own mailbox.',
        how_title: 'How it works', how_sub: "Run it locally in three steps — it's a lightweight Node + browser app.",
        step1_t: 'Configure Google Cloud', step1_d: 'Enable the Gmail API and create an OAuth 2.0 client. Full walkthrough in the instructions.',
        step2_t: 'Install & run', step2_d: 'Run <code>npm install</code> then <code>npm start</code> and open <code>localhost:3000</code>.',
        step3_t: 'Sign in & clean', step3_d: 'Sign in with Google, review the Top 10 senders, and hit Clean to reclaim space.',
        arch_title: 'Under the hood',
        arch_sub: 'Roughly 1,400 lines of TypeScript, no database and no third-party backend.',
        arch1_t: 'TypeScript end to end', arch1_d: 'Server, browser client and this very page are written in TypeScript and compiled before they run.',
        arch2_t: 'Node + Express server', arch2_d: 'A single <code>server.ts</code> drives the OAuth flow and exposes a small JSON API to the browser.',
        arch3_t: 'Official Gmail API', arch3_d: "Google's <code>googleapis</code> client lists your messages, groups them by sender and moves them with <code>batchModify</code>.",
        arch4_t: 'No database', arch4_d: 'Nothing is persisted: the access token lives in the server session and is gone the moment you sign out.',
        sec_title: 'Built with security in mind',
        sec_sub: 'The app follows the OWASP Top 10 checklist documented in SECURITY.md.',
        sec1_t: 'One restricted scope', sec1_d: 'Only <code>gmail.modify</code> is requested — enough to read and to trash, nothing more. Your password is never seen.',
        sec2_t: 'Hardened HTTP', sec2_d: 'Helmet sets a strict Content-Security-Policy, HSTS in production, a locked-down Permissions-Policy and <code>no-store</code> on every API response.',
        sec3_t: 'Short session, CSRF-checked', sec3_d: 'The signed httpOnly cookie lasts one hour — the same life as the Google access token — and every API call is verified as same-origin.',
        sec4_t: 'Rate limited', sec4_d: 'Up to 100 API requests and 10 sign-in attempts per 15 minutes, per IP address.',
        lim_title: 'Good to know',
        lim_sub: 'A few honest limits before you run it.',
        lim1_t: 'Analyzes a recent sample', lim1_d: 'The scan covers your 500 most recent messages; exact totals are then fetched for the senders at the top.',
        lim2_t: 'Cleaning is bulk and fast', lim2_d: 'Messages are moved with <code>batchModify</code>, up to 1,000 per call — hundreds of emails clear in seconds.',
        lim3_t: 'Nothing is deleted forever', lim3_d: 'Emails are moved to the Gmail trash, where you can restore them for 30 days.',
        lim4_t: 'Testing mode by default', lim4_d: 'While the Google project is unverified, only accounts added as test users (up to 100) can sign in.',
        selfhost: 'Gmail Cleaner Buddy is an open-source, self-hosted application (Node server + browser). This page explains the project; to actually clean your inbox, run the app on your own machine following the instructions. Available in English, Português, Español, Français, Italiano, Русский and 中文.',
        f_repo: 'Repository', f_docs: 'Instructions', f_sec: 'Security', f_priv: 'Privacy', f_terms: 'Terms', f_lic: 'License'
    },
    pt: {
        nav_features: 'Recursos', nav_how: 'Como funciona', nav_sec: 'Segurança', nav_code: 'Código',
        hero_badge: '✦ Código aberto · OAuth2 · Privacidade em primeiro lugar',
        hero_title: 'Recupere sua caixa do Gmail',
        hero_tag: 'Conecte qualquer conta Gmail via OAuth2, veja os Top 10 remetentes que mais ocupam espaço e mova os emails deles para a lixeira — em um clique.',
        cta_github: '★ Ver no GitHub', cta_start: 'Começar',
        st1_l: 'Idiomas na interface', st2_l: 'Escopo pedido ao Google',
        st3_l: 'Dados guardados em servidor', st4_l: 'Licença de código aberto',
        feat_title: 'Por que o Gmail Cleaner Buddy',
        feat_sub: 'Uma ferramenta pequena e auto-hospedada que faz uma coisa bem: descobrir quem entope sua caixa e limpar tudo.',
        feat1_t: 'Login OAuth2 seguro', feat1_d: 'Entre com o seletor de contas oficial do Google. O app nunca vê nem armazena senhas.',
        feat2_t: 'Top 10 ofensores', feat2_d: 'Veja na hora os remetentes que mais ocupam espaço e quantidade de mensagens na sua caixa.',
        feat3_t: 'Limpeza em um clique', feat3_d: 'Mova todos os emails de um remetente barulhento direto para a lixeira com um único clique.',
        feat4_t: 'Privacidade em primeiro lugar', feat4_d: 'Seus dados nunca são armazenados em servidor. Tudo roda na sua própria sessão, endurecido conforme o OWASP Top 10.',
        prev_title: 'Uma olhada no app',
        prev_sub: 'Depois do login, o app inteiro é uma tela só: as estatísticas da sua caixa e os remetentes que a lotam.',
        pv_analyzed: 'Emails analisados', pv_space: 'Espaço total',
        pv_senders: 'Remetentes únicos', pv_top10: 'Top 10 (emails)',
        pv_list: '📬 Remetentes com mais emails', pv_clean: 'Limpar',
        pv_note: 'Ilustração com dados de exemplo — o app real mostra a sua própria caixa.',
        how_title: 'Como funciona', how_sub: 'Execute localmente em três passos — é um app leve de Node + navegador.',
        step1_t: 'Configurar o Google Cloud', step1_d: 'Ative a Gmail API e crie um cliente OAuth 2.0. Passo a passo completo nas instruções.',
        step2_t: 'Instalar e executar', step2_d: 'Rode <code>npm install</code>, depois <code>npm start</code> e abra <code>localhost:3000</code>.',
        step3_t: 'Entrar e limpar', step3_d: 'Entre com o Google, revise os Top 10 remetentes e clique em Limpar para recuperar espaço.',
        arch_title: 'Por dentro',
        arch_sub: 'Cerca de 1.400 linhas de TypeScript, sem banco de dados e sem backend de terceiros.',
        arch1_t: 'TypeScript de ponta a ponta', arch1_d: 'Servidor, cliente do navegador e esta própria página são escritos em TypeScript e compilados antes de rodar.',
        arch2_t: 'Servidor Node + Express', arch2_d: 'Um único <code>server.ts</code> conduz o fluxo OAuth e expõe uma pequena API JSON ao navegador.',
        arch3_t: 'Gmail API oficial', arch3_d: 'O cliente <code>googleapis</code> do Google lista suas mensagens, agrupa por remetente e as move com <code>batchModify</code>.',
        arch4_t: 'Sem banco de dados', arch4_d: 'Nada é persistido: o token de acesso vive na sessão do servidor e some no instante em que você sai.',
        sec_title: 'Feito pensando em segurança',
        sec_sub: 'O app segue o checklist do OWASP Top 10 documentado no SECURITY.md.',
        sec1_t: 'Um único escopo restrito', sec1_d: 'Só o <code>gmail.modify</code> é pedido — o suficiente para ler e mandar para a lixeira, nada além. Sua senha nunca é vista.',
        sec2_t: 'HTTP endurecido', sec2_d: 'O Helmet aplica uma Content-Security-Policy estrita, HSTS em produção, uma Permissions-Policy travada e <code>no-store</code> em toda resposta de API.',
        sec3_t: 'Sessão curta, com checagem CSRF', sec3_d: 'O cookie assinado httpOnly dura uma hora — a mesma vida do access token do Google — e cada chamada de API é verificada como mesma origem.',
        sec4_t: 'Com limite de requisições', sec4_d: 'Até 100 requisições de API e 10 tentativas de login a cada 15 minutos, por endereço IP.',
        lim_title: 'Bom saber',
        lim_sub: 'Alguns limites honestos antes de você executar.',
        lim1_t: 'Analisa uma amostra recente', lim1_d: 'A varredura cobre suas 500 mensagens mais recentes; depois, os totais exatos são buscados para os remetentes do topo.',
        lim2_t: 'A limpeza é em lote e rápida', lim2_d: 'As mensagens são movidas com <code>batchModify</code>, até 1.000 por chamada — centenas de emails saem em segundos.',
        lim3_t: 'Nada é apagado para sempre', lim3_d: 'Os emails vão para a lixeira do Gmail, de onde você pode restaurá-los por 30 dias.',
        lim4_t: 'Modo de teste por padrão', lim4_d: 'Enquanto o projeto do Google não for verificado, só contas adicionadas como test users (até 100) conseguem entrar.',
        selfhost: 'O Gmail Cleaner Buddy é uma aplicação de código aberto e auto-hospedada (servidor Node + navegador). Esta página explica o projeto; para de fato limpar sua caixa, execute o app na sua própria máquina seguindo as instruções. Disponível em English, Português, Español, Français, Italiano, Русский e 中文.',
        f_repo: 'Repositório', f_docs: 'Instruções', f_sec: 'Segurança', f_priv: 'Privacidade', f_terms: 'Termos', f_lic: 'Licença'
    },
    es: {
        nav_features: 'Funciones', nav_how: 'Cómo funciona', nav_sec: 'Seguridad', nav_code: 'Código',
        hero_badge: '✦ Código abierto · OAuth2 · La privacidad primero',
        hero_title: 'Recupera tu bandeja de Gmail',
        hero_tag: 'Conecta cualquier cuenta de Gmail mediante OAuth2, mira los 10 principales remitentes que más espacio ocupan y mueve sus correos a la papelera — con un clic.',
        cta_github: '★ Ver en GitHub', cta_start: 'Empezar',
        st1_l: 'Idiomas de la interfaz', st2_l: 'Ámbito pedido a Google',
        st3_l: 'Datos guardados en servidores', st4_l: 'Licencia de código abierto',
        feat_title: 'Por qué Gmail Cleaner Buddy',
        feat_sub: 'Una herramienta pequeña y autoalojada que hace una cosa bien: encontrar quién satura tu bandeja y limpiarlo.',
        feat1_t: 'Inicio de sesión OAuth2 seguro', feat1_d: 'Inicia sesión con el selector de cuentas oficial de Google. La app nunca ve ni guarda contraseñas.',
        feat2_t: 'Top 10 infractores', feat2_d: 'Ve al instante los remitentes que más espacio y mensajes ocupan en tu buzón.',
        feat3_t: 'Limpieza con un clic', feat3_d: 'Mueve todos los correos de un remitente molesto directo a la papelera con un solo clic.',
        feat4_t: 'La privacidad primero', feat4_d: 'Tus datos nunca se guardan en ningún servidor. Todo se ejecuta en tu propia sesión, reforzado según el OWASP Top 10.',
        prev_title: 'Un vistazo a la app',
        prev_sub: 'Tras iniciar sesión, toda la app es una sola pantalla: las estadísticas de tu buzón y los remitentes que lo llenan.',
        pv_analyzed: 'Correos analizados', pv_space: 'Espacio total',
        pv_senders: 'Remitentes únicos', pv_top10: 'Top 10 (correos)',
        pv_list: '📬 Remitentes con más correos', pv_clean: 'Limpiar',
        pv_note: 'Ilustración con datos de ejemplo — la app real muestra tu propio buzón.',
        how_title: 'Cómo funciona', how_sub: 'Ejecútalo localmente en tres pasos — es una app ligera de Node + navegador.',
        step1_t: 'Configurar Google Cloud', step1_d: 'Activa la Gmail API y crea un cliente OAuth 2.0. Guía completa en las instrucciones.',
        step2_t: 'Instalar y ejecutar', step2_d: 'Ejecuta <code>npm install</code>, luego <code>npm start</code> y abre <code>localhost:3000</code>.',
        step3_t: 'Inicia sesión y limpia', step3_d: 'Inicia sesión con Google, revisa los 10 principales remitentes y pulsa Limpiar para recuperar espacio.',
        arch_title: 'Por dentro',
        arch_sub: 'Unas 1.400 líneas de TypeScript, sin base de datos y sin backend de terceros.',
        arch1_t: 'TypeScript de principio a fin', arch1_d: 'El servidor, el cliente del navegador y esta misma página están escritos en TypeScript y se compilan antes de ejecutarse.',
        arch2_t: 'Servidor Node + Express', arch2_d: 'Un único <code>server.ts</code> maneja el flujo OAuth y expone una pequeña API JSON al navegador.',
        arch3_t: 'Gmail API oficial', arch3_d: 'El cliente <code>googleapis</code> de Google lista tus mensajes, los agrupa por remitente y los mueve con <code>batchModify</code>.',
        arch4_t: 'Sin base de datos', arch4_d: 'No se persiste nada: el token de acceso vive en la sesión del servidor y desaparece en cuanto cierras sesión.',
        sec_title: 'Creada pensando en la seguridad',
        sec_sub: 'La app sigue la lista del OWASP Top 10 documentada en SECURITY.md.',
        sec1_t: 'Un solo ámbito restringido', sec1_d: 'Solo se pide <code>gmail.modify</code> — lo justo para leer y enviar a la papelera, nada más. Tu contraseña nunca se ve.',
        sec2_t: 'HTTP reforzado', sec2_d: 'Helmet aplica una Content-Security-Policy estricta, HSTS en producción, una Permissions-Policy restringida y <code>no-store</code> en cada respuesta de la API.',
        sec3_t: 'Sesión corta, verificada contra CSRF', sec3_d: 'La cookie firmada httpOnly dura una hora — la misma vida que el token de acceso de Google — y cada llamada a la API se verifica como del mismo origen.',
        sec4_t: 'Con límite de peticiones', sec4_d: 'Hasta 100 peticiones de API y 10 intentos de inicio de sesión cada 15 minutos, por dirección IP.',
        lim_title: 'Conviene saber',
        lim_sub: 'Algunos límites honestos antes de ejecutarla.',
        lim1_t: 'Analiza una muestra reciente', lim1_d: 'El escaneo cubre tus 500 mensajes más recientes; después se obtienen los totales exactos de los remitentes que encabezan la lista.',
        lim2_t: 'La limpieza es masiva y rápida', lim2_d: 'Los mensajes se mueven con <code>batchModify</code>, hasta 1.000 por llamada — cientos de correos desaparecen en segundos.',
        lim3_t: 'Nada se borra para siempre', lim3_d: 'Los correos van a la papelera de Gmail, donde puedes restaurarlos durante 30 días.',
        lim4_t: 'Modo de prueba por defecto', lim4_d: 'Mientras el proyecto de Google no esté verificado, solo pueden entrar las cuentas añadidas como test users (hasta 100).',
        selfhost: 'Gmail Cleaner Buddy es una aplicación de código abierto y autoalojada (servidor Node + navegador). Esta página explica el proyecto; para limpiar realmente tu bandeja, ejecuta la app en tu propia máquina siguiendo las instrucciones. Disponible en English, Português, Español, Français, Italiano, Русский y 中文.',
        f_repo: 'Repositorio', f_docs: 'Instrucciones', f_sec: 'Seguridad', f_priv: 'Privacidad', f_terms: 'Términos', f_lic: 'Licencia'
    },
    fr: {
        nav_features: 'Fonctionnalités', nav_how: 'Comment ça marche', nav_sec: 'Sécurité', nav_code: 'Code',
        hero_badge: '✦ Open source · OAuth2 · Priorité à la vie privée',
        hero_title: 'Reprenez votre boîte Gmail',
        hero_tag: 'Connectez n’importe quel compte Gmail via OAuth2, voyez les 10 principaux expéditeurs qui occupent le plus d’espace et déplacez leurs e-mails vers la corbeille — en un clic.',
        cta_github: '★ Voir sur GitHub', cta_start: 'Commencer',
        st1_l: 'Langues de l’interface', st2_l: 'Champ demandé à Google',
        st3_l: 'Données stockées sur serveur', st4_l: 'Licence open source',
        feat_title: 'Pourquoi Gmail Cleaner Buddy',
        feat_sub: 'Un petit outil auto-hébergé qui fait bien une seule chose : trouver qui encombre votre boîte et faire le ménage.',
        feat1_t: 'Connexion OAuth2 sécurisée', feat1_d: 'Connectez-vous avec le sélecteur de comptes officiel de Google. L’app ne voit ni ne stocke jamais de mot de passe.',
        feat2_t: 'Top 10 des encombrants', feat2_d: 'Voyez immédiatement les expéditeurs qui occupent le plus d’espace et de messages dans votre boîte.',
        feat3_t: 'Nettoyage en un clic', feat3_d: 'Déplacez tous les e-mails d’un expéditeur bruyant directement vers la corbeille d’un seul clic.',
        feat4_t: 'Priorité à la vie privée', feat4_d: 'Vos données ne sont jamais stockées sur un serveur. Tout s’exécute dans votre propre session, durcie selon l’OWASP Top 10.',
        prev_title: 'Un aperçu de l’app',
        prev_sub: 'Une fois connecté, toute l’app tient sur un seul écran : les statistiques de votre boîte et les expéditeurs qui la remplissent.',
        pv_analyzed: 'E-mails analysés', pv_space: 'Espace total',
        pv_senders: 'Expéditeurs uniques', pv_top10: 'Top 10 (e-mails)',
        pv_list: '📬 Expéditeurs avec le plus d’e-mails', pv_clean: 'Nettoyer',
        pv_note: 'Illustration avec des données d’exemple — l’app réelle affiche votre propre boîte.',
        how_title: 'Comment ça marche', how_sub: 'Exécutez-le localement en trois étapes — c’est une app légère Node + navigateur.',
        step1_t: 'Configurer Google Cloud', step1_d: 'Activez l’API Gmail et créez un client OAuth 2.0. Guide complet dans les instructions.',
        step2_t: 'Installer et exécuter', step2_d: 'Lancez <code>npm install</code> puis <code>npm start</code> et ouvrez <code>localhost:3000</code>.',
        step3_t: 'Se connecter et nettoyer', step3_d: 'Connectez-vous avec Google, examinez les 10 principaux expéditeurs et cliquez sur Nettoyer pour récupérer de l’espace.',
        arch_title: 'Sous le capot',
        arch_sub: 'Environ 1 400 lignes de TypeScript, sans base de données ni backend tiers.',
        arch1_t: 'TypeScript de bout en bout', arch1_d: 'Le serveur, le client navigateur et cette page même sont écrits en TypeScript et compilés avant exécution.',
        arch2_t: 'Serveur Node + Express', arch2_d: 'Un unique <code>server.ts</code> pilote le flux OAuth et expose une petite API JSON au navigateur.',
        arch3_t: 'API Gmail officielle', arch3_d: 'Le client <code>googleapis</code> de Google liste vos messages, les regroupe par expéditeur et les déplace avec <code>batchModify</code>.',
        arch4_t: 'Aucune base de données', arch4_d: 'Rien n’est persisté : le jeton d’accès vit dans la session serveur et disparaît dès que vous vous déconnectez.',
        sec_title: 'Conçue avec la sécurité en tête',
        sec_sub: 'L’app suit la checklist OWASP Top 10 documentée dans SECURITY.md.',
        sec1_t: 'Un seul champ restreint', sec1_d: 'Seul <code>gmail.modify</code> est demandé — de quoi lire et mettre à la corbeille, rien de plus. Votre mot de passe n’est jamais vu.',
        sec2_t: 'HTTP durci', sec2_d: 'Helmet applique une Content-Security-Policy stricte, HSTS en production, une Permissions-Policy verrouillée et <code>no-store</code> sur chaque réponse d’API.',
        sec3_t: 'Session courte, vérifiée contre le CSRF', sec3_d: 'Le cookie signé httpOnly dure une heure — la même durée que le jeton d’accès Google — et chaque appel d’API est vérifié comme provenant de la même origine.',
        sec4_t: 'Limitation de débit', sec4_d: 'Jusqu’à 100 requêtes d’API et 10 tentatives de connexion par tranche de 15 minutes, par adresse IP.',
        lim_title: 'Bon à savoir',
        lim_sub: 'Quelques limites honnêtes avant de vous lancer.',
        lim1_t: 'Analyse un échantillon récent', lim1_d: 'Le scan couvre vos 500 messages les plus récents ; les totaux exacts sont ensuite récupérés pour les expéditeurs en tête.',
        lim2_t: 'Le nettoyage est groupé et rapide', lim2_d: 'Les messages sont déplacés avec <code>batchModify</code>, jusqu’à 1 000 par appel — des centaines d’e-mails disparaissent en quelques secondes.',
        lim3_t: 'Rien n’est supprimé définitivement', lim3_d: 'Les e-mails vont dans la corbeille Gmail, où vous pouvez les restaurer pendant 30 jours.',
        lim4_t: 'Mode test par défaut', lim4_d: 'Tant que le projet Google n’est pas vérifié, seuls les comptes ajoutés comme test users (jusqu’à 100) peuvent se connecter.',
        selfhost: 'Gmail Cleaner Buddy est une application open source et auto-hébergée (serveur Node + navigateur). Cette page présente le projet ; pour réellement nettoyer votre boîte, exécutez l’app sur votre propre machine en suivant les instructions. Disponible en English, Português, Español, Français, Italiano, Русский et 中文.',
        f_repo: 'Dépôt', f_docs: 'Instructions', f_sec: 'Sécurité', f_priv: 'Confidentialité', f_terms: 'Conditions', f_lic: 'Licence'
    },
    it: {
        nav_features: 'Funzionalità', nav_how: 'Come funziona', nav_sec: 'Sicurezza', nav_code: 'Codice',
        hero_badge: '✦ Open source · OAuth2 · Privacy al primo posto',
        hero_title: 'Riprenditi la tua casella Gmail',
        hero_tag: 'Collega qualsiasi account Gmail tramite OAuth2, guarda i Top 10 mittenti che occupano più spazio e sposta le loro email nel cestino — con un clic.',
        cta_github: '★ Vedi su GitHub', cta_start: 'Inizia',
        st1_l: 'Lingue dell’interfaccia', st2_l: 'Ambito richiesto a Google',
        st3_l: 'Dati salvati sui server', st4_l: 'Licenza open source',
        feat_title: 'Perché Gmail Cleaner Buddy',
        feat_sub: 'Uno strumento piccolo e self-hosted che fa bene una cosa sola: scoprire chi intasa la tua casella e ripulirla.',
        feat1_t: 'Accesso OAuth2 sicuro', feat1_d: 'Accedi con il selettore di account ufficiale di Google. L’app non vede né memorizza mai le password.',
        feat2_t: 'Top 10 responsabili', feat2_d: 'Vedi subito i mittenti che occupano più spazio e più messaggi nella tua casella.',
        feat3_t: 'Pulizia con un clic', feat3_d: 'Sposta tutte le email di un mittente invadente direttamente nel cestino con un solo clic.',
        feat4_t: 'Privacy al primo posto', feat4_d: 'I tuoi dati non vengono mai salvati su alcun server. Tutto gira nella tua sessione, irrobustita secondo l’OWASP Top 10.',
        prev_title: 'Uno sguardo all’app',
        prev_sub: 'Dopo l’accesso, l’intera app è una sola schermata: le statistiche della casella e i mittenti che la riempiono.',
        pv_analyzed: 'Email analizzate', pv_space: 'Spazio totale',
        pv_senders: 'Mittenti unici', pv_top10: 'Top 10 (email)',
        pv_list: '📬 Mittenti con più email', pv_clean: 'Pulisci',
        pv_note: 'Illustrazione con dati di esempio — l’app reale mostra la tua casella.',
        how_title: 'Come funziona', how_sub: 'Eseguila in locale in tre passaggi — è un’app leggera Node + browser.',
        step1_t: 'Configura Google Cloud', step1_d: 'Attiva la Gmail API e crea un client OAuth 2.0. Guida completa nelle istruzioni.',
        step2_t: 'Installa ed esegui', step2_d: 'Esegui <code>npm install</code>, poi <code>npm start</code> e apri <code>localhost:3000</code>.',
        step3_t: 'Accedi e pulisci', step3_d: 'Accedi con Google, controlla i Top 10 mittenti e premi Pulisci per recuperare spazio.',
        arch_title: 'Sotto il cofano',
        arch_sub: 'Circa 1.400 righe di TypeScript, senza database e senza backend di terze parti.',
        arch1_t: 'TypeScript dall’inizio alla fine', arch1_d: 'Server, client del browser e questa stessa pagina sono scritti in TypeScript e compilati prima dell’esecuzione.',
        arch2_t: 'Server Node + Express', arch2_d: 'Un unico <code>server.ts</code> gestisce il flusso OAuth ed espone una piccola API JSON al browser.',
        arch3_t: 'Gmail API ufficiale', arch3_d: 'Il client <code>googleapis</code> di Google elenca i messaggi, li raggruppa per mittente e li sposta con <code>batchModify</code>.',
        arch4_t: 'Nessun database', arch4_d: 'Nulla viene conservato: il token di accesso vive nella sessione del server e sparisce appena esci.',
        sec_title: 'Costruita pensando alla sicurezza',
        sec_sub: 'L’app segue la checklist OWASP Top 10 documentata in SECURITY.md.',
        sec1_t: 'Un solo ambito ristretto', sec1_d: 'Viene richiesto solo <code>gmail.modify</code> — quanto basta per leggere e cestinare, niente di più. La tua password non viene mai vista.',
        sec2_t: 'HTTP irrobustito', sec2_d: 'Helmet applica una Content-Security-Policy rigorosa, HSTS in produzione, una Permissions-Policy blindata e <code>no-store</code> su ogni risposta dell’API.',
        sec3_t: 'Sessione breve, con verifica CSRF', sec3_d: 'Il cookie firmato httpOnly dura un’ora — la stessa vita del token di accesso Google — e ogni chiamata all’API viene verificata come stessa origine.',
        sec4_t: 'Con limite di richieste', sec4_d: 'Fino a 100 richieste API e 10 tentativi di accesso ogni 15 minuti, per indirizzo IP.',
        lim_title: 'Buono a sapersi',
        lim_sub: 'Qualche limite dichiarato apertamente prima di eseguirla.',
        lim1_t: 'Analizza un campione recente', lim1_d: 'La scansione copre i tuoi 500 messaggi più recenti; poi vengono recuperati i totali esatti per i mittenti in cima.',
        lim2_t: 'La pulizia è massiva e veloce', lim2_d: 'I messaggi vengono spostati con <code>batchModify</code>, fino a 1.000 per chiamata — centinaia di email spariscono in pochi secondi.',
        lim3_t: 'Niente viene cancellato per sempre', lim3_d: 'Le email finiscono nel cestino di Gmail, da cui puoi ripristinarle per 30 giorni.',
        lim4_t: 'Modalità test come impostazione predefinita', lim4_d: 'Finché il progetto Google non è verificato, possono accedere solo gli account aggiunti come test users (fino a 100).',
        selfhost: 'Gmail Cleaner Buddy è un’applicazione open source e self-hosted (server Node + browser). Questa pagina spiega il progetto; per pulire davvero la tua casella, esegui l’app sul tuo computer seguendo le istruzioni. Disponibile in English, Português, Español, Français, Italiano, Русский e 中文.',
        f_repo: 'Repository', f_docs: 'Istruzioni', f_sec: 'Sicurezza', f_priv: 'Privacy', f_terms: 'Termini', f_lic: 'Licenza'
    },
    ru: {
        nav_features: 'Возможности', nav_how: 'Как это работает', nav_sec: 'Безопасность', nav_code: 'Код',
        hero_badge: '✦ Открытый код · OAuth2 · Приватность прежде всего',
        hero_title: 'Верните себе почтовый ящик Gmail',
        hero_tag: 'Подключите любой аккаунт Gmail через OAuth2, посмотрите 10 главных отправителей, занимающих больше всего места, и переместите их письма в корзину — одним нажатием.',
        cta_github: '★ Смотреть на GitHub', cta_start: 'Начать',
        st1_l: 'Языков интерфейса', st2_l: 'Запрашиваемая область доступа',
        st3_l: 'Данных хранится на серверах', st4_l: 'Лицензия с открытым кодом',
        feat_title: 'Почему Gmail Cleaner Buddy',
        feat_sub: 'Небольшой самостоятельно размещаемый инструмент, который хорошо делает одно: находит, кто забивает ваш ящик, и вычищает его.',
        feat1_t: 'Безопасный вход через OAuth2', feat1_d: 'Вход через официальный выбор аккаунта Google. Приложение никогда не видит и не хранит пароли.',
        feat2_t: 'Топ-10 нарушителей', feat2_d: 'Мгновенно увидьте отправителей, занимающих больше всего места и сообщений в вашем ящике.',
        feat3_t: 'Очистка одним нажатием', feat3_d: 'Переместите все письма шумного отправителя прямо в корзину одним нажатием.',
        feat4_t: 'Приватность прежде всего', feat4_d: 'Ваши данные никогда не хранятся ни на одном сервере. Всё работает в вашей сессии, усиленной по OWASP Top 10.',
        prev_title: 'Как выглядит приложение',
        prev_sub: 'После входа всё приложение — это один экран: статистика ящика и отправители, которые его заполняют.',
        pv_analyzed: 'Писем проанализировано', pv_space: 'Всего места',
        pv_senders: 'Уникальных отправителей', pv_top10: 'Топ-10 (письма)',
        pv_list: '📬 Отправители с наибольшим числом писем', pv_clean: 'Очистить',
        pv_note: 'Иллюстрация с примерными данными — реальное приложение показывает ваш собственный ящик.',
        how_title: 'Как это работает', how_sub: 'Запустите локально за три шага — это лёгкое приложение Node + браузер.',
        step1_t: 'Настроить Google Cloud', step1_d: 'Включите Gmail API и создайте клиент OAuth 2.0. Полное пошаговое руководство в инструкциях.',
        step2_t: 'Установить и запустить', step2_d: 'Выполните <code>npm install</code>, затем <code>npm start</code> и откройте <code>localhost:3000</code>.',
        step3_t: 'Войти и очистить', step3_d: 'Войдите через Google, просмотрите 10 главных отправителей и нажмите «Очистить», чтобы освободить место.',
        arch_title: 'Под капотом',
        arch_sub: 'Около 1400 строк TypeScript, без базы данных и без стороннего бэкенда.',
        arch1_t: 'TypeScript от начала до конца', arch1_d: 'Сервер, браузерный клиент и сама эта страница написаны на TypeScript и компилируются перед запуском.',
        arch2_t: 'Сервер Node + Express', arch2_d: 'Единственный <code>server.ts</code> ведёт поток OAuth и предоставляет браузеру небольшой JSON API.',
        arch3_t: 'Официальный Gmail API', arch3_d: 'Клиент <code>googleapis</code> от Google получает список писем, группирует их по отправителю и перемещает через <code>batchModify</code>.',
        arch4_t: 'Без базы данных', arch4_d: 'Ничего не сохраняется: токен доступа живёт в серверной сессии и исчезает в момент выхода.',
        sec_title: 'Сделано с мыслью о безопасности',
        sec_sub: 'Приложение следует чек-листу OWASP Top 10, описанному в SECURITY.md.',
        sec1_t: 'Одна ограниченная область доступа', sec1_d: 'Запрашивается только <code>gmail.modify</code> — достаточно, чтобы читать и отправлять в корзину, и не более. Ваш пароль никогда не виден.',
        sec2_t: 'Усиленный HTTP', sec2_d: 'Helmet задаёт строгую Content-Security-Policy, HSTS в продакшне, ограниченную Permissions-Policy и <code>no-store</code> для каждого ответа API.',
        sec3_t: 'Короткая сессия с проверкой CSRF', sec3_d: 'Подписанный httpOnly cookie живёт один час — столько же, сколько токен доступа Google — и каждый вызов API проверяется на совпадение источника.',
        sec4_t: 'Ограничение частоты запросов', sec4_d: 'До 100 запросов к API и 10 попыток входа за 15 минут с одного IP-адреса.',
        lim_title: 'Полезно знать',
        lim_sub: 'Несколько честных ограничений перед запуском.',
        lim1_t: 'Анализирует свежую выборку', lim1_d: 'Сканирование охватывает 500 последних писем; затем для отправителей из верхней части списка запрашиваются точные итоги.',
        lim2_t: 'Очистка массовая и быстрая', lim2_d: 'Письма перемещаются через <code>batchModify</code>, до 1000 за вызов — сотни писем убираются за секунды.',
        lim3_t: 'Ничего не удаляется навсегда', lim3_d: 'Письма попадают в корзину Gmail, откуда их можно восстановить в течение 30 дней.',
        lim4_t: 'По умолчанию режим тестирования', lim4_d: 'Пока проект Google не проверен, войти могут только аккаунты, добавленные как test users (до 100).',
        selfhost: 'Gmail Cleaner Buddy — это приложение с открытым кодом, размещаемое самостоятельно (сервер Node + браузер). Эта страница рассказывает о проекте; чтобы действительно очистить ящик, запустите приложение на своём компьютере по инструкции. Доступно на English, Português, Español, Français, Italiano, Русский и 中文.',
        f_repo: 'Репозиторий', f_docs: 'Инструкции', f_sec: 'Безопасность', f_priv: 'Конфиденциальность', f_terms: 'Условия', f_lic: 'Лицензия'
    },
    zh: {
        nav_features: '功能', nav_how: '工作原理', nav_sec: '安全', nav_code: '代码',
        hero_badge: '✦ 开源 · OAuth2 · 隐私优先',
        hero_title: '重新掌控你的 Gmail 收件箱',
        hero_tag: '通过 OAuth2 连接任意 Gmail 账号，查看占用空间最多的前 10 名发件人，一键将他们的邮件移至垃圾箱。',
        cta_github: '★ 在 GitHub 查看', cta_start: '开始使用',
        st1_l: '界面语言', st2_l: '向 Google 申请的权限范围',
        st3_l: '存储在服务器上的数据', st4_l: '开源许可证',
        feat_title: '为什么选择 Gmail Cleaner Buddy',
        feat_sub: '一个小巧的自托管工具，只把一件事做好：找出谁在塞满你的收件箱，并清理干净。',
        feat1_t: '安全的 OAuth2 登录', feat1_d: '使用 Google 官方账号选择器登录。应用绝不会看到或存储密码。',
        feat2_t: '前 10 名占用者', feat2_d: '即时查看在你邮箱中占用最多空间和邮件数量的发件人。',
        feat3_t: '一键清理', feat3_d: '一键将某个吵闹发件人的所有邮件直接移至垃圾箱。',
        feat4_t: '隐私优先', feat4_d: '你的数据绝不会存储在任何服务器上。一切都在你自己的会话中运行，并按 OWASP Top 10 加固。',
        prev_title: '应用一览',
        prev_sub: '登录之后，整个应用只有一个界面：你的邮箱统计，以及塞满它的发件人。',
        pv_analyzed: '已分析邮件', pv_space: '总空间',
        pv_senders: '独立发件人', pv_top10: '前 10 名（邮件）',
        pv_list: '📬 邮件最多的发件人', pv_clean: '清理',
        pv_note: '示意图使用示例数据 —— 真实应用显示的是你自己的邮箱。',
        how_title: '工作原理', how_sub: '三步在本地运行 —— 这是一个轻量的 Node + 浏览器应用。',
        step1_t: '配置 Google Cloud', step1_d: '启用 Gmail API 并创建 OAuth 2.0 客户端。完整步骤见说明文档。',
        step2_t: '安装并运行', step2_d: '运行 <code>npm install</code>，然后 <code>npm start</code>，并打开 <code>localhost:3000</code>。',
        step3_t: '登录并清理', step3_d: '使用 Google 登录，查看前 10 名发件人，点击「清理」以释放空间。',
        arch_title: '内部实现',
        arch_sub: '约 1,400 行 TypeScript，没有数据库，也没有第三方后端。',
        arch1_t: '全程 TypeScript', arch1_d: '服务器、浏览器客户端以及本页面本身都用 TypeScript 编写，运行前先编译。',
        arch2_t: 'Node + Express 服务器', arch2_d: '单个 <code>server.ts</code> 驱动 OAuth 流程，并向浏览器提供一个小型 JSON API。',
        arch3_t: '官方 Gmail API', arch3_d: 'Google 的 <code>googleapis</code> 客户端列出邮件、按发件人分组，并用 <code>batchModify</code> 移动它们。',
        arch4_t: '没有数据库', arch4_d: '什么都不持久化：访问令牌只存在于服务器会话中，你一退出就消失。',
        sec_title: '以安全为出发点构建',
        sec_sub: '应用遵循 SECURITY.md 中记录的 OWASP Top 10 检查清单。',
        sec1_t: '仅一个受限范围', sec1_d: '只申请 <code>gmail.modify</code> —— 足以读取和移入垃圾箱，仅此而已。你的密码永远不会被看到。',
        sec2_t: '加固的 HTTP', sec2_d: 'Helmet 设置严格的 Content-Security-Policy、生产环境的 HSTS、收紧的 Permissions-Policy，以及每个 API 响应上的 <code>no-store</code>。',
        sec3_t: '短会话并校验 CSRF', sec3_d: '签名的 httpOnly Cookie 有效期为一小时 —— 与 Google 访问令牌相同 —— 且每次 API 调用都会验证为同源请求。',
        sec4_t: '限制请求频率', sec4_d: '每个 IP 地址每 15 分钟最多 100 次 API 请求和 10 次登录尝试。',
        lim_title: '需要知道的事',
        lim_sub: '在运行之前，先坦白几个限制。',
        lim1_t: '分析近期样本', lim1_d: '扫描覆盖你最近的 500 封邮件；随后会为排在前面的发件人获取精确总数。',
        lim2_t: '清理是批量且快速的', lim2_d: '邮件通过 <code>batchModify</code> 移动，每次调用最多 1,000 封 —— 数百封邮件几秒内清空。',
        lim3_t: '不会永久删除', lim3_d: '邮件会移入 Gmail 垃圾箱，你可以在 30 天内恢复它们。',
        lim4_t: '默认处于测试模式', lim4_d: '在 Google 项目通过验证之前，只有被添加为 test users 的账号（最多 100 个）才能登录。',
        selfhost: 'Gmail Cleaner Buddy 是一个开源的自托管应用（Node 服务器 + 浏览器）。本页面介绍该项目；若要真正清理你的收件箱，请按照说明在自己的电脑上运行该应用。提供 English、Português、Español、Français、Italiano、Русский 和 中文 版本。',
        f_repo: '代码仓库', f_docs: '使用说明', f_sec: '安全', f_priv: '隐私', f_terms: '条款', f_lic: '许可证'
    }
};
// Keys whose values contain HTML (<code>…</code>) and must be set via innerHTML.
const HTML_KEYS = new Set([
    'step2_d', 'step3_d',
    'arch2_d', 'arch3_d',
    'sec1_d', 'sec2_d', 'sec3_d',
    'lim2_d'
]);
const langBtn = document.getElementById('langBtn');
const langMenu = document.getElementById('langMenu');
const curFlag = document.getElementById('curFlag');
const curLabel = document.getElementById('curLabel');
function applyI18n(code) {
    const dict = I18N[code] || I18N['en'];
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (key && dict[key] !== undefined) {
            if (HTML_KEYS.has(key))
                el.innerHTML = dict[key];
            else
                el.textContent = dict[key];
        }
    });
    document.documentElement.lang = code === 'zh' ? 'zh-CN' : code;
}
function setLang(code) {
    const l = LANGS.find((x) => x.code === code) || LANGS[0];
    if (curFlag)
        curFlag.textContent = l.flag;
    if (curLabel)
        curLabel.textContent = l.label;
    applyI18n(code);
    if (langMenu) {
        langMenu.querySelectorAll('button').forEach((b) => {
            b.setAttribute('aria-selected', String(b.dataset['code'] === code));
        });
    }
    try {
        localStorage.setItem('gcb_lang', code);
    }
    catch (e) { /* storage disabled */ }
}
function openMenu() {
    langMenu === null || langMenu === void 0 ? void 0 : langMenu.classList.add('open');
    langBtn === null || langBtn === void 0 ? void 0 : langBtn.setAttribute('aria-expanded', 'true');
}
function closeMenu() {
    langMenu === null || langMenu === void 0 ? void 0 : langMenu.classList.remove('open');
    langBtn === null || langBtn === void 0 ? void 0 : langBtn.setAttribute('aria-expanded', 'false');
}
if (langMenu) {
    LANGS.forEach((l) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.dataset['code'] = l.code;
        b.setAttribute('role', 'option');
        b.innerHTML = `<span class="flag">${l.flag}</span><span>${l.name}</span>`;
        b.addEventListener('click', () => { setLang(l.code); closeMenu(); });
        langMenu.appendChild(b);
    });
}
langBtn === null || langBtn === void 0 ? void 0 : langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (langMenu === null || langMenu === void 0 ? void 0 : langMenu.classList.contains('open'))
        closeMenu();
    else
        openMenu();
});
document.addEventListener('click', () => closeMenu());
langMenu === null || langMenu === void 0 ? void 0 : langMenu.addEventListener('click', (e) => e.stopPropagation());
// Default: English, unless a previous choice exists.
let initial = 'en';
try {
    const saved = localStorage.getItem('gcb_lang');
    if (saved && I18N[saved])
        initial = saved;
}
catch (e) { /* storage disabled */ }
setLang(initial);
