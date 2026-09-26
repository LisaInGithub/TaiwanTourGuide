// 「問導遊」離線版:以關鍵字理解旅客問題,回覆景點、美食、交通與行程建議。
// 在 claude.ai 上開啟時會改由 Claude 回答(見 js/ai-guide.js),這裡是沒有網路或無法使用 AI 時的備援。
import { DESTINATIONS, REGIONS, INTERESTS, getDestination, shopsOf } from './data.js';
import { planAlternatives, formatDuration, placeName } from './planner.js';
import { recommend, generateItinerary } from './itinerary.js';

const INTENT_WORDS = {
  route: ['怎麼去', '怎麼到', '怎麼過去', '怎麼前往', '怎麼走', '交通', '搭什麼', '坐什麼', '搭車', '坐車', '搭哪', '坐哪',
    '路線', '多久', '多遠', '車程', '要搭', '要坐', '高鐵', '火車', '客運', '票價', '多少錢'],
  plan: ['行程', '怎麼玩', '怎麼排', '安排', '幾天', '日遊'],
  food: ['吃', '美食', '小吃', '餐廳', '夜市', '好吃', '伴手禮', '喝', '早餐', '宵夜', '海鮮'],
  play: ['玩', '景點', '去哪', '推薦', '好玩', '逛', '看', '走走'],
};

const INTEREST_WORDS = {
  室內: ['下雨', '雨天', '室內', '太熱', '冷氣'],
  親子: ['親子', '小孩', '孩子', '小朋友', '家庭', '帶爸媽'],
  溫泉: ['溫泉', '泡湯'],
  海邊: ['海邊', '海灘', '玩水', '島', '看海'],
  登山: ['爬山', '登山', '步道', '健行'],
  夜景: ['夜景', '晚上', '夜晚'],
  老街: ['老街'],
  文化: ['歷史', '古蹟', '文化', '博物館', '廟', '藝術'],
  自然: ['自然', '風景', '大自然', '森林', '湖'],
  拍照: ['拍照', '打卡', 'ig', 'IG', '網美'],
  購物: ['購物', '逛街', '買'],
};

// 資料裡沒有對應標籤、但常被問到的關鍵字:直接在景點名稱與介紹裡找
const FREE_WORDS = ['夕陽', '日落', '日出', '雲海', '天燈', '夜市', '瀑布', '單車', '自行車', '燈塔', '熱氣球', '原住民', '櫻花', '海鮮'];
const WORD_SYNONYMS = { 日落: '夕陽', 黃昏: '夕陽', 自行車: '單車', 騎車: '單車', 腳踏車: '單車' };

const CN_NUM = { 一: 1, 二: 2, 兩: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7 };

export function findDestinations(text) {
  const hits = [];
  for (const d of DESTINATIONS) {
    for (const n of [d.name, ...d.aliases]) {
      for (let p = text.indexOf(n); p >= 0; p = text.indexOf(n, p + 1)) {
        hits.push({ id: d.id, start: p, end: p + n.length });
      }
    }
  }
  // 較長的名稱優先(「桃園機場」不應同時被判成「桃園」)
  const kept = hits.filter((h) => !hits.some((o) => o !== h && o.id !== h.id
    && o.start <= h.start && o.end >= h.end && o.end - o.start > h.end - h.start));
  // 依出現順序排列,「從A到B」才能判斷方向
  return kept.sort((x, y) => x.start - y.start).map((h) => h.id).filter((id, i, arr) => arr.indexOf(id) === i);
}

export function parseDays(text) {
  const m = text.match(/([1-7一二兩三四五六七])\s*[天日]/);
  if (!m) return null;
  return CN_NUM[m[1]] ?? Number(m[1]);
}

const has = (text, words) => words.some((w) => text.includes(w));

function searchText(word) {
  return DESTINATIONS.flatMap((d) => d.attractions
    .filter((a) => a.name.includes(word) || a.desc.includes(word) || (a.tip ?? '').includes(word))
    .map((a) => ({ ...a, destName: d.name, destId: d.id })));
}

