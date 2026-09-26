// Offline guide: understands common questions (English or Chinese) by keywords and answers from the app's data.
// On claude.ai, Claude answers instead (js/ai-guide.js); this is the fallback when AI isn't available.
import { DESTINATIONS, REGIONS, INTERESTS, getDestination, shopsOf } from './data.js';
import { planAlternatives } from './planner.js';
import { recommend, generateItinerary } from './itinerary.js';
import {
  getLang, setLang, dName, dIntro, dLocal, aName, aDesc, aTip, fName, fDesc, fType, sName, sArea, sNote,
  lineName, interestName, regionName, withZh, duration,
} from './i18n.js';

const INTENT_WORDS = {
  route: ['怎麼去', '怎麼到', '怎麼過去', '怎麼前往', '怎麼走', '交通', '搭什麼', '坐什麼', '搭車', '坐車', '搭哪', '坐哪',
    '路線', '多久', '多遠', '車程', '要搭', '要坐', '高鐵', '火車', '客運', '票價', '多少錢',
    'how do i get', 'how to get', 'get to', 'getting to', 'how long', 'how far', 'train', 'bus', 'hsr', 'transport', 'fare', 'ticket', 'travel from'],
  plan: ['行程', '怎麼玩', '怎麼排', '安排', '幾天', '日遊', 'itinerary', 'plan', 'schedule', 'day trip'],
  food: ['吃', '美食', '小吃', '餐廳', '夜市', '好吃', '伴手禮', '喝', '早餐', '宵夜', '海鮮',
    'eat', 'food', 'restaurant', 'night market', 'breakfast', 'snack', 'drink', 'dessert', 'souvenir', 'seafood', 'hungry', 'dinner', 'lunch'],
  play: ['玩', '景點', '去哪', '推薦', '好玩', '逛', '看', '走走', 'what to do', 'things to', 'see', 'visit', 'places', 'recommend', 'where', 'fun', 'sightseeing', 'first time'],
};

const INTEREST_WORDS = {
  室內: ['下雨', '雨天', '室內', '太熱', '冷氣', 'rain', 'indoor'],
  親子: ['親子', '小孩', '孩子', '小朋友', '家庭', '帶爸媽', 'kid', 'children', 'family'],
  溫泉: ['溫泉', '泡湯', 'hot spring', 'onsen'],
  海邊: ['海邊', '海灘', '玩水', '島', '看海', 'beach', 'island', 'swim'],
  登山: ['爬山', '登山', '步道', '健行', 'hike', 'hiking', 'trail'],
  夜景: ['夜景', '晚上', '夜晚', 'night view', 'at night', 'evening'],
  老街: ['老街', 'old street'],
  文化: ['歷史', '古蹟', '文化', '博物館', '廟', '藝術', 'history', 'temple', 'museum', 'culture', 'art'],
  自然: ['自然', '風景', '大自然', '森林', '湖', 'nature', 'scenery', 'forest', 'lake'],
  拍照: ['拍照', '打卡', '網美', 'photo', 'instagram'],
  購物: ['購物', '逛街', '買', 'shopping'],
};

// Common asks that aren't tags: searched in the Chinese names and descriptions
const FREE_WORDS = ['夕陽', '日落', '日出', '雲海', '天燈', '夜市', '瀑布', '單車', '自行車', '燈塔', '熱氣球', '原住民', '櫻花', '海鮮'];
const WORD_SYNONYMS = {
  日落: '夕陽', 黃昏: '夕陽', 自行車: '單車', 騎車: '單車', 腳踏車: '單車',
  sunset: '夕陽', sunrise: '日出', 'sea of clouds': '雲海', lantern: '天燈', waterfall: '瀑布', cycling: '單車', bike: '單車',
  lighthouse: '燈塔', balloon: '熱氣球', indigenous: '原住民', aboriginal: '原住民', 'cherry blossom': '櫻花',
};
const WORD_EN = { 夕陽: 'the sunset', 日出: 'the sunrise', 雲海: 'the sea of clouds', 天燈: 'sky lanterns', 瀑布: 'waterfalls', 單車: 'cycling', 燈塔: 'lighthouses', 熱氣球: 'hot-air balloons', 原住民: 'Indigenous culture', 櫻花: 'cherry blossoms' };
const FOOD_WORDS = { 海鮮: '海鮮', 夜市: '夜市', 伴手禮: '伴手禮', 甜點: '甜點', 飲品: '飲品', 早餐: '早餐', seafood: '海鮮', 'night market': '夜市', souvenir: '伴手禮', dessert: '甜點', drink: '飲品', breakfast: '早餐' };
const REGION_WORDS = { north: '北部', central: '中部', south: '南部', east: '東部', islands: '離島' };

