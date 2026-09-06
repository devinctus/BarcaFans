/* UCL 2026/27 league phase page.
   Firebase, auth, predictions, leaderboard and the modal live in shared.js;
   this file owns the matchday tabs, match cards, the standings table and the
   admin result rows. */

let activeTab = String(BFLogic.currentMatchday(UCL_MATCHES, Date.now()));

function teamCell(code, align) {
  const t = UCL_TEAMS[code];
  const crest = `<img class="club-crest" src="${t.crest}" alt="" ` +
                `onerror="this.replaceWith(Object.assign(document.createElement('span'),` +
                `{className:'club-crest-fallback',textContent:'${t.code}'}))" />`;
  return align === 'home'
    ? `<span class="team home">${crest}<span class="club-code">${t.code}</span> ${t.country}</span>`
    : `<span class="team away">${t.country} <span class="club-code">${t.code}</span>${crest}</span>`;
}

/* ── MODAL ──
   Resolves the two UCL teams into the {code, flag, name} shape BFShared's
   shared modal expects (mirrors wc2026.js's openModal wrapper), then
   delegates to the shared core. Kept as a short bare global so card markup
   can call it directly from onclick=. */
function openModal(matchId) {
  const m = UCL_MATCHES.find(x => x.id === matchId);
  if (!m) return;
  const home = UCL_TEAMS[m.home];
  const away = UCL_TEAMS[m.away];
  BFShared.openModal(matchId, {
    home: { code: home.code, flag: home.country, name: home.name },
    away: { code: away.code, flag: away.country, name: away.name }
  });
}

function matchCardHtml(m) {
  const results = BFShared.state.results;
  const status = BFLogic.getStatus(m, results, Date.now());
  const pred = BFShared.state.predictions[m.id];
  const res = results[m.id];
  const score = (res && res.status === 'finished')
    ? `<span class="match-result">${res.homeGoals}:${res.awayGoals}</span>`
    : `<span class="vs">vs</span>`;
  let pts = null;
  if (pred && res && res.status === 'finished') {
    pts = BFLogic.calcPoints(pred.homeGoals, pred.awayGoals, res.homeGoals, res.awayGoals);
  }
  const ptsLabel = pts === null ? '' : pts === 3 ? ' 🎯+3' : pts === 1 ? ' ✅+1' : ' ❌+0';
  const predHtml = pred ? `<div class="match-pred">Твій прогноз: ${pred.homeGoals}:${pred.awayGoals}${ptsLabel}</div>` : '';
  const badge = {
    upcoming: `<span class="badge badge-upcoming">🕐 ${BFShared.fmtDate(m.kickoff)} (Київ)</span>`,
    live:     `<span class="badge badge-live">🔴 LIVE</span>`,
    closed:   `<span class="badge badge-closed">🔒 ${BFShared.fmtDate(m.kickoff)}</span>`,
    finished: `<span class="badge badge-finished">✅ Завершено</span>`
  }[status];
  const cta = status === 'upcoming'
    ? (pred ? `<div class="match-cta match-cta-done">✓ Прогноз прийнятий</div>`
            : `<div class="match-cta">+ Зробити прогноз</div>`)
    : '';
  return `
    <div class="match-card ${status}" onclick="openModal('${m.id}')">
      <div class="match-teams">${teamCell(m.home,'home')}${score}${teamCell(m.away,'away')}</div>
      <div class="match-meta"><div class="match-meta-row">${badge}${predHtml}</div>${cta}</div>
    </div>`;
}

