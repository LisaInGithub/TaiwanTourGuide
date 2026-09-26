import { DESTINATIONS, INTERESTS, REGIONS, MODE_INFO, SHOPS, getDestination, shopsOf } from './data.js';
import { planAlternatives, planMultiStop, TRANSFER_MINUTES } from './planner.js';
import { generateItinerary, recommend, PACES } from './itinerary.js';
import { askGuide } from './guide.js';
import { askClaude, getSampler, getRawSampler, translatePhoto, makePhrase } from './ai-guide.js';
import { nearbyAttractions, mapsUrl, transitUrl } from './geo.js';
import { PHRASES, TEA, TIPS, SOS } from './phrases.js';
import {
  t, getLang, setLang, dName, dIntro, dLocal, aName, aDesc, aTip, fName, fDesc, fType, sName, sArea, sNote,
  lineName, tipText, regionName, interestName, withZh, duration,
} from './i18n.js';

const view = document.getElementById('view');
const nav = document.querySelector('.tabbar');
const overlay = document.getElementById('overlay');

// ---------- state & per-browser storage ----------
const storage = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode etc. */ }
  },
};

setLang(storage.get('lang', 'en'));

const state = {
  tab: 'home',
  interests: [],
  region: '',
  chat: [{ who: 'bot', text: askGuide('').text, greeting: true }],
  chatBusy: false,
  aiMode: 'checking', // checking | ai | offline
  nearby: null, // {items} | {error}
  plan: { start: 'taipei', days: 3, pace: 'normal', interests: [], returnToStart: true, result: null },
  route: { from: 'taipei', to: 'tainan', results: null },
  explore: { destId: 'taipei' },
  saved: storage.get('saved', []),
  help: {
    photo: { available: false, busy: false, text: '' },
    custom: { busy: false, card: null, error: '' },
    tea: { drink: 0, sugar: 2, ice: 1, size: 0 },
  },
};

const TABS = [['home', '🧭', 'tabGuide'], ['plan', '🗓️', 'tabPlan'], ['route', '🚆', 'tabTransit'], ['explore', '🍜', 'tabEat'], ['help', '🆘', 'tabHelp']];
const PACE_EN = { relaxed: 'Relaxed', normal: 'Normal', packed: 'Packed' };
const LABEL_EN = { 最快: 'Fastest', 最省錢: 'Cheapest', 最少轉乘: 'Fewest transfers' };
const isEn = () => getLang() === 'en';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const findAttraction = (id) => {
  for (const d of DESTINATIONS) {
    const a = d.attractions.find((x) => x.id === id);
    if (a) return { ...a, destId: d.id, destName: d.name };
  }
  return null;
};
const isSaved = (id) => state.saved.some((s) => s.id === id);
// English first with Chinese underneath, so visitors can show the Chinese to locals
const dual = (enName, zh) => (isEn() && enName !== zh ? `${esc(enName)} <span class="zh">${esc(zh)}</span>` : esc(zh));

function destOptions(selected) {
  return REGIONS.map((r) => {
    const opts = DESTINATIONS.filter((d) => d.region === r)
      .map((d) => `<option value="${d.id}" ${d.id === selected ? 'selected' : ''}>${esc(withZh(dName(d.id), d.name))}</option>`).join('');
    return `<optgroup label="${regionName(r)}">${opts}</optgroup>`;
  }).join('');
}

function interestChips(selected, group) {
  return `<div class="chips">${INTERESTS.map((i) =>
    `<button class="chip ${selected.includes(i.key) ? 'on' : ''}" data-action="toggle-interest" data-group="${group}" data-key="${i.key}">${i.icon} ${esc(interestName(i.key, i.label))}</button>`).join('')}</div>`;
}

function spotCard(a) {
  return `<div class="card">
    <div class="row spread"><h3>${dual(aName(a), a.name)}</h3>
      <button class="icon-btn" data-action="save" data-id="${a.id}" aria-label="${t('save')}">${isSaved(a.id) ? '⭐' : '☆'}</button></div>
    <div class="muted small">📍 ${esc(dName(a.destId))} ・ ${t('stay')} ${a.hours} ${t('hours')}${a.km != null ? ` ・ ${a.km.toFixed(1)} km ${isEn() ? t('away') : ''}` : ''}</div>
    <p>${esc(aDesc(a))}</p>
    ${aTip(a) ? `<p class="small">💡 ${esc(aTip(a))}</p>` : ''}
    <div class="row" style="margin-top:8px">
      <a class="small" href="${mapsUrl(a.name)}" target="_blank" rel="noopener">${t('openMap')}</a>
      ${isEn() ? `<button class="link small" data-action="show-card" data-zh="${esc(a.name)}" data-en="${esc(aName(a))}">${t('showLocal')}</button>` : ''}
    </div>
  </div>`;
}

