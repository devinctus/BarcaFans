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

  return { calcPoints, getStatus, LIVE_WINDOW_MS };
});
