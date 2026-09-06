const test = require('node:test');
const assert = require('node:assert');
const { tallyLeaderboard } = require('../logic.js');

const results = {
  r32_01: { status: 'finished', homeGoals: 2, awayGoals: 1 },
  ucl_md1_01: { status: 'finished', homeGoals: 0, awayGoals: 0 },
};

const predictions = [
  { userId: 'u1', matchId: 'r32_01',     homeGoals: 2, awayGoals: 1, displayName: 'A' },
  { userId: 'u1', matchId: 'ucl_md1_01', homeGoals: 1, awayGoals: 1, displayName: 'A' },
  { userId: 'u2', matchId: 'ucl_md1_01', homeGoals: 0, awayGoals: 0, displayName: 'B' },
];

test('tally counts only matches belonging to the given tournament', () => {
  const wc = tallyLeaderboard(predictions, results, new Set(['r32_01']));
  assert.deepStrictEqual(wc.map(e => [e.uid, e.pts]), [['u1', 3]]);
});

test('tally keeps tournaments separate', () => {
  const ucl = tallyLeaderboard(predictions, results, new Set(['ucl_md1_01']));
  assert.deepStrictEqual(ucl.map(e => [e.uid, e.pts]), [['u2', 3], ['u1', 1]]);
});

test('tally ignores matches without a finished result', () => {
  const ucl = tallyLeaderboard(predictions, {}, new Set(['ucl_md1_01']));
  assert.deepStrictEqual(ucl, []);
});

/* An excluded match must contribute no points.
   The set below is built exactly the way BFShared.init builds it from
   { matches, excluded }, so this pins the production semantics. */
test('an excluded match contributes no points', () => {
  const matches = [{ id: 'r32_01' }, { id: 'r32_03' }];
  const excluded = ['r32_03'];
  const matchIdSet = new Set(matches.map(m => m.id).filter(id => !excluded.includes(id)));

  const res = {
    r32_01: { status: 'finished', homeGoals: 2, awayGoals: 1 },
    r32_03: { status: 'finished', homeGoals: 1, awayGoals: 0 },
  };
  const preds = [
    { userId: 'u1', matchId: 'r32_01', homeGoals: 2, awayGoals: 1, displayName: 'A' },
    { userId: 'u1', matchId: 'r32_03', homeGoals: 1, awayGoals: 0, displayName: 'A' },
    { userId: 'u2', matchId: 'r32_03', homeGoals: 1, awayGoals: 0, displayName: 'B' },
  ];

  assert.ok(!matchIdSet.has('r32_03'));
  // u1 gets 3 for r32_01 only (the exact r32_03 hit is not counted);
  // u2 predicted only the excluded match and does not appear at all.
  assert.deepStrictEqual(
    tallyLeaderboard(preds, res, matchIdSet).map(e => [e.uid, e.pts]),
    [['u1', 3]]
  );
});

/* Row shape the leaderboard renderer depends on: the admin row must carry the
   admin email so non-admin viewers can filter it out, even when an earlier
   prediction doc for the same user has no email field. */
test('tally carries name, photo and email onto each row', () => {
  const res = { m1: { status: 'finished', homeGoals: 1, awayGoals: 0 },
                m2: { status: 'finished', homeGoals: 1, awayGoals: 0 } };
  const preds = [
    { userId: 'u1', matchId: 'm1', homeGoals: 1, awayGoals: 0, displayName: 'Old', photoURL: 'p1' },
    { userId: 'u1', matchId: 'm2', homeGoals: 1, awayGoals: 0, displayName: 'New', photoURL: 'p2', email: 'a@b.c' },
  ];
  const [row] = tallyLeaderboard(preds, res, new Set(['m1', 'm2']));
  assert.strictEqual(row.pts, 6);
  assert.strictEqual(row.name, 'New');
  assert.strictEqual(row.photo, 'p2');
  assert.strictEqual(row.email, 'a@b.c');
});
