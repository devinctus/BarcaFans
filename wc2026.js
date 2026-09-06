/* World Cup 2026 playoff bracket.
   Firebase, auth, predictions, leaderboard and the modal live in shared.js;
   this file owns the WC fixture list, the bracket, the round tabs and the
   admin result rows. */

/* ── SHARED STATE (same object throughout the page lifetime) ── */
const S = BFShared.state;

/* ── ROUND LABELS ── */
const ROUND_LABELS = {
  r32:   'Round of 32',
  r16:   'Round of 16',
  qf:    'Чвертьфінал',
  sf:    'Півфінал',
  final: 'Фінал'
};

/* ── ALL MATCHES ── */
const MATCHES = [
  // ── ROUND OF 32 — LEFT (порядок як на офіційному брекеті, зверху вниз) ──
  { id:'r32_01', round:'r32', side:'left',  kickoff:'2026-06-29T20:30:00Z',
    home:{code:'GER',flag:'🇩🇪',name:'Німеччина'},      away:{code:'PAR',flag:'🇵🇾',name:'Парагвай'} },
  { id:'r32_02', round:'r32', side:'left',  kickoff:'2026-06-30T21:00:00Z',
    home:{code:'FRA',flag:'🇫🇷',name:'Франція'},        away:{code:'SWE',flag:'🇸🇪',name:'Швеція'} },
  { id:'r32_03', round:'r32', side:'left',  kickoff:'2026-06-28T19:00:00Z',
    home:{code:'RSA',flag:'🇿🇦',name:'ПАР'},           away:{code:'CAN',flag:'🇨🇦',name:'Канада'} },
  { id:'r32_04', round:'r32', side:'left',  kickoff:'2026-06-30T01:00:00Z',
    home:{code:'NED',flag:'🇳🇱',name:'Нідерланди'},     away:{code:'MOR',flag:'🇲🇦',name:'Марокко'} },
  { id:'r32_05', round:'r32', side:'left',  kickoff:'2026-07-02T23:00:00Z',
    home:{code:'POR',flag:'🇵🇹',name:'Португалія'},     away:{code:'CRO',flag:'🇭🇷',name:'Хорватія'} },
  { id:'r32_06', round:'r32', side:'left',  kickoff:'2026-07-02T19:00:00Z',
    home:{code:'SPA',flag:'🇪🇸',name:'Іспанія'},        away:{code:'AUT',flag:'🇦🇹',name:'Австрія'} },
  { id:'r32_07', round:'r32', side:'left',  kickoff:'2026-07-02T00:00:00Z',
    home:{code:'USA',flag:'🇺🇸',name:'США'},             away:{code:'BIH',flag:'🇧🇦',name:'Боснія'} },
  { id:'r32_08', round:'r32', side:'left',  kickoff:'2026-07-01T20:00:00Z',
    home:{code:'BEL',flag:'🇧🇪',name:'Бельгія'},        away:{code:'SEN',flag:'🇸🇳',name:'Сенегал'} },

  // ── ROUND OF 32 — RIGHT (порядок як на офіційному брекеті, зверху вниз) ──
  { id:'r32_09', round:'r32', side:'right', kickoff:'2026-06-29T17:00:00Z',
    home:{code:'BRA',flag:'🇧🇷',name:'Бразилія'},       away:{code:'JAP',flag:'🇯🇵',name:'Японія'} },
  { id:'r32_10', round:'r32', side:'right', kickoff:'2026-06-30T17:00:00Z',
    home:{code:'CIV',flag:'🇨🇮',name:"Кот-д'Івуар"},   away:{code:'NOR',flag:'🇳🇴',name:'Норвегія'} },
  { id:'r32_11', round:'r32', side:'right', kickoff:'2026-07-01T01:00:00Z',
    home:{code:'MEX',flag:'🇲🇽',name:'Мексика'},        away:{code:'ECU',flag:'🇪🇨',name:'Еквадор'} },
  { id:'r32_12', round:'r32', side:'right', kickoff:'2026-07-01T16:00:00Z',
    home:{code:'ENG',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',name:'Англія'},         away:{code:'DRC',flag:'🇨🇩',name:'ДР Конго'} },
  { id:'r32_13', round:'r32', side:'right', kickoff:'2026-07-03T22:00:00Z',
    home:{code:'ARG',flag:'🇦🇷',name:'Аргентина'},      away:{code:'CPV',flag:'🇨🇻',name:'Кабо-Верде'} },
  { id:'r32_14', round:'r32', side:'right', kickoff:'2026-07-03T18:00:00Z',
    home:{code:'AUS',flag:'🇦🇺',name:'Австралія'},      away:{code:'EGP',flag:'🇪🇬',name:'Єгипет'} },
  { id:'r32_15', round:'r32', side:'right', kickoff:'2026-07-03T03:00:00Z',
    home:{code:'SUI',flag:'🇨🇭',name:'Швейцарія'},      away:{code:'ALG',flag:'🇩🇿',name:'Алжир'} },
  { id:'r32_16', round:'r32', side:'right', kickoff:'2026-07-04T01:30:00Z',
    home:{code:'COL',flag:'🇨🇴',name:'Колумбія'},       away:{code:'GHA',flag:'🇬🇭',name:'Гана'} },

  // ── ROUND OF 16 — LEFT ──
  // M90: W(GER/PAR) vs W(FRA/SWE) — Philadelphia, Jul 4 17:00 ET / 21:00 UTC
  { id:'r16_90', round:'r16', side:'left',  kickoff:'2026-07-04T21:00:00Z',
    homeFrom:{type:'winner',matchId:'r32_01'}, awayFrom:{type:'winner',matchId:'r32_02'} },
  // Канада/Марокко (W RSA/CAN vs W NED/MOR) — Houston, Jul 4 13:00 ET / 17:00 UTC
  { id:'r16_91', round:'r16', side:'left',  kickoff:'2026-07-04T17:00:00Z',
    homeFrom:{type:'winner',matchId:'r32_03'}, awayFrom:{type:'winner',matchId:'r32_04'} },
  // M93: W(POR/CRO) vs W(SPA/AUT) — Arlington, Jul 6 19:00 UTC
  { id:'r16_93', round:'r16', side:'left',  kickoff:'2026-07-06T19:00:00Z',
    homeFrom:{type:'winner',matchId:'r32_05'}, awayFrom:{type:'winner',matchId:'r32_06'} },
  // M94: W(USA/BIH) vs W(BEL/SEN) — Seattle, Jul 7 00:00 UTC
  { id:'r16_94', round:'r16', side:'left',  kickoff:'2026-07-07T00:00:00Z',
    homeFrom:{type:'winner',matchId:'r32_07'}, awayFrom:{type:'winner',matchId:'r32_08'} },

  // ── ROUND OF 16 — RIGHT ──
  // Бразилія/Норвегія (W BRA/JAP vs W CIV/NOR) — East Rutherford, Jul 5 16:00 ET / 20:00 UTC
  { id:'r16_89', round:'r16', side:'right', kickoff:'2026-07-05T20:00:00Z',
    homeFrom:{type:'winner',matchId:'r32_09'}, awayFrom:{type:'winner',matchId:'r32_10'} },
  // M92: W(MEX/ECU) vs W(ENG/DRC) — Mexico City, Jul 6 00:00 UTC
  { id:'r16_92', round:'r16', side:'right', kickoff:'2026-07-06T00:00:00Z',
    homeFrom:{type:'winner',matchId:'r32_11'}, awayFrom:{type:'winner',matchId:'r32_12'} },
  // M95: W(ARG/CPV) vs W(AUS/EGP) — Atlanta, Jul 7 16:00 UTC
  { id:'r16_95', round:'r16', side:'right', kickoff:'2026-07-07T16:00:00Z',
    homeFrom:{type:'winner',matchId:'r32_13'}, awayFrom:{type:'winner',matchId:'r32_14'} },
  // M96: W(SUI/ALG) vs W(COL/GHA) — Vancouver, Jul 7 20:00 UTC
  { id:'r16_96', round:'r16', side:'right', kickoff:'2026-07-07T20:00:00Z',
    homeFrom:{type:'winner',matchId:'r32_15'}, awayFrom:{type:'winner',matchId:'r32_16'} },

  // ── QUARTER-FINALS — LEFT ──
  // QF97: W(r16_90) vs W(r16_91) — Foxborough, Jul 9 20:00 UTC
  { id:'qf_97',  round:'qf', side:'left',  kickoff:'2026-07-09T20:00:00Z',
    homeFrom:{type:'winner',matchId:'r16_90'}, awayFrom:{type:'winner',matchId:'r16_91'} },
  // Іспанія/Бельгія (W r16_93 vs W r16_94) — real M98, Los Angeles, Jul 10 15:00 ET / 19:00 UTC
  { id:'qf_99',  round:'qf', side:'left',  kickoff:'2026-07-10T19:00:00Z',
    homeFrom:{type:'winner',matchId:'r16_93'}, awayFrom:{type:'winner',matchId:'r16_94'} },

  // ── QUARTER-FINALS — RIGHT ──
  // Норвегія/Англія (W r16_89 vs W r16_92) — real M99, Miami, Jul 11 17:00 ET / 21:00 UTC
  { id:'qf_98',  round:'qf', side:'right', kickoff:'2026-07-11T21:00:00Z',
    homeFrom:{type:'winner',matchId:'r16_89'}, awayFrom:{type:'winner',matchId:'r16_92'} },
  // QF100: W(r16_95) vs W(r16_96) — Kansas City, Jul 12 01:00 UTC
  { id:'qf_100', round:'qf', side:'right', kickoff:'2026-07-12T01:00:00Z',
    homeFrom:{type:'winner',matchId:'r16_95'}, awayFrom:{type:'winner',matchId:'r16_96'} },

  // ── SEMI-FINALS ──
  // SF101: W(qf_97) vs W(qf_99) — Arlington, Jul 14 19:00 UTC
  { id:'sf_101', round:'sf', side:'left',  kickoff:'2026-07-14T19:00:00Z',
    homeFrom:{type:'winner',matchId:'qf_97'},  awayFrom:{type:'winner',matchId:'qf_99'} },
  // SF102: W(qf_98) vs W(qf_100) — Atlanta, Jul 15 19:00 UTC
  { id:'sf_102', round:'sf', side:'right', kickoff:'2026-07-15T19:00:00Z',
    homeFrom:{type:'winner',matchId:'qf_98'},  awayFrom:{type:'winner',matchId:'qf_100'} },

  // ── ФІНАЛ ──
  // 3rd place: L(sf_101) vs L(sf_102) — Miami, Jul 18 21:00 UTC
  { id:'m3rd_103', round:'final', side:'left',  kickoff:'2026-07-18T21:00:00Z',
    homeFrom:{type:'loser',matchId:'sf_101'},   awayFrom:{type:'loser',matchId:'sf_102'} },
  // Final: W(sf_101) vs W(sf_102) — MetLife, Jul 19 19:00 UTC
  { id:'final_104', round:'final', side:'right', kickoff:'2026-07-19T19:00:00Z',
    homeFrom:{type:'winner',matchId:'sf_101'},  awayFrom:{type:'winner',matchId:'sf_102'} },
];

/* Матчі, які не враховуються в таблиці лідерів (r32_03 = ПАР–Канада, перший матч) */
const LEADERBOARD_EXCLUDED = ['r32_03'];

/* ── STATE ── */
let activeRound = 'r32';

/* ── HELPERS ── */
function findMatch(id) {
  return MATCHES.find(m => m.id === id);
}

function getTeamInfo(m, side) {
  const direct = side === 'home' ? m.home : m.away;
  if (direct) return direct;
  const fromDef = side === 'home' ? m.homeFrom : m.awayFrom;
  return resolveTeam(fromDef);
}

function resolveTeam(from) {
  const src = findMatch(from.matchId);
  if (!src) return { code: '?', flag: '', name: '?', tbd: true };
  const res = S.results[from.matchId];
  if (!res?.advancedTeam) {
    const h = getTeamInfo(src, 'home');
    const a = getTeamInfo(src, 'away');
    const hc = h?.tbd ? '?' : h?.code;
    const ac = a?.tbd ? '?' : a?.code;
    const pre = from.type === 'winner' ? 'В.' : 'П.';
    return { code: `${hc}/${ac}`, flag: '', name: `${pre} ${hc}/${ac}`, tbd: true };
  }
  const side = from.type === 'winner'
    ? res.advancedTeam
    : (res.advancedTeam === 'home' ? 'away' : 'home');
  return getTeamInfo(src, side);
}

function statusOf(m) {
  return BFLogic.getStatus(m, S.results, Date.now());
}

/* ── RENDER ALL ── */
function renderAll() {
  renderBracket();
  BFShared.renderLeaderboard();
  renderAdmin();
}

/* Викликається зі спільного ядра після кожної зміни даних.
   Поки користувач сам не перемкнув таб, відкриваємо перший незавершений етап. */
function onRender() {
  if (!userSelectedRound) {
    activeRound = computeDefaultRound();
    applyActiveRoundTab();
  }
  renderAll();
}

/* ── ROUND TABS ── */
const ROUND_ORDER = ['r32', 'r16', 'qf', 'sf', 'final'];
let userSelectedRound = false;

function applyActiveRoundTab() {
  document.querySelectorAll('.round-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.round === activeRound);
  });
}

// Перший етап, у якому ще НЕ всі матчі мають внесений результат.
// Коли весь етап завершено — за замовчуванням відкриваємо наступний.
function computeDefaultRound() {
  for (const r of ROUND_ORDER) {
    const ms = MATCHES.filter(m => m.round === r);
    const allDone = ms.length > 0 && ms.every(m => S.results[m.id] && S.results[m.id].status === 'finished');
    if (!allDone) return r;
  }
  return 'final';
}

function switchRound(round) {
  userSelectedRound = true;
  activeRound = round;
  applyActiveRoundTab();
  renderBracket();
}

/* перемикання desktop/mobile порядку при зміні розміру вікна */
let _resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(renderBracket, 150);
});

