interface Offender {
  domain: string;
  count: number;
  size: number;
  category: string;
  isProtected?: boolean;
}

interface AnalyzeData {
  totalMessages: number;
  analyzedMessages: number;
  failedMessages: number;
  uniqueSenders: number;
  offenders: Offender[];
  top10: Offender[];
}

type Lang = 'en' | 'pt' | 'es' | 'fr' | 'it' | 'ru' | 'zh';

let currentData: AnalyzeData | null = null;
let currentLang: Lang = 'en';

const LANG_FLAG_CLASSES: Record<Lang, string> = { en: 'fi fi-us', pt: 'fi fi-br', es: 'fi fi-es', fr: 'fi fi-fr', it: 'fi fi-it', ru: 'fi fi-ru', zh: 'fi fi-cn' };
const LANG_LABELS: Record<Lang, string> = { en: 'EN', pt: 'PT', es: 'ES', fr: 'FR', it: 'IT', ru: 'RU', zh: '中文' };

// ===================== i18n =====================
const LOCALES: Record<Lang, string> = { en: 'en-US', pt: 'pt-BR', es: 'es-ES', fr: 'fr-FR', it: 'it-IT', ru: 'ru-RU', zh: 'zh-CN' };

const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  pt: {
    'subtitle': '🔐 Conectado ao Gmail via OAuth2',
    'auth.title': '🔒 Conectar ao Gmail',
    'auth.desc': 'Autorize o acesso à sua conta Gmail para analisar os remetentes que mais lotam sua caixa e movê-los para a lixeira.',
    'auth.loginBtn': 'Entrar com Google',
    'auth.note': '🔐 Autenticação OAuth2 oficial do Google<br>🗑️ Permissão para ler e mover seus emails para a lixeira',
    'results.title': '🏆 Top 10 remetentes',
    'btn.cleanAll': '🗑️ Limpar Top 10',
    'btn.logout': '🚪 Sair',
    'stat.analyzed': 'Emails analisados',
    'stat.space': 'Espaço total',
    'stat.senders': 'Remetentes únicos',
    'stat.top10': 'Top 10 (emails)',
    'list.title': '📬 Remetentes com mais emails',
    'btn.clean': 'Limpar',
    'toast.authSuccess': '✅ Autenticado com sucesso!',
    'toast.authError': '❌ Erro na autenticação. Tente novamente.',
    'toast.sessionExpired': '🔒 Sessão expirada. Entre novamente.',
    'toast.logoutError': '❌ Erro ao desconectar',
    'toast.loadError': '❌ Erro ao carregar dados',
    'toast.analyzing': '🔍 Analisando caixa postal...',
    'toast.analyzePartial': '✅ Análise parcial: {ok} ok, {failed} falharam',
    'toast.analyzeDone': '✅ Análise concluída!',
    'toast.analyzeError': '❌ Erro ao analisar',
    'confirm.cleanSender': 'Mover emails de {sender} para a lixeira?',
    'confirm.cleanAll': 'Mover TODOS os Top 10 para a lixeira?',
    'toast.cleaned': '✅ {n} emails movidos para a lixeira',
    'toast.cleanAllPartial': '⚠️ {removed} movidos; {failed} falharam',
    'protected.tooltip': 'Sua própria conta — protegida contra limpeza'
  },
  en: {
    'subtitle': '🔐 Connected to Gmail via OAuth2',
    'auth.title': '🔒 Connect to Gmail',
    'auth.desc': 'Authorize access to your Gmail account to analyze the senders that clutter your inbox the most and move them to the trash.',
    'auth.loginBtn': 'Sign in with Google',
    'auth.note': '🔐 Official Google OAuth2 authentication<br>🗑️ Permission to read and move your emails to the trash',
    'results.title': '🏆 Top 10 senders',
    'btn.cleanAll': '🗑️ Clean Top 10',
    'btn.logout': '🚪 Sign out',
    'stat.analyzed': 'Emails analyzed',
    'stat.space': 'Total space',
    'stat.senders': 'Unique senders',
    'stat.top10': 'Top 10 (emails)',
    'list.title': '📬 Senders with the most emails',
    'btn.clean': 'Clean',
    'toast.authSuccess': '✅ Successfully authenticated!',
    'toast.authError': '❌ Authentication error. Please try again.',
    'toast.sessionExpired': '🔒 Session expired. Please sign in again.',
    'toast.logoutError': '❌ Error signing out',
    'toast.loadError': '❌ Error loading data',
    'toast.analyzing': '🔍 Analyzing your mailbox...',
    'toast.analyzePartial': '✅ Partial analysis: {ok} ok, {failed} failed',
    'toast.analyzeDone': '✅ Analysis complete!',
    'toast.analyzeError': '❌ Error analyzing',
    'confirm.cleanSender': 'Move emails from {sender} to the trash?',
    'confirm.cleanAll': 'Move ALL Top 10 to the trash?',
    'toast.cleaned': '✅ {n} emails moved to the trash',
    'toast.cleanAllPartial': '⚠️ {removed} moved; {failed} failed',
    'protected.tooltip': 'Your own account — protected from cleaning'
  },
  es: {
    'subtitle': '🔐 Conectado a Gmail vía OAuth2',
    'auth.title': '🔒 Conectar a Gmail',
    'auth.desc': 'Autoriza el acceso a tu cuenta de Gmail para analizar los remitentes que más saturan tu bandeja y moverlos a la papelera.',
    'auth.loginBtn': 'Iniciar sesión con Google',
    'auth.note': '🔐 Autenticación OAuth2 oficial de Google<br>🗑️ Permiso para leer y mover tus correos a la papelera',
    'results.title': '🏆 Top 10 remitentes',
    'btn.cleanAll': '🗑️ Limpiar Top 10',
    'btn.logout': '🚪 Salir',
    'stat.analyzed': 'Correos analizados',
    'stat.space': 'Espacio total',
    'stat.senders': 'Remitentes únicos',
    'stat.top10': 'Top 10 (correos)',
    'list.title': '📬 Remitentes con más correos',
    'btn.clean': 'Limpiar',
    'toast.authSuccess': '✅ ¡Autenticado correctamente!',
    'toast.authError': '❌ Error de autenticación. Inténtalo de nuevo.',
    'toast.sessionExpired': '🔒 Sesión expirada. Inicia sesión de nuevo.',
    'toast.logoutError': '❌ Error al cerrar sesión',
    'toast.loadError': '❌ Error al cargar los datos',
    'toast.analyzing': '🔍 Analizando tu buzón...',
    'toast.analyzePartial': '✅ Análisis parcial: {ok} ok, {failed} fallaron',
    'toast.analyzeDone': '✅ ¡Análisis completado!',
    'toast.analyzeError': '❌ Error al analizar',
    'confirm.cleanSender': '¿Mover los correos de {sender} a la papelera?',
    'confirm.cleanAll': '¿Mover TODO el Top 10 a la papelera?',
    'toast.cleaned': '✅ {n} correos movidos a la papelera',
    'toast.cleanAllPartial': '⚠️ {removed} movidos; {failed} fallaron',
    'protected.tooltip': 'Tu propia cuenta: protegida contra la limpieza'
  },
  fr: {
    'subtitle': '🔐 Connecté à Gmail via OAuth2',
    'auth.title': '🔒 Se connecter à Gmail',
    'auth.desc': 'Autorisez l’accès à votre compte Gmail pour analyser les expéditeurs qui encombrent le plus votre boîte et les déplacer vers la corbeille.',
    'auth.loginBtn': 'Se connecter avec Google',
    'auth.note': '🔐 Authentification OAuth2 officielle de Google<br>🗑️ Autorisation de lire et déplacer vos e-mails vers la corbeille',
    'results.title': '🏆 Top 10 des expéditeurs',
    'btn.cleanAll': '🗑️ Nettoyer le Top 10',
    'btn.logout': '🚪 Se déconnecter',
    'stat.analyzed': 'E-mails analysés',
    'stat.space': 'Espace total',
    'stat.senders': 'Expéditeurs uniques',
    'stat.top10': 'Top 10 (e-mails)',
    'list.title': '📬 Expéditeurs avec le plus d’e-mails',
    'btn.clean': 'Nettoyer',
    'toast.authSuccess': '✅ Authentification réussie !',
    'toast.authError': '❌ Erreur d’authentification. Veuillez réessayer.',
    'toast.sessionExpired': '🔒 Session expirée. Veuillez vous reconnecter.',
    'toast.logoutError': '❌ Erreur lors de la déconnexion',
    'toast.loadError': '❌ Erreur lors du chargement des données',
    'toast.analyzing': '🔍 Analyse de votre boîte de réception...',
    'toast.analyzePartial': '✅ Analyse partielle : {ok} ok, {failed} échoués',
    'toast.analyzeDone': '✅ Analyse terminée !',
    'toast.analyzeError': '❌ Erreur lors de l’analyse',
    'confirm.cleanSender': 'Déplacer les e-mails de {sender} vers la corbeille ?',
    'confirm.cleanAll': 'Déplacer TOUT le Top 10 vers la corbeille ?',
    'toast.cleaned': '✅ {n} e-mails déplacés vers la corbeille',
    'toast.cleanAllPartial': '⚠️ {removed} déplacés ; {failed} échoués',
    'protected.tooltip': 'Votre propre compte — protégé du nettoyage'
  },
  it: {
    'subtitle': '🔐 Connesso a Gmail tramite OAuth2',
    'auth.title': '🔒 Connetti a Gmail',
    'auth.desc': 'Autorizza l’accesso al tuo account Gmail per analizzare i mittenti che intasano di più la tua casella e spostarli nel cestino.',
    'auth.loginBtn': 'Accedi con Google',
    'auth.note': '🔐 Autenticazione OAuth2 ufficiale di Google<br>🗑️ Autorizzazione a leggere e spostare le tue email nel cestino',
    'results.title': '🏆 Top 10 mittenti',
    'btn.cleanAll': '🗑️ Pulisci Top 10',
    'btn.logout': '🚪 Esci',
    'stat.analyzed': 'Email analizzate',
    'stat.space': 'Spazio totale',
    'stat.senders': 'Mittenti unici',
    'stat.top10': 'Top 10 (email)',
    'list.title': '📬 Mittenti con più email',
    'btn.clean': 'Pulisci',
    'toast.authSuccess': '✅ Autenticazione riuscita!',
    'toast.authError': '❌ Errore di autenticazione. Riprova.',
    'toast.sessionExpired': '🔒 Sessione scaduta. Accedi di nuovo.',
    'toast.logoutError': '❌ Errore durante la disconnessione',
    'toast.loadError': '❌ Errore durante il caricamento dei dati',
    'toast.analyzing': '🔍 Analisi della tua casella...',
    'toast.analyzePartial': '✅ Analisi parziale: {ok} ok, {failed} non riuscite',
    'toast.analyzeDone': '✅ Analisi completata!',
    'toast.analyzeError': '❌ Errore durante l’analisi',
    'confirm.cleanSender': 'Spostare le email di {sender} nel cestino?',
    'confirm.cleanAll': 'Spostare TUTTI i Top 10 nel cestino?',
    'toast.cleaned': '✅ {n} email spostate nel cestino',
    'toast.cleanAllPartial': '⚠️ {removed} spostate; {failed} non riuscite',
    'protected.tooltip': 'Il tuo account — protetto dalla pulizia'
  },
  ru: {
    'subtitle': '🔐 Подключено к Gmail через OAuth2',
    'auth.title': '🔒 Подключиться к Gmail',
    'auth.desc': 'Разрешите доступ к вашему аккаунту Gmail, чтобы проанализировать отправителей, которые больше всего заполняют ваш ящик, и переместить их письма в корзину.',
    'auth.loginBtn': 'Войти через Google',
    'auth.note': '🔐 Официальная аутентификация Google OAuth2<br>🗑️ Разрешение читать и перемещать ваши письма в корзину',
    'results.title': '🏆 10 главных отправителей',
    'btn.cleanAll': '🗑️ Очистить топ-10',
    'btn.logout': '🚪 Выйти',
    'stat.analyzed': 'Проанализировано писем',
    'stat.space': 'Всего места',
    'stat.senders': 'Уникальных отправителей',
    'stat.top10': 'Топ-10 (письма)',
    'list.title': '📬 Отправители с наибольшим числом писем',
    'btn.clean': 'Очистить',
    'toast.authSuccess': '✅ Успешная аутентификация!',
    'toast.authError': '❌ Ошибка аутентификации. Попробуйте снова.',
    'toast.sessionExpired': '🔒 Сессия истекла. Войдите снова.',
    'toast.logoutError': '❌ Ошибка при выходе',
    'toast.loadError': '❌ Ошибка загрузки данных',
    'toast.analyzing': '🔍 Анализ вашего почтового ящика...',
    'toast.analyzePartial': '✅ Частичный анализ: {ok} ок, {failed} не удалось',
    'toast.analyzeDone': '✅ Анализ завершён!',
    'toast.analyzeError': '❌ Ошибка анализа',
    'confirm.cleanSender': 'Переместить письма от {sender} в корзину?',
    'confirm.cleanAll': 'Переместить ВЕСЬ топ-10 в корзину?',
    'toast.cleaned': '✅ {n} писем перемещено в корзину',
    'toast.cleanAllPartial': '⚠️ {removed} перемещено; {failed} не удалось',
    'protected.tooltip': 'Ваш собственный аккаунт — защищён от очистки'
  },
  zh: {
    'subtitle': '🔐 已通过 OAuth2 连接到 Gmail',
    'auth.title': '🔒 连接到 Gmail',
    'auth.desc': '授权访问你的 Gmail 账号，以分析最占满收件箱的发件人并将其邮件移至垃圾箱。',
    'auth.loginBtn': '使用 Google 登录',
    'auth.note': '🔐 Google 官方 OAuth2 身份验证<br>🗑️ 读取并将你的邮件移至垃圾箱的权限',
    'results.title': '🏆 前 10 名发件人',
    'btn.cleanAll': '🗑️ 清理前 10 名',
    'btn.logout': '🚪 退出',
    'stat.analyzed': '已分析邮件',
    'stat.space': '总空间',
    'stat.senders': '独立发件人',
    'stat.top10': '前 10 名（邮件）',
    'list.title': '📬 邮件最多的发件人',
    'btn.clean': '清理',
    'toast.authSuccess': '✅ 身份验证成功！',
    'toast.authError': '❌ 身份验证出错，请重试。',
    'toast.sessionExpired': '🔒 会话已过期，请重新登录。',
    'toast.logoutError': '❌ 退出时出错',
    'toast.loadError': '❌ 加载数据出错',
    'toast.analyzing': '🔍 正在分析你的邮箱...',
    'toast.analyzePartial': '✅ 部分分析：{ok} 成功，{failed} 失败',
    'toast.analyzeDone': '✅ 分析完成！',
    'toast.analyzeError': '❌ 分析出错',
    'confirm.cleanSender': '将来自 {sender} 的邮件移至垃圾箱？',
    'confirm.cleanAll': '将全部前 10 名移至垃圾箱？',
    'toast.cleaned': '✅ 已将 {n} 封邮件移至垃圾箱',
    'toast.cleanAllPartial': '⚠️ 已移动 {removed}；{failed} 失败',
    'protected.tooltip': '您自己的账户 — 已受保护，不会被清理'
  }
};