function routeCard(r, from, to) {
  const legs = r.legs.map((l, i) => `
    ${i > 0 ? `<li class="transfer">${t('changeAt', { p: esc(dName(l.from)), m: TRANSFER_MINUTES })}</li>` : ''}
    <li class="leg">
      <div class="mode">${MODE_INFO[l.mode].icon}</div>
      <div>
        <strong>${dual(lineName(l.name), l.name)}</strong>
        <div class="muted small">${l.stops.map((s) => esc(dName(s))).join(' → ')}</div>
        <div class="small">${t('about')} ${duration(l.min)} ・ NT$${l.fare}${MODE_INFO[l.mode].url ? ` ・ <a href="${MODE_INFO[l.mode].url}" target="_blank" rel="noopener">${t('timetable')}</a>` : ''}</div>
        ${l.tips.map((x) => `<div class="small">💡 ${esc(tipText(x))}</div>`).join('')}
      </div>
    </li>`).join('');
  return `<div class="card route-opt">
    <div class="row spread">
      <div>${r.labels.map((x) => `<span class="chip on small">${isEn() ? LABEL_EN[x] ?? x : x}</span>`).join(' ')}</div>
      <div class="muted small">${t('transfers', { n: r.transfers })}</div>
    </div>
    <div class="row" style="margin-top:8px; gap:18px">
      <div><div class="muted small">${t('total')}</div><div class="stat">${duration(r.totalMin)}</div></div>
      <div><div class="muted small">${t('fare')}</div><div class="stat">NT$${r.totalFare}</div></div>
    </div>
    <ul class="legs">${legs}</ul>
    <a class="small" href="${transitUrl(getDestination(from).name, getDestination(to).name)}" target="_blank" rel="noopener">${t('liveTransit')}</a>
  </div>`;
}

// Shops and spots named in an answer (by their Chinese name) → Google Maps links
const PLACE_INDEX = [
  ...Object.entries(SHOPS).flatMap(([destId, list]) => list.map((x) => ({ zh: x.name, label: () => sName(x), query: `${x.name} ${getDestination(destId).name}` }))),
  ...DESTINATIONS.flatMap((d) => d.attractions.map((a) => {
    const zh = a.name.replace(/(.*?)/g, '');
    return { zh, label: () => aName(a).replace(/ \(.*?\)$/, ''), query: zh };
  })),
].sort((x, y) => y.zh.length - x.zh.length);

function placeLinks(text) {
  const found = [];
  let rest = text;
  for (const p of PLACE_INDEX) {
    const short = p.zh.split('・')[0];
    const key = rest.includes(p.zh) ? p.zh : short.length >= 3 && rest.includes(short) ? short : null;
    if (!key) continue;
    found.push(p);
    rest = rest.split(key).join('');
    if (found.length >= 8) break;
  }
  return found;
}

function linkChips(links) {
  if (!links?.length) return '';
  return `<div class="chips links">${links.map((p) => `<a class="chip small" href="${mapsUrl(p.query)}" target="_blank" rel="noopener">📍 ${esc(p.label())}</a>`).join('')}</div>`;
}

function aiBadge() {
  if (state.aiMode === 'ai') return `<span class="tag">${t('byClaude')}</span>`;
  if (state.aiMode === 'offline') return `<span class="tag">${t('offline')}</span>`;
  return '';
}

