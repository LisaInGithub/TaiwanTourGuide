// 「問導遊」AI 版:在 claude.ai 上開啟時,由 Claude 理解問題,
// 並透過下方工具查詢 App 內的景點、美食、交通資料後回答。
// 無法使用時(直接開檔、未授權等)回傳 null,由 guide.js 的離線規則接手。
import { DESTINATIONS, INTERESTS, REGIONS, getDestination, shopsOf } from './data.js';
import { planAlternatives, placeName } from './planner.js';
import { recommend, generateItinerary, PACES } from './itinerary.js';
import { findDestinations } from './guide.js';

const MAX_TURNS = 10;

function resolvePlace(name) {
  const id = findDestinations(String(name ?? ''))[0];
  if (!id) throw new Error(`資料裡沒有「${name}」,可用地點:${DESTINATIONS.map((d) => d.name).join('、')}`);
  return id;
}

const TOOLS = [
  {
    name: 'get_destination',
    description: '查詢一個地點(城市/景區)的介紹、在地交通、所有景點、美食類型,以及具體的在地知名店家(shops)。回傳 JSON。',
    inputSchema: { type: 'object', properties: { name: { type: 'string', description: '地點名稱,例如 台南、九份、日月潭' } }, required: ['name'] },
    execute({ name }) {
      const d = getDestination(resolvePlace(name));
      return {
        name: d.name, region: d.region, intro: d.intro, localTransport: d.localTransport,
        attractions: d.attractions.map((a) => ({ name: a.name, hours: a.hours, tags: a.tags, desc: a.desc, tip: a.tip, nightOnly: a.evening })),
        foods: d.foods.map((f) => ({ name: f.name, type: f.type, desc: f.desc })),
        shops: shopsOf(d.id).map((x) => ({ name: x.name, dish: x.dish, area: x.area, note: x.note })),
      };
    },
  },
  {
    name: 'search_attractions',
    description: '依興趣標籤、地區或關鍵字(例如 夕陽、日出、天燈)搜尋全台景點,回傳最符合的前 8 個。',
    inputSchema: {
      type: 'object',
      properties: {
        interests: { type: 'array', items: { type: 'string', enum: INTERESTS.map((i) => i.key) } },
        region: { type: 'string', enum: REGIONS },
        keyword: { type: 'string', description: '在景點名稱與介紹中搜尋的字' },
      },
    },
    execute({ interests, region, keyword }) {
      const tags = Array.isArray(interests) ? interests.map(String) : [];
      let list = recommend(tags, { region: region ? String(region) : undefined, limit: 200 });
      if (keyword) list = list.filter((a) => `${a.name}${a.desc}${a.tip ?? ''}`.includes(String(keyword)));
      return list.slice(0, 8).map((a) => ({ name: a.name, place: a.destName, hours: a.hours, tags: a.tags, desc: a.desc, tip: a.tip }));
    },
  },
  {
    name: 'plan_route',
    description: '查兩地之間的大眾運輸路線,回傳最快/最省錢/最少轉乘方案(每段交通工具、時間、參考票價)。',
    inputSchema: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' } }, required: ['from', 'to'] },
    execute({ from, to }) {
      const a = resolvePlace(from);
      const b = resolvePlace(to);
      if (a === b) throw new Error('出發地與目的地相同');
      const routes = planAlternatives(a, b);
      return {
        from: placeName(a), to: placeName(b), arrivalTip: getDestination(b).localTransport,
        options: routes.map((r) => ({
          type: r.labels, totalMinutes: r.totalMin, totalFareNTD: r.totalFare, transfers: r.transfers,
          legs: r.legs.map((l) => ({ by: l.name, from: placeName(l.from), to: placeName(l.to), minutes: l.min, fareNTD: l.fare, tips: l.tips })),
        })),
      };
    },
  },
  {
    name: 'make_itinerary',
    description: '自動排多日行程,回傳每天的景點、移動與美食。stay_in_region=true 時只在出發地同區域內移動。',
    inputSchema: {
      type: 'object',
      properties: {
        start: { type: 'string' },
        days: { type: 'integer', minimum: 1, maximum: 7 },
        interests: { type: 'array', items: { type: 'string', enum: INTERESTS.map((i) => i.key) } },
        pace: { type: 'string', enum: Object.keys(PACES) },
        stay_in_region: { type: 'boolean' },
      },
      required: ['start', 'days'],
    },
    execute({ start, days, interests, pace, stay_in_region: stayInRegion }) {
      const plan = generateItinerary({
        start: resolvePlace(start),
        days: Math.min(7, Math.max(1, Number(days) || 2)),
        interests: Array.isArray(interests) ? interests.map(String) : [],
        pace: PACES[pace] ? pace : 'normal',
        stayInRegion: Boolean(stayInRegion),
      });
      return plan.map((d) => ({
        day: d.day,
        stayAt: d.stayAt,
        items: d.items.map((i) => (i.type === 'travel'
          ? `移動 ${placeName(i.from)}→${placeName(i.to)}(${i.route.legs.map((l) => l.name).join('→')},約 ${i.route.totalMin} 分)`
          : i.type === 'food' ? `美食:${i.name}` : `${i.name}(${i.hours} 小時)`)),
      }));
    },
  },
];