function t(key: string, params: Record<string, string | number> = {}): string {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  let str = dict[key] ?? TRANSLATIONS.en[key] ?? key;
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return str;
}

function applyLanguage(lang: string): void {
  const safeLang: Lang = (lang in TRANSLATIONS ? lang : 'en') as Lang;
  currentLang = safeLang;
  localStorage.setItem('lang', safeLang);
  document.documentElement.lang = LOCALES[safeLang];

  const flagEl = document.getElementById('langFlag');
  const labelEl = document.getElementById('langLabel');
  if (flagEl) flagEl.className = LANG_FLAG_CLASSES[safeLang];
  if (labelEl) labelEl.textContent = LANG_LABELS[safeLang];

  document.querySelectorAll<HTMLElement>('#langMenu [data-lang]').forEach((li) => {
    li.classList.toggle('active', (li as HTMLElement).dataset['lang'] === safeLang);
  });

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n')!);
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach((el) => {
    el.innerHTML = t(el.getAttribute('data-i18n-html')!);
  });

  if (currentData) renderResults(currentData);
}

window.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('loginButton')?.addEventListener('click', loginGoogle);
  document.getElementById('cleanAllButton')?.addEventListener('click', cleanAll);
  document.getElementById('logoutButton')?.addEventListener('click', logout);

  const langBtn = document.getElementById('langBtn');
  const langMenu = document.getElementById('langMenu');
  langBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = langMenu?.classList.toggle('open');
    langBtn.setAttribute('aria-expanded', String(!!open));
  });
  document.addEventListener('click', () => {
    langMenu?.classList.remove('open');
    langBtn?.setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll<HTMLElement>('#langMenu [data-lang]').forEach((li) => {
    li.addEventListener('click', () => {
      applyLanguage(li.dataset['lang']!);
      langMenu?.classList.remove('open');
      langBtn?.setAttribute('aria-expanded', 'false');
    });
  });

  // Default language is English; a previously chosen language is restored if present.
  const saved = localStorage.getItem('lang');
  applyLanguage(saved && saved in TRANSLATIONS ? saved : 'en');

  const params = new URLSearchParams(window.location.search);

  if (params.get('auth') === 'success') {
    toast(t('toast.authSuccess'));
    window.history.replaceState({}, '', '/');
    await checkAuth();
  } else if (params.get('error')) {
    toast(t('toast.authError'));
    window.history.replaceState({}, '', '/');
  } else {
    await checkAuth();
  }

  registerServiceWorker();
});

