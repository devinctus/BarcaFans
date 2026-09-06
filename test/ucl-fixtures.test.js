const test = require('node:test');
const assert = require('node:assert');
const { UCL_TEAMS, UCL_MATCHES } = require('../ucl-data.js');

const MD_WINDOWS = {
  1: ['2026-09-08', '2026-09-10'], 2: ['2026-10-13', '2026-10-14'],
  3: ['2026-10-20', '2026-10-21'], 4: ['2026-11-03', '2026-11-04'],
  5: ['2026-11-24', '2026-11-25'], 6: ['2026-12-08', '2026-12-09'],
  7: ['2027-01-19', '2027-01-20'], 8: ['2027-01-27', '2027-01-27'],
};

test('exactly 144 matches', () => {
  assert.strictEqual(UCL_MATCHES.length, 144);
});

test('every match id is unique and ucl_ prefixed', () => {
  const ids = UCL_MATCHES.map(m => m.id);
  assert.strictEqual(new Set(ids).size, 144);
  for (const id of ids) assert.match(id, /^ucl_md[1-8]_\d{2}$/);
});

test('every matchday has 18 matches', () => {
  for (let md = 1; md <= 8; md++) {
    const n = UCL_MATCHES.filter(m => m.matchday === md).length;
    assert.strictEqual(n, 18, `matchday ${md} has ${n} matches`);
  }
});

test('every club plays exactly 8 matches, 4 home and 4 away', () => {
  for (const code of Object.keys(UCL_TEAMS)) {
    const home = UCL_MATCHES.filter(m => m.home === code).length;
    const away = UCL_MATCHES.filter(m => m.away === code).length;
    assert.strictEqual(home, 4, `${code} has ${home} home matches`);
    assert.strictEqual(away, 4, `${code} has ${away} away matches`);
  }
});

test('every club faces 8 distinct opponents', () => {
  for (const code of Object.keys(UCL_TEAMS)) {
    const opps = UCL_MATCHES
      .filter(m => m.home === code || m.away === code)
      .map(m => (m.home === code ? m.away : m.home));
    assert.strictEqual(new Set(opps).size, 8, `${code} has duplicate opponents`);
  }
});

test('every club faces exactly two clubs from each pot', () => {
  for (const code of Object.keys(UCL_TEAMS)) {
    const opps = UCL_MATCHES
      .filter(m => m.home === code || m.away === code)
      .map(m => (m.home === code ? m.away : m.home));
    for (const pot of [1, 2, 3, 4]) {
      const n = opps.filter(o => UCL_TEAMS[o].pot === pot).length;
      assert.strictEqual(n, 2, `${code} faces ${n} clubs from pot ${pot}`);
    }
  }
});

test('no club faces a club from its own country', () => {
  for (const m of UCL_MATCHES) {
    assert.notStrictEqual(
      UCL_TEAMS[m.home].country, UCL_TEAMS[m.away].country,
      `${m.id}: ${m.home} v ${m.away} are from the same country`
    );
  }
});

test('no club plays twice in the same matchday', () => {
  for (let md = 1; md <= 8; md++) {
    const seen = new Set();
    for (const m of UCL_MATCHES.filter(x => x.matchday === md)) {
      assert.ok(!seen.has(m.home), `${m.home} plays twice on MD${md}`);
      assert.ok(!seen.has(m.away), `${m.away} plays twice on MD${md}`);
      seen.add(m.home); seen.add(m.away);
    }
  }
});

test('every kickoff is valid UTC inside its matchday window', () => {
  for (const m of UCL_MATCHES) {
    assert.match(m.kickoff, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, `${m.id}: bad kickoff format`);
    const day = m.kickoff.slice(0, 10);
    const [from, to] = MD_WINDOWS[m.matchday];
    assert.ok(day >= from && day <= to, `${m.id}: ${day} outside MD${m.matchday} window`);
  }
});

test('both teams of every match exist in UCL_TEAMS', () => {
  for (const m of UCL_MATCHES) {
    assert.ok(UCL_TEAMS[m.home], `${m.id}: unknown home ${m.home}`);
    assert.ok(UCL_TEAMS[m.away], `${m.id}: unknown away ${m.away}`);
  }
});