const RULES = `你是「台灣小導遊」App 裡的導遊,用台灣繁體中文、親切口語地回答旅客。
規則:
1. 回答景點、美食、交通、行程時,先用工具查 App 資料,再根據結果回答;不要編造店名、班次或票價。
2. 問美食時,優先推薦 get_destination 回傳的 shops(具體店名+在哪裡+特色),店名要一字不差照抄,App 會自動附上 Google 地圖連結。
3. 你看不到 Google 評分:絕對不要寫出星等、評論數或「Google 4.5 分」之類的數字;需要時說「可以點下方地圖連結看最新評分」。
4. App 資料沒有的內容,只補充你非常確定的知名店家或常識,並說明「建議出發前再確認營業時間」。
5. 交通時間與票價一律說是「約」、「參考」。
6. 問題不清楚(例如沒說從哪裡出發)時,先用最合理的假設回答(預設從台北出發),並在最後一句提醒可以告訴你出發地。
7. 格式:純文字,不要用 Markdown 標題、粗體或表格;條列用「・」;整體 250 字以內,重點先講。
8. 與旅遊無關的問題,簡短回應後把話題帶回台灣旅遊。
App 收錄的地點:${DESTINATIONS.map((d) => d.name).join('、')}。
興趣標籤:${INTERESTS.map((i) => i.key).join('、')}。
今天日期:${new Date().toISOString().slice(0, 10)}。`;

let samplePromise = null;
let disabled = false;

// 回傳可用的 sample 函式,或 null
export async function getSampler() {
  if (disabled || typeof window === 'undefined' || !window.claude?.use) return null;
  samplePromise ??= window.claude.use('sample').then(async (sample) => {
    if (!sample) return null;
    const limits = await sample.limits().catch(() => null);
    return limits?.tools ? sample : null;
  }).catch(() => null);
  return samplePromise;
}

const PERMANENT = ['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed', 'tools_unavailable'];

/**
 * @param {{who:'me'|'bot', text:string}[]} history 對話紀錄(最後一則是旅客的新問題)
 * @returns {Promise<{text:string}|{error:string, permanent:boolean, text?:string}|null>}
 */
export async function askClaude(history, { onText, signal } = {}) {
  const sample = await getSampler();
  if (!sample) return null;
  const turns = history.slice(-MAX_TURNS).filter((m) => m.text?.trim())
    .map((m) => ({ role: m.who === 'me' ? 'user' : 'assistant', content: m.text }));
  while (turns.length && turns[0].role !== 'user') turns.shift();
  try {
    const { text } = await sample([{ role: 'user', content: RULES }, ...turns], {
      tools: TOOLS, modelTier: 'quick', signal, onText: ({ text: t }) => onText?.(t),
    });
    return { text };
  } catch (e) {
    const code = e?.code ?? 'upstream_error';
    if (PERMANENT.includes(code)) disabled = true;
    return { error: code, permanent: PERMANENT.includes(code), text: e?.text };
  }
}
