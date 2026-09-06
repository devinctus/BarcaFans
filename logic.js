/* Pure tournament logic. Loads as a browser global (BFLogic) and as a Node module. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BFLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  const LIVE_WINDOW_MS = 180 * 60000;

  function calcPoints(pH, pA, rH, rA) {
    if (pH === rH && pA === rA) return 3;
    return Math.sign(pH - pA) === Math.sign(rH - rA) ? 1 : 0;
  }

  function getStatus(match, results, now) {
    const res = results[match.id];
    if (res && res.status === 'finished') return 'finished';
    const kickoff = Date.parse(match.kickoff);
    if (now >= kickoff && now < kickoff + LIVE_WINDOW_MS) return 'live';
    if (now >= kickoff) return 'closed';
    return 'upcoming';
  }

  /* Sums points per user across the matches in matchIdSet.
     Only matches with a stored, finished result count.
     name/photo/email follow the last prediction doc seen for that user
     (email only ever overwritten by a truthy value), matching the
     pre-extraction behaviour the leaderboard renderer relies on. */
  function tallyLeaderboard(predictions, results, matchIdSet) {
    const acc = {};
    for (const p of predictions) {
      if (!matchIdSet.has(p.matchId)) continue;
      const r = results[p.matchId];
      if (!r || r.status !== 'finished') continue;
      const e = acc[p.userId] || (acc[p.userId] = {
        uid: p.userId, pts: 0, name: p.displayName, photo: p.photoURL, email: null
      });
      e.pts += calcPoints(p.homeGoals, p.awayGoals, r.homeGoals, r.awayGoals);
      e.name  = p.displayName;
      e.photo = p.photoURL;
      if (p.email) e.email = p.email;
    }
    return Object.values(acc)
      .sort((a, b) => b.pts - a.pts || String(a.name).localeCompare(String(b.name)));
  }

  function computeStandings(teamCodes, matches, results) {
    const table = {};
    for (const code of teamCodes) {
      table[code] = { code, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, gd: 0, pts: 0, rank: 0 };
    }
    for (const m of matches) {
      const r = results[m.id];
      if (!r || r.status !== 'finished') continue;
      const h = table[m.home], a = table[m.away];
      if (!h || !a) continue;
      h.played++; a.played++;
      h.gf += r.homeGoals; h.ga += r.awayGoals;
      a.gf += r.awayGoals; a.ga += r.homeGoals;
      if (r.homeGoals > r.awayGoals)      { h.win++;  a.loss++; h.pts += 3; }
      else if (r.homeGoals < r.awayGoals) { a.win++;  h.loss++; a.pts += 3; }
      else                                { h.draw++; a.draw++; h.pts++; a.pts++; }
    }
    const rows = Object.values(table);
    for (const r of rows) r.gd = r.gf - r.ga;
    rows.sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.code.localeCompare(y.code));
    rows.forEach((r, i) => { r.rank = i + 1; });
    return rows;
  }

  function currentMatchday(matches, now) {
    const mds = [...new Set(matches.map(m => m.matchday))].sort((a, b) => a - b);
    for (const md of mds) {
      const last = Math.max(...matches.filter(m => m.matchday === md).map(m => Date.parse(m.kickoff)));
      if (now < last + LIVE_WINDOW_MS) return md;
    }
    return mds[mds.length - 1];
  }

  return { calcPoints, getStatus, tallyLeaderboard, LIVE_WINDOW_MS, computeStandings, currentMatchday };
});