const NUM = { 一: 1, 二: 2, 兩: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7 };

const EN_ALIASES = {
  taipei: ['taipei', 'beitou', 'yangmingshan'], jiufen: ['jiufen', 'jinguashi'], tamsui: ['tamsui', 'danshui'],
  pingxi: ['pingxi', 'shifen'], keelung: ['keelung'], yilan: ['yilan', 'jiaoxi', 'luodong'], taoyuan: ['taoyuan', 'daxi'],
  airport: ['airport', 'taoyuan airport'], hsinchu: ['hsinchu'], taichung: ['taichung'], sunmoonlake: ['sun moon lake', 'nantou'],
  chiayi: ['chiayi'], alishan: ['alishan'], tainan: ['tainan', 'anping'], kaohsiung: ['kaohsiung', 'zuoying', 'cijin'],
  kenting: ['kenting', 'hengchun', 'pingtung'], hualien: ['hualien'], taroko: ['taroko'], taitung: ['taitung', 'chishang'], penghu: ['penghu', 'magong'],
};

export function findDestinations(raw) {
  const text = String(raw).toLowerCase();
  const hits = [];
  for (const d of DESTINATIONS) {
    for (const n of [d.name, ...d.aliases, ...(EN_ALIASES[d.id] ?? [])]) {
      const key = n.toLowerCase();
      for (let p = text.indexOf(key); p >= 0; p = text.indexOf(key, p + 1)) {
        hits.push({ id: d.id, start: p, end: p + key.length });
      }
    }
  }
  // Longer names win ("桃園機場" / "taoyuan airport" is not also "桃園")
  const kept = hits.filter((h) => !hits.some((o) => o !== h && o.id !== h.id
    && o.start <= h.start && o.end >= h.end && o.end - o.start > h.end - h.start));
  // Order of appearance gives direction for "from A to B"
  return kept.sort((x, y) => x.start - y.start).map((h) => h.id).filter((id, i, arr) => arr.indexOf(id) === i);
}

export function parseDays(text) {
  const m = String(text).toLowerCase().match(/([1-7一二兩三四五六七]|one|two|three|four|five|six|seven)\s*(?:[天日]|-?\s*days?\b)/);
  if (!m) return null;
  return NUM[m[1]] ?? Number(m[1]);
}

// English words match at a word start ("rain" must not match "train"); Chinese matches anywhere
const has = (text, words) => words.some((w) => (/^[a-z ]+$/.test(w)
  ? new RegExp(`\\b${w}`).test(text) : text.includes(w.toLowerCase())));
const L = (enText, zhText) => (getLang() === 'en' ? enText : zhText);
const place = (id) => withZh(dName(id), getDestination(id).name);

function searchText(word) {
  return DESTINATIONS.flatMap((d) => d.attractions
    .filter((a) => a.name.includes(word) || a.desc.includes(word) || (a.tip ?? '').includes(word))
    .map((a) => ({ ...a, destName: d.name, destId: d.id })));
}

const spotLine = (a) => `・${withZh(aName(a), a.name)} — ${dName(a.destId)}: ${aDesc(a)}${aTip(a) ? ` 💡${aTip(a)}` : ''}`;

function routeAnswer(from, to, assumedFrom) {
  const routes = planAlternatives(from, to);
  if (!routes.length) return { text: L(`I couldn't find public transport from ${dName(from)} to ${dName(to)}. A car or driver is best.`, `目前資料裡還找不到${dName(from)}到${dName(to)}的大眾運輸,建議租車或包車。`) };
  const labelEn = { 最快: 'Fastest', 最省錢: 'Cheapest', 最少轉乘: 'Fewest transfers' };
  const lines = routes.map((r) => {
    const steps = r.legs.map((l) => `${lineName(l.name)} (${dName(l.from)} → ${dName(l.to)}, ${L('about', '約')} ${duration(l.min)})`).join(' → ');
    const labels = r.labels.map((x) => L(labelEn[x] ?? x, x)).join('/');
    return `【${labels}】${L('about', '約')} ${duration(r.totalMin)}, NT$${r.totalFare}\n  ${steps}`;
  });
  const head = assumedFrom ? L(`Assuming you start in Taipei (tell me e.g. "from Kaohsiung to ${dName(to)}" to change it):\n`, `我先假設你從台北出發(可以跟我說「從高雄到${dName(to)}」換出發地):\n`) : '';
  return {
    text: `${head}${L(`${dName(from)} to ${place(to)}:`, `${dName(from)}到${dName(to)}有這些走法:`)}\n${lines.join('\n')}\n\n🚏 ${L('When you arrive', '到了之後')}: ${dLocal(getDestination(to))}\n${L('(Times and fares are estimates)', '(時間票價為參考值)')}`,
    action: { type: 'route', from, to },
  };
}

