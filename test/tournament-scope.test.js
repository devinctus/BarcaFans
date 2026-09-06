const test = require('node:test');
const assert = require('node:assert');
const { scopeToMatchIds } = require('../logic.js');

/* shared.js's deleteAllPredictions/deleteAdminPredictions delegate the actual
   scoping decision to BFLogic.scopeToMatchIds, called with
   tournamentMatchIdSet (built in init() from ALL of config.matches). This
   test proves that decision keeps a prediction belonging to another
   tournament out of the delete set, i.e. it survives a scoped bulk-delete. */

test('scopeToMatchIds only selects rows for the current tournament', () => {
  const uclMatchIdSet = new Set(['ucl_md1_01', 'ucl_md1_02']);
  const rows = [
    { matchId: 'ucl_md1_01', ref: 'a' },
    { matchId: 'r32_01', ref: 'b' },   // belongs to WC 2026, not UCL
    { matchId: 'ucl_md1_02', ref: 'c' },
  ];

  const toDelete = scopeToMatchIds(rows, uclMatchIdSet);

  assert.strictEqual(toDelete.length, 2);
  assert.deepStrictEqual(toDelete.map(r => r.matchId).sort(), ['ucl_md1_01', 'ucl_md1_02']);
  assert.ok(
    !toDelete.some(r => r.matchId === 'r32_01'),
    'a prediction belonging to another tournament must survive the scoped delete'
  );
});

test('scopeToMatchIds returns nothing when no row matches the tournament', () => {
  const wcMatchIdSet = new Set(['r32_01', 'r32_02']);
  const rows = [{ matchId: 'ucl_md1_01', ref: 'x' }];
  assert.deepStrictEqual(scopeToMatchIds(rows, wcMatchIdSet), []);
});

/* Regression test for the leaderboard/tournament conflation bug: shared.js
   used to scope BOTH the leaderboard tally AND the admin bulk-delete with
   the same filtered set (all matches MINUS config.excluded). That set is
   correct for leaderboard scoring (WC2026 deliberately excludes r32_03 from
   points via LEADERBOARD_EXCLUDED, see wc2026.js), but wrong for deletion:
   r32_03 is still part of the WC2026 tournament, so "delete all predictions"
   must still remove predictions on it even though it scores zero points.
   shared.js now builds two separate sets in init():
     - leaderboardMatchIdSet = all matches MINUS excluded (feeds tallyLeaderboard)
     - tournamentMatchIdSet  = ALL matches, excluded included (feeds the two
       delete functions via scopeToMatchIds)
   This test reconstructs both sets the same way init() does and proves a
   prediction on the leaderboard-excluded match is absent from
   leaderboardMatchIdSet (so it would score 0 on the leaderboard) yet is
   still selected for deletion when scopeToMatchIds is called with
   tournamentMatchIdSet, matching the two real call sites in shared.js
   (deleteAllPredictions / deleteAdminPredictions). */
test('a prediction on a leaderboard-excluded match is still deleted by the tournament-scoped delete', () => {
  const matches = [
    { id: 'r32_01' },
    { id: 'r32_02' },
    { id: 'r32_03' },
  ];
  const excluded = ['r32_03']; // mirrors wc2026.js's LEADERBOARD_EXCLUDED

  // Same construction as BFShared.init() in shared.js.
  const tournamentMatchIdSet = new Set(matches.map(m => m.id));
  const leaderboardMatchIdSet = new Set(
    matches.map(m => m.id).filter(id => !excluded.includes(id))
  );

  // r32_03 must NOT count toward leaderboard scoring...
  assert.ok(!leaderboardMatchIdSet.has('r32_03'));

  // ...but it IS still part of the tournament, so a prediction on it must
  // survive scoping by tournamentMatchIdSet and be selected for deletion.
  const rows = [
    { matchId: 'r32_01', ref: 'a' },
    { matchId: 'r32_03', ref: 'b' }, // excluded from leaderboard, still in tournament
  ];
  const toDelete = scopeToMatchIds(rows, tournamentMatchIdSet);

  assert.strictEqual(toDelete.length, 2);
  assert.ok(
    toDelete.some(r => r.matchId === 'r32_03'),
    'a prediction on a leaderboard-excluded match must still be deleted by the tournament-scoped delete'
  );
});
