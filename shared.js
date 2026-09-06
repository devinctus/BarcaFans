/* Shared core: Firebase, auth, predictions, leaderboard, modal.
   Tournament-agnostic. A page supplies its tournament through BFShared.init()
   and keeps its own bracket/table rendering. */

/* ── FIREBASE INIT ── */
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();

const BFShared = (function () {

  /* Tournament config supplied by the page:
     { id, matches: [{id, kickoff, ...}], onRender: () => void, excluded?: string[] } */
  let CFG = null;
  let matchIdSet = new Set();

  const state = {
    currentUser: null,
    predictions: {},
    results: {},
    leaderboardData: []
  };

  let predUnsubscribe = null;

  function init(config) {
    CFG = config;
    // Матчі зі списку excluded не враховуються в таблиці лідерів.
    matchIdSet = new Set(
      config.matches.map(m => m.id).filter(id => !(config.excluded || []).includes(id))
    );
    wireAuth();
    wireResults();
    wireModalDismiss();
  }

  function findMatch(id) {
    return CFG.matches.find(m => m.id === id);
  }

  function statusOf(match) {
    return BFLogic.getStatus(match, state.results, Date.now());
  }

  function isAdmin() {
    return !!(state.currentUser && state.currentUser.email === ADMIN_EMAIL);
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
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    auth.signInWithPopup(provider).catch(e => {
      alert('LOGIN ERROR: ' + e.code + '\n' + e.message);
      console.error(e);
    });
  }
  function logout() { auth.signOut(); }

  async function saveUserProfile(user) {
    await db.collection('users').doc(user.uid).set({
      uid: user.uid, displayName: user.displayName,
      email: user.email, photoURL: user.photoURL,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }

  /* ── LOADING STATE ── */
  let _authReady = false, _resultsReady = false;
  function checkHideLoading() {
    if (!_authReady || !_resultsReady) return;
    const el = document.getElementById('loadingScreen');
    if (el) el.classList.add('hidden');
  }

  function wireAuth() {
    auth.onAuthStateChanged(async user => {
      state.currentUser = user;
      if (predUnsubscribe) { predUnsubscribe(); predUnsubscribe = null; }
      if (user) {
        await saveUserProfile(user);
        predUnsubscribe = db.collection('predictions')
          .where('userId', '==', user.uid)
          .onSnapshot(snap => {
            snap.forEach(d => { state.predictions[d.data().matchId] = d.data(); });
            CFG.onRender();
          });
      } else {
        state.predictions = {};
        CFG.onRender();
      }
      updateNavbar(user);
      toggleAdmin(user);
      rebuildLeaderboard();
      _authReady = true;
      checkHideLoading();
    });
  }

  /* ── RESULTS LISTENER ── */
  function wireResults() {
    db.collection('results').onSnapshot(snap => {
      state.results = {};
      snap.forEach(d => { state.results[d.id] = d.data(); });
      CFG.onRender();
      rebuildLeaderboard();
      if (!_resultsReady) { _resultsReady = true; checkHideLoading(); }
    });
  }

  /* ── LEADERBOARD ── */
  function rebuildLeaderboard() {
    db.collection('predictions').get().then(snap => {
      const rows = [];
      snap.forEach(d => rows.push(d.data()));
      state.leaderboardData = BFLogic.tallyLeaderboard(rows, state.results, matchIdSet);
      renderLeaderboard();
    });
  }

  function renderLeaderboard() {
    const el = document.getElementById('leaderboardBody');
    if (!el) return;
    const displayData = isAdmin()
      ? state.leaderboardData
      : state.leaderboardData.filter(e => e.email !== ADMIN_EMAIL);
    if (!displayData.length) {
      el.innerHTML = '<div class="lb-empty">Поки немає завершених матчів 🕐</div>';
      return;
    }
    const medals = ['🥇', '🥈', '🥉'];
    const tierClass = ['gold', 'silver', 'bronze'];
    el.innerHTML = displayData.map((e, i) => {
      const isAdminEntry = e.email === ADMIN_EMAIL;
      const displayName  = isAdminEntry ? 'Admin' : e.name;
      const initials     = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const photoHtml    = (!isAdminEntry && e.photo)
        ? `<img src="${e.photo}" class="lb-avatar" referrerpolicy="no-referrer" />`
        : `<div class="lb-initials">${initials}</div>`;
      const medal   = i < 3 ? medals[i] : String(i + 1);
      const tier    = i < 3 ? tierClass[i] : 'normal';
      const isMe    = state.currentUser && e.uid === state.currentUser.uid;
      return `
    <div class="lb-card ${tier}${isMe ? ' lb-me' : ''}">
      <span class="lb-medal">${medal}</span>
      ${photoHtml}
      <span class="lb-name">${displayName}</span>
      <span class="lb-pts">${e.pts} <span>балів</span></span>
    </div>`;
    }).join('');
  }

  /* ── PREDICTIONS ── */
  async function savePrediction(matchId, homeGoals, awayGoals) {
    if (!state.currentUser) return;
    await db.collection('predictions').doc(`${state.currentUser.uid}_${matchId}`).set({
      userId: state.currentUser.uid, matchId,
      tournament: CFG.id,
      homeGoals, awayGoals,
      displayName: state.currentUser.displayName,
      photoURL: state.currentUser.photoURL,
      email: state.currentUser.email,
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
    if (!isAdmin()) return;
    await db.collection('results').doc(matchId).set({
      advancedTeam: side,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }

  async function resetResult(matchId) {
    if (!isAdmin()) return;
    if (!confirm('Скинути результат матчу? Всі нараховані бали за цей матч будуть анульовані.')) return;
    await db.collection('results').doc(matchId).delete();
    delete state.results[matchId];
    CFG.onRender();
    rebuildLeaderboard();
  }

  /* Both delete operations below act on the top-level `predictions`
     collection, which holds every tournament's rows in one place. Without
     scoping, deleting from one tournament's admin page would also wipe the
     other tournament's predictions. BFLogic.scopeToMatchIds keeps only the
     rows whose matchId belongs to THIS page's matchIdSet (built in init()),
     so a foreign-tournament prediction is left untouched. */
  async function deleteAllPredictions() {
    if (!isAdmin()) return;
    if (!confirm(`Видалити ВСІ прогнози всіх учасників турніру "${CFG.id}"? Цю дію не можна скасувати.`)) return;
    const snap = await db.collection('predictions').get();
    const rows = snap.docs.map(d => ({ ref: d.ref, matchId: d.data().matchId }));
    const toDelete = BFLogic.scopeToMatchIds(rows, matchIdSet);
    if (!toDelete.length) { alert('Прогнозів не знайдено.'); return; }
    const batch = db.batch();
    toDelete.forEach(r => batch.delete(r.ref));
    await batch.commit();
    toDelete.forEach(r => { delete state.predictions[r.matchId]; });
    CFG.onRender();
  }

  async function deleteAdminPredictions() {
    if (!isAdmin()) return;
    if (!confirm(`Видалити всі прогнози адміна турніру "${CFG.id}"? Цю дію не можна скасувати.`)) return;
    const snap = await db.collection('predictions').where('email', '==', ADMIN_EMAIL).get();
    const rows = snap.docs.map(d => ({ ref: d.ref, matchId: d.data().matchId }));
    const toDelete = BFLogic.scopeToMatchIds(rows, matchIdSet);
    if (!toDelete.length) { alert('Прогнозів адміна не знайдено.'); return; }
    const batch = db.batch();
    toDelete.forEach(r => batch.delete(r.ref));
    await batch.commit();
    toDelete.forEach(r => { delete state.predictions[r.matchId]; });
    CFG.onRender();
  }

  /* ── NAVBAR ── */
  function updateNavbar(user) {
    const el = document.getElementById('authArea');
    if (!el) return;
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

  /* ── ADMIN VISIBILITY ── */
  function toggleAdmin(user) {
    const sec = document.getElementById('adminSection');
    if (!sec) return;
    sec.classList.toggle('visible', !!(user && user.email === ADMIN_EMAIL));
  }

  /* ── MODAL ──
     `teams` is supplied by the page, which knows how to resolve its own teams:
       { home, away, tbd, finishedExtraHtml } */
  function openModal(matchId, teams) {
    const m        = findMatch(matchId);
    const homeTeam = teams.home;
    const awayTeam = teams.away;
    const isTbd    = !!teams.tbd;
    const status   = statusOf(m);
    const pred     = state.predictions[matchId];
    const res      = state.results[matchId];

    let pts = null;
    if (pred && res && res.status === 'finished')
      pts = BFLogic.calcPoints(pred.homeGoals, pred.awayGoals, res.homeGoals, res.awayGoals);

    const ptsHtml = pts === null ? '' :
      pts === 3 ? '<div class="pts-msg gold">🎯 Точний рахунок! +3 бали</div>' :
      pts === 1 ? '<div class="pts-msg green">✅ Правильний напрямок! +1 бал</div>' :
                  '<div class="pts-msg red">😔 Не пощастило! +0 балів</div>';

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
    } else if (!state.currentUser) {
      bodyHtml = `
      <div class="modal-login-prompt">
        <p>Щоб зробити прогноз, увійдіть через Google</p>
        <button class="btn-login" onclick="login();closeModal()">Увійти через Google</button>
      </div>`;
    } else if (status === 'finished') {
      const advHtml = teams.finishedExtraHtml || '';
      bodyHtml = `
      <div class="modal-result">
        <div class="result-score">Результат (90 хв) — <strong>${res.homeGoals} : ${res.awayGoals}</strong></div>
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
        <p>${status === 'live' ? 'Матч вже почався — прогнози закриті' : 'Прогнози закриті — матч уже розпочався'}</p>
        ${pred
          ? `<div class="pred-score">Твій прогноз: ${pred.homeGoals} : ${pred.awayGoals}</div>`
          : `<div class="pred-score grey">Ти не встиг зробити прогноз</div>`}
      </div>`;
    } else {
      const currentBetHtml = pred ? `
      <div class="modal-current-bet">
        <div class="modal-current-bet-label">✓ Твій прогноз</div>
        <div class="modal-current-bet-score">${pred.homeGoals} : ${pred.awayGoals}</div>
      </div>` : '';
      bodyHtml = `
      ${currentBetHtml}
      <form onsubmit="submitPrediction(event,'${matchId}')">
        <div class="score-input">
          <div class="score-team">
            <span>${homeTeam.flag}</span>
            <span class="team-name">${homeTeam.name}</span>
            <input type="number" id="homeInput" value="${pred ? pred.homeGoals : 0}" min="0" max="19" required />
          </div>
          <span class="score-colon">:</span>
          <div class="score-team">
            <span>${awayTeam.flag}</span>
            <span class="team-name">${awayTeam.name}</span>
            <input type="number" id="awayInput" value="${pred ? pred.awayGoals : 0}" min="0" max="19" required />
          </div>
        </div>
        <button type="submit" class="btn-submit">
          ${pred ? '🔄 Змінити прогноз' : '⚽ Зробити прогноз'}
        </button>
        <p class="deadline-note">🔒 Прогноз можна поставити до початку матчу</p>
      </form>`;
    }

    const bettersSection = isTbd ? '' :
      `<div id="modalBetters" class="modal-betters"><span class="modal-betters-loading">…</span></div>`;

    document.getElementById('modalContent').innerHTML = headerHtml + bodyHtml + bettersSection;
    document.getElementById('modal').classList.add('open');
    if (!isTbd) loadMatchBetters(matchId);
  }

  async function loadMatchBetters(matchId) {
    try {
      const snap = await db.collection('predictions').where('matchId', '==', matchId).get();
      const el = document.getElementById('modalBetters');
      if (!el) return;
      const res = state.results[matchId];
      const finished = res && res.status === 'finished';
      const entries = [];
      snap.forEach(d => {
        const p = d.data();
        if (!p.displayName) return;
        entries.push(p);
      });
      if (!entries.length) {
        el.innerHTML = `<div class="modal-betters-box modal-betters-empty-box"><p class="modal-betters-empty">Ніхто ще не зробив свій прогноз на гру</p></div>`;
        return;
      }
      if (finished) {
        entries.sort((a, b) => {
          const pa = BFLogic.calcPoints(a.homeGoals, a.awayGoals, res.homeGoals, res.awayGoals);
          const pb = BFLogic.calcPoints(b.homeGoals, b.awayGoals, res.homeGoals, res.awayGoals);
          return pb - pa;
        });
        const rows = entries.map(p => {
          const name = p.email === ADMIN_EMAIL ? 'Admin' : p.displayName;
          const pts = BFLogic.calcPoints(p.homeGoals, p.awayGoals, res.homeGoals, res.awayGoals);
          const ptsClass = pts === 3 ? 'pts-gold' : pts === 1 ? 'pts-green' : 'pts-red';
          const ptsLabel = pts === 3 ? '3 бали 🎯' : pts === 1 ? '1 бал ✅' : '0 балів';
          return `<div class="modal-betters-row">
          <span class="modal-betters-row-name">👤 ${name}</span>
          <span class="modal-betters-row-pred">${p.homeGoals}:${p.awayGoals}</span>
          <span class="modal-betters-row-pts ${ptsClass}">${ptsLabel}</span>
        </div>`;
        }).join('');
        el.innerHTML = `<div class="modal-betters-box"><div class="modal-betters-label">Прогнози учасників:</div>${rows}</div>`;
      } else {
        const rows = entries.map(p => {
          const name = p.email === ADMIN_EMAIL ? 'Admin' : p.displayName;
          return `<div class="modal-betters-name">👤 ${name}</div>`;
        }).join('');
        el.innerHTML = `<div class="modal-betters-box"><div class="modal-betters-label">Прогноз прийнятий від:</div>${rows}</div>`;
      }
    } catch(e) {}
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
    state.predictions[matchId] = { homeGoals: h, awayGoals: a };
    closeModal();
  }

  /* ── CLOSE ON BACKDROP ── */
  function wireModalDismiss() {
    const overlay = document.getElementById('modal');
    if (overlay) {
      overlay.addEventListener('click', e => {
        if (e.target === e.currentTarget) closeModal();
      });
    }
    const closeBtn = document.getElementById('modalCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
  }

  return {
    init, state,
    savePrediction, rebuildLeaderboard, renderLeaderboard,
    openModal, closeModal, submitPrediction, loadMatchBetters,
    fmtDate, isAdmin,
    saveResult, resetResult, setAdvancer,
    deleteAdminPredictions, deleteAllPredictions,
    login, logout
  };
})();

/* Inline onclick= / onsubmit= handlers in the HTML resolve against the global
   scope, so these have to stay reachable as bare globals. */
var login                  = BFShared.login;
var logout                 = BFShared.logout;
var closeModal             = BFShared.closeModal;
var submitPrediction       = BFShared.submitPrediction;
var setAdvancer            = BFShared.setAdvancer;
var resetResult            = BFShared.resetResult;
var deleteAdminPredictions = BFShared.deleteAdminPredictions;
var deleteAllPredictions   = BFShared.deleteAllPredictions;
