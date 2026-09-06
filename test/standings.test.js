const test = require('node:test');
const assert = require('node:assert');
const { computeStandings, currentMatchday } = require('../logic.js');

const codes = ['AAA', 'BBB', 'CCC', 'DDD'];
const matches = [
  { id: 'm1', matchday: 1, home: 'AAA', away: 'BBB' },
  { id: 'm2', matchday: 1, home: 'CCC', away: 'DDD' },
  { id: 'm3', matchday: 2, home: 'AAA', away: 'CCC' },
];

test('teams with no played matches still appear with zeroes', () => {
  const t = computeStandings(codes, matches, {});
  assert.strictEqual(t.length, 4);
  assert.deepStrictEqual(
    t.map(r => [r.played, r.pts]),
    [[0, 0], [0, 0], [0, 0], [0, 0]]
  );
});

test('win gives 3 points, draw gives 1', () => {
  const results = {
    m1: { status: 'finished', homeGoals: 2, awayGoals: 0 },
    m2: { status: 'finished', homeGoals: 1, awayGoals: 1 },
  };
  const t = computeStandings(codes, matches, results);
  const by = Object.fromEntries(t.map(r => [r.code, r]));
  assert.strictEqual(by.AAA.pts, 3);
  assert.strictEqual(by.AAA.win, 1);
  assert.strictEqual(by.BBB.pts, 0);
  assert.strictEqual(by.BBB.loss, 1);
  assert.strictEqual(by.CCC.pts, 1);
  assert.strictEqual(by.DDD.draw, 1);
});

test('goals for and against are counted from both sides', () => {
  const results = { m1: { status: 'finished', homeGoals: 3, awayGoals: 1 } };
  const by = Object.fromEntries(computeStandings(codes, matches, results).map(r => [r.code, r]));
  assert.deepStrictEqual([by.AAA.gf, by.AAA.ga, by.AAA.gd], [3, 1, 2]);
  assert.deepStrictEqual([by.BBB.gf, by.BBB.ga, by.BBB.gd], [1, 3, -2]);
});

test('unfinished results are ignored', () => {
  const results = { m1: { status: 'live', homeGoals: 5, awayGoals: 0 } };
  const by = Object.fromEntries(computeStandings(codes, matches, results).map(r => [r.code, r]));
  assert.strictEqual(by.AAA.played, 0);
});

test('sorts by points, then goal difference, then goals scored', () => {
  const results = {
    m1: { status: 'finished', homeGoals: 1, awayGoals: 0 },
    m2: { status: 'finished', homeGoals: 3, awayGoals: 0 },
  };
  const t = computeStandings(codes, matches, results);
  assert.strictEqual(t[0].code, 'CCC');
  assert.strictEqual(t[0].rank, 1);
  assert.strictEqual(t[1].code, 'AAA');
  assert.strictEqual(t[1].rank, 2);
});

test('currentMatchday returns the matchday still in play', () => {
  const ms = [
    { matchday: 1, kickoff: '2026-09-08T19:00:00Z' },
    { matchday: 2, kickoff: '2026-10-13T19:00:00Z' },
  ];
  assert.strictEqual(currentMatchday(ms, Date.parse('2026-09-01T00:00:00Z')), 1);
  assert.strictEqual(currentMatchday(ms, Date.parse('2026-09-08T20:00:00Z')), 1);
  assert.strictEqual(currentMatchday(ms, Date.parse('2026-09-09T00:00:00Z')), 2);
  assert.strictEqual(currentMatchday(ms, Date.parse('2027-06-01T00:00:00Z')), 2);
});