function routeAnswer(from, to, assumedFrom) {
  const routes = planAlternatives(from, to);
  if (!routes.length) return { text: `目前資料裡還找不到${placeName(from)}到${placeName(to)}的大眾運輸,建議租車或包車。` };
  const lines = routes.map((r) => {
    const steps = r.legs.map((l) => `${l.name}(${placeName(l.from)}→${placeName(l.to)} 約 ${formatDuration(l.min)})`).join(' → ');
    return `【${r.labels.join('/')}】約 ${formatDuration(r.totalMin)}、NT$${r.totalFare}\n  ${steps}`;
  });
  const head = assumedFrom ? `我先假設你從台北出發(可以跟我說「從高雄到${placeName(to)}」換出發地):\n` : '';
  const local = getDestination(to).localTransport;
  return {
    text: `${head}${placeName(from)}到${placeName(to)}有這些走法:\n${lines.join('\n')}\n\n🚏 到了之後:${local}\n(時間票價為參考值)`,
    action: { type: 'route', from, to },
  };
}

function planAnswer(start, days, interests, stayInRegion) {
  const plan = generateItinerary({ start, days, interests, returnToStart: false, stayInRegion });
  const lines = plan.map((d) => {
    if (!d.items.length) return `Day ${d.day}:自由活動,可以再深度探索或安排 SPA、咖啡廳(住${d.stayAt})`;
    const parts = d.items.map((i) => (i.type === 'travel' ? `🚆前往${placeName(i.to)}` : i.type === 'food' ? `🍽️${i.name}` : i.name));
    return `Day ${d.day}:${parts.join(' → ')}(住${d.stayAt})`;
  });
  return {
    text: `幫你排了 ${days} 天的${placeName(start)}出發行程:\n${lines.join('\n')}\n\n想調整步調或偏好,可以到「行程」分頁細修。`,
    action: { type: 'plan', start, days, interests },
  };
}