// ---------- pages ----------
function renderHome() {
  const recs = recommend(state.interests, { region: state.region || undefined, limit: 6 });
  const nearby = state.nearby?.error ? `<div class="empty">${t(state.nearby.error)}</div>` : (state.nearby?.items ?? []).map(spotCard).join('');
  return `
    <div class="card">
      <div class="row spread"><h2 style="margin:0">${t('askTitle')}</h2>${aiBadge()}</div>
      <div class="chat" id="chat">${state.chat.map((m, i) => `<div class="bubble ${m.who}${m.pending ? ' pending' : ''}" id="bubble-${i}">${esc(m.text)}${linkChips(m.links)}</div>`).join('')}</div>
      <form class="ask" data-form="ask">
        <input type="text" name="q" id="ask-q" placeholder="${esc(t('askPlaceholder'))}" autocomplete="off" ${state.chatBusy ? 'disabled' : ''} />
        <button class="btn" type="submit" ${state.chatBusy ? 'disabled' : ''}>${state.chatBusy ? t('answering') : t('send')}</button>
      </form>
      <div class="chips" style="margin-top:8px">${t('examples').map((q) => `<button class="chip small" data-action="ask" data-q="${esc(q)}" ${state.chatBusy ? 'disabled' : ''}>${esc(q)}</button>`).join('')}</div>
    </div>

    <h2>${t('recTitle')}</h2>
    <p class="muted">${t('recHint')}</p>
    ${interestChips(state.interests, 'home')}
    <label class="field" for="region">${t('region')}</label>
    <select id="region" data-bind="region">
      <option value="">${t('allTaiwan')}</option>
      ${REGIONS.map((r) => `<option value="${r}" ${r === state.region ? 'selected' : ''}>${regionName(r)}</option>`).join('')}
    </select>
    <div class="grid" style="margin-top:12px">${recs.map(spotCard).join('') || `<div class="empty">${t('noMatch')}</div>`}</div>

    <h2>${t('nearTitle')}</h2>
    <button class="btn ghost" data-action="nearby">${t('useLocation')}</button>
    <div class="grid" style="margin-top:12px">${nearby}</div>`;
}

function renderPlan() {
  const p = state.plan;
  const stayName = (zh) => {
    const id = DESTINATIONS.find((x) => x.name === zh)?.id;
    return id ? withZh(dName(id), zh) : zh;
  };
  const result = p.result ? p.result.map((d) => `
    <div class="card day">
      <h3>Day ${d.day}</h3>
      <ul class="timeline">${d.items.map(renderItem).join('') || `<li>${t('free')}</li>`}</ul>
      <div class="muted small" style="margin-top:6px">${t('tonight')} ${esc(stayName(d.stayAt))}</div>
    </div>`).join('') : '';
  return `
    <h2>${t('planTitle')}</h2>
    <div class="card">
      <label class="field" for="plan-start">${t('start')}</label>
      <select id="plan-start" data-bind="plan.start">${destOptions(p.start)}</select>
      <div class="row" style="gap:12px">
        <div style="flex:1"><label class="field" for="plan-days">${t('days')}</label>
          <select id="plan-days" data-bind="plan.days">${[1, 2, 3, 4, 5, 6, 7].map((n) => `<option value="${n}" ${n === p.days ? 'selected' : ''}>${n} ${n === 1 ? t('day') : t('daysN')}</option>`).join('')}</select></div>
        <div style="flex:1"><label class="field" for="plan-pace">${t('pace')}</label>
          <select id="plan-pace" data-bind="plan.pace">${Object.entries(PACES).map(([k, v]) => `<option value="${k}" ${k === p.pace ? 'selected' : ''}>${isEn() ? PACE_EN[k] : v.label} ${t('paceHint', { h: v.hours })}</option>`).join('')}</select></div>
      </div>
      <label class="field">${t('prefs')}</label>
      ${interestChips(p.interests, 'plan')}
      <label class="row small" style="margin-top:10px"><input type="checkbox" id="plan-return" data-bind="plan.returnToStart" ${p.returnToStart ? 'checked' : ''}/> ${t('returnStart')}</label>
      <div style="margin-top:12px"><button class="btn" data-action="make-plan">${t('makePlan')}</button></div>
    </div>
    ${result}
    ${p.result ? `<p class="notice">${t('planNote')}</p>` : ''}
    ${renderSaved()}`;
}

