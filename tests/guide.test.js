import { test } from 'node:test';
import assert from 'node:assert/strict';
import { askGuide, findDestinations } from '../js/guide.js';

test('問交通會回傳路線', () => {
  const a = askGuide('從台北到花蓮怎麼去?');
  assert.deepEqual(a.action, { type: 'route', from: 'taipei', to: 'hualien' });
});

test('問美食會推薦當地小吃', () => {
  const a = askGuide('台南有什麼好吃的');
  assert.equal(a.action.type, 'food');
  assert.match(a.text, /牛肉湯/);
});

test('桃園機場不會被誤判成桃園', () => {
  assert.deepEqual(findDestinations('從桃園機場到台北'), ['airport', 'taipei']);
});

test('雨天問題推薦室內景點', () => {
  const a = askGuide('下雨天可以去哪');
  assert.match(a.text, /故宮|博物館|101/);
});
