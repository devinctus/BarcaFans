/* UCL 2026/27 league phase page.
   Firebase, auth, predictions, leaderboard and the modal live in shared.js;
   this file owns the matchday tabs, match cards, the standings table and the
   admin result rows. */

let activeTab = String(BFLogic.currentMatchday(UCL_MATCHES, Date.now()));

/* Single source of the crest markup, used by cards, the standings table and
   the modal. Falls back to the club's text code if the image fails to load,
   so a missing file never collapses the layout. */
function crestHtml(t, cls) {
  return `<img class="${cls}" src="${t.crest}" alt="" ` +
         `onerror="this.replaceWith(Object.assign(document.createElement('span'),` +
         `{className:'club-crest-fallback',textContent:'${t.code}'}))" />`;
}

function teamCell(code, align) {
  const t = UCL_TEAMS[code];
  const crest = crestHtml(t, 'club-crest');
  return align === 'home'
    ? `<span class="team home">${crest}<span class="club-code">${t.code}</span> ${t.country}</span>`
    : `<span class="team away">${t.country} <span class="club-code">${t.code}</span>${crest}</span>`;
}

/* ── MODAL ──
   Clubs are identified by their crest, not by a national flag: several clubs
   share a country, so a flag alone does not say who is playing. `badge` is
   the shared modal's optional pre-rendered override for `flag`; the World Cup
   supplies no badge and keeps showing national flags. */
function openModal(matchId) {
  const m = UCL_MATCHES.find(x => x.id === matchId);
  if (!m) return;
  const home = UCL_TEAMS[m.home];
  const away = UCL_TEAMS[m.away];
  // The header already shows both crests and names, and left is always the
  // home side, so the score row carries neither a mark nor a label here.
  const team = t => ({
    code: t.code,
    name: `${t.name} ${t.country}`,
    badge: crestHtml(t, 'modal-crest'),
    scoreLabel: ''
  });
  BFShared.openModal(matchId, { home: team(home), away: team(away) });
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
      <td class="st-team">${crestHtml(t, 'club-crest')} ${t.name} ${t.country}</td>
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
/* Mirrors the World Cup admin row structure so it picks up the same styling
   in wc2026.css. The league phase has no advancement, so there is no
   "who goes through" toggle here. */
function adminRowHtml(m) {
  const res  = BFShared.state.results[m.id] || {};
  const home = UCL_TEAMS[m.home];
  const away = UCL_TEAMS[m.away];
  const done = res.status === 'finished';
  return `
    <div class="admin-match-row">
      <div class="admin-match-top">
        <span class="admin-match-label">${crestHtml(home, 'club-crest')} ${home.code} vs ${away.code} ${crestHtml(away, 'club-crest')}</span>
        <span class="admin-match-date">${BFShared.fmtDate(m.kickoff)}</span>
      </div>
      <div class="admin-row-controls">
        <div class="admin-score-inputs">
          <input type="number" id="a_h_${m.id}" value="${res.homeGoals ?? ''}" min="0" max="19" placeholder="0" />
          <span>:</span>
          <input type="number" id="a_a_${m.id}" value="${res.awayGoals ?? ''}" min="0" max="19" placeholder="0" />
        </div>
        <button class="btn-save-result${done ? ' saved' : ''}" onclick="uclAdminSave('${m.id}', this)">
          ${done ? '✔ Збережено' : 'Зберегти'}
        </button>
        ${done ? `<button class="btn-reset-result" onclick="uclResetResult('${m.id}')">↩ Скинути</button>` : ''}
      </div>
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
  btn.classList.add('saved');
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