// PWA: o service worker é o que torna o app instalável e permite empacotá-lo
// como TWA na Play Store. Registrado por último, e sem await, para nunca
// atrasar o fluxo de login. Só roda em HTTPS (ou localhost) — em http:// puro
// `navigator.serviceWorker` nem existe, daí a checagem.
function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js').catch((error) => {
    console.warn('Service worker não registrado:', error);
  });
}

async function checkAuth(): Promise<void> {
  try {
    const res = await fetch('/auth/status');
    if (!res.ok) return;
    const data = await res.json();
    if (data.authenticated) {
      await loadUserData();
    }
  } catch (error) {
    console.error('Erro ao verificar auth:', error);
  }
}

function loginGoogle(): void {
  window.location.href = '/auth/google';
}

// Wrapper que trata 401 (sessão expirada) de forma centralizada
async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, options);
  if (res.status === 401) {
    toast(t('toast.sessionExpired'));
    setTimeout(() => location.reload(), 1500);
    throw new Error('unauthorized');
  }
  return res;
}

async function logout(): Promise<void> {
  try {
    const res = await apiFetch('/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Falha no logout');
    location.reload();
  } catch (error: any) {
    if (error?.message !== 'unauthorized') {
      console.error('Erro ao desconectar:', error);
      toast(t('toast.logoutError'));
    }
  }
}

