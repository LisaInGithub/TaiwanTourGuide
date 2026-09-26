import { DESTINATIONS, INTERESTS, REGIONS, MODE_INFO, getDestination } from './data.js';
import { planAlternatives, planMultiStop, formatDuration, placeName, TRANSFER_MINUTES } from './planner.js';
import { generateItinerary, recommend, PACES } from './itinerary.js';
import { askGuide } from './guide.js';
import { nearbyAttractions, mapsUrl, transitUrl } from './geo.js';

const view = document.getElementById('view');

// ---------- 狀態與本機儲存 ----------
const storage = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* 無痕模式等情況忽略 */ }
  },
};

const state = {
  tab: 'home',
  interests: [],
  region: '',
  chat: [{ who: 'bot', text: askGuide('').text }],
  nearby: null,
  plan: { start: 'taipei', days: 3, pace: 'normal', interests: [], returnToStart: true, result: null },
  route: { from: 'taipei', to: 'tainan', results: null },
  explore: { destId: 'taipei' },
  saved: storage.get('saved', []), // [{id, name, destId}]
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const findAttraction = (id) => {
  for (const d of DESTINATIONS) {
    const a = d.attractions.find((x) => x.id === id);
    if (a) return { ...a, destId: d.id, destName: d.name };
  }
  return null;
};
const isSaved = (id) => state.saved.some((s) => s.id === id);

function destOptions(selected, { withEmpty = false } = {}) {
  const groups = REGIONS.map((r) => {
    const opts = DESTINATIONS.filter((d) => d.region === r)
      .map((d) => `<option value="${d.id}" ${d.id === selected ? 'selected' : ''}>${d.name}</option>`).join('');
    return `<optgroup label="${r}">${opts}</optgroup>`;
  }).join('');
  return (withEmpty ? '<option value="">全部地區</option>' : '') + groups;
}

function interestChips(selected, group) {
  return `<div class="chips">${INTERESTS.map((i) =>
    `<button class="chip ${selected.includes(i.key) ? 'on' : ''}" data-action="toggle-interest" data-group="${group}" data-key="${i.key}">${i.icon} ${i.label}</button>`).join('')}</div>`;
}

function spotCard(a) {
  return `<div class="card">
    <div class="row spread"><h3>${esc(a.name)}</h3>
      <button class="icon-btn" data-action="save" data-id="${a.id}" aria-label="收藏">${isSaved(a.id) ? '⭐' : '☆'}</button></div>
    <div class="muted small">📍 ${esc(a.destName)} ・ 建議停留 ${a.hours} 小時${a.km != null ? ` ・ 距離 ${a.km.toFixed(1)} km` : ''}</div>
    <p>${esc(a.desc)}</p>
    ${a.tip ? `<p class="small">💡 ${esc(a.tip)}</p>` : ''}
    <div>${a.tags.map((t) => `<span class="tag">${t}</span>`).join('')}</div>
    <div class="row" style="margin-top:8px"><a class="small" href="${mapsUrl(a.name)}" target="_blank" rel="noopener">🗺️ 開啟地圖</a></div>
  </div>`;
}

function routeCard(r, from, to) {
  const legs = r.legs.map((l, i) => `
    ${i > 0 ? `<li class="transfer">↻ 於${placeName(l.from)}轉乘(預留約 ${TRANSFER_MINUTES} 分鐘)</li>` : ''}
    <li class="leg">
      <div class="mode">${MODE_INFO[l.mode].icon}</div>
      <div>
        <strong>${esc(l.name)}</strong>
        <div class="muted small">${l.stops.map(placeName).join(' → ')}</div>
        <div class="small">約 ${formatDuration(l.min)} ・ NT$${l.fare}${MODE_INFO[l.mode].url ? ` ・ <a href="${MODE_INFO[l.mode].url}" target="_blank" rel="noopener">查時刻/訂票</a>` : ''}</div>
        ${l.tips.map((t) => `<div class="small">💡 ${esc(t)}</div>`).join('')}
      </div>
    </li>`).join('');
  return `<div class="card route-opt">
    <div class="row spread">
      <div>${r.labels.map((x) => `<span class="chip on small">${x}</span>`).join(' ')}</div>
      <div class="muted small">轉乘 ${r.transfers} 次</div>
    </div>
    <div class="row" style="margin-top:8px; gap:18px">
      <div><div class="muted small">總時間</div><div class="stat">${formatDuration(r.totalMin)}</div></div>
      <div><div class="muted small">參考票價</div><div class="stat">NT$${r.totalFare}</div></div>
    </div>
    <ul class="legs">${legs}</ul>
    <a class="small" href="${transitUrl(placeName(from), placeName(to))}" target="_blank" rel="noopener">🗺️ 用 Google 地圖查即時班次</a>
  </div>`;
}

// ---------- 各頁面 ----------
function renderHome() {
  const recs = recommend(state.interests, { region: state.region || undefined, limit: 6 });
  return `
    <div class="card">
      <h2 style="margin-top:0">💬 問問小導遊</h2>
      <div class="chat" id="chat">${state.chat.map((m) => `<div class="bubble ${m.who}">${esc(m.text)}</div>`).join('')}</div>
      <form class="ask" data-form="ask">
        <input type="text" name="q" placeholder="例:台南有什麼好吃的?" autocomplete="off" />
        <button class="btn" type="submit">送出</button>
      </form>
    </div>

    <h2>✨ 導遊推薦</h2>
    <p class="muted">選擇你的旅遊偏好,我會推薦最適合的景點。</p>
    ${interestChips(state.interests, 'home')}
    <label class="field">地區</label>
    <select data-bind="region">
      <option value="">全台灣</option>
      ${REGIONS.map((r) => `<option ${r === state.region ? 'selected' : ''}>${r}</option>`).join('')}
    </select>
    <div class="grid" style="margin-top:12px">${recs.map(spotCard).join('') || '<div class="empty">沒有符合的景點</div>'}</div>

    <h2>📍 我附近有什麼?</h2>
    <button class="btn ghost" data-action="nearby">使用我的位置</button>
    <div id="nearby" class="grid" style="margin-top:12px">${state.nearby ?? ''}</div>`;
}

function renderPlan() {
  const p = state.plan;
  const result = p.result ? p.result.map((d) => `
    <div class="card day">
      <h3>Day ${d.day}</h3>
      <ul class="timeline">${d.items.map(renderItem).join('') || '<li>自由活動</li>'}</ul>
      <div class="muted small" style="margin-top:6px">🏨 今晚住宿:${esc(d.stayAt)}</div>
    </div>`).join('') : '';
  return `
    <h2>🗓️ 幫我排行程</h2>
    <div class="card">
      <label class="field">出發地</label>
      <select data-bind="plan.start">${destOptions(p.start)}</select>
      <div class="row" style="gap:12px">
        <div style="flex:1"><label class="field">天數</label>
          <select data-bind="plan.days">${[1, 2, 3, 4, 5, 6, 7].map((n) => `<option value="${n}" ${n === p.days ? 'selected' : ''}>${n} 天</option>`).join('')}</select></div>
        <div style="flex:1"><label class="field">步調</label>
          <select data-bind="plan.pace">${Object.entries(PACES).map(([k, v]) => `<option value="${k}" ${k === p.pace ? 'selected' : ''}>${v.label}(每天約 ${v.hours} 小時)</option>`).join('')}</select></div>
      </div>
      <label class="field">旅遊偏好(可複選,不選則推薦熱門景點)</label>
      ${interestChips(p.interests, 'plan')}
      <label class="row small" style="margin-top:10px"><input type="checkbox" data-bind="plan.returnToStart" ${p.returnToStart ? 'checked' : ''}/> 最後一天回到出發地</label>
      <div style="margin-top:12px"><button class="btn" data-action="make-plan">產生行程</button></div>
    </div>
    ${result}
    ${p.result ? '<p class="notice">行程由系統依景點停留時間與交通時間自動估算,實際請依營業時間與天氣彈性調整。</p>' : ''}`;
}

function renderItem(it) {
  if (it.type === 'travel') {
    const r = it.route;
    const how = r.legs.map((l) => `${MODE_INFO[l.mode].icon} ${l.name}`).join(' → ');
    return `<li class="travel"><strong>移動:${placeName(it.from)} → ${placeName(it.to)}</strong>
      <div class="small muted">${esc(how)} ・ 約 ${formatDuration(r.totalMin)} ・ NT$${r.totalFare}</div></li>`;
  }
  if (it.type === 'food') {
    return `<li class="food"><strong>🍽️ 美食推薦:${esc(it.name)}</strong><div class="small muted">${esc(it.desc)}</div></li>`;
  }
  return `<li><strong>${esc(it.name)}</strong> <span class="muted small">(${it.hours} 小時)</span>
    <div class="small muted">${esc(it.desc)}</div>
    <a class="small" href="${mapsUrl(it.name)}" target="_blank" rel="noopener">地圖</a></li>`;
}

function renderRoute() {
  const r = state.route;
  const results = r.results == null ? '' : r.results.length
    ? r.results.map((x) => routeCard(x, r.from, r.to)).join('')
    : '<div class="empty">找不到路線,可能需要租車或包車前往。</div>';
  return `
    <h2>🚆 交通路線規劃</h2>
    <div class="card">
      <label class="field">從</label>
      <select data-bind="route.from">${destOptions(r.from)}</select>
      <div style="text-align:center; margin-top:6px"><button class="btn ghost small" data-action="swap">⇅ 交換</button></div>
      <label class="field">到</label>
      <select data-bind="route.to">${destOptions(r.to)}</select>
      <div style="margin-top:12px"><button class="btn" data-action="find-route">搜尋路線</button></div>
    </div>
    ${results}
    <p class="notice">票價與時間為參考值,班次請以台灣高鐵、台鐵、客運公司公告為準。</p>
    ${localTransportCard(r.to)}`;
}

function localTransportCard(destId) {
  const d = getDestination(destId);
  return d ? `<div class="card"><h3>🚏 到了${d.name}之後</h3><p class="small">${esc(d.localTransport)}</p></div>` : '';
}

function renderExplore() {
  const d = getDestination(state.explore.destId);
  const byType = {};
  for (const f of d.foods) (byType[f.type] ??= []).push(f);
  const foods = Object.entries(byType).map(([type, list]) => `
    <div class="card"><h3>${type}</h3>${list.map((f) => `<p><strong>${esc(f.name)}</strong><br><span class="small muted">${esc(f.desc)}</span>
      <br><a class="small" href="${mapsUrl(`${d.name} ${f.name}`)}" target="_blank" rel="noopener">找附近店家</a></p>`).join('')}</div>`).join('');
  return `
    <h2>🍜 吃喝玩樂</h2>
    <select data-bind="explore.destId">${destOptions(d.id)}</select>
    <div class="card" style="margin-top:12px">
      <h3>${d.name}</h3><p>${esc(d.intro)}</p><p class="small muted">🚏 ${esc(d.localTransport)}</p>
    </div>
    <h2>😋 好吃的</h2>
    ${foods || '<div class="empty">這裡以自然景觀為主,建議回到鄰近市區用餐。</div>'}
    <h2>🎡 好玩的</h2>
    <div class="grid">${d.attractions.map((a) => spotCard({ ...a, destName: d.name })).join('') || '<div class="empty">此地為交通轉運點</div>'}</div>`;
}

function renderSaved() {
  if (!state.saved.length) return '<h2>⭐ 我的收藏</h2><div class="empty">還沒有收藏景點,在推薦清單點 ☆ 加入吧!</div>';
  const items = state.saved.map((s) => findAttraction(s.id)).filter(Boolean);
  const stops = [...new Set(items.map((a) => a.destId))];
  const segs = planMultiStop(stops);
  const routeHtml = segs.length ? `<div class="card"><h3>🧭 串聯路線(依收藏順序)</h3><ul class="legs">${segs.map((s) => s.route
    ? `<li class="leg"><div class="mode">${MODE_INFO[s.route.legs[0].mode].icon}</div><div><strong>${placeName(s.from)} → ${placeName(s.to)}</strong>
       <div class="small muted">${s.route.legs.map((l) => l.name).join(' → ')} ・ 約 ${formatDuration(s.route.totalMin)} ・ NT$${s.route.totalFare}</div></div></li>`
    : `<li class="leg"><div class="mode">🚕</div><div>${placeName(s.from)} → ${placeName(s.to)}:建議租車</div></li>`).join('')}</ul></div>` : '';
  return `<h2>⭐ 我的收藏</h2>
    ${items.map((a, i) => `<div class="card row spread">
      <div><strong>${esc(a.name)}</strong><div class="muted small">${a.destName} ・ ${a.hours} 小時</div></div>
      <div class="row">
        <button class="btn ghost small" data-action="move" data-id="${a.id}" data-dir="-1" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button class="btn ghost small" data-action="move" data-id="${a.id}" data-dir="1" ${i === items.length - 1 ? 'disabled' : ''}>↓</button>
        <button class="btn ghost small" data-action="save" data-id="${a.id}">移除</button>
      </div></div>`).join('')}
    ${routeHtml}`;
}

const PAGES = { home: renderHome, plan: renderPlan, route: renderRoute, explore: renderExplore, saved: renderSaved };

function render() {
  view.innerHTML = PAGES[state.tab]();
  document.querySelectorAll('.tabbar button').forEach((b) => b.classList.toggle('active', b.dataset.tab === state.tab));
  const chat = document.getElementById('chat');
  if (chat) chat.scrollTop = chat.scrollHeight;
}

function go(tab) {
  state.tab = tab;
  render();
  window.scrollTo(0, 0);
}

// ---------- 事件 ----------
document.querySelector('.tabbar').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-tab]');
  if (b) go(b.dataset.tab);
});