function renderItem(it) {
  if (it.type === 'travel') {
    const r = it.route;
    const how = r.legs.map((l) => `${MODE_INFO[l.mode].icon} ${lineName(l.name)}`).join(' → ');
    return `<li class="travel"><strong>${t('move')} ${esc(dName(it.from))} → ${esc(dName(it.to))}</strong>
      <div class="small muted">${esc(how)} ・ ${t('about')} ${duration(r.totalMin)} ・ NT$${r.totalFare}</div></li>`;
  }
  if (it.type === 'food') {
    return `<li class="food"><strong>${t('foodPick')} ${dual(fName(it.destId, it), it.name)}</strong><div class="small muted">${esc(fDesc(it.destId, it))}</div></li>`;
  }
  return `<li><strong>${dual(aName(it), it.name)}</strong> <span class="muted small">(${it.hours} ${t('hours')})</span>
    <div class="small muted">${esc(aDesc(it))}</div>
    <a class="small" href="${mapsUrl(it.name)}" target="_blank" rel="noopener">${t('map')}</a></li>`;
}

function renderRoute() {
  const r = state.route;
  const results = r.results == null ? '' : r.results.length
    ? r.results.map((x) => routeCard(x, r.from, r.to)).join('')
    : `<div class="empty">${t('noRoute')}</div>`;
  const d = getDestination(r.to);
  return `
    <h2>${t('transitTitle')}</h2>
    <div class="card">
      <label class="field" for="route-from">${t('from')}</label>
      <select id="route-from" data-bind="route.from">${destOptions(r.from)}</select>
      <div style="text-align:center; margin-top:6px"><button class="btn ghost small" data-action="swap">${t('swap')}</button></div>
      <label class="field" for="route-to">${t('to')}</label>
      <select id="route-to" data-bind="route.to">${destOptions(r.to)}</select>
      <div style="margin-top:12px"><button class="btn" data-action="find-route">${t('search')}</button></div>
    </div>
    ${results}
    <p class="notice">${t('fareNote')}</p>
    <div class="card"><h3>${t('arrived', { p: esc(dName(d.id)) })}</h3><p class="small">${esc(dLocal(d))}</p></div>`;
}

function renderExplore() {
  const d = getDestination(state.explore.destId);
  const byType = {};
  for (const f of d.foods) (byType[f.type] ??= []).push(f);
  const foods = Object.entries(byType).map(([type, list]) => `
    <div class="card"><h3>${esc(fType(type))}</h3>${list.map((f) => `<p><strong>${dual(fName(d.id, f), f.name)}</strong><br><span class="small muted">${esc(fDesc(d.id, f))}</span>
      <br><a class="small" href="${mapsUrl(`${d.name} ${f.name}`)}" target="_blank" rel="noopener">${t('findShops')}</a></p>`).join('')}</div>`).join('');
  const shops = shopsOf(d.id);
  return `
    <h2>${t('eatTitle')}</h2>
    <select id="explore-dest" data-bind="explore.destId" aria-label="${t('region')}">${destOptions(d.id)}</select>
    <div class="card" style="margin-top:12px">
      <h3>${dual(dName(d.id), d.name)}</h3><p>${esc(dIntro(d))}</p><p class="small muted">🚏 ${esc(dLocal(d))}</p>
    </div>
    <h2>${t('eats')}</h2>
    ${foods || `<div class="empty">${t('noFood')}</div>`}
    ${shops.length ? `<h2>${t('shopsTitle')}</h2>
    <p class="muted small">${t('shopsHint')}</p>
    <div class="grid">${shops.map((x) => `<div class="card">
      <h3>${dual(sName(x), x.name)}</h3>
      <div class="muted small">${esc(dishLabel(d.id, x.dish))} ・ ${esc(sArea(x))}</div>
      <p class="small">${esc(sNote(x))}</p>
      <div class="row">
        <a class="btn ghost small" href="${mapsUrl(`${x.name} ${d.name}`)}" target="_blank" rel="noopener">${t('googleRating')}</a>
        ${isEn() ? `<button class="link small" data-action="show-card" data-zh="${esc(x.name)}" data-en="${esc(sName(x))}">${t('showLocal')}</button>` : ''}
      </div>
    </div>`).join('')}</div>` : ''}
    <h2>${t('fun')}</h2>
    <div class="grid">${d.attractions.map((a) => spotCard({ ...a, destId: d.id })).join('') || `<div class="empty">${t('hub')}</div>`}</div>`;
}

// a shop's "dish" is either a food type (早餐) or one of the place's foods (牛肉麵)
const dishLabel = (destId, dish) => (fType(dish) !== dish ? fType(dish) : fName(destId, { name: dish }));