async function loadUserData(): Promise<void> {
  showLoading();
  try {
    const userRes = await apiFetch('/api/user');
    if (!userRes.ok) throw new Error('Falha ao carregar usuário');
    const userData = await userRes.json();
    document.getElementById('userEmail')!.textContent = `📧 ${userData.email}`;

    document.getElementById('authScreen')!.style.display = 'none';
    document.getElementById('resultsScreen')!.style.display = 'block';

    await refreshAnalysis();
  } catch (error: any) {
    if (error?.message !== 'unauthorized') {
      console.error('Erro ao carregar dados:', error);
      toast(t('toast.loadError'));
    }
  } finally {
    hideLoading();
  }
}

async function refreshAnalysis(): Promise<void> {
  showLoading();
  toast(t('toast.analyzing'));
  try {
    const res = await apiFetch('/api/analyze');
    if (!res.ok) throw new Error('Falha na análise');
    const data: AnalyzeData = await res.json();
    currentData = data;
    renderResults(data);
    if (data.failedMessages > 0) {
      toast(t('toast.analyzePartial', { ok: data.analyzedMessages, failed: data.failedMessages }));
    } else {
      toast(t('toast.analyzeDone'));
    }
  } catch (error: any) {
    if (error?.message !== 'unauthorized') {
      console.error('Erro na análise:', error);
      toast(t('toast.analyzeError'));
    }
  } finally {
    hideLoading();
  }
}

