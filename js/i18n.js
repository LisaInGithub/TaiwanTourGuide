// Language switching (English first, Traditional Chinese second).
import { getDestination } from './data.js';
import {
  DEST_EN, ATTR_EN, FOOD_EN, SHOP_EN, LINE_EN, TIP_EN, REGION_EN, INTEREST_EN, FOOD_TYPE_EN,
} from './data-en.js';

let lang = 'en';
export const getLang = () => lang;
export const setLang = (l) => { lang = l === 'zh' ? 'zh' : 'en'; };
const en = () => lang === 'en';

const UI = {
  tabGuide: ['Guide', '導遊'], tabPlan: ['Plan', '行程'], tabTransit: ['Transit', '交通'], tabEat: ['Eat & Play', '吃喝玩樂'], tabHelp: ['Help', '救急'],
  askTitle: ['💬 Ask your local buddy', '💬 問問小導遊'],
  askPlaceholder: ['e.g. What should I eat in Tainan?', '例:花蓮三天怎麼玩?'],
  send: ['Send', '送出'], answering: ['Answering…', '回答中…'], thinking: ['Thinking…', '思考中…'],
  byClaude: ['✨ Answered by Claude', '✨ 由 Claude 回答'], offline: ['Offline guide', '離線導遊'],
  cutOff: ['(The answer was cut off)', '(回答中斷了)'],
  busy: ['Lots of people are asking right now. Here is the offline answer:', '現在問的人太多了,先給你離線版的回答:'],
  flaky: ['The connection is unstable. Here is the offline answer:', '連線不太順,先給你離線版的回答:'],
  recTitle: ['✨ Recommended for you', '✨ 導遊推薦'],
  recHint: ['Pick what you like and I’ll suggest the best spots.', '選擇你的旅遊偏好,我會推薦最適合的景點。'],
  region: ['Region', '地區'], allTaiwan: ['All of Taiwan', '全台灣'],
  noMatch: ['No matching spots', '沒有符合的景點'],
  nearTitle: ['📍 What’s near me?', '📍 我附近有什麼?'], useLocation: ['Use my location', '使用我的位置'],
  locating: ['Locating…', '定位中…'], noGeo: ['Location isn’t available on this device.', '此裝置不支援定位。'],
  geoFail: ['Couldn’t get your location. Check that location access is allowed.', '無法取得位置,請確認已允許定位權限。'],
  stay: ['Suggested stay', '建議停留'], hours: ['h', '小時'], away: ['away', '距離'],
  openMap: ['🗺️ Open map', '🗺️ 開啟地圖'], showLocal: ['🀄 Show to driver', '🀄 給司機看'],
  save: ['Save', '收藏'],
  planTitle: ['🗓️ Plan my trip', '🗓️ 幫我排行程'], start: ['Starting point', '出發地'], days: ['Days', '天數'],
  day: ['day', '天'], daysN: ['days', '天'], pace: ['Pace', '步調'],
  paceHint: ['(about {h} h a day)', '(每天約 {h} 小時)'],
  prefs: ['Interests (optional; leave empty for the classics)', '旅遊偏好(可複選,不選則推薦熱門景點)'],
  returnStart: ['Return to the starting point on the last day', '最後一天回到出發地'],
  makePlan: ['Make my plan', '產生行程'], free: ['Free time', '自由活動'], tonight: ['🏨 Stay tonight:', '🏨 今晚住宿:'],
  planNote: ['Times are estimates based on typical visit length and travel time. Check opening hours and weather.', '行程由系統依景點停留時間與交通時間自動估算,實際請依營業時間與天氣彈性調整。'],
  move: ['Travel:', '移動:'], foodPick: ['🍽️ Try:', '🍽️ 美食推薦:'], map: ['Map', '地圖'],
  transitTitle: ['🚆 Getting around', '🚆 交通路線規劃'], from: ['From', '從'], to: ['To', '到'], swap: ['⇅ Swap', '⇅ 交換'],
  search: ['Find routes', '搜尋路線'], noRoute: ['No public transport found. You may need a car or a driver.', '找不到路線,可能需要租車或包車前往。'],
  fareNote: ['Fares and times are estimates. Check the official HSR, TRA and bus timetables.', '票價與時間為參考值,班次請以台灣高鐵、台鐵、客運公司公告為準。'],
  arrived: ['🚏 Once you arrive in {p}', '🚏 到了{p}之後'],
  transfers: ['{n} transfer(s)', '轉乘 {n} 次'], total: ['Total time', '總時間'], fare: ['Est. fare', '參考票價'],
  changeAt: ['↻ Change at {p} (allow about {m} min)', '↻ 於{p}轉乘(預留約 {m} 分鐘)'],
  timetable: ['Timetable / tickets', '查時刻/訂票'], liveTransit: ['🗺️ Live departures on Google Maps', '🗺️ 用 Google 地圖查即時班次'],
  about: ['about', '約'],
  eatTitle: ['🍜 Eat & play', '🍜 吃喝玩樂'], eats: ['😋 What to eat', '😋 好吃的'], fun: ['🎡 What to do', '🎡 好玩的'],
  noFood: ['Mostly nature here; eat in the nearest town.', '這裡以自然景觀為主,建議回到鄰近市區用餐。'],
  hub: ['Transport hub', '此地為交通轉運點'], findShops: ['Find shops nearby', '找附近店家'],
  shopsTitle: ['📍 Local favourites', '📍 在地名店'],
  shopsHint: ['Long-loved local shops. Ratings change, so tap “Google rating” for the latest stars, reviews and hours.', '長年口碑老店。評分會變動,點「看 Google 評分」可看最新星等、評論與營業時間。'],
  googleRating: ['⭐ Google rating', '⭐ 看 Google 評分'],
  savedTitle: ['⭐ Saved spots', '⭐ 我的收藏'], savedEmpty: ['Nothing saved yet. Tap ☆ on any spot.', '還沒有收藏景點,在推薦清單點 ☆ 加入吧!'],
  chain: ['🧭 Route through your saved spots', '🧭 串聯路線(依收藏順序)'], remove: ['Remove', '移除'], needCar: ['a car is best', '建議租車'],
  helpTitle: ['🆘 Help', '🆘 救急'],
  photoTitle: ['📸 Translate a menu or sign', '📸 拍照翻譯菜單、招牌'],
  photoHint: ['Take or choose a photo; I’ll translate it and point out meat, seafood, spice and common allergens.', '拍照或選一張照片,我會翻譯並標出肉類、海鮮、辣度與常見過敏原。'],
  photoBtn: ['Choose photo', '選擇照片'], photoNone: ['Photo translation needs Claude and isn’t available here. Try the phrase cards below.', '這裡無法使用照片翻譯(需要 Claude),可以先用下方的句卡。'],
  phrasesTitle: ['🗣️ Show-the-vendor cards', '🗣️ 給店家看的句卡'],
  phrasesHint: ['Tap a card to show it full screen.', '點一下卡片就會全螢幕顯示。'],
  customTitle: ['✍️ Make your own card', '✍️ 自己做一張句卡'], customPlaceholder: ['e.g. Can I have this without pork?', '例:可以不要加豬肉嗎?'],
  make: ['Make card', '產生'],
  teaTitle: ['🧋 Order bubble tea', '🧋 點一杯珍奶'], sugar: ['Sugar', '甜度'], ice: ['Ice', '冰塊'], topping: ['Topping', '配料'],
  showCard: ['Show card', '顯示卡片'],
  tipsTitle: ['💡 Things locals wish you knew', '💡 在地人想告訴你的事'],
  sosTitle: ['🚨 Emergency', '🚨 緊急電話'],
  tapClose: ['Tap anywhere to close', '點任意處關閉'],
  tryAgain: ['Couldn’t make it this time. Try again in a moment.', '這次沒有成功,請稍後再試。'],
  examples: [['Taipei to Tainan: how long?', 'What should I eat in Tainan?', '3 days in Hualien?', 'Best sunset spot?'],
    ['台南早餐吃什麼?', '台北去台南要多久?', '花蓮三天怎麼玩?', '哪裡看夕陽最美?']],
  langToggle: ['中文', 'EN'],
};

