// 交通路線規劃:在路網上以 Dijkstra 演算法找出最佳路線。
import { EDGES, getDestination } from './data.js';

export const TRANSFER_MINUTES = 15; // 每次轉乘預估的等車/步行時間

const STRATEGIES = {
  fastest: { label: '最快', cost: (e, transfer) => e.min + (transfer ? TRANSFER_MINUTES : 0) },
  cheapest: { label: '最省錢', cost: (e, transfer) => e.fare + e.min * 0.1 + (transfer ? 5 : 0) },
  fewest: { label: '最少轉乘', cost: (e, transfer) => e.min + (transfer ? 1000 : 0) },
};

function buildAdjacency(edges) {
  const adj = new Map();
  const add = (from, to, e) => {
    if (!adj.has(from)) adj.set(from, []);
    adj.get(from).push({ ...e, from, to });
  };
  for (const e of edges) {
    add(e.a, e.b, e);
    add(e.b, e.a, e);
  }
  return adj;
}

const ADJ = buildAdjacency(EDGES);

// 搜尋狀態包含「目前所在節點 + 搭乘中的路線」,才能正確計算轉乘成本。
export function planRoute(fromId, toId, strategy = 'fastest') {
  if (fromId === toId) return null;
  const strat = STRATEGIES[strategy] ?? STRATEGIES.fastest;
  const key = (node, line) => `${node}|${line ?? ''}`;
  const dist = new Map([[key(fromId, null), 0]]);
  const prev = new Map();
  const queue = [{ node: fromId, line: null, cost: 0 }];

  while (queue.length) {
    queue.sort((x, y) => x.cost - y.cost);
    const cur = queue.shift();
    const curKey = key(cur.node, cur.line);
    if (cur.cost > (dist.get(curKey) ?? Infinity)) continue;
    if (cur.node === toId) return buildResult(curKey, prev, strategy);

    if (cur.node !== fromId && getDestination(cur.node)?.noTransit) continue;
    for (const e of ADJ.get(cur.node) ?? []) {
      const transfer = cur.line !== null && cur.line !== e.line;
      const nextCost = cur.cost + strat.cost(e, transfer);
      const nextKey = key(e.to, e.line);
      if (nextCost < (dist.get(nextKey) ?? Infinity)) {
        dist.set(nextKey, nextCost);
        prev.set(nextKey, { prevKey: curKey, edge: e });
        queue.push({ node: e.to, line: e.line, cost: nextCost });
      }
    }
  }
  return null;
}

function buildResult(endKey, prev, strategy) {
  const raw = [];
  for (let k = endKey; prev.has(k); k = prev.get(k).prevKey) raw.unshift(prev.get(k).edge);

  // 合併同一路線的連續路段
  const legs = [];
  for (const e of raw) {
    const last = legs[legs.length - 1];
    if (last && last.line === e.line) {
      last.to = e.to;
      last.min += e.min;
      last.fare += e.fare;
      last.stops.push(e.to);
      if (e.tip && !last.tips.includes(e.tip)) last.tips.push(e.tip);
    } else {
      legs.push({
        mode: e.mode, line: e.line, name: e.name, from: e.from, to: e.to,
        min: e.min, fare: e.fare, stops: [e.from, e.to], tips: e.tip ? [e.tip] : [],
      });
    }
  }
  const transfers = legs.length - 1;
  return {
    strategy,
    strategyLabel: STRATEGIES[strategy].label,
    legs,
    transfers,
    totalMin: legs.reduce((s, l) => s + l.min, 0) + transfers * TRANSFER_MINUTES,
    totalFare: legs.reduce((s, l) => s + l.fare, 0),
  };
}

// 一次計算三種策略,去除重複的路線
export function planAlternatives(fromId, toId) {
  const seen = new Set();
  const results = [];
  for (const s of Object.keys(STRATEGIES)) {
    const r = planRoute(fromId, toId, s);
    if (!r) continue;
    const sig = r.legs.map((l) => `${l.line}:${l.from}>${l.to}`).join(',');
    if (seen.has(sig)) {
      results.find((x) => x.sig === sig).labels.push(r.strategyLabel);
      continue;
    }
    seen.add(sig);
    results.push({ ...r, sig, labels: [r.strategyLabel] });
  }
  return results;
}

// 多點串聯(依序經過每個地點)
export function planMultiStop(ids, strategy = 'fastest') {
  const segments = [];
  for (let i = 0; i < ids.length - 1; i++) {
    if (ids[i] === ids[i + 1]) continue;
    const r = planRoute(ids[i], ids[i + 1], strategy);
    segments.push({ from: ids[i], to: ids[i + 1], route: r });
  }
  return segments;
}

export function travelMinutes(fromId, toId) {
  if (fromId === toId) return 0;
  return planRoute(fromId, toId, 'fastest')?.totalMin ?? Infinity;
}

export function formatDuration(min) {
  const m = Math.round(min);
  if (m < 60) return `${m} 分鐘`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} 小時 ${r} 分` : `${h} 小時`;
}

export function placeName(id) {
  return getDestination(id)?.name ?? id;
}
