// 行程自動規劃:依照興趣、天數、步調,像導遊一樣排出每日行程。
import { DESTINATIONS, getDestination } from './data.js';
import { planRoute, travelMinutes } from './planner.js';

export const PACES = {
  relaxed: { label: '悠閒', hours: 5 },
  normal: { label: '一般', hours: 7 },
  packed: { label: '緊湊', hours: 9 },
};

// 第一次來台灣的經典必去(沒選偏好時優先推薦)
const CLASSICS = ['tp101', 'jiufen-st', 'sml-bike', 'anping', 'alishan-forest', 'npm', 'taroko-np', 'fengjia', 'pier2', 'shifen', 'qixingtan', 'kt-street'];

export function scoreAttraction(att, interests) {
  const matches = att.tags.filter((t) => interests.includes(t)).length;
  return matches * 3 + (att.popular ? 1 : 0);
}

function isRelevant(att, interests) {
  return interests.length === 0 || att.tags.some((t) => interests.includes(t));
}

function destinationScore(dest, interests, usedIds) {
  return dest.attractions
    .filter((a) => !usedIds.has(a.id) && isRelevant(a, interests))
    .map((a) => scoreAttraction(a, interests))
    .sort((x, y) => y - x)
    .slice(0, 3)
    .reduce((s, x) => s + x, 0);
}

// 推薦景點排行(首頁「導遊推薦」使用)
export function recommend(interests, { region, limit = 8 } = {}) {
  const list = [];
  for (const d of DESTINATIONS) {
    if (region && d.region !== region) continue;
    for (const a of d.attractions) {
      if (!isRelevant(a, interests)) continue;
      list.push({ ...a, destId: d.id, destName: d.name, score: scoreAttraction(a, interests) });
    }
  }
  const classic = (a) => (CLASSICS.includes(a.id) ? CLASSICS.indexOf(a.id) : CLASSICS.length);
  list.sort((x, y) => y.score - x.score || classic(x) - classic(y) || x.name.localeCompare(y.name, 'zh-Hant'));
  // 同一個地點最多推薦 2 個,讓結果分散到不同城市
  const perDest = {};
  const diverse = list.filter((a) => (perDest[a.destId] = (perDest[a.destId] ?? 0) + 1) <= 2);
  const rest = list.filter((a) => !diverse.includes(a));
  return [...diverse, ...rest].slice(0, limit);
}

function pickNextDestination(current, interests, usedAtt, visitedDest, region) {
  let best = null;
  for (const d of DESTINATIONS) {
    if (d.id === current || visitedDest.has(d.id)) continue;
    if (region && d.region !== region) continue;
    const score = destinationScore(d, interests, usedAtt);
    if (score <= 0) continue;
    const hrs = travelMinutes(current, d.id) / 60;
    if (!Number.isFinite(hrs)) continue;
    // 分數高、距離近的優先;車程超過 4 小時大幅扣分
    const value = score / (1 + hrs) - (hrs > 4 ? 5 : 0);
    if (!best || value > best.value) best = { id: d.id, value, hrs };
  }
  return best;
}

function pickMeal(dest, interests, usedFoods, hasNightSpot) {
  const foods = dest.foods.filter((f) => !usedFoods.has(`${dest.id}:${f.name}`) && !(hasNightSpot && f.type === '夜市'));
  if (!foods.length) return null;
  const preferMarket = interests.includes('美食') && !hasNightSpot;
  const f = (preferMarket && foods.find((x) => x.type === '夜市')) || foods.find((x) => x.type !== '伴手禮') || foods[0];
  usedFoods.add(`${dest.id}:${f.name}`);
  return f;
}

/**
 * @param {{start:string, days:number, interests:string[], pace?:keyof PACES, returnToStart?:boolean, stayInRegion?:boolean}} opts
 *   stayInRegion:只在出發地同一區域內移動(例如「花蓮三天」就只排東部)
 */
export function generateItinerary({ start, days, interests = [], pace = 'normal', returnToStart = false, stayInRegion = false }) {
  const region = stayInRegion ? getDestination(start).region : null;
  const dayHours = PACES[pace]?.hours ?? PACES.normal.hours;
  const usedAtt = new Set();
  const usedFoods = new Set();
  const visitedDest = new Set([start]);
  let current = start;
  const plan = [];

  for (let day = 1; day <= days; day++) {
    let hoursLeft = dayHours;
    const items = [];
    const isLastDay = day === days;
    const returnMin = isLastDay && returnToStart ? travelMinutes(current, start) : 0;

    for (let guard = 0; guard < 20; guard++) {
      const dest = getDestination(current);
      const candidates = dest.attractions
        .filter((a) => !a.evening && !usedAtt.has(a.id) && isRelevant(a, interests))
        .sort((x, y) => scoreAttraction(y, interests) - scoreAttraction(x, interests));

      // 預留晚上逛夜市的時間
      const nightReserve = isLastDay && returnToStart ? 0 : Math.max(0, ...dest.attractions
        .filter((a) => a.evening && !usedAtt.has(a.id) && isRelevant(a, interests)).map((a) => a.hours));
      const budget = hoursLeft - nightReserve - (isLastDay && returnToStart ? returnMin / 60 : 0);
      const fit = candidates.find((a) => a.hours <= budget);
      if (fit) {
        usedAtt.add(fit.id);
        hoursLeft -= fit.hours;
        items.push({ type: 'spot', destId: current, destName: dest.name, ...fit });
        continue;
      }
      if (candidates.length > 0 || (isLastDay && returnToStart)) break; // 今天時間用完,明天繼續

      const next = pickNextDestination(current, interests, usedAtt, visitedDest, region);
      if (!next) break;
      if (next.hrs > budget && items.length > 0) break; // 車程太長,改到隔天早上出發
      const route = planRoute(current, next.id, 'fastest');
      items.push({ type: 'travel', from: current, to: next.id, route });
      hoursLeft -= route.totalMin / 60;
      visitedDest.add(next.id);
      current = next.id;
    }

    // 夜市等晚上才熱鬧的景點,安排在當天最後
    const here = getDestination(current);
    const night = here.attractions
      .filter((a) => a.evening && !usedAtt.has(a.id) && isRelevant(a, interests))
      .sort((x, y) => scoreAttraction(y, interests) - scoreAttraction(x, interests))[0];
    const leavingTonight = isLastDay && returnToStart && current !== start;
    if (night && !leavingTonight && night.hours <= hoursLeft) {
      usedAtt.add(night.id);
      items.push({ type: 'spot', destId: current, destName: here.name, ...night });
    }

    const meal = pickMeal(here, interests, usedFoods, Boolean(night) || leavingTonight);
    if (meal) items.push({ ...meal, type: 'food', foodType: meal.type, destId: current, destName: here.name });

    if (leavingTonight) {
      items.push({ type: 'travel', from: current, to: start, route: planRoute(current, start, 'fastest') });
      current = start;
    }
    plan.push({ day, items, stayAt: getDestination(current).name });
  }
  return plan;
}
