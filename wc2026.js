/* ── FIREBASE INIT ── */
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();

/* ── MATCHES DATA ── */
const MATCHES = [
  // LEFT
  { id:'r32_01', side:'left',  home:{code:'GER',flag:'🇩🇪',name:'Німеччина'},   away:{code:'PAR',flag:'🇵🇾',name:'Парагвай'},     kickoff:'2026-06-29T15:00:00Z' },
  { id:'r32_02', side:'left',  home:{code:'FRA',flag:'🇫🇷',name:'Франція'},      away:{code:'SWE',flag:'🇸🇪',name:'Швеція'},       kickoff:'2026-06-29T18:00:00Z' },
  { id:'r32_03', side:'left',  home:{code:'RSA',flag:'🇿🇦',name:'ПАР'},          away:{code:'CAN',flag:'🇨🇦',name:'Канада'},       kickoff:'2026-06-30T15:00:00Z' },
  { id:'r32_04', side:'left',  home:{code:'NED',flag:'🇳🇱',name:'Нідерланди'},   away:{code:'MOR',flag:'🇲🇦',name:'Марокко'},      kickoff:'2026-06-30T18:00:00Z' },
  { id:'r32_05', side:'left',  home:{code:'POR',flag:'🇵🇹',name:'Португалія'},   away:{code:'CRO',flag:'🇭🇷',name:'Хорватія'},     kickoff:'2026-07-01T15:00:00Z' },
  { id:'r32_06', side:'left',  home:{code:'SPA',flag:'🇪🇸',name:'Іспанія'},      away:{code:'AUT',flag:'🇦🇹',name:'Австрія'},      kickoff:'2026-07-01T18:00:00Z' },
  { id:'r32_07', side:'left',  home:{code:'USA',flag:'🇺🇸',name:'США'},          away:{code:'BIH',flag:'🇧🇦',name:'Боснія'},       kickoff:'2026-07-02T15:00:00Z' },
  { id:'r32_08', side:'left',  home:{code:'BEL',flag:'🇧🇪',name:'Бельгія'},      away:{code:'SEN',flag:'🇸🇳',name:'Сенегал'},      kickoff:'2026-07-02T18:00:00Z' },
  // RIGHT
  { id:'r32_09', side:'right', home:{code:'BRA',flag:'🇧🇷',name:'Бразилія'},     away:{code:'JAP',flag:'🇯🇵',name:'Японія'},       kickoff:'2026-06-29T15:00:00Z' },
  { id:'r32_10', side:'right', home:{code:'CIV',flag:'🇨🇮',name:"Кот-д'Івуар"}, away:{code:'NOR',flag:'🇳🇴',name:'Норвегія'},     kickoff:'2026-06-29T18:00:00Z' },
  { id:'r32_11', side:'right', home:{code:'MEX',flag:'🇲🇽',name:'Мексика'},      away:{code:'ECU',flag:'🇪🇨',name:'Еквадор'},      kickoff:'2026-06-30T15:00:00Z' },
  { id:'r32_12', side:'right', home:{code:'ENG',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',name:'Англія'},       away:{code:'DRC',flag:'🇨🇩',name:'ДР Конго'},      kickoff:'2026-06-30T18:00:00Z' },
  { id:'r32_13', side:'right', home:{code:'ARG',flag:'🇦🇷',name:'Аргентина'},    away:{code:'CPV',flag:'🇨🇻',name:'Кабо-Верде'},   kickoff:'2026-07-01T15:00:00Z' },
  { id:'r32_14', side:'right', home:{code:'AUS',flag:'🇦🇺',name:'Австралія'},    away:{code:'EGP',flag:'🇪🇬',name:'Єгипет'},       kickoff:'2026-07-01T18:00:00Z' },
  { id:'r32_15', side:'right', home:{code:'SUI',flag:'🇨🇭',name:'Швейцарія'},    away:{code:'ALG',flag:'🇩🇿',name:'Алжир'},        kickoff:'2026-07-02T15:00:00Z' },
  { id:'r32_16', side:'right', home:{code:'COL',flag:'🇨🇴',name:'Колумбія'},     away:{code:'GHA',flag:'🇬🇭',name:'Гана'},         kickoff:'2026-07-02T18:00:00Z' },
];

/* ── STATE ── */
let currentUser      = null;
let predictions      = {};   // matchId → prediction doc
let results          = {};   // matchId → result doc
let leaderboardData  = [];
let predUnsubscribe  = null;

/* ── SCORING ── */
function calcPoints(pH, pA, rH, rA) {
  if (pH === rH && pA === rA) return 3;
  if (Math.sign(pH - pA) === Math.sign(rH - rA)) return 1;
  return 0;
}

/* ── HELPERS ── */
function getStatus(match) {
  const now     = Date.now();
  const kickoff = new Date(match.kickoff).getTime();
  const deadline = kickoff + 90  * 60000;
  const endTime  = kickoff + 150 * 60000;
  const res = results[match.id];
  if (res && res.status === 'finished') return 'finished';
  if (now >= kickoff && now < endTime)  return 'live';
  if (now >= deadline)                  return 'closed';
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
function login() {
  auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(console.error);
}
function logout() { auth.signOut(); }

async function saveUserProfile(user) {
  await db.collection('users').doc(user.uid).set({
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
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

/* ── ADMIN: SAVE RESULT ── */
async function saveResult(matchId, homeGoals, awayGoals) {
  await db.collection('results').doc(matchId).set({
    homeGoals, awayGoals, status: 'finished',
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

/* ── RENDER ALL ── */
function renderAll() {
  renderBracket();
  renderLeaderboard();
  renderAdmin();
}

/* ── BRACKET ── */
function renderBracket() {
  const left  = MATCHES.filter(m => m.side === 'left');
  const right = MATCHES.filter(m => m.side === 'right');
  document.getElementById('leftBracket').innerHTML  = left.map(matchCardHtml).join('');
  document.getElementById('rightBracket').innerHTML = right.map(matchCardHtml).join('');
}

function matchCardHtml(m) {
  const status = getStatus(m);
  const pred   = predictions[m.id];
  const res    = results[m.id];

  let pts = null;
  if (pred && res && res.status === 'finished')
    pts = calcPoints(pred.homeGoals, pred.awayGoals, res.homeGoals, res.awayGoals);

  const badgeMap = {
    upcoming: `<span class="badge badge-upcoming">🕐 ${fmtDate(m.kickoff)} (Київ)</span>`,
    live:     `<span class="badge badge-live">🔴 LIVE</span>`,
    closed:   `<span class="badge badge-closed">🔒 Закрито · ${fmtDate(m.kickoff)}</span>`,
    finished: `<span class="badge badge-finished">✅ Завершено</span>`
  };

  const scoreHtml = (res && res.status === 'finished')
    ? `<span class="match-result">${res.homeGoals}:${res.awayGoals}</span>`
    : `<span class="vs">vs</span>`;

  const ptsLabel = pts === null ? '' : pts === 3 ? ' 🎯+3' : pts === 1 ? ' ✅+1' : ' ❌+0';
  const predHtml = pred
    ? `<div class="match-pred">Твій прогноз: ${pred.homeGoals}:${pred.awayGoals}${ptsLabel}</div>`
    : '';

  const ctaHtml = (status === 'upcoming' && !pred)
    ? `<div class="match-cta">+ Зробити прогноз</div>` : '';

  return `
    <div class="match-card ${status}" onclick="openModal('${m.id}')">
      <div class="match-teams">
        <span class="team home">${m.home.flag} ${m.home.code}</span>
        ${scoreHtml}
        <span class="team away">${m.away.code} ${m.away.flag}</span>
      </div>
      <div class="match-meta">
        ${badgeMap[status]}
        ${predHtml}
        ${ctaHtml}
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
  el.innerHTML = MATCHES.map(m => {
    const res = results[m.id] || {};
    return `
      <div class="admin-match-row">
        <span class="admin-match-label">${m.home.flag} ${m.home.code} vs ${m.away.code} ${m.away.flag}</span>
        <div class="admin-score-inputs">
          <input type="number" id="a_h_${m.id}" value="${res.homeGoals ?? ''}" min="0" max="20" placeholder="0" />
          <span>:</span>
          <input type="number" id="a_a_${m.id}" value="${res.awayGoals ?? ''}" min="0" max="20" placeholder="0" />
        </div>
        <button class="btn-save-result ${res.status === 'finished' ? 'saved' : ''}"
          onclick="adminSave('${m.id}', this)">
          ${res.status === 'finished' ? '✔ Збережено' : 'Зберегти'}
        </button>
      </div>`;
  }).join('');
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
  const m      = MATCHES.find(x => x.id === matchId);
  const status = getStatus(m);
  const pred   = predictions[matchId];
  const res    = results[matchId];

  let pts = null;
  if (pred && res && res.status === 'finished')
    pts = calcPoints(pred.homeGoals, pred.awayGoals, res.homeGoals, res.awayGoals);

  const ptsHtml = pts === null ? '' :
    pts === 3 ? '<div class="pts-msg gold">🎯 Точний рахунок! +3 бали</div>' :
    pts === 1 ? '<div class="pts-msg green">✅ Правильний напрямок! +1 бал</div>'  :
                '<div class="pts-msg red">❌ Не вгадав — +0 балів</div>';

  let bodyHtml = '';

  if (!currentUser) {
    bodyHtml = `
      <div class="modal-login-prompt">
        <p>Щоб зробити прогноз, увійдіть через Google</p>
        <button class="btn-login" onclick="login();closeModal()">Увійти через Google</button>
      </div>`;
  } else if (status === 'finished') {
    bodyHtml = `
      <div class="modal-result">
        <div class="result-score">Результат: <strong>${res.homeGoals} : ${res.awayGoals}</strong></div>
        ${pred
          ? `<div class="pred-score">Твій прогноз: ${pred.homeGoals} : ${pred.awayGoals}</div>`
          : `<div class="pred-score grey">Ти не робив прогноз</div>`}
        ${ptsHtml}
      </div>`;
  } else if (status === 'live' || status === 'closed') {
    bodyHtml = `
      <div class="modal-closed">
        <div class="closed-icon">${status === 'live' ? '🔴' : '🔒'}</div>
        <p>${status === 'live' ? 'Матч вже йде — ставки закрито' : 'Ставки закрито'}</p>
        ${pred
          ? `<div class="pred-score">Твій прогноз: ${pred.homeGoals} : ${pred.awayGoals}</div>`
          : `<div class="pred-score grey">Ти не встиг зробити прогноз</div>`}
      </div>`;
  } else {
    bodyHtml = `
      <form onsubmit="submitPrediction(event,'${matchId}')">
        <div class="score-input">
          <div class="score-team">
            <span>${m.home.flag}</span>
            <span class="team-name">${m.home.name}</span>
            <input type="number" id="homeInput" value="${pred ? pred.homeGoals : 1}" min="0" max="20" required />
          </div>
          <span class="score-colon">:</span>
          <div class="score-team">
            <span>${m.away.flag}</span>
            <span class="team-name">${m.away.name}</span>
            <input type="number" id="awayInput" value="${pred ? pred.awayGoals : 0}" min="0" max="20" required />
          </div>
        </div>
        <button type="submit" class="btn-submit">
          ${pred ? '🔄 Оновити прогноз' : '⚽ Зробити ставку'}
        </button>
        <p class="deadline-note">⏱ Ставки приймаються до 90-ї хвилини матчу</p>
      </form>`;
  }

  document.getElementById('modalContent').innerHTML = `
    <div class="modal-header">
      <div class="modal-teams">
        <div class="modal-team">
          <span class="big-flag">${m.home.flag}</span>
          <span>${m.home.name}</span>
        </div>
        <div class="modal-vs">vs</div>
        <div class="modal-team">
          <span class="big-flag">${m.away.flag}</span>
          <span>${m.away.name}</span>
        </div>
      </div>
      <div class="modal-date">📅 ${fmtDate(m.kickoff)} (за Києвом)</div>
    </div>
    ${bodyHtml}`;

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