function renderSaved() {
  if (!state.saved.length) return `<h2>${t('savedTitle')}</h2><div class="empty">${t('savedEmpty')}</div>`;
  const items = state.saved.map((s) => findAttraction(s.id)).filter(Boolean);
  const stops = [...new Set(items.map((a) => a.destId))];
  const segs = planMultiStop(stops);
  const routeHtml = segs.length ? `<div class="card"><h3>${t('chain')}</h3><ul class="legs">${segs.map((s) => s.route
    ? `<li class="leg"><div class="mode">${MODE_INFO[s.route.legs[0].mode].icon}</div><div><strong>${esc(dName(s.from))} → ${esc(dName(s.to))}</strong>
       <div class="small muted">${s.route.legs.map((l) => esc(lineName(l.name))).join(' → ')} ・ ${t('about')} ${duration(s.route.totalMin)} ・ NT$${s.route.totalFare}</div></div></li>`
    : `<li class="leg"><div class="mode">🚕</div><div>${esc(dName(s.from))} → ${esc(dName(s.to))}: ${t('needCar')}</div></li>`).join('')}</ul></div>` : '';
  return `<h2>${t('savedTitle')}</h2>
    ${items.map((a, i) => `<div class="card row spread">
      <div><strong>${dual(aName(a), a.name)}</strong><div class="muted small">${esc(dName(a.destId))} ・ ${a.hours} ${t('hours')}</div></div>
      <div class="row">
        <button class="btn ghost small" data-action="move" data-id="${a.id}" data-dir="-1" ${i === 0 ? 'disabled' : ''} aria-label="Up">↑</button>
        <button class="btn ghost small" data-action="move" data-id="${a.id}" data-dir="1" ${i === items.length - 1 ? 'disabled' : ''} aria-label="Down">↓</button>
        <button class="btn ghost small" data-action="save" data-id="${a.id}">${t('remove')}</button>
      </div></div>`).join('')}
    ${routeHtml}`;
}

function phraseCard(p, i) {
  return `<button class="phrase" data-action="show-phrase" data-i="${i}">
    <span class="zh-big">${esc(p.zh)}</span>
    <span class="small muted">${esc(p.py)}</span>
    <span class="small">${esc(p.en)}</span>
  </button>`;
}

function teaOrder() {
  const x = state.help.tea;
  const pick = (list, i) => list[i];
  const d = pick(TEA.drinks, x.drink); const s = pick(TEA.sugar, x.sugar); const ice = pick(TEA.ice, x.ice); const size = pick(TEA.size, x.size);
  return { zh: `${size.zh}${d.zh},${s.zh}${ice.zh}`, py: '', en: `${size.en} ${d.en}, ${s.en.toLowerCase()}, ${ice.en.toLowerCase()}` };
}

function teaSelect(key, list) {
  return `<select id="tea-${key}" data-bind="help.tea.${key}">${list.map((o, i) => `<option value="${i}" ${state.help.tea[key] === i ? 'selected' : ''}>${esc(isEn() ? `${o.en} · ${o.zh}` : o.zh)}</option>`).join('')}</select>`;
}