// Atualização otimista: remove o remetente limpo da lista local e re-renderiza
// na hora, sem pagar os ~25s de uma nova análise completa. O 11º colocado sobe
// para o Top 10 (o servidor conta com exatidão os 25 primeiros justamente para
// isso). Um F5 refaz a análise completa quando o usuário quiser re-verificar.
function removeSenderLocally(sender: string): void {
  if (!currentData) return;
  currentData.offenders = currentData.offenders.filter((o) => o.domain !== sender);
  currentData.top10 = currentData.offenders.slice(0, 10);
  currentData.uniqueSenders = currentData.offenders.length;
  renderResults(currentData);
}

function renderResults(data: AnalyzeData): void {
  document.getElementById('totalEmails')!.textContent = formatNumber(data.totalMessages);
  document.getElementById('totalSize')!.textContent = formatSize(data.offenders.reduce((s, o) => s + o.size, 0));
  document.getElementById('uniqueSenders')!.textContent = formatNumber(data.uniqueSenders);
  document.getElementById('top10Count')!.textContent = formatNumber(data.top10.reduce((s, o) => s + o.count, 0));

  const list = document.getElementById('offendersList')!;
  list.innerHTML = '';

  data.top10.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'offender';

    const rank = document.createElement('div');
    rank.className = `rank ${i === 0 ? 'r1' : i === 1 ? 'r2' : i === 2 ? 'r3' : ''}`;
    rank.textContent = String(i + 1);

    const details = document.createElement('div');
    const domainEl = document.createElement('div');
    domainEl.className = 'domain';
    domainEl.textContent = item.domain;
    if (item.isProtected) {
      // Cadeado depois do endereço: sinaliza "protegido", não "removido" —
      // por isso um ícone, e não texto taxado.
      const lock = document.createElement('span');
      lock.className = 'lock';
      lock.textContent = ' 🔒';
      lock.title = t('protected.tooltip');
      lock.setAttribute('aria-label', t('protected.tooltip'));
      domainEl.appendChild(lock);
    }
    const categoryEl = document.createElement('div');
    categoryEl.className = 'cat';
    categoryEl.textContent = item.category;
    details.appendChild(domainEl);
    details.appendChild(categoryEl);

    const count = document.createElement('div');
    count.className = 'count';
    const countNum = document.createElement('span');
    countNum.textContent = formatNumber(item.count);
    const sizeSmall = document.createElement('small');
    sizeSmall.textContent = formatSize(item.size);
    count.appendChild(countNum);
    count.appendChild(sizeSmall);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-clean-single';
    button.textContent = t('btn.clean');
    if (item.isProtected) {
      button.disabled = true;
      button.title = t('protected.tooltip');
      button.setAttribute('aria-disabled', 'true');
    } else {
      button.addEventListener('click', () => cleanSender(item.domain));
    }

    row.appendChild(rank);
    row.appendChild(details);
    row.appendChild(count);
    row.appendChild(button);
    list.appendChild(row);
  });
}