/* ── BRACKET ── */
function renderBracket() {
  const roundMatches = MATCHES.filter(m => m.round === activeRound);
  if (window.innerWidth <= 900) {
    // Мобільний: одна колонка, матчі відсортовані за датою проведення
    const sorted = [...roundMatches].sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
    document.getElementById('leftBracket').innerHTML  = sorted.map(matchCardHtml).join('');
    document.getElementById('rightBracket').innerHTML = '';
  } else {
    const left  = roundMatches.filter(m => m.side === 'left');
    const right = roundMatches.filter(m => m.side === 'right');
    document.getElementById('leftBracket').innerHTML  = left.map(matchCardHtml).join('');
    document.getElementById('rightBracket').innerHTML = right.map(matchCardHtml).join('');
  }

  const roundLabel = document.getElementById('bracketRoundLabel');
  if (roundLabel) roundLabel.textContent = ROUND_LABELS[activeRound].toUpperCase();

  const heroLabel = document.getElementById('heroRoundLabel');
  if (heroLabel) heroLabel.textContent = ROUND_LABELS[activeRound] + ' · Плей-офф';
}

function matchCardHtml(m) {
  const homeTeam = getTeamInfo(m, 'home');
  const awayTeam = getTeamInfo(m, 'away');
  const isTbd    = !!(homeTeam?.tbd || awayTeam?.tbd);
  const status   = statusOf(m);
  const pred     = S.predictions[m.id];
  const res      = S.results[m.id];

  let pts = null;
  if (pred && res && res.status === 'finished')
    pts = BFLogic.calcPoints(pred.homeGoals, pred.awayGoals, res.homeGoals, res.awayGoals);

  const badgeMap = {
    upcoming: `<span class="badge badge-upcoming">🕐 ${BFShared.fmtDate(m.kickoff)} (Київ)</span>`,
    live:     `<span class="badge badge-live">🔴 LIVE</span>`,
    closed:   `<span class="badge badge-closed">🔒 ${BFShared.fmtDate(m.kickoff)}</span>`,
    finished: `<span class="badge badge-finished">✅ Завершено</span>`
  };

  const scoreHtml = (res && res.status === 'finished')
    ? `<span class="match-result">${res.homeGoals}:${res.awayGoals}</span>`
    : `<span class="vs">vs</span>`;

  const ptsLabel  = pts === null ? '' : pts === 3 ? ' 🎯+3' : pts === 1 ? ' ✅+1' : ' ❌+0';
  const predHtml  = (pred && !isTbd)
    ? `<div class="match-pred">Твій прогноз: ${pred.homeGoals}:${pred.awayGoals}${ptsLabel}</div>` : '';
  const ctaHtml = (status === 'upcoming' && !isTbd)
    ? pred
      ? `<div class="match-cta match-cta-done">✓ Прогноз прийнятий</div>`
      : `<div class="match-cta">+ Зробити прогноз</div>`
    : '';

  let advHtml = '';
  if (res?.advancedTeam) {
    const w = getTeamInfo(m, res.advancedTeam);
    if (!w?.tbd) advHtml = `<span class="match-adv">Пройшла далі збірна → ${w.flag} ${w.code}</span>`;
  }

  const isFinalist = m.id === 'final_104' && res?.advancedTeam;
  if (isFinalist) {
    const champ = getTeamInfo(m, res.advancedTeam);
    if (!champ?.tbd) advHtml = `<span class="match-adv champ">🏆 ${champ.flag} ${champ.name} — Чемпіон!</span>`;
  }
  const is3rd = m.id === 'm3rd_103' && res?.advancedTeam;
  if (is3rd) {
    const third = getTeamInfo(m, res.advancedTeam);
    if (!third?.tbd) advHtml = `<span class="match-adv third">🥉 ${third.flag} ${third.name}</span>`;
  }

  const metaRowHtml = `<div class="match-meta-row">${badgeMap[status]}${advHtml}${predHtml}</div>`;

  return `
    <div class="match-card ${status}${isTbd ? ' tbd' : ''}" onclick="openModal('${m.id}')">
      <div class="match-teams">
        <span class="team home">${homeTeam.flag} ${homeTeam.code}</span>
        ${scoreHtml}
        <span class="team away">${awayTeam.code} ${awayTeam.flag}</span>
      </div>
      <div class="match-meta">
        ${metaRowHtml}
        ${ctaHtml}
      </div>
    </div>`;
}

