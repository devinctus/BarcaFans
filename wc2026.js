/* ── FIREBASE INIT ── */
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();

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
  // M90: W(GER/PAR) vs W(FRA/SWE) — Houston, Jul 4 17:00 UTC
  { id:'r16_90', round:'r16', side:'left',  kickoff:'2026-07-04T17:00:00Z',
    homeFrom:{type:'winner',matchId:'r32_01'}, awayFrom:{type:'winner',matchId:'r32_02'} },
  // M91: W(RSA/CAN) vs W(NED/MOR) — East Rutherford, Jul 5 20:00 UTC
  { id:'r16_91', round:'r16', side:'left',  kickoff:'2026-07-05T20:00:00Z',
    homeFrom:{type:'winner',matchId:'r32_03'}, awayFrom:{type:'winner',matchId:'r32_04'} },
  // M93: W(POR/CRO) vs W(SPA/AUT) — Arlington, Jul 6 19:00 UTC
  { id:'r16_93', round:'r16', side:'left',  kickoff:'2026-07-06T19:00:00Z',
    homeFrom:{type:'winner',matchId:'r32_05'}, awayFrom:{type:'winner',matchId:'r32_06'} },
  // M94: W(USA/BIH) vs W(BEL/SEN) — Seattle, Jul 7 00:00 UTC
  { id:'r16_94', round:'r16', side:'left',  kickoff:'2026-07-07T00:00:00Z',
    homeFrom:{type:'winner',matchId:'r32_07'}, awayFrom:{type:'winner',matchId:'r32_08'} },

  // ── ROUND OF 16 — RIGHT ──
  // M89: W(BRA/JAP) vs W(CIV/NOR) — Philadelphia, Jul 4 21:00 UTC
  { id:'r16_89', round:'r16', side:'right', kickoff:'2026-07-04T21:00:00Z',
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
  // QF99: W(r16_93) vs W(r16_94) — Miami, Jul 11 21:00 UTC
  { id:'qf_99',  round:'qf', side:'left',  kickoff:'2026-07-11T21:00:00Z',
    homeFrom:{type:'winner',matchId:'r16_93'}, awayFrom:{type:'winner',matchId:'r16_94'} },

  // ── QUARTER-FINALS — RIGHT ──
  // QF98: W(r16_89) vs W(r16_92) — Inglewood, Jul 10 19:00 UTC
  { id:'qf_98',  round:'qf', side:'right', kickoff:'2026-07-10T19:00:00Z',
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

/* ── STATE ── */
let currentUser     = null;
let predictions     = {};
let results         = {};
let leaderboardData = [];
let predUnsubscribe = null;
let activeRound     = 'r32';

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
  const res = results[from.matchId];
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

/* ── SCORING ── */
function calcPoints(pH, pA, rH, rA) {
  if (pH === rH && pA === rA) return 3;
  if (Math.sign(pH - pA) === Math.sign(rH - rA)) return 1;
  return 0;
}

/* ── STATUS ── */
function getStatus(match) {
  const now        = Date.now();
  const kickoff    = new Date(match.kickoff).getTime();
  const predCutoff = kickoff - 60 * 60000;
  const endTime    = kickoff + 150 * 60000;
  const res = results[match.id];
  if (res && res.status === 'finished') return 'finished';
  if (now >= kickoff && now < endTime)  return 'live';
  if (now >= predCutoff)                return 'closed';
  return 'upcoming';
}

function fmtDate(iso) {
  return new Date(iso).toLocaleString('uk-UA', {
    timeZone: 'Europe/Kiev',
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit'
  });
}

/* ── AUTH ── */
function login()  { auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(console.error); }
function logout() { auth.signOut(); }

async function saveUserProfile(user) {
  await db.collection('users').doc(user.uid).set({
    uid: user.uid, displayName: user.displayName,
    email: user.email, photoURL: user.photoURL,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

auth.onAuthStateChanged(async user => {
  currentUser = user;
  if (predUnsubscribe) { predUnsubscribe(); predUnsubscribe = null; }
  if (user) {
    await saveUserProfile(user);
    predUnsubscribe = db.collection('predictions')
      .where('userId', '==', user.uid)
      .onSnapshot(snap => {
        snap.forEach(d => { predictions[d.data().matchId] = d.data(); });
        renderAll();
      });
  } else {
    predictions = {};
    renderAll();
  }
  updateNavbar(user);
  toggleAdmin(user);
});

/* ── RESULTS LISTENER ── */
db.collection('results').onSnapshot(snap => {
  results = {};
  snap.forEach(d => { results[d.id] = d.data(); });
  renderAll();
  rebuildLeaderboard();
});

/* ── LEADERBOARD ── */
function rebuildLeaderboard() {
  db.collection('predictions').get().then(snap => {
    const pts = {}, names = {}, photos = {};
    snap.forEach(d => {
      const p = d.data();
      const r = results[p.matchId];
      if (!r || r.status !== 'finished') return;
      const score = calcPoints(p.homeGoals, p.awayGoals, r.homeGoals, r.awayGoals);
      pts[p.userId]    = (pts[p.userId]    || 0) + score;
      names[p.userId]  = p.displayName;
      photos[p.userId] = p.photoURL;
    });
    leaderboardData = Object.entries(pts)
      .sort((a, b) => b[1] - a[1])
      .map(([uid, p]) => ({ uid, pts: p, name: names[uid], photo: photos[uid] }));
    renderLeaderboard();
  });
}

/* ── PREDICTIONS ── */
async function savePrediction(matchId, homeGoals, awayGoals) {
  if (!currentUser) return;
  await db.collection('predictions').doc(`${currentUser.uid}_${matchId}`).set({
    userId: currentUser.uid, matchId,
    homeGoals, awayGoals,
    displayName: currentUser.displayName,
    photoURL: currentUser.photoURL,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

/* ── RESULTS (ADMIN) ── */
async function saveResult(matchId, homeGoals, awayGoals) {
  await db.collection('results').doc(matchId).set({
    homeGoals, awayGoals, status: 'finished',
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

async function setAdvancer(matchId, side) {
  if (!currentUser || currentUser.email !== ADMIN_EMAIL) return;
  await db.collection('results').doc(matchId).set({
    advancedTeam: side,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

/* ── RENDER ALL ── */
function renderAll() {
  renderBracket();
  renderLeaderboard();
  renderAdmin();
}

/* ── ROUND TABS ── */
function switchRound(round) {
  activeRound = round;
  document.querySelectorAll('.round-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.round === round);
  });
  renderBracket();
}

/* ── BRACKET ── */
function renderBracket() {
  const roundMatches = MATCHES.filter(m => m.round === activeRound);
  const left  = roundMatches.filter(m => m.side === 'left');
  const right = roundMatches.filter(m => m.side === 'right');
  document.getElementById('leftBracket').innerHTML  = left.map(matchCardHtml).join('');
  document.getElementById('rightBracket').innerHTML = right.map(matchCardHtml).join('');

  const roundLabel = document.getElementById('bracketRoundLabel');
  if (roundLabel) {
    roundLabel.textContent = ROUND_LABELS[activeRound].toUpperCase();
  }
}

function matchCardHtml(m) {
  const homeTeam = getTeamInfo(m, 'home');
  const awayTeam = getTeamInfo(m, 'away');
  const isTbd    = !!(homeTeam?.tbd || awayTeam?.tbd);
  const status   = getStatus(m);
  const pred     = predictions[m.id];
  const res      = results[m.id];

  let pts = null;
  if (pred && res && res.status === 'finished')
    pts = calcPoints(pred.homeGoals, pred.awayGoals, res.homeGoals, res.awayGoals);

  const badgeMap = {
    upcoming: `<span class="badge badge-upcoming">🕐 ${fmtDate(m.kickoff)} (Київ)</span>`,
    live:     `<span class="badge badge-live">🔴 LIVE</span>`,
    closed:   `<span class="badge badge-closed">🔒 ${fmtDate(m.kickoff)}</span>`,
    finished: `<span class="badge badge-finished">✅ Завершено</span>`
  };

  const scoreHtml = (res && res.status === 'finished')
    ? `<span class="match-result">${res.homeGoals}:${res.awayGoals}</span>`
    : `<span class="vs">vs</span>`;

  const ptsLabel  = pts === null ? '' : pts === 3 ? ' 🎯+3' : pts === 1 ? ' ✅+1' : ' ❌+0';
  const predHtml  = (pred && !isTbd)
    ? `<div class="match-pred">Твій прогноз: ${pred.homeGoals}:${pred.awayGoals}${ptsLabel}</div>` : '';
  const ctaHtml   = (status === 'upcoming' && !pred && !isTbd)
    ? `<div class="match-cta">+ Зробити прогноз</div>` : '';

  let advHtml = '';
  if (res?.advancedTeam) {
    const w = getTeamInfo(m, res.advancedTeam);
    if (!w?.tbd) advHtml = `<div class="match-adv">${w.flag} ${w.code} → далі</div>`;
  }

  const isFinalist = m.id === 'final_104' && res?.advancedTeam;
  if (isFinalist) {
    const champ = getTeamInfo(m, res.advancedTeam);
    if (!champ?.tbd) advHtml = `<div class="match-adv champ">🏆 ${champ.flag} ${champ.name} — Чемпіон!</div>`;
  }
  const is3rd = m.id === 'm3rd_103' && res?.advancedTeam;
  if (is3rd) {
    const third = getTeamInfo(m, res.advancedTeam);
    if (!third?.tbd) advHtml = `<div class="match-adv third">🥉 ${third.flag} ${third.name}</div>`;
  }

  return `
    <div class="match-card ${status}${isTbd ? ' tbd' : ''}" onclick="openModal('${m.id}')">
      <div class="match-teams">
        <span class="team home">${homeTeam.flag} ${homeTeam.code}</span>
        ${scoreHtml}
        <span class="team away">${awayTeam.code} ${awayTeam.flag}</span>
      </div>
      <div class="match-meta">
        ${badgeMap[status]}
        ${predHtml}${ctaHtml}${advHtml}
      </div>
    </div>`;
}

/* ── LEADERBOARD ── */
function renderLeaderboard() {
  const el = document.getElementById('leaderboardBody');
  if (!el) return;
  if (!leaderboardData.length) {
    el.innerHTML = '<tr><td colspan="3" class="empty-lb">Поки немає завершених матчів 🕐</td></tr>';
    return;
  }
  el.innerHTML = leaderboardData.map((e, i) => `
    <tr class="${currentUser && e.uid === currentUser.uid ? 'my-row' : ''}">
      <td class="rank">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
      <td class="player">
        ${e.photo ? `<img src="${e.photo}" class="avatar" referrerpolicy="no-referrer" />` : ''}
        ${e.name}
      </td>
      <td class="pts">${e.pts} <span>балів</span></td>
    </tr>`).join('');
}

/* ── ADMIN PANEL ── */
function toggleAdmin(user) {
  const sec = document.getElementById('adminSection');
  sec.classList.toggle('visible', !!(user && user.email === ADMIN_EMAIL));
}

function renderAdmin() {
  if (!currentUser || currentUser.email !== ADMIN_EMAIL) return;
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
  const res       = results[m.id] || {};
  const adv       = res.advancedTeam;
  const homeLabel = homeTeam.tbd ? homeTeam.name : `${homeTeam.flag} ${homeTeam.code}`;
  const awayLabel = awayTeam.tbd ? awayTeam.name : `${awayTeam.flag} ${awayTeam.code}`;

  return `
    <div class="admin-match-row">
      <div class="admin-match-top">
        <span class="admin-match-label">${homeLabel} vs ${awayLabel}</span>
        <span class="admin-match-date">${fmtDate(m.kickoff)}</span>
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
          <input type="number" id="a_h_${m.id}" value="${res.homeGoals ?? ''}" min="0" max="20" placeholder="0" />
          <span>:</span>
          <input type="number" id="a_a_${m.id}" value="${res.awayGoals ?? ''}" min="0" max="20" placeholder="0" />
        </div>
        <button class="btn-save-result${res.status === 'finished' ? ' saved' : ''}"
                onclick="adminSave('${m.id}',this)">
          ${res.status === 'finished' ? '✔ Збережено' : 'Зберегти'}
        </button>
      </div>
    </div>`;
}

async function adminSave(matchId, btn) {
  const h = parseInt(document.getElementById(`a_h_${matchId}`).value);
  const a = parseInt(document.getElementById(`a_a_${matchId}`).value);
  if (isNaN(h) || isNaN(a)) return;
  btn.disabled = true;
  btn.textContent = 'Зберігаємо...';
  await saveResult(matchId, h, a);
  btn.textContent = '✔ Збережено';
  btn.classList.add('saved');
  btn.disabled = false;
}

/* ── NAVBAR ── */
function updateNavbar(user) {
  const el = document.getElementById('authArea');
  if (!user) {
    el.innerHTML = `<button class="btn-login" onclick="login()">Увійти через Google</button>`;
  } else {
    el.innerHTML = `
      <div class="user-info">
        ${user.photoURL ? `<img src="${user.photoURL}" class="avatar" referrerpolicy="no-referrer" />` : ''}
        <span>${user.displayName.split(' ')[0]}</span>
        <button class="btn-logout" onclick="logout()">Вийти</button>
      </div>`;
  }
}

/* ── MODAL ── */
function openModal(matchId) {
  const m        = findMatch(matchId);
  const homeTeam = getTeamInfo(m, 'home');
  const awayTeam = getTeamInfo(m, 'away');
  const isTbd    = !!(homeTeam?.tbd || awayTeam?.tbd);
  const status   = getStatus(m);
  const pred     = predictions[matchId];
  const res      = results[matchId];

  let pts = null;
  if (pred && res && res.status === 'finished')
    pts = calcPoints(pred.homeGoals, pred.awayGoals, res.homeGoals, res.awayGoals);

  const ptsHtml = pts === null ? '' :
    pts === 3 ? '<div class="pts-msg gold">🎯 Точний рахунок! +3 бали</div>' :
    pts === 1 ? '<div class="pts-msg green">✅ Правильний напрямок! +1 бал</div>' :
                '<div class="pts-msg red">❌ Не вгадав — +0 балів</div>';

  const headerHtml = `
    <div class="modal-header">
      <div class="modal-teams">
        <div class="modal-team${isTbd ? ' tbd' : ''}">
          <span class="big-flag">${homeTeam.flag || '❓'}</span>
          <span>${homeTeam.name}</span>
        </div>
        <div class="modal-vs">vs</div>
        <div class="modal-team${isTbd ? ' tbd' : ''}">
          <span class="big-flag">${awayTeam.flag || '❓'}</span>
          <span>${awayTeam.name}</span>
        </div>
      </div>
      <div class="modal-date">📅 ${fmtDate(m.kickoff)} (за Києвом)</div>
    </div>`;

  let bodyHtml = '';

  if (isTbd) {
    bodyHtml = `
      <div class="modal-tbd">
        <p>Команди ще не визначені.</p>
        <p>Повернись після завершення попереднього раунду!</p>
      </div>`;
  } else if (!currentUser) {
    bodyHtml = `
      <div class="modal-login-prompt">
        <p>Щоб зробити прогноз, увійдіть через Google</p>
        <button class="btn-login" onclick="login();closeModal()">Увійти через Google</button>
      </div>`;
  } else if (status === 'finished') {
    const advTeam = res?.advancedTeam ? getTeamInfo(m, res.advancedTeam) : null;
    const advHtml = advTeam && !advTeam.tbd
      ? `<div class="modal-adv">→ Пройшов далі: ${advTeam.flag} ${advTeam.name}</div>` : '';
    bodyHtml = `
      <div class="modal-result">
        <div class="result-score">Результат (90 хв): <strong>${res.homeGoals} : ${res.awayGoals}</strong></div>
        ${advHtml}
        ${pred
          ? `<div class="pred-score">Твій прогноз: ${pred.homeGoals} : ${pred.awayGoals}</div>`
          : `<div class="pred-score grey">Ти не робив прогноз</div>`}
        ${ptsHtml}
      </div>`;
  } else if (status === 'live' || status === 'closed') {
    bodyHtml = `
      <div class="modal-closed">
        <div class="closed-icon">${status === 'live' ? '🔴' : '🔒'}</div>
        <p>${status === 'live' ? 'Матч вже йде — ставки закрито' : 'Ставки закрито — до початку менше 60 хвилин'}</p>
        ${pred
          ? `<div class="pred-score">Твій прогноз: ${pred.homeGoals} : ${pred.awayGoals}</div>`
          : `<div class="pred-score grey">Ти не встиг зробити прогноз</div>`}
      </div>`;
  } else {
    bodyHtml = `
      <form onsubmit="submitPrediction(event,'${matchId}')">
        <div class="score-input">
          <div class="score-team">
            <span>${homeTeam.flag}</span>
            <span class="team-name">${homeTeam.name}</span>
            <input type="number" id="homeInput" value="${pred ? pred.homeGoals : 1}" min="0" max="20" required />
          </div>
          <span class="score-colon">:</span>
          <div class="score-team">
            <span>${awayTeam.flag}</span>
            <span class="team-name">${awayTeam.name}</span>
            <input type="number" id="awayInput" value="${pred ? pred.awayGoals : 0}" min="0" max="20" required />
          </div>
        </div>
        <button type="submit" class="btn-submit">
          ${pred ? '🔄 Оновити прогноз' : '⚽ Зробити ставку'}
        </button>
        <p class="deadline-note">🔒 Ставки закриваються за 60 хвилин до початку матчу</p>
      </form>`;
  }

  document.getElementById('modalContent').innerHTML = headerHtml + bodyHtml;
  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

async function submitPrediction(e, matchId) {
  e.preventDefault();
  const h = parseInt(document.getElementById('homeInput').value);
  const a = parseInt(document.getElementById('awayInput').value);
  if (isNaN(h) || isNaN(a)) return;
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;
  btn.textContent = 'Зберігаємо...';
  await savePrediction(matchId, h, a);
  predictions[matchId] = { homeGoals: h, awayGoals: a };
  closeModal();
}

/* ── CLOSE ON BACKDROP ── */
document.getElementById('modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
