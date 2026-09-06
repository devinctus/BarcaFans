const test = require('node:test');
const assert = require('node:assert');
const { UCL_TEAMS } = require('../ucl-data.js');

test('there are exactly 36 clubs', () => {
  assert.strictEqual(Object.keys(UCL_TEAMS).length, 36);
});

test('each pot holds exactly 9 clubs', () => {
  for (const pot of [1, 2, 3, 4]) {
    const n = Object.values(UCL_TEAMS).filter(t => t.pot === pot).length;
    assert.strictEqual(n, 9, `pot ${pot} has ${n} clubs`);
  }
});

test('every club has code, name, country flag, pot and crest path', () => {
  for (const [key, t] of Object.entries(UCL_TEAMS)) {
    assert.strictEqual(t.code, key, `key ${key} does not match code ${t.code}`);
    assert.ok(t.name && t.name.length > 2, `${key}: missing name`);
    assert.ok(/\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}]/u.test(t.country), `${key}: country must be an emoji flag`);
    assert.ok([1, 2, 3, 4].includes(t.pot), `${key}: bad pot`);
    assert.match(t.crest, /^crests\/[a-z0-9-]+\.(svg|png)$/, `${key}: bad crest path`);
  }
});

test('club codes are unique and uppercase', () => {
  const codes = Object.keys(UCL_TEAMS);
  assert.strictEqual(new Set(codes).size, codes.length);
  for (const c of codes) assert.match(c, /^[A-Z0-9]{3,4}$/);
});
