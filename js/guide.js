// 「問導遊」:以關鍵字理解旅客問題,回覆景點、美食與交通建議。
// 原型採規則式比對,正式版可替換為大型語言模型(見 docs/DESIGN.md)。
import { DESTINATIONS, REGIONS, INTERESTS } from './data.js';
import { planAlternatives, formatDuration, placeName } from './planner.js';
import { recommend } from './itinerary.js';

const INTENT_WORDS = {
  food: ['吃', '美食', '小吃', '餐廳', '夜市', '好吃', '伴手禮', '喝'],
  route: ['怎麼去', '怎麼到', '交通', '搭什麼', '坐什麼', '路線', '怎麼走', '到'],
  play: ['玩', '景點', '去哪', '推薦', '好玩', '逛', '看'],
};

const INTEREST_WORDS = {
  室內: ['下雨', '雨天', '室內', '太熱'],
  親子: ['親子', '小孩', '孩子', '小朋友', '家庭'],
  溫泉: ['溫泉', '泡湯'],
  海邊: ['海邊', '海灘', '玩水', '島'],
  登山: ['爬山', '登山', '步道', '健行'],
  夜景: ['夜景', '晚上'],
  老街: ['老街'],
  文化: ['歷史', '古蹟', '文化', '博物館', '廟'],
  自然: ['自然', '風景', '大自然'],
  拍照: ['拍照', '打卡', 'ig', 'IG', '網美'],
  購物: ['購物', '逛街', '買'],
};

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

const has = (text, words) => words.some((w) => text.includes(w));

export function askGuide(question) {
  const text = question.trim();
  if (!text) return greet();

  const dests = findDestinations(text);
  const region = REGIONS.find((r) => text.includes(r));
  const interests = Object.entries(INTEREST_WORDS).filter(([, ws]) => has(text, ws)).map(([k]) => k);

  // 交通:「從台北到台南怎麼去」
  if (dests.length >= 2 && (has(text, INTENT_WORDS.route) || text.includes('從'))) {
    const [from, to] = dests;
    const routes = planAlternatives(from, to);
    if (!routes.length) return { text: `目前資料庫裡還找不到 ${placeName(from)} 到 ${placeName(to)} 的路線,建議改搭計程車或租車。` };
    const best = routes[0];
    const steps = best.legs.map((l) => `${l.name}(${placeName(l.from)} → ${placeName(l.to)},約 ${formatDuration(l.min)})`).join(' → ');
    return {
      text: `從${placeName(from)}到${placeName(to)},最快的方式是:${steps}。全程約 ${formatDuration(best.totalMin)},票價約 NT$${best.totalFare}。`,
      action: { type: 'route', from, to },
    };
  }

  const dest = dests[0] ? DESTINATIONS.find((d) => d.id === dests[0]) : null;

  // 美食
  if (has(text, INTENT_WORDS.food)) {
    if (dest) {
      const list = dest.foods.slice(0, 5).map((f) => `【${f.type}】${f.name}:${f.desc}`);
      if (!list.length) return { text: `${dest.name}比較少特色小吃,建議回到鄰近市區用餐喔!` };
      return { text: `來${dest.name}一定要試試:\n${list.join('\n')}`, action: { type: 'food', destId: dest.id } };
    }
    const markets = DESTINATIONS.flatMap((d) => d.foods.filter((f) => f.type === '夜市').map((f) => `${f.name}(${d.name})`));
    return { text: `台灣必逛的夜市有:${markets.join('、')}。告訴我你在哪個城市,我可以推薦當地小吃!` };
  }

  // 景點推薦
  if (dest) {
    const picks = recommend(interests, { limit: 50 }).filter((a) => a.destId === dest.id).slice(0, 4);
    const list = (picks.length ? picks : dest.attractions.slice(0, 4)).map((a) => `・${a.name}:${a.desc}`);
    return {
      text: `${dest.intro}\n推薦你去:\n${list.join('\n')}\n\n🚏 在地交通:${dest.localTransport}`,
      action: { type: 'dest', destId: dest.id },
    };
  }

  if (interests.length || region || has(text, INTENT_WORDS.play)) {
    const picks = recommend(interests, { region, limit: 5 });
    if (!picks.length) return { text: '這個條件我暫時找不到適合的景點,換個說法試試看?' };
    const label = interests.map((k) => INTERESTS.find((i) => i.key === k)?.label).join('、');
    const head = `${region ?? '全台'}${label ? `「${label}」` : ''}推薦`;
    return { text: `${head}:\n${picks.map((a) => `・${a.name}(${a.destName}):${a.desc}`).join('\n')}` };
  }

  return greet();
}

function greet() {
  return {
    text: '你好!我是你的台灣小導遊 🧭\n你可以問我:\n・台南有什麼好吃的?\n・從台北到花蓮怎麼去?\n・下雨天台中可以去哪?\n・南部適合親子的景點',
  };
}