export function askGuide(question) {
  const text = question.trim();
  if (!text) return greet();

  const dests = findDestinations(text);
  const region = REGIONS.find((r) => text.includes(r));
  const interests = Object.entries(INTEREST_WORDS).filter(([, ws]) => has(text, ws)).map(([k]) => k);
  const days = parseDays(text);
  const wantsRoute = has(text, INTENT_WORDS.route) || (dests.length >= 2 && /從|到|去/.test(text));

  // 交通:「從台北到台南怎麼去」「台北去台南要多久」「去日月潭要搭什麼車」
  if (wantsRoute && !days) {
    if (dests.length >= 2) return routeAnswer(dests[0], dests[1]);
    if (dests.length === 1 && dests[0] !== 'taipei') return routeAnswer('taipei', dests[0], true);
  }

  // 行程:「花蓮三天怎麼玩」「幫我排台南兩天行程」
  if (days || has(text, INTENT_WORDS.plan)) {
    // 有指定地點就留在那一區玩;沒指定就從台北出發環島
    return planAnswer(dests[0] ?? 'taipei', Math.min(days ?? 2, 7), interests, Boolean(dests[0]));
  }

  const dest = dests[0] ? getDestination(dests[0]) : null;

  // 特定關鍵字:夕陽、日出、天燈…
  const free = [...FREE_WORDS, ...Object.keys(WORD_SYNONYMS)].find((w) => text.includes(w));
  if (free && free !== '海鮮' && free !== '夜市') {
    const word = WORD_SYNONYMS[free] ?? free;
    let spots = searchText(word);
    if (dest) spots = spots.filter((a) => a.destId === dest.id).concat(spots.filter((a) => a.destId !== dest.id));
    if (spots.length) {
      return { text: `想看${word},推薦這些地方:\n${spots.slice(0, 5).map((a) => `・${a.name}(${a.destName}):${a.desc}${a.tip ? ` 💡${a.tip}` : ''}`).join('\n')}` };
    }
  }

  // 美食
  if (has(text, INTENT_WORDS.food)) {
    const foodWord = ['海鮮', '夜市', '伴手禮', '甜點', '飲品', '早餐'].find((w) => text.includes(w));
    const match = (f) => !foodWord || f.name.includes(foodWord) || f.type.includes(foodWord) || f.desc.includes(foodWord)
      || (foodWord === '早餐' && f.desc.includes('早餐'));
    if (dest) {
      const list = dest.foods.filter(match);
      const shown = list.length ? list : dest.foods;
      if (!shown.length) return { text: `${dest.name}以自然景觀為主,比較少特色小吃,建議回到鄰近市區用餐。` };
      const note = foodWord && !list.length ? `${dest.name}沒有特別以「${foodWord}」出名,不過這些很值得吃:\n` : `來${dest.name}推薦你吃:\n`;
      const shops = shopsOf(dest.id).filter((x) => !foodWord || x.dish === foodWord || shown.some((f) => f.name === x.dish));
      const shopText = shops.length ? `\n\n📍 在地知名店家:\n${shops.slice(0, 5).map((x) => `・${x.name}(${x.area}):${x.note}`).join('\n')}` : '';
      return { text: note + shown.slice(0, 6).map((f) => `・【${f.type}】${f.name}:${f.desc}`).join('\n') + shopText, action: { type: 'food', destId: dest.id } };
    }
    const all = [
      ...(foodWord === '早餐' ? DESTINATIONS.flatMap((d) => shopsOf(d.id, '早餐').map((x) => `・${x.name}(${d.name}${x.area}):${x.note}`)) : []),
      ...DESTINATIONS.flatMap((d) => d.foods.filter(match).map((f) => `・${f.name}(${d.name}):${f.desc}`)),
    ];
    if (foodWord && all.length) return { text: `各地的${foodWord}推薦:\n${all.slice(0, 8).join('\n')}` };
    const markets = DESTINATIONS.flatMap((d) => d.foods.filter((f) => f.type === '夜市').map((f) => `${f.name}(${d.name})`));
    return { text: `台灣必逛的夜市有:${markets.join('、')}。\n告訴我你在哪個城市(例如「台南有什麼好吃的」),我可以推薦當地小吃!` };
  }

  // 某個地點好不好玩
  if (dest) {
    if (!dest.attractions.length) return { ...routeAnswer(dest.id === 'taipei' ? 'airport' : 'taipei', dest.id), text: `${dest.intro}\n${dest.localTransport}` };
    const picks = recommend(interests, { limit: 50 }).filter((a) => a.destId === dest.id).slice(0, 4);
    const list = (picks.length ? picks : dest.attractions.slice(0, 4)).map((a) => `・${a.name}(建議 ${a.hours} 小時):${a.desc}`);
    const food = dest.foods.slice(0, 3).map((f) => f.name).join('、');
    return {
      text: `${dest.intro}\n推薦你去:\n${list.join('\n')}${food ? `\n\n😋 必吃:${food}` : ''}\n🚏 在地交通:${dest.localTransport}`,
      action: { type: 'dest', destId: dest.id },
    };
  }

  if (interests.length || region || has(text, INTENT_WORDS.play) || text.includes('第一次')) {
    const picks = recommend(interests, { region, limit: 6 });
    if (!picks.length) return { text: '這個條件我暫時找不到適合的景點,換個說法試試看?' };
    const label = interests.map((k) => INTERESTS.find((i) => i.key === k)?.label).join('、');
    const head = `${region ?? '全台'}${label ? `「${label}」` : '必去'}推薦`;
    return { text: `${head}:\n${picks.map((a) => `・${a.name}(${a.destName}):${a.desc}`).join('\n')}` };
  }

  return { ...greet(), text: `我不太確定你想問什麼 🙏\n${greet().text}` };
}

function greet() {
  return {
    text: '你好!我是你的台灣小導遊 🧭\n你可以問我:\n・台南有什麼好吃的?\n・台北去花蓮要多久?\n・花蓮三天怎麼玩?\n・哪裡看夕陽最美?\n・下雨天台中可以去哪?',
  };
}