/* ── MODAL ──
   Розвʼязання команд (включно з TBD) — специфіка плей-офф, тож шапку й рядок
   "пройшла далі" готуємо тут, а сам модал малює спільне ядро. */
function openModal(matchId) {
  const m        = findMatch(matchId);
  const homeTeam = getTeamInfo(m, 'home');
  const awayTeam = getTeamInfo(m, 'away');
  const res      = S.results[matchId];

  const advTeam = res?.advancedTeam ? getTeamInfo(m, res.advancedTeam) : null;
  const advHtml = advTeam && !advTeam.tbd
    ? `<div class="modal-adv">Пройшла далі збірна → ${advTeam.flag} ${advTeam.name}</div>` : '';

  BFShared.openModal(matchId, {
    home: homeTeam,
    away: awayTeam,
    tbd: !!(homeTeam?.tbd || awayTeam?.tbd),
    finishedExtraHtml: advHtml
  });
}

/* ── ADMIN PANEL ── */
function renderAdmin() {
  if (!BFShared.isAdmin()) return;
  const el = document.getElementById('adminMatches');
  const rounds = ['r32', 'r16', 'qf', 'sf', 'final'];
  el.innerHTML = rounds.map(round => {
    const ms = MATCHES.filter(m => m.round === round);
    return `
      <div class="admin-round-group">
        <h3 class="admin-round-label">${ROUND_LABELS[round]}</h3>
        ${ms.map(adminMatchRowHtml).join('')}
      </div>`;
  }).join('');
}

