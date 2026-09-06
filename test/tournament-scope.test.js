const test = require('node:test');
const assert = require('node:assert');
const { scopeToMatchIds } = require('../logic.js');

/* shared.js's deleteAllPredictions/deleteAdminPredictions delegate the actual
   scoping decision to BFLogic.scopeToMatchIds (the same matchIdSet init()
   builds from the page's own matches). This test proves that decision keeps
   a prediction belonging to another tournament out of the delete set, i.e.
   it survives a scoped bulk-delete. */

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
