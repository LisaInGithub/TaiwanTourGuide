// AI guide: on claude.ai, Claude understands the question and answers using the tools below,
// which read the app's own data (places, food, shops, routes, itineraries).
// When Claude isn't available (opened as a file, not granted, …) this returns null and guide.js takes over.
import { DESTINATIONS, INTERESTS, REGIONS, getDestination, shopsOf } from './data.js';
import { DEST_EN, ATTR_EN, FOOD_EN, SHOP_EN, LINE_EN } from './data-en.js';
import { planAlternatives, placeName } from './planner.js';
import { recommend, generateItinerary, PACES } from './itinerary.js';
import { findDestinations } from './guide.js';

const MAX_TURNS = 10;

function resolvePlace(name) {
  const id = findDestinations(String(name ?? ''))[0];
  if (!id) throw new Error(`No place "${name}" in the app. Known places: ${DESTINATIONS.map((d) => `${DEST_EN[d.id].name} (${d.name})`).join(', ')}`);
  return id;
}

const enPlace = (id) => `${DEST_EN[id]?.name ?? id} (${placeName(id)})`;
const enAttr = (a) => ({ name: a.name, en: ATTR_EN[a.id]?.name, hours: a.hours, tags: a.tags, desc: ATTR_EN[a.id]?.desc ?? a.desc, tip: ATTR_EN[a.id]?.tip ?? a.tip });

const TOOLS = [
  {
    name: 'get_destination',
    description: 'Look up one place (city or scenic area): intro, local transport, all attractions, typical foods, and specific well-known local shops. Chinese name in `name`, English in `en`. Returns JSON.',
    inputSchema: { type: 'object', properties: { name: { type: 'string', description: 'Place name in English or Chinese, e.g. Tainan / 台南, Jiufen, Sun Moon Lake' } }, required: ['name'] },
    execute({ name }) {
      const d = getDestination(resolvePlace(name));
      const e = DEST_EN[d.id];
      return {
        name: d.name, en: e.name, region: d.region, intro: e.intro, localTransport: e.localTransport,
        attractions: d.attractions.map((a) => ({ ...enAttr(a), nightOnly: a.evening })),
        foods: d.foods.map((f) => ({ name: f.name, en: FOOD_EN[`${d.id}:${f.name}`]?.name, type: f.type, desc: FOOD_EN[`${d.id}:${f.name}`]?.desc ?? f.desc })),
        shops: shopsOf(d.id).map((x) => ({ name: x.name, en: SHOP_EN[x.name]?.name, dish: x.dish, area: SHOP_EN[x.name]?.area ?? x.area, note: SHOP_EN[x.name]?.note ?? x.note })),
      };
    },
  },
  {
    name: 'search_attractions',
    description: 'Search attractions across Taiwan by interest tag (Chinese keys), region (Chinese), or a keyword found in the Chinese name/description (e.g. 夕陽 sunset, 日出 sunrise, 天燈 lantern). Returns the top 8.',
    inputSchema: {
      type: 'object',
      properties: {
        interests: { type: 'array', items: { type: 'string', enum: INTERESTS.map((i) => i.key) } },
        region: { type: 'string', enum: REGIONS },
        keyword: { type: 'string', description: 'Chinese keyword searched in names and descriptions' },
      },
    },
    execute({ interests, region, keyword }) {
      const tags = Array.isArray(interests) ? interests.map(String) : [];
      let list = recommend(tags, { region: region ? String(region) : undefined, limit: 200 });
      if (keyword) list = list.filter((a) => `${a.name}${a.desc}${a.tip ?? ''}`.includes(String(keyword)));
      return list.slice(0, 8).map((a) => ({ ...enAttr(a), place: enPlace(a.destId) }));
    },
  },
  {
    name: 'plan_route',
    description: 'Public transport between two places: fastest / cheapest / fewest-transfer options with each leg, minutes and estimated fare in NTD.',
    inputSchema: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' } }, required: ['from', 'to'] },
    execute({ from, to }) {
      const a = resolvePlace(from);
      const b = resolvePlace(to);
      if (a === b) throw new Error('Start and destination are the same');
      const routes = planAlternatives(a, b);
      return {
        from: enPlace(a), to: enPlace(b), arrivalTip: DEST_EN[b].localTransport,
        options: routes.map((r) => ({
          type: r.labels, totalMinutes: r.totalMin, totalFareNTD: r.totalFare, transfers: r.transfers,
          legs: r.legs.map((l) => ({ by: `${LINE_EN[l.name] ?? l.name} (${l.name})`, from: enPlace(l.from), to: enPlace(l.to), minutes: l.min, fareNTD: l.fare, tips: l.tips })),
        })),
      };
    },
  },
  {
    name: 'make_itinerary',
    description: 'Build a multi-day itinerary: each day’s spots, travel and a food pick. stay_in_region=true keeps it within the start’s region.',
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
          ? `Travel ${enPlace(i.from)} → ${enPlace(i.to)} by ${i.route.legs.map((l) => LINE_EN[l.name] ?? l.name).join(' → ')}, about ${i.route.totalMin} min`
          : i.type === 'food' ? `Food: ${FOOD_EN[`${i.destId}:${i.name}`]?.name ?? ''} (${i.name})` : `${ATTR_EN[i.id]?.name ?? ''} (${i.name}), ${i.hours} h`)),
      }));
    },
  },
];

