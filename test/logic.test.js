const test = require('node:test');
const assert = require('node:assert');
const { calcPoints, getStatus } = require('../logic.js');

test('calcPoints: exact score gives 3', () => {
  assert.strictEqual(calcPoints(2, 1, 2, 1), 3);
  assert.strictEqual(calcPoints(0, 0, 0, 0), 3);
});

test('calcPoints: correct direction gives 1', () => {
  assert.strictEqual(calcPoints(2, 1, 3, 1), 1);
  assert.strictEqual(calcPoints(2, 2, 1, 1), 1);
  assert.strictEqual(calcPoints(0, 3, 1, 4), 1);
});

test('calcPoints: wrong direction gives 0', () => {
  assert.strictEqual(calcPoints(2, 1, 1, 2), 0);
  assert.strictEqual(calcPoints(1, 1, 2, 0), 0);
});

test('getStatus: finished when a result is stored', () => {
  const m = { id: 'x', kickoff: '2026-09-08T19:00:00Z' };
  const now = Date.parse('2026-09-08T18:00:00Z');
  assert.strictEqual(getStatus(m, { x: { status: 'finished' } }, now), 'finished');
});

test('getStatus: upcoming before kickoff', () => {
  const m = { id: 'x', kickoff: '2026-09-08T19:00:00Z' };
  const now = Date.parse('2026-09-08T18:59:00Z');
  assert.strictEqual(getStatus(m, {}, now), 'upcoming');
});

test('getStatus: live from kickoff until three hours after', () => {
  const m = { id: 'x', kickoff: '2026-09-08T19:00:00Z' };
  assert.strictEqual(getStatus(m, {}, Date.parse('2026-09-08T19:00:00Z')), 'live');
  assert.strictEqual(getStatus(m, {}, Date.parse('2026-09-08T21:59:00Z')), 'live');
});

test('getStatus: closed after the live window, never reopens', () => {
  const m = { id: 'x', kickoff: '2026-09-08T19:00:00Z' };
  assert.strictEqual(getStatus(m, {}, Date.parse('2026-09-08T22:00:00Z')), 'closed');
  assert.strictEqual(getStatus(m, {}, Date.parse('2027-01-01T00:00:00Z')), 'closed');
});