async function cleanSender(sender: string): Promise<void> {
  if (!confirm(t('confirm.cleanSender', { sender }))) return;
  showLoading();
  try {
    const res = await apiFetch('/api/clean', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender })
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload.error || 'Erro ao limpar emails');
    }
    const data = await res.json();
    toast(t('toast.cleaned', { n: data.removed }));
    removeSenderLocally(sender);
  } catch (error: any) {
    if (error?.message !== 'unauthorized') {
      console.error('Erro ao limpar:', error);
      toast(`❌ ${error.message}`);
    }
  } finally {
    hideLoading();
  }
}

async function cleanAll(): Promise<void> {
  if (!currentData?.top10?.length) return;
  if (!confirm(t('confirm.cleanAll'))) return;

  showLoading();
  let totalRemoved = 0;
  let totalFailed = 0;

  // Cópia da lista: removeSenderLocally mexe no top10 durante o loop.
  // A conta do próprio usuário fica de fora: o servidor recusaria com 400 e o
  // "Limpar Top 10" acabaria reportando uma falha que não é falha.
  const targets = currentData.top10.filter((o) => !o.isProtected);
  for (const item of targets) {
    try {
      const res = await apiFetch('/api/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: item.domain })
      });
      if (res.ok) {
        const data = await res.json();
        totalRemoved += data.removed || 0;
        totalFailed += data.failed || 0;
        removeSenderLocally(item.domain);
      } else {
        totalFailed++;
      }
    } catch (error: any) {
      if (error?.message === 'unauthorized') { hideLoading(); return; }
      totalFailed++;
    }
  }

  if (totalFailed > 0) {
    toast(t('toast.cleanAllPartial', { removed: totalRemoved, failed: totalFailed }));
  } else {
    toast(t('toast.cleaned', { n: totalRemoved }));
  }
  hideLoading();
}

function showLoading(): void { document.getElementById('loading')!.classList.add('show'); }
function hideLoading(): void { document.getElementById('loading')!.classList.remove('show'); }

function toast(msg: string): void {
  const el = document.getElementById('toast')!;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

function formatNumber(n: number): string { return Number(n).toLocaleString(LOCALES[currentLang] || 'en-US'); }

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}