function planAnswer(start, days, interests, stayInRegion) {
  const plan = generateItinerary({ start, days, interests, returnToStart: false, stayInRegion });
  const lines = plan.map((d) => {
    const stayId = DESTINATIONS.find((x) => x.name === d.stayAt)?.id;
    const stay = stayId ? dName(stayId) : d.stayAt;
    if (!d.items.length) return L(`Day ${d.day}: free time; explore more slowly or find a café (stay in ${stay})`, `Day ${d.day}:自由活動,可以再深度探索或安排 SPA、咖啡廳(住${stay})`);
    const parts = d.items.map((i) => (i.type === 'travel' ? `🚆${L('to', '前往')} ${dName(i.to)}`
      : i.type === 'food' ? `🍽️${withZh(fName(i.destId, i), i.name)}` : withZh(aName(i), i.name)));
    return `Day ${d.day}: ${parts.join(' → ')} (${L('stay in', '住')} ${stay})`;
  });
  return {
    text: `${L(`Here's a ${days}-day plan from ${dName(start)}:`, `幫你排了 ${days} 天的${dName(start)}出發行程:`)}\n${lines.join('\n')}\n\n${L('Fine-tune the pace and interests in the Plan tab.', '想調整步調或偏好,可以到「行程」分頁細修。')}`,
    action: { type: 'plan', start, days, interests },
  };
}

export function askGuide(question, lang = getLang()) {
  const prev = getLang();
  setLang(lang);
  try {
    return answer(question.trim());
  } finally {
    setLang(prev);
  }
}

