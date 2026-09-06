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

  return { calcPoints, getStatus, tallyLeaderboard, LIVE_WINDOW_MS };
});