function standingsHtml() {
  const rows = BFLogic.computeStandings(Object.keys(UCL_TEAMS), UCL_MATCHES, BFShared.state.results);
  const zone = r => r.rank <= 8 ? 'zone-top' : r.rank <= 24 ? 'zone-playoff' : 'zone-out';
  const body = rows.map(r => {
    const t = UCL_TEAMS[r.code];
    return `<tr class="${zone(r)}">
      <td>${r.rank}</td>
      <td class="st-team"><img class="club-crest" src="${t.crest}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'club-crest-fallback',textContent:'${t.code}'}))" /> ${t.name} ${t.country}</td>
      <td>${r.played}</td><td>${r.win}</td><td>${r.draw}</td><td>${r.loss}</td>
      <td>${r.gf}:${r.ga}</td><td>${r.gd > 0 ? '+' : ''}${r.gd}</td><td class="st-pts">${r.pts}</td>
    </tr>`;
  }).join('');
  return `
    <p class="rules-note">Зелена зона: 1-8, прямо в 1/8 фіналу; Жовта: 9-24, раунд плей-оф; Сіра: 25-36, виліт</p>
    <div class="standings-wrap"><table class="standings">
      <thead><tr><th>№</th><th>Клуб</th><th>І</th><th>В</th><th>Н</th><th>П</th><th>Голи</th><th>РМ</th><th>О</th></tr></thead>
      <tbody>${body}</tbody>
    </table></div>`;
}

function renderAll() {
  const el = document.getElementById('uclContent');
  if (!el) return;
  el.innerHTML = activeTab === 'table'
    ? standingsHtml()
    : `<div class="ucl-matches">` +
      UCL_MATCHES.filter(m => m.matchday === Number(activeTab))
                 .sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff))
                 .map(matchCardHtml).join('') + `</div>`;
  document.querySelectorAll('#uclTabs .round-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === activeTab);
  });
  renderUclAdmin();
}

function switchTab(tab) {
  activeTab = tab;
  renderAll();
}

/* ── ADMIN PANEL ──
   Lets the admin enter and reset a result for all 144 matches, grouped by
   matchday. */
function adminRowHtml(m) {
  const res = BFShared.state.results[m.id] || {};
  const h = res.homeGoals != null ? res.homeGoals : '';
  const a = res.awayGoals != null ? res.awayGoals : '';
  return `
    <div class="admin-match-row">
      <span class="admin-teams">${UCL_TEAMS[m.home].code} v ${UCL_TEAMS[m.away].code}</span>
      <input type="number" min="0" max="19" id="a_h_${m.id}" value="${h}" />
      <span>:</span>
      <input type="number" min="0" max="19" id="a_a_${m.id}" value="${a}" />
      <button onclick="uclAdminSave('${m.id}', this)">Зберегти</button>
      ${res.status === 'finished' ? `<button class="btn-reset-result" onclick="uclResetResult('${m.id}')">↩ Скинути</button>` : ''}
    </div>`;
}

function renderUclAdmin() {
  const el = document.getElementById('adminMatches');
  if (!el || !BFShared.isAdmin()) return;
  el.innerHTML = [1,2,3,4,5,6,7,8].map(md => `
    <div class="admin-round-group">
      <h3 class="admin-round-label">Тур ${md}</h3>
      ${UCL_MATCHES.filter(m => m.matchday === md)
                   .sort((a,b) => Date.parse(a.kickoff) - Date.parse(b.kickoff))
                   .map(adminRowHtml).join('')}
    </div>`).join('');
}

async function uclAdminSave(matchId, btn) {
  const h = parseInt(document.getElementById(`a_h_${matchId}`).value);
  const a = parseInt(document.getElementById(`a_a_${matchId}`).value);
  if (isNaN(h) || isNaN(a)) return;
  btn.disabled = true;
  btn.textContent = 'Зберігаємо...';
  await BFShared.saveResult(matchId, h, a);
  btn.textContent = '✔ Збережено';
  btn.disabled = false;
}

/* BFShared.resetResult already confirms, deletes the result, updates state
   and re-renders on its own; this stays a thin alias so admin-panel markup
   can call a short, page-local name (mirrors how wc2026.js reuses the shared
   function directly, without re-confirming). */
async function uclResetResult(matchId) {
  await BFShared.resetResult(matchId);
}

/* ── START ── */
BFShared.init({ id: 'ucl2627', matches: UCL_MATCHES, onRender: renderAll });