const RULES = `You are the local buddy inside the "Taiwan Buddy" app, helping foreign visitors travel in Taiwan like a friendly local who speaks Chinese.
Rules:
1. Reply in the language the traveller writes in (English if unsure). Friendly, practical, like a local friend.
2. For places, food, transport and itineraries, call the tools first and answer from their results. Never invent shop names, train times or prices.
3. Whenever you name a place, dish or shop, write the English name followed by the exact Chinese name in parentheses, copied character for character from the tool result, e.g. "Fuhang Soy Milk (阜杭豆漿)". Travellers show the Chinese to locals, and the app turns these names into Google Maps links.
4. For food, prefer the specific shops from get_destination (name, where, what to order).
5. You cannot see Google ratings: never write star ratings, review counts or scores. If useful, say they can tap the map links for the latest ratings.
6. Add the practical things visitors don't know when relevant: cash only at night markets and small stalls, EasyCard, no eating or drinking on the MRT, booking trains ahead, opening hours (many breakfast shops close by midday).
7. Only add facts outside the app data when you are very sure, and say to check opening hours before going.
8. Times and fares are estimates: say "about".
9. If something is unclear (e.g. no starting point), assume the most likely case (start from Taipei) and say they can tell you otherwise.
10. Format: plain text, no Markdown headings, bold or tables. Use "・" for list items. Keep it under about 180 words, most useful point first.
11. For questions unrelated to travel, answer briefly and steer back to Taiwan travel.
Places in the app: ${DESTINATIONS.map((d) => `${DEST_EN[d.id].name} (${d.name})`).join(', ')}.
Interest tags (use the Chinese keys): ${INTERESTS.map((i) => i.key).join(', ')}.
Today's date: ${new Date().toISOString().slice(0, 10)}.`;

let samplePromise = null;
let disabled = false;

// Resolves the sample function when Claude with tools is available, else null
export async function getSampler() {
  if (disabled || typeof window === 'undefined' || !window.claude?.use) return null;
  samplePromise ??= window.claude.use('sample').then(async (sample) => {
    if (!sample) return null;
    const limits = await sample.limits().catch(() => null);
    return limits?.tools ? sample : null;
  }).catch(() => null);
  return samplePromise;
}

let rawPromise = null;
// sample() without the tools requirement, plus its limits (for photos and phrase cards)
export async function getRawSampler() {
  if (typeof window === 'undefined' || !window.claude?.use) return null;
  rawPromise ??= window.claude.use('sample').then(async (sample) => {
    if (!sample) return null;
    const limits = await sample.limits().catch(() => null);
    return { sample, images: Boolean(limits?.images), mediaTypes: limits?.images?.mediaTypes ?? [] };
  }).catch(() => null);
  return rawPromise;
}

const PHOTO_PROMPT = (lang) => `This photo was taken by a foreign visitor in Taiwan: a menu, sign, label or ticket.
Translate it for them into ${lang === 'zh' ? 'Traditional Chinese (Taiwan)' : 'English'}.
For a menu: one line per item as "・中文名 — translation — price", then short notes on anything a visitor should know: pork, beef, seafood, spicy, peanuts or other common allergens, vegetarian options, and 1–2 items worth trying.
For a sign or notice: what it says and what the visitor should do.
Plain text only, no Markdown. If the photo is unreadable, say so and suggest retaking it closer.`;

export async function translatePhoto(file, lang, { onText, signal } = {}) {
  const raw = await getRawSampler();
  if (!raw?.images) return { error: 'images_unavailable' };
  try {
    const { text } = await raw.sample(PHOTO_PROMPT(lang), { images: file, modelTier: 'default', cache: false, onText: ({ text: t }) => onText?.(t), signal });
    return { text };
  } catch (e) {
    return { error: e?.code ?? 'upstream_error', text: e?.text };
  }
}

export async function makePhrase(text) {
  const raw = await getRawSampler();
  if (!raw) return { error: 'not_available' };
  try {
    const card = await raw.sample.json(`A foreign visitor in Taiwan wants to show this to a local (shop owner, driver, staff): "${text}"
Write it as natural, polite Taiwanese Mandarin in Traditional Chinese characters, short enough for a big card.
Reply with only JSON: {"zh": "...", "py": "hanyu pinyin with tone marks", "en": "short English back-translation"}`, { modelTier: 'quick' });
    if (!card?.zh) return { error: 'invalid_json' };
    return { card: { zh: String(card.zh), py: String(card.py ?? ''), en: String(card.en ?? text) } };
  } catch (e) {
    return { error: e?.code ?? 'upstream_error' };
  }
}

const PERMANENT = ['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed', 'tools_unavailable'];

/**
 * @param {{who:'me'|'bot', text:string}[]} history the chat so far (last item is the traveller's new question)
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