export function t(key, vars = {}) {
  const v = UI[key];
  if (!v) return key;
  let s = en() ? v[0] : v[1];
  if (typeof s === 'string') for (const [k, x] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, x);
  return s;
}

// ---- data helpers: English name first, Chinese kept for showing locals ----
export const dName = (id) => (en() ? DEST_EN[id]?.name : null) ?? getDestination(id)?.name ?? id;
export const dIntro = (d) => (en() ? DEST_EN[d.id]?.intro : null) ?? d.intro;
export const dLocal = (d) => (en() ? DEST_EN[d.id]?.localTransport : null) ?? d.localTransport;
export const aName = (a) => (en() ? ATTR_EN[a.id]?.name : null) ?? a.name;
export const aDesc = (a) => (en() ? ATTR_EN[a.id]?.desc : null) ?? a.desc;
export const aTip = (a) => (a.tip ? (en() ? ATTR_EN[a.id]?.tip : null) ?? a.tip : '');
export const fName = (destId, f) => (en() ? FOOD_EN[`${destId}:${f.name}`]?.name : null) ?? f.name;
export const fDesc = (destId, f) => (en() ? FOOD_EN[`${destId}:${f.name}`]?.desc : null) ?? f.desc;
export const fType = (type) => (en() ? FOOD_TYPE_EN[type] : null) ?? type;
export const sName = (x) => (en() ? SHOP_EN[x.name]?.name : null) ?? x.name;
export const sArea = (x) => (en() ? SHOP_EN[x.name]?.area : null) ?? x.area;
export const sNote = (x) => (en() ? SHOP_EN[x.name]?.note : null) ?? x.note;
export const lineName = (zh) => (en() ? LINE_EN[zh] : null) ?? zh;
export const tipText = (zh) => (en() ? TIP_EN[zh] : null) ?? zh;
export const regionName = (r) => (en() ? REGION_EN[r] : null) ?? r;
export const interestName = (k, zhLabel) => (en() ? INTEREST_EN[k] : null) ?? zhLabel;

// "Taipei 101 (台北101)": English plus the Chinese that locals can read
export const withZh = (enName, zh) => (en() && enName !== zh ? `${enName} (${zh})` : zh);

export function duration(min) {
  const m = Math.round(min);
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (en()) return m < 60 ? `${m} min` : r ? `${h} h ${r} min` : `${h} h`;
  return m < 60 ? `${m} 分鐘` : r ? `${h} 小時 ${r} 分` : `${h} 小時`;
}
