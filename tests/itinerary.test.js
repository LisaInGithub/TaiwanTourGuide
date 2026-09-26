import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateItinerary, recommend } from '../js/itinerary.js';

test('產生指定天數的行程,且景點不重複', () => {
  const plan = generateItinerary({ start: 'taipei', days: 4, interests: ['美食', '老街'] });
  assert.equal(plan.length, 4);
  const spots = plan.flatMap((d) => d.items.filter((i) => i.type === 'spot').map((i) => i.id));
  assert.equal(new Set(spots).size, spots.length);
  assert.ok(spots.length >= 6);
});

test('每天景點時數不超過步調上限', () => {
  const plan = generateItinerary({ start: 'tainan', days: 3, interests: [], pace: 'relaxed' });
  for (const d of plan) {
    const hrs = d.items.filter((i) => i.type === 'spot').reduce((s, i) => s + i.hours, 0);
    assert.ok(hrs <= 5, `Day ${d.day}: ${hrs}`);
  }
});

test('勾選回到出發地時,最後住宿為出發地', () => {
  const plan = generateItinerary({ start: 'taipei', days: 5, interests: ['自然'], returnToStart: true });
  assert.equal(plan.at(-1).stayAt, '台北');
});

test('推薦結果符合興趣', () => {
  const recs = recommend(['溫泉']);
  assert.ok(recs.length > 0);
  assert.ok(recs.every((a) => a.tags.includes('溫泉')));
});