function renderHelp() {
  const h = state.help;
  const photo = h.photo.available ? `
      <p class="small muted">${t('photoHint')}</p>
      <label class="btn" for="photo-input" ${h.photo.busy ? 'aria-disabled="true"' : ''}>${h.photo.busy ? t('thinking') : t('photoBtn')}</label>
      <input type="file" id="photo-input" accept="image/*" capture="environment" hidden ${h.photo.busy ? 'disabled' : ''} />
      ${h.photo.text ? `<div class="bubble bot" id="photo-out" style="margin-top:10px;max-width:100%">${esc(h.photo.text)}</div>` : '<div id="photo-out"></div>'}`
    : `<p class="small muted">${t('photoNone')}</p>`;
  const custom = h.custom;
  const tea = teaOrder();
  return `
    <h2>${t('helpTitle')}</h2>
    <div class="card"><h3>${t('photoTitle')}</h3>${photo}</div>

    <h2>${t('phrasesTitle')}</h2>
    <p class="muted small">${t('phrasesHint')}</p>
    <div class="phrases">${PHRASES.map(phraseCard).join('')}</div>

    ${state.aiMode === 'ai' ? `<div class="card" style="margin-top:12px"><h3>${t('customTitle')}</h3>
      <form class="ask" data-form="phrase">
        <input type="text" name="p" id="phrase-q" placeholder="${esc(t('customPlaceholder'))}" autocomplete="off" ${custom.busy ? 'disabled' : ''} />
        <button class="btn" type="submit" ${custom.busy ? 'disabled' : ''}>${custom.busy ? t('thinking') : t('make')}</button>
      </form>
      ${custom.error ? `<p class="small">${esc(custom.error)}</p>` : ''}
      ${custom.card ? `<div class="phrases" style="margin-top:10px">${phraseCard(custom.card, 'custom')}</div>` : ''}
    </div>` : ''}

    <div class="card" style="margin-top:12px"><h3>${t('teaTitle')}</h3>
      <div class="tea-grid">
        <label class="field" for="tea-drink">🧋</label>${teaSelect('drink', TEA.drinks)}
        <label class="field" for="tea-size">📏</label>${teaSelect('size', TEA.size)}
        <label class="field" for="tea-sugar">${t('sugar')}</label>${teaSelect('sugar', TEA.sugar)}
        <label class="field" for="tea-ice">${t('ice')}</label>${teaSelect('ice', TEA.ice)}
      </div>
      <div class="phrases" style="margin-top:10px">${phraseCard(tea, 'tea')}</div>
    </div>

    <h2>${t('tipsTitle')}</h2>
    <div class="card"><ul class="tips">${TIPS.map((x) => `<li><span>${x.icon}</span><span>${esc(isEn() ? x.en : x.zh)}</span></li>`).join('')}</ul></div>

    <h2>${t('sosTitle')}</h2>
    <div class="card"><ul class="tips">${SOS.map((x) => `<li><span class="sos-num">${x.num}</span><span>${esc(isEn() ? x.en : x.zh)}</span></li>`).join('')}</ul></div>`;
}

const PAGES = { home: renderHome, plan: renderPlan, route: renderRoute, explore: renderExplore, help: renderHelp };

function render() {
  document.documentElement.lang = isEn() ? 'en' : 'zh-Hant-TW';
  document.getElementById('lang-btn').textContent = t('langToggle');
  nav.innerHTML = TABS.map(([id, icon, key]) => `<button data-tab="${id}" class="${state.tab === id ? 'active' : ''}"><span>${icon}</span>${t(key)}</button>`).join('');
  view.innerHTML = PAGES[state.tab]();
  const chat = document.getElementById('chat');
  if (chat) chat.scrollTop = chat.scrollHeight;
}

function go(tab) {
  state.tab = tab;
  render();
  window.scrollTo(0, 0);
}

function showCard(card) {
  overlay.innerHTML = `<div class="zh-huge">${esc(card.zh)}</div>
    ${card.py ? `<div class="py">${esc(card.py)}</div>` : ''}
    ${card.en ? `<div class="en">${esc(card.en)}</div>` : ''}
    <div class="small close-hint">${t('tapClose')}</div>`;
  overlay.hidden = false;
}

// ---------- events ----------
overlay.addEventListener('click', () => { overlay.hidden = true; });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') overlay.hidden = true; });

document.getElementById('lang-btn').addEventListener('click', () => {
  setLang(isEn() ? 'zh' : 'en');
  storage.set('lang', getLang());
  // refresh the greeting if the chat hasn't started yet
  if (state.chat.length === 1 && state.chat[0].greeting) state.chat[0].text = askGuide('').text;
  render();
});

nav.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-tab]');
  if (b) go(b.dataset.tab);
});

view.addEventListener('change', async (e) => {
  if (e.target.id === 'photo-input') {
    const file = e.target.files?.[0];
    if (file) runPhoto(file);
    return;
  }
  const path = e.target.dataset.bind;
  if (!path) return;
  const keys = path.split('.');
  let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  if (path === 'plan.days' || path.startsWith('help.tea.')) value = Number(value);
  let obj = state;
  for (const k of keys.slice(0, -1)) obj = obj[k];
  obj[keys.at(-1)] = value;
  if (path === 'route.to' || path === 'route.from') state.route.results = null;
  render();
});

view.addEventListener('submit', (e) => {
  e.preventDefault();
  if (e.target.dataset.form === 'ask') sendQuestion(e.target.q.value);
  if (e.target.dataset.form === 'phrase') runPhrase(e.target.p.value);
});

