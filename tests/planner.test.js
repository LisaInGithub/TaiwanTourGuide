import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planRoute, planAlternatives } from '../js/planner.js';
import { DESTINATIONS, EDGES } from '../js/data.js';

test('台北到高雄最快走高鐵,且合併成一段', () => {
  const r = planRoute('taipei', 'kaohsiung', 'fastest');
  assert.equal(r.legs.length, 1);
  assert.equal(r.legs[0].mode, 'hsr');
  assert.equal(r.transfers, 0);
});

test('台北到高雄最省錢不搭高鐵', () => {
  const r = planRoute('taipei', 'kaohsiung', 'cheapest');
  assert.ok(r.legs.every((l) => l.mode !== 'hsr'));
  assert.ok(r.totalFare < planRoute('taipei', 'kaohsiung', 'fastest').totalFare);
});

test('台北到日月潭需轉乘高鐵+客運', () => {
  const r = planRoute('taipei', 'sunmoonlake');
  assert.deepEqual(r.legs.map((l) => l.mode), ['hsr', 'bus']);
  assert.equal(r.transfers, 1);
});

test('台北到花蓮直達台鐵', () => {
  const r = planRoute('taipei', 'hualien');
  assert.equal(r.legs.length, 1);
  assert.equal(r.legs[0].mode, 'tra');
});

test('每個地點都能從台北抵達', () => {
  for (const d of DESTINATIONS) {
    if (d.id === 'taipei') continue;
    assert.ok(planRoute('taipei', d.id), `無法到達 ${d.name}`);
  }
});

test('路網只引用存在的地點', () => {
  const ids = new Set(DESTINATIONS.map((d) => d.id));
  for (const e of EDGES) assert.ok(ids.has(e.a) && ids.has(e.b), `${e.a}-${e.b}`);
});

test('替代方案不重複', () => {
  const alts = planAlternatives('taipei', 'tainan');
  assert.equal(new Set(alts.map((a) => a.sig)).size, alts.length);
  assert.ok(alts.length >= 2);
});

test('離島不會被當成轉乘點', () => {
  for (const s of ['fastest', 'cheapest', 'fewest']) {
    const r = planRoute('taipei', 'kaohsiung', s);
    assert.ok(r.legs.every((l) => !l.stops.slice(1, -1).includes('penghu') && l.to !== 'penghu'));
  }
});