function adminMatchRowHtml(m) {
  const homeTeam  = getTeamInfo(m, 'home');
  const awayTeam  = getTeamInfo(m, 'away');
  const res       = S.results[m.id] || {};
  const adv       = res.advancedTeam;
  const homeLabel = homeTeam.tbd ? homeTeam.name : `${homeTeam.flag} ${homeTeam.code}`;
  const awayLabel = awayTeam.tbd ? awayTeam.name : `${awayTeam.flag} ${awayTeam.code}`;

  return `
    <div class="admin-match-row">
      <div class="admin-match-top">
        <span class="admin-match-label">${homeLabel} vs ${awayLabel}</span>
        <span class="admin-match-date">${BFShared.fmtDate(m.kickoff)}</span>
      </div>
      <div class="admin-row-controls">
        <div class="adv-toggle">
          <button class="adv-btn${adv === 'home' ? ' adv-selected' : ''}"
                  onclick="setAdvancer('${m.id}','home')">${homeLabel}</button>
          <span class="adv-arrow">→</span>
          <button class="adv-btn${adv === 'away' ? ' adv-selected' : ''}"
                  onclick="setAdvancer('${m.id}','away')">${awayLabel}</button>
        </div>
        <div class="admin-score-inputs">
          <input type="number" id="a_h_${m.id}" value="${res.homeGoals ?? ''}" min="0" max="19" placeholder="0" />
          <span>:</span>
          <input type="number" id="a_a_${m.id}" value="${res.awayGoals ?? ''}" min="0" max="19" placeholder="0" />
        </div>
        <button class="btn-save-result${res.status === 'finished' ? ' saved' : ''}"
                onclick="adminSave('${m.id}',this)">
          ${res.status === 'finished' ? '✔ Збережено' : 'Зберегти'}
        </button>
        ${res.status === 'finished' ? `<button class="btn-reset-result" onclick="resetResult('${m.id}')">↩ Скинути</button>` : ''}
      </div>
    </div>`;
}

async function adminSave(matchId, btn) {
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

/* ── START ── */
BFShared.init({
  id: 'wc2026',
  matches: MATCHES,
  excluded: LEADERBOARD_EXCLUDED,
  onRender: onRender
});