view.addEventListener('change', (e) => {
  const path = e.target.dataset.bind;
  if (!path) return;
  const [a, b] = path.split('.');
  let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  if (path === 'plan.days') value = Number(value);
  if (b) state[a][b] = value; else state[a] = value;
  if (path === 'route.to') state.route.results = null;
  render();
});

view.addEventListener('submit', (e) => {
  if (e.target.dataset.form !== 'ask') return;
  e.preventDefault();
  const q = e.target.q.value.trim();
  if (!q) return;
  const ans = askGuide(q);
  state.chat.push({ who: 'me', text: q }, { who: 'bot', text: ans.text });
  if (ans.action?.type === 'route') Object.assign(state.route, { from: ans.action.from, to: ans.action.to, results: planAlternatives(ans.action.from, ans.action.to) });
  if (ans.action?.type === 'food' || ans.action?.type === 'dest') state.explore.destId = ans.action.destId;
  render();
  view.querySelector('input[name=q]')?.focus();
});

view.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const { action } = el.dataset;

  if (action === 'toggle-interest') {
    const list = el.dataset.group === 'home' ? state.interests : state.plan.interests;
    const i = list.indexOf(el.dataset.key);
    if (i >= 0) list.splice(i, 1); else list.push(el.dataset.key);
    render();
  } else if (action === 'save') {
    const id = el.dataset.id;
    if (isSaved(id)) state.saved = state.saved.filter((s) => s.id !== id);
    else state.saved.push({ id });
    storage.set('saved', state.saved);
    render();
  } else if (action === 'move') {
    const i = state.saved.findIndex((s) => s.id === el.dataset.id);
    const j = i + Number(el.dataset.dir);
    [state.saved[i], state.saved[j]] = [state.saved[j], state.saved[i]];
    storage.set('saved', state.saved);
    render();
  } else if (action === 'make-plan') {
    state.plan.result = generateItinerary(state.plan);
    render();
  } else if (action === 'find-route') {
    state.route.results = state.route.from === state.route.to ? [] : planAlternatives(state.route.from, state.route.to);
    render();
  } else if (action === 'swap') {
    Object.assign(state.route, { from: state.route.to, to: state.route.from, results: null });
    render();
  } else if (action === 'nearby') {
    if (!navigator.geolocation) return alert('此裝置不支援定位');
    el.disabled = true;
    el.textContent = '定位中…';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        state.nearby = nearbyAttractions(pos.coords.latitude, pos.coords.longitude).map(spotCard).join('');
        render();
      },
      () => {
        state.nearby = '<div class="empty">無法取得位置,請確認已允許定位權限。</div>';
        render();
      },
      { timeout: 10000 },
    );
  }
});

render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
