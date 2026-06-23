let currentData = null;
let csrfToken = null;

window.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('loginButton')?.addEventListener('click', loginGoogle);
  document.getElementById('refreshButton')?.addEventListener('click', refreshAnalysis);
  document.getElementById('cleanAllButton')?.addEventListener('click', cleanAll);
  document.getElementById('logoutButton')?.addEventListener('click', logout);

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
    if (!res.ok) return;

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
  try {
    const res = await fetch('/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      }
    });

    if (!res.ok) {
      throw new Error('Falha no logout');
    }

    location.reload();
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    toast('❌ Erro ao desconectar');
  }
}

async function fetchCsrfToken() {
  const res = await fetch('/auth/csrf-token');
  if (!res.ok) {
    throw new Error('Falha ao obter token CSRF');
  }

  const data = await res.json();
  csrfToken = data.csrfToken;
}

async function loadUserData() {
  showLoading();

  try {
    const userRes = await fetch('/api/user');
    if (!userRes.ok) throw new Error('Falha ao carregar usuário');

    const userData = await userRes.json();
    document.getElementById('userEmail').textContent = `📧 ${userData.email}`;

    await fetchCsrfToken();
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
    if (!res.ok) {
      throw new Error('Falha na análise');
    }

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
    const row = document.createElement('div');
    row.className = 'offender';

    const rank = document.createElement('div');
    rank.className = `rank ${i === 0 ? 'r1' : i === 1 ? 'r2' : i === 2 ? 'r3' : ''}`;
    rank.textContent = String(i + 1);

    const details = document.createElement('div');
    const domainEl = document.createElement('div');
    domainEl.className = 'domain';
    domainEl.textContent = item.domain;
    const categoryEl = document.createElement('div');
    categoryEl.className = 'cat';
    categoryEl.textContent = item.category;
    details.appendChild(domainEl);
    details.appendChild(categoryEl);

    const count = document.createElement('div');
    count.className = 'count';
    count.innerHTML = `${formatNumber(item.count)}<small>${formatSize(item.size)}</small>`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-clean-single';
    button.textContent = 'Limpar';
    button.addEventListener('click', () => cleanSender(item.domain));

    row.appendChild(rank);
    row.appendChild(details);
    row.appendChild(count);
    row.appendChild(button);
    list.appendChild(row);
  });
}

async function cleanSender(sender) {
  if (!confirm(`Mover ${sender} para lixeira?`)) return;

  showLoading();

  try {
    const res = await fetch('/api/clean', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      body: JSON.stringify({ sender })
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload.error || 'Erro ao limpar emails');
    }

    const data = await res.json();
    toast(`✅ ${data.removed} emails movidos para lixeira`);
    await refreshAnalysis();
  } catch (error) {
    console.error('Erro ao limpar:', error);
    toast('❌ Erro ao limpar emails');
  } finally {
    hideLoading();
  }
}

async function cleanAll() {
  if (!currentData?.top10?.length) return;
  if (!confirm('Mover TODOS os Top 10 para lixeira?')) return;

  showLoading();

  for (const item of currentData.top10) {
    try {
      const res = await fetch('/api/clean', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ sender: item.domain })
      });

      if (!res.ok) {
        console.error(`Falha ao limpar ${item.domain}`);
      }
    } catch (error) {
      console.error(`Erro ao limpar ${item.domain}:`, error);
    }
  }

  toast('✅ Limpeza concluída!');
  await refreshAnalysis();
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
