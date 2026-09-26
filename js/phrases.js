// Survival content for visitors: phrase cards, bubble-tea ordering, local tips, emergency numbers.

export const PHRASES = [
  { zh: '我要這個', py: 'wǒ yào zhège', en: 'I’d like this one, please.' },
  { zh: '多少錢?', py: 'duōshǎo qián', en: 'How much is it?' },
  { zh: '可以刷卡嗎?', py: 'kěyǐ shuākǎ ma', en: 'Can I pay by card?' },
  { zh: '內用', py: 'nèiyòng', en: 'Eat here' },
  { zh: '外帶', py: 'wàidài', en: 'Take away' },
  { zh: '不要香菜', py: 'bú yào xiāngcài', en: 'No cilantro, please.' },
  { zh: '不要辣', py: 'bú yào là', en: 'Not spicy, please.' },
  { zh: '我吃素(不吃肉、不吃海鮮)', py: 'wǒ chī sù', en: 'I’m vegetarian (no meat, no seafood).' },
  { zh: '我對花生過敏', py: 'wǒ duì huāshēng guòmǐn', en: 'I’m allergic to peanuts.' },
  { zh: '我不吃豬肉', py: 'wǒ bù chī zhūròu', en: 'I don’t eat pork.' },
  { zh: '請問廁所在哪裡?', py: 'qǐngwèn cèsuǒ zài nǎlǐ', en: 'Where is the restroom?' },
  { zh: '請問捷運站在哪裡?', py: 'qǐngwèn jiéyùn zhàn zài nǎlǐ', en: 'Where is the MRT station?' },
  { zh: '請載我到這個地址', py: 'qǐng zài wǒ dào zhège dìzhǐ', en: 'Please take me to this address.' },
  { zh: '我不會說中文,謝謝你', py: 'wǒ bú huì shuō zhōngwén, xièxie nǐ', en: 'I don’t speak Chinese, thank you.' },
  { zh: '請幫我叫救護車', py: 'qǐng bāng wǒ jiào jiùhùchē', en: 'Please call an ambulance for me.' },
];

// Standard hand-shaken tea shop options
export const TEA = {
  drinks: [
    { zh: '珍珠奶茶', en: 'Bubble milk tea' }, { zh: '紅茶拿鐵', en: 'Black tea latte' },
    { zh: '四季春青茶', en: 'Four Seasons oolong' }, { zh: '冬瓜檸檬', en: 'Winter melon lemon' },
  ],
  sugar: [
    { zh: '全糖', en: 'Full sugar (100%)' }, { zh: '少糖', en: 'Less sugar (~70%)' }, { zh: '半糖', en: 'Half sugar (50%)' },
    { zh: '微糖', en: 'Light sugar (~30%)' }, { zh: '無糖', en: 'No sugar' },
  ],
  ice: [
    { zh: '正常冰', en: 'Regular ice' }, { zh: '少冰', en: 'Less ice' }, { zh: '微冰', en: 'Light ice' },
    { zh: '去冰', en: 'No ice' }, { zh: '溫的', en: 'Warm' }, { zh: '熱的', en: 'Hot' },
  ],
  size: [{ zh: '大杯', en: 'Large' }, { zh: '中杯', en: 'Medium' }],
};

export const TIPS = [
  { icon: '💳', en: 'Get an EasyCard (悠遊卡) or iPASS at any MRT station or convenience store. It works on the MRT, buses, YouBike bikes and in convenience stores.', zh: '在捷運站或便利商店買悠遊卡或一卡通,捷運、公車、YouBike、便利商店都能用。' },
  { icon: '💵', en: 'Carry cash. Night-market stalls and small eateries are often cash only. ATMs at 7-Eleven and FamilyMart usually accept foreign cards.', zh: '身上要帶現金:夜市攤販和小吃店常常只收現金。7-11、全家的 ATM 大多可用國外提款卡。' },
  { icon: '🚇', en: 'No eating or drinking (even water or gum) inside MRT stations and trains. You can be fined NT$1,500–7,500.', zh: '捷運站內和車廂禁止飲食(包括喝水、口香糖),違者可罰 NT$1,500–7,500。' },
  { icon: '🗑️', en: 'There are very few public bins. Keep your trash and throw it away at a convenience store or your hotel.', zh: '路上幾乎沒有垃圾桶,垃圾請先帶著,到便利商店或旅館再丟。' },
  { icon: '🙅', en: 'No tipping. Some sit-down restaurants add a 10% service charge to the bill.', zh: '不用給小費;部分餐廳會在帳單加收一成服務費。' },
  { icon: '🚰', en: 'Don’t drink tap water unboiled. Use the water dispensers in stations, museums and hotels.', zh: '自來水要煮沸才能喝,車站、博物館、旅館多有飲水機。' },
  { icon: '🛵', en: 'Scooters are everywhere and cars may turn across crosswalks. Look both ways, even on a green light.', zh: '機車很多,車輛也會轉彎穿過斑馬線,即使綠燈也要左右看。' },
  { icon: '💺', en: 'Leave the dark-blue priority seats (博愛座) on the MRT for elderly, pregnant or disabled passengers.', zh: '捷運上的深藍色博愛座請讓給長者、孕婦、行動不便者。' },
  { icon: '🚕', en: 'Taxis are yellow and metered. Show the driver the Chinese name or address; Uber also works in big cities.', zh: '計程車是黃色、跳表計費,給司機看中文名稱或地址;大城市也能叫 Uber。' },
  { icon: '🧾', en: 'Tourist tax refund: at shops with the TRS sign, same-day purchases over NT$2,000 can qualify. Bring your passport.', zh: '外籍旅客退稅:有 TRS 標誌的商店,同日消費滿 NT$2,000 可申請,記得帶護照。' },
  { icon: '🌀', en: 'Typhoons (summer–autumn) can cancel trains, ferries and flights. Watch the news and your phone alerts.', zh: '夏秋颱風可能讓火車、船班、飛機停駛,留意新聞與手機警報。' },
];

export const SOS = [
  { num: '110', en: 'Police', zh: '報警' },
  { num: '119', en: 'Fire & ambulance', zh: '消防、救護車' },
  { num: '0800-011-765', en: 'Tourist hotline (24 h, English, Japanese & more)', zh: '觀光諮詢熱線(24 小時,多語)' },
];