function answer(text) {
  if (!text) return greet();
  const lower = text.toLowerCase();
  const dests = findDestinations(text);
  const region = REGIONS.find((r) => text.includes(r)) ?? Object.entries(REGION_WORDS).find(([w]) => new RegExp(`\\b${w}\\b`).test(lower))?.[1];
  const interests = Object.entries(INTEREST_WORDS).filter(([, ws]) => has(lower, ws)).map(([k]) => k);
  const days = parseDays(text);
  const wantsRoute = has(lower, INTENT_WORDS.route) || (dests.length >= 2 && (/從|到|去/.test(text) || /\b(from|to)\b/.test(lower)));

  // Transport: "Taipei to Tainan how long", "how do I get to Sun Moon Lake", 「台北去台南要多久」
  if (wantsRoute && !days) {
    if (dests.length >= 2) return routeAnswer(dests[0], dests[1]);
    if (dests.length === 1 && dests[0] !== 'taipei') return routeAnswer('taipei', dests[0], true);
  }

  // Itinerary: "3 days in Hualien", 「花蓮三天怎麼玩」
  if (days || has(lower, INTENT_WORDS.plan)) {
    return planAnswer(dests[0] ?? 'taipei', Math.min(days ?? 2, 7), interests, Boolean(dests[0]));
  }

  const dest = dests[0] ? getDestination(dests[0]) : null;

  // Keywords: sunset, sunrise, lanterns…
  const free = [...FREE_WORDS, ...Object.keys(WORD_SYNONYMS)].find((w) => has(lower, [w]));
  if (free && free !== '海鮮' && free !== '夜市') {
    const word = WORD_SYNONYMS[free] ?? free;
    let spots = searchText(word);
    if (dest) spots = spots.filter((a) => a.destId === dest.id).concat(spots.filter((a) => a.destId !== dest.id));
    if (spots.length) {
      return { text: `${L(`Best places for ${WORD_EN[word] ?? word}:`, `想看${word},推薦這些地方:`)}\n${spots.slice(0, 5).map(spotLine).join('\n')}` };
    }
  }

  // Food
  if (has(lower, INTENT_WORDS.food)) {
    const fw = Object.keys(FOOD_WORDS).find((w) => has(lower, [w]));
    const foodWord = fw ? FOOD_WORDS[fw] : null;
    const match = (f) => !foodWord || f.name.includes(foodWord) || f.type.includes(foodWord) || f.desc.includes(foodWord);
    const foodLine = (destId, f) => `・【${fType(f.type)}】${withZh(fName(destId, f), f.name)}: ${fDesc(destId, f)}`;
    const shopLine = (x) => `・${withZh(sName(x), x.name)} (${sArea(x)}): ${sNote(x)}`;
    if (dest) {
      const list = dest.foods.filter(match);
      const shown = list.length ? list : dest.foods;
      if (!shown.length) return { text: L(`${dName(dest.id)} is mostly about nature; eat in the nearest town.`, `${dest.name}以自然景觀為主,比較少特色小吃,建議回到鄰近市區用餐。`) };
      const note = foodWord && !list.length
        ? L(`${dName(dest.id)} isn't known for ${fType(foodWord).toLowerCase()}, but these are worth trying:\n`, `${dest.name}沒有特別以「${foodWord}」出名,不過這些很值得吃:\n`)
        : L(`What to eat in ${dName(dest.id)}:\n`, `來${dest.name}推薦你吃:\n`);
      const shops = shopsOf(dest.id).filter((x) => !foodWord || x.dish === foodWord || shown.some((f) => f.name === x.dish));
      const shopText = shops.length ? `\n\n📍 ${L('Local favourites', '在地知名店家')}:\n${shops.slice(0, 5).map(shopLine).join('\n')}` : '';
      const cash = L('\n\n💵 Bring cash: small shops and night-market stalls often don’t take cards.', '');
      return { text: note + shown.slice(0, 6).map((f) => foodLine(dest.id, f)).join('\n') + shopText + cash, action: { type: 'food', destId: dest.id } };
    }
    const all = [
      ...(foodWord === '早餐' ? DESTINATIONS.flatMap((d) => shopsOf(d.id, '早餐').map((x) => `${shopLine(x)} — ${dName(d.id)}`)) : []),
      ...DESTINATIONS.flatMap((d) => d.foods.filter(match).map((f) => `${foodLine(d.id, f)} — ${dName(d.id)}`)),
    ];
    if (foodWord && all.length) return { text: `${L(`${fType(foodWord)} picks around Taiwan:`, `各地的${foodWord}推薦:`)}\n${all.slice(0, 8).join('\n')}` };
    const markets = DESTINATIONS.flatMap((d) => d.foods.filter((f) => f.type === '夜市').map((f) => `${withZh(fName(d.id, f), f.name)} — ${dName(d.id)}`));
    return { text: L(`Must-visit night markets: ${markets.join(', ')}.\nTell me which city you're in (e.g. "What to eat in Tainan?") for local picks!`, `台灣必逛的夜市有:${markets.join('、')}。\n告訴我你在哪個城市(例如「台南有什麼好吃的」),我可以推薦當地小吃!`) };
  }

  // About one place
  if (dest) {
    if (!dest.attractions.length) return { ...routeAnswer(dest.id === 'taipei' ? 'airport' : 'taipei', dest.id), text: `${dIntro(dest)}\n${dLocal(dest)}` };
    const picks = recommend(interests, { limit: 50 }).filter((a) => a.destId === dest.id).slice(0, 4);
    const list = (picks.length ? picks : dest.attractions.map((a) => ({ ...a, destId: dest.id })).slice(0, 4))
      .map((a) => `・${withZh(aName(a), a.name)} (${L('about', '建議')} ${a.hours} ${L('h', '小時')}): ${aDesc(a)}`);
    const food = dest.foods.slice(0, 3).map((f) => withZh(fName(dest.id, f), f.name)).join(L(', ', '、'));
    return {
      text: `${dIntro(dest)}\n${L('Go see:', '推薦你去:')}\n${list.join('\n')}${food ? `\n\n😋 ${L('Must eat', '必吃')}: ${food}` : ''}\n🚏 ${L('Getting around', '在地交通')}: ${dLocal(dest)}`,
      action: { type: 'dest', destId: dest.id },
    };
  }

  if (interests.length || region || has(lower, INTENT_WORDS.play) || text.includes('第一次')) {
    const picks = recommend(interests, { region, limit: 6 });
    if (!picks.length) return { text: L('I couldn’t find a good match. Try asking another way?', '這個條件我暫時找不到適合的景點,換個說法試試看?') };
    const label = interests.map((k) => interestName(k, INTERESTS.find((i) => i.key === k)?.label)).join(L(', ', '、'));
    const where = region ? regionName(region) : L('Taiwan', '全台');
    const head = L(`${label ? `${label} picks` : 'Must-sees'} in ${where}`, `${where}${label ? `「${label}」` : '必去'}推薦`);
    return { text: `${head}:\n${picks.map(spotLine).join('\n')}` };
  }

  return { ...greet(), text: `${L('I’m not sure what you mean 🙏', '我不太確定你想問什麼 🙏')}\n${greet().text}` };
}

function greet() {
  return {
    text: L(
      'Hi! I’m your local buddy in Taiwan 🧭\nAsk me things like:\n・What should I eat in Tainan?\n・How long from Taipei to Hualien?\n・3 days in Hualien?\n・Best place for the sunset?\n・Rainy day in Taichung, where to go?',
      '你好!我是你的台灣小導遊 🧭\n你可以問我:\n・台南有什麼好吃的?\n・台北去花蓮要多久?\n・花蓮三天怎麼玩?\n・哪裡看夕陽最美?\n・下雨天台中可以去哪?',
    ),
  };
}
