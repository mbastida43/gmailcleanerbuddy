let currentData = null;

window.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('btnLogin').addEventListener('click', loginGoogle);
  document.getElementById('btnRefresh').addEventListener('click', refreshAnalysis);
  document.getElementById('btnCleanAll').addEventListener('click', cleanAll);
  document.getElementById('btnLogout').addEventListener('click', logout);

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

// Sessão expirada/revogada: volta para a tela de login
async function apiFetch(url, options) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    toast('🔒 Sessão expirada. Conecte-se novamente.');
    setTimeout(() => location.reload(), 1500);
    throw new Error('unauthenticated');
  }
  return res;
}

async function logout() {
  await fetch('/auth/logout', { method: 'POST' });
  location.reload();
}

async function loadUserData() {
  showLoading();

  try {
    const userRes = await apiFetch('/api/user');
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
    const res = await apiFetch('/api/analyze');
    const data = await res.json();

    currentData = data;
    renderResults(data);
    if (data.failedMessages > 0) {
      toast(`⚠️ Análise parcial: ${data.failedMessages} mensagens não puderam ser lidas`);
    } else {
      toast('✅ Análise concluída!');
    }

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
  list.replaceChildren();

  // Todo o conteúdo vindo dos emails (domínio do remetente) é inserido via
  // textContent — nunca via innerHTML — para impedir XSS por headers
  // "From" maliciosos.
  data.top10.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'offender';

    const rank = document.createElement('div');
    rank.className = `rank ${i === 0 ? 'r1' : i === 1 ? 'r2' : i === 2 ? 'r3' : ''}`;
    rank.textContent = i + 1;

    const info = document.createElement('div');
    const domain = document.createElement('div');
    domain.className = 'domain';
    domain.textContent = item.domain;
    const cat = document.createElement('div');
    cat.className = 'cat';
    cat.textContent = item.category;
    info.append(domain, cat);

    const count = document.createElement('div');
    count.className = 'count';
    count.textContent = formatNumber(item.count);
    const size = document.createElement('small');
    size.textContent = formatSize(item.size);
    count.appendChild(size);

    const btn = document.createElement('button');
    btn.className = 'btn-clean-single';
    btn.textContent = 'Limpar';
    btn.addEventListener('click', () => cleanSender(item.domain));

    row.append(rank, info, count, btn);
    list.appendChild(row);
  });
}

async function cleanSender(sender) {
  if (!confirm(`Mover ${sender} para lixeira?`)) return;

  showLoading();

  try {
    const res = await apiFetch('/api/clean', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender })
    });

    const data = await res.json();
    if (!res.ok) {
      toast(`❌ ${data.error || 'Erro ao limpar emails'}`);
      return;
    }
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

  let removed = 0;
  let failures = 0;

  for (const item of currentData.top10) {
    try {
      const res = await apiFetch('/api/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: item.domain })
      });
      const data = await res.json();
      if (res.ok) {
        removed += data.removed;
      } else {
        failures++;
        console.error(`Falha ao limpar ${item.domain}:`, data.error);
      }
    } catch (error) {
      if (error.message === 'unauthenticated') { hideLoading(); return; }
      failures++;
      console.error(`Erro ao limpar ${item.domain}:`, error);
    }
  }

  if (failures > 0) {
    toast(`⚠️ ${removed} emails movidos; ${failures} remetente(s) falharam`);
  } else {
    toast(`✅ ${removed} emails movidos para lixeira`);
  }
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
