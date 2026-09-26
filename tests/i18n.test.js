import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DESTINATIONS, EDGES, SHOPS } from '../js/data.js';
import { DEST_EN, ATTR_EN, FOOD_EN, SHOP_EN, LINE_EN, TIP_EN } from '../js/data-en.js';

test('every place, spot and food has an English translation', () => {
  for (const d of DESTINATIONS) {
    assert.ok(DEST_EN[d.id], d.id);
    for (const a of d.attractions) {
      assert.ok(ATTR_EN[a.id]?.name && ATTR_EN[a.id]?.desc, a.id);
      if (a.tip) assert.ok(ATTR_EN[a.id].tip, `${a.id} tip`);
    }
    for (const f of d.foods) assert.ok(FOOD_EN[`${d.id}:${f.name}`], `${d.id}:${f.name}`);
  }
});

test('every shop, line and tip has an English translation', () => {
  for (const x of Object.values(SHOPS).flat()) assert.ok(SHOP_EN[x.name], x.name);
  for (const e of EDGES) {
    assert.ok(LINE_EN[e.name], e.name);
    if (e.tip) assert.ok(TIP_EN[e.tip], e.tip);
  }
});
