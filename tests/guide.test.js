import { test } from 'node:test';
import assert from 'node:assert/strict';
import { askGuide, findDestinations } from '../js/guide.js';

test('問交通會回傳路線', () => {
  const a = askGuide('從台北到花蓮怎麼去?', 'zh');
  assert.deepEqual(a.action, { type: 'route', from: 'taipei', to: 'hualien' });
});

test('問美食會推薦當地小吃', () => {
  const a = askGuide('台南有什麼好吃的', 'zh');
  assert.equal(a.action.type, 'food');
  assert.match(a.text, /牛肉湯/);
});

test('桃園機場不會被誤判成桃園', () => {
  assert.deepEqual(findDestinations('從桃園機場到台北'), ['airport', 'taipei']);
});

test('雨天問題推薦室內景點', () => {
  const a = askGuide('下雨天可以去哪', 'zh');
  assert.match(a.text, /故宮|博物館|101/);
});

test('「要多久」也會被當成交通問題', () => {
  assert.deepEqual(askGuide('台北去台南要多久', 'zh').action, { type: 'route', from: 'taipei', to: 'tainan' });
});

test('只講目的地的交通問題,預設從台北出發', () => {
  assert.deepEqual(askGuide('去日月潭要搭什麼車', 'zh').action, { type: 'route', from: 'taipei', to: 'sunmoonlake' });
});

test('「花蓮三天怎麼玩」會排 3 天且留在東部', () => {
  const a = askGuide('花蓮三天怎麼玩', 'zh');
  assert.equal(a.action.type, 'plan');
  assert.equal(a.action.days, 3);
  assert.doesNotMatch(a.text, /住台北/);
});

test('看夕陽會找介紹裡提到夕陽的景點', () => {
  assert.match(askGuide('哪裡看夕陽最美', 'zh').text, /高美濕地|漁人碼頭/);
});

test('指定食物種類會篩選', () => {
  assert.match(askGuide('我在高雄,想吃海鮮', 'zh').text, /旗津/);
});

test('問美食會推薦具體店家,且不寫評分數字', () => {
  const a = askGuide('台南早餐吃什麼', 'zh');
  assert.match(a.text, /阿堂鹹粥|六千牛肉湯/);
  assert.doesNotMatch(a.text, /\d\.\d\s*(分|顆星)/);
});

test('English: route questions', () => {
  assert.deepEqual(askGuide('How do I get from Taipei to Tainan?', 'en').action, { type: 'route', from: 'taipei', to: 'tainan' });
  assert.deepEqual(askGuide('how do I get to Sun Moon Lake', 'en').action, { type: 'route', from: 'taipei', to: 'sunmoonlake' });
});

test('English: "train" is not mistaken for "rain"', () => {
  assert.equal(askGuide('take the train to Jiufen', 'en').action.type, 'route');
});

test('English: itineraries and food keep the Chinese names for locals', () => {
  const plan = askGuide('3 days in Hualien', 'en');
  assert.equal(plan.action.days, 3);
  assert.match(plan.text, /Qixingtan Beach \(七星潭\)/);
  const food = askGuide('What should I eat in Tainan?', 'en');
  assert.match(food.text, /Beef soup \(牛肉湯\)/);
  assert.match(food.text, /cash/i);
});

test('English: sunset keyword', () => {
  assert.match(askGuide('best sunset spot?', 'en').text, /Gaomei Wetlands|Fisherman/);
});