function applyAction(action) {
  if (action?.type === 'route') Object.assign(state.route, { from: action.from, to: action.to, results: planAlternatives(action.from, action.to) });
  if (action?.type === 'food' || action?.type === 'dest') state.explore.destId = action.destId;
  if (action?.type === 'plan') Object.assign(state.plan, { start: action.start, days: action.days, interests: [...action.interests], result: null });
}

async function sendQuestion(raw) {
  const q = raw.trim();
  if (!q || state.chatBusy) return;
  // answer offline in the language the question was typed in
  const qLang = /[一-鿿]/.test(q) && !/[a-z]{3,}/i.test(q) ? 'zh' : 'en';
  const local = askGuide(q, qLang);
  applyAction(local.action);
  state.chat.push({ who: 'me', text: q });

  if (state.aiMode === 'offline') {
    state.chat.push({ who: 'bot', text: local.text, links: placeLinks(local.text) });
    render();
    view.querySelector('#ask-q')?.focus();
    return;
  }

  const bot = { who: 'bot', text: t('thinking'), pending: true };
  state.chat.push(bot);
  state.chatBusy = true;
  render();
  const idx = state.chat.length - 1;
  const history = state.chat.slice(0, -1).filter((m) => !m.pending && !m.greeting);
  const res = await askClaude(history, {
    onText: (text) => {
      bot.text = text;
      const el = document.getElementById(`bubble-${idx}`);
      if (el) { el.textContent = text; el.classList.remove('pending'); }
      const chat = document.getElementById('chat');
      if (chat) chat.scrollTop = chat.scrollHeight;
    },
  });
  bot.pending = false;
  if (!res || res.permanent) {
    state.aiMode = 'offline';
    bot.text = local.text;
  } else if (res.error) {
    bot.text = res.text?.trim() ? `${res.text}\n${t('cutOff')}` : `${res.error === 'rate_limited' ? t('busy') : t('flaky')}\n${local.text}`;
  } else {
    bot.text = res.text;
  }
  bot.links = placeLinks(bot.text);
  state.chatBusy = false;
  render();
  view.querySelector('#ask-q')?.focus();
}

async function runPhoto(file) {
  const p = state.help.photo;
  p.busy = true;
  p.text = t('thinking');
  render();
  const res = await translatePhoto(file, getLang(), {
    onText: (text) => {
      p.text = text;
      const el = document.getElementById('photo-out');
      if (el) { el.className = 'bubble bot'; el.style.cssText = 'margin-top:10px;max-width:100%'; el.textContent = text; }
    },
  });
  p.busy = false;
  p.text = res.text?.trim() ? res.text : t('tryAgain');
  render();
}

async function runPhrase(raw) {
  const text = raw.trim();
  const c = state.help.custom;
  if (!text || c.busy) return;
  c.busy = true;
  c.error = '';
  render();
  const res = await makePhrase(text);
  c.busy = false;
  if (res.card) c.card = res.card; else c.error = t('tryAgain');
  render();
}

view.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const { action } = el.dataset;

  if (action === 'ask') {
    sendQuestion(el.dataset.q);
  } else if (action === 'show-phrase') {
    const i = el.dataset.i;
    showCard(i === 'custom' ? state.help.custom.card : i === 'tea' ? teaOrder() : PHRASES[Number(i)]);
  } else if (action === 'show-card') {
    const lead = isEn() ? 'Please take me here · 請載我到這裡' : '';
    showCard({ zh: el.dataset.zh, py: lead, en: el.dataset.en });
  } else if (action === 'toggle-interest') {
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
    if (!navigator.geolocation) {
      state.nearby = { error: 'noGeo' };
      render();
      return;
    }
    el.disabled = true;
    el.textContent = t('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        state.nearby = { items: nearbyAttractions(pos.coords.latitude, pos.coords.longitude) };
        render();
      },
      () => {
        state.nearby = { error: 'geoFail' };
        render();
      },
      { timeout: 10000 },
    );
  }
});

render();

getSampler().then((s) => {
  if (state.aiMode === 'checking') state.aiMode = s ? 'ai' : 'offline';
  if (!state.chatBusy) render();
});
getRawSampler().then((raw) => {
  state.help.photo.available = Boolean(raw?.images);
  if (state.tab === 'help') render();
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
