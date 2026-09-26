// 台灣旅遊資料庫(原型版本)
// 交通時間與票價為「參考值」,實際請以各營運單位公告為準。

export const INTERESTS = [
  { key: '自然', label: '自然風景', icon: '🏞️' },
  { key: '文化', label: '文化歷史', icon: '🏯' },
  { key: '老街', label: '老街漫遊', icon: '🏮' },
  { key: '美食', label: '夜市美食', icon: '🍜' },
  { key: '溫泉', label: '泡溫泉', icon: '♨️' },
  { key: '親子', label: '親子同樂', icon: '👨‍👩‍👧' },
  { key: '購物', label: '逛街購物', icon: '🛍️' },
  { key: '拍照', label: '拍照打卡', icon: '📸' },
  { key: '海邊', label: '海邊島嶼', icon: '🏖️' },
  { key: '登山', label: '登山步道', icon: '🥾' },
  { key: '夜景', label: '夜景', icon: '🌃' },
  { key: '室內', label: '雨天室內', icon: '☔' },
];

export const REGIONS = ['北部', '中部', '南部', '東部', '離島'];

export const DESTINATIONS = [
  {
    id: 'taipei', name: '台北', region: '北部', aliases: ['臺北', '台北市', '北投', '陽明山'],
    lat: 25.0478, lng: 121.5170,
    intro: '首都台北融合現代都會與傳統廟宇,捷運四通八達,小吃與夜市密度全台最高。',
    localTransport: '捷運+公車最方便,悠遊卡/一卡通可搭乘捷運、公車並租借 YouBike 微笑單車。',
    attractions: [
      { id: 'tp101', name: '台北101', tags: ['購物', '夜景', '拍照', '室內'], hours: 2, lat: 25.0339, lng: 121.5645, popular: true, desc: '台北地標,89 樓觀景台可俯瞰整個台北盆地。', tip: '傍晚上樓可同時看夕陽與夜景。' },
      { id: 'npm', name: '國立故宮博物院', tags: ['文化', '室內', '親子'], hours: 3, lat: 25.1024, lng: 121.5485, popular: true, desc: '收藏翠玉白菜、肉形石等數十萬件中華文物。', tip: '建議上午前往避開團客,可租語音導覽。' },
      { id: 'cks', name: '中正紀念堂', tags: ['文化', '拍照'], hours: 1, lat: 25.0346, lng: 121.5218, desc: '白牆藍瓦的紀念建築與廣場,整點有儀隊交接。' },
      { id: 'xiangshan', name: '象山步道', tags: ['登山', '夜景', '自然', '拍照'], hours: 1.5, lat: 25.0273, lng: 121.5767, desc: '約 20–30 分鐘登頂,是拍攝台北101的經典角度。', tip: '日落前 40 分鐘出發最剛好。' },
      { id: 'ximen', name: '西門町', tags: ['購物', '美食'], hours: 2, lat: 25.0422, lng: 121.5079, desc: '年輕人的潮流聚集地,電影院、潮牌與小吃林立。' },
      { id: 'dadaocheng', name: '大稻埕・迪化街', tags: ['老街', '文化', '美食', '拍照'], hours: 2, lat: 25.0567, lng: 121.5100, desc: '百年街屋、南北貨與霞海城隍廟,傍晚可到碼頭看夕陽。' },
      { id: 'beitou', name: '北投溫泉', tags: ['溫泉', '自然', '文化'], hours: 3, lat: 25.1367, lng: 121.5066, desc: '搭捷運就能到的溫泉鄉,地熱谷與溫泉博物館免費參觀。' },
      { id: 'yangming', name: '陽明山國家公園', tags: ['自然', '登山'], hours: 4, lat: 25.1622, lng: 121.5447, desc: '火山地形、芒草與花季,春天海芋、秋天芒草最美。', tip: '山上天氣多變,記得帶外套與雨具。' },
      { id: 'huashan', name: '華山1914文創園區', tags: ['文化', '室內', '拍照', '購物'], hours: 1.5, lat: 25.0441, lng: 121.5294, desc: '老酒廠改建的文創園區,常有展覽與市集。' },
    ],
    foods: [
      { name: '牛肉麵', type: '小吃', desc: '紅燒或清燉,台北名店眾多,是必吃代表。' },
      { name: '小籠包', type: '小吃', desc: '薄皮多汁,信義區與永康街都有知名老店。' },
      { name: '滷肉飯', type: '小吃', desc: '肥瘦適中的滷肉淋在白飯上,平價又道地。' },
      { name: '士林夜市', type: '夜市', desc: '台北最大夜市,大雞排、生煎包、各式遊戲攤。' },
      { name: '饒河街觀光夜市', type: '夜市', desc: '入口的福州胡椒餅常大排長龍。' },
      { name: '寧夏夜市', type: '夜市', desc: '以傳統台灣小吃為主,蚵仔煎、滷肉飯、芋丸。' },
      { name: '珍珠奶茶', type: '飲品', desc: '台灣國民飲料,可調整甜度冰塊。' },
    ],
  },
  {
    id: 'jiufen', name: '九份', region: '北部', aliases: ['九份老街', '金瓜石', '瑞芳'],
    lat: 25.1097, lng: 121.8445,
    intro: '依山而建的山城,紅燈籠、石階與海景交織出懷舊氛圍。',
    localTransport: '老街步行為主,前往金瓜石可搭 788、1062 等公車。',
    attractions: [
      { id: 'jiufen-st', name: '九份老街', tags: ['老街', '美食', '拍照', '夜景'], hours: 2.5, lat: 25.1097, lng: 121.8445, popular: true, desc: '豎崎路的紅燈籠與茶樓是招牌景色。', tip: '傍晚點燈最美,但假日人潮多,建議平日前往。' },
      { id: 'gold-museum', name: '黃金博物館(金瓜石)', tags: ['文化', '親子', '自然'], hours: 2, lat: 25.1070, lng: 121.8580, desc: '可觸摸 220 公斤大金磚,並參觀日式宿舍群。' },
      { id: 'teapot', name: '無耳茶壺山步道', tags: ['登山', '自然'], hours: 2, lat: 25.1050, lng: 121.8650, desc: '可遠眺陰陽海與十三層遺址。' },
    ],
    foods: [
      { name: '芋圓', type: '甜點', desc: 'Q 彈芋圓配上刨冰或熱湯,九份必吃。' },
      { name: '草仔粿', type: '小吃', desc: '艾草外皮包菜脯或紅豆餡。' },
      { name: '魚丸湯', type: '小吃', desc: '老街上常見的在地小吃。' },
    ],
  },
  {
    id: 'tamsui', name: '淡水', region: '北部', aliases: ['淡水老街', '漁人碼頭'],
    lat: 25.1693, lng: 121.4410,
    intro: '河口小鎮,老街、古蹟與全台知名的夕陽景色。',
    localTransport: '捷運淡水站下車步行,前往漁人碼頭可搭公車或渡輪。',
    attractions: [
      { id: 'tamsui-st', name: '淡水老街', tags: ['老街', '美食'], hours: 1.5, lat: 25.1693, lng: 121.4410, popular: true, desc: '河岸步道搭配老街小吃。' },
      { id: 'fort', name: '紅毛城', tags: ['文化', '拍照'], hours: 1, lat: 25.1753, lng: 121.4331, desc: '17 世紀西班牙人興建,後為英國領事館。' },
      { id: 'fisherman', name: '漁人碼頭・情人橋', tags: ['海邊', '夜景', '拍照'], hours: 1.5, lat: 25.1834, lng: 121.4105, desc: '看夕陽的最佳地點。' },
    ],
    foods: [
      { name: '阿給', type: '小吃', desc: '油豆腐塞冬粉、封魚漿,淋上甜辣醬。' },
      { name: '鐵蛋', type: '小吃', desc: '反覆滷製風乾,口感Q韌。' },
      { name: '魚酥', type: '伴手禮', desc: '酥脆的魚漿零食。' },
    ],
  },
  {
    id: 'pingxi', name: '平溪', region: '北部', aliases: ['十分', '菁桐', '平溪線'],
    lat: 25.0412, lng: 121.7753,
    intro: '鐵道小鎮,在鐵軌上放天燈是台灣代表體驗。',
    localTransport: '搭台鐵平溪線串聯十分、平溪、菁桐,可購買一日週遊券。',
    attractions: [
      { id: 'shifen', name: '十分老街放天燈', tags: ['老街', '拍照', '親子'], hours: 1.5, lat: 25.0412, lng: 121.7753, popular: true, desc: '寫下願望放天燈,火車就從身旁駛過。' },
      { id: 'shifen-falls', name: '十分瀑布', tags: ['自然', '拍照'], hours: 1, lat: 25.0485, lng: 121.7875, desc: '有「台灣尼加拉瀑布」之稱。' },
      { id: 'jingtong', name: '菁桐車站', tags: ['老街', '文化'], hours: 1, lat: 25.0240, lng: 121.7236, desc: '日式木造車站與掛滿許願竹筒的老街。' },
    ],
    foods: [
      { name: '雞翅包飯', type: '小吃', desc: '去骨雞翅包入炒飯烤製。' },
      { name: '花生冰淇淋捲', type: '甜點', desc: '花生粉、冰淇淋與香菜包在潤餅皮裡。' },
    ],
  },
  {
    id: 'keelung', name: '基隆', region: '北部', aliases: ['基隆市', '廟口'],
    lat: 25.1283, lng: 121.7434,
    intro: '雨港基隆,以廟口夜市和海港風情聞名。',
    localTransport: '市區公車為主,和平島、正濱漁港車程約 15–20 分鐘。',
    attractions: [
      { id: 'miaokou', evening: true, name: '基隆廟口夜市', tags: ['美食', '夜景'], hours: 1.5, lat: 25.1283, lng: 121.7434, popular: true, desc: '以奠濟宮為中心的百年夜市,黃色燈籠一字排開。' },
      { id: 'heping', name: '和平島地質公園', tags: ['自然', '海邊', '親子'], hours: 2, lat: 25.1602, lng: 121.7629, desc: '奇特的海蝕地形與海水游泳池。' },
      { id: 'zhengbin', name: '正濱漁港彩色屋', tags: ['拍照', '海邊'], hours: 1, lat: 25.1497, lng: 121.7747, desc: '繽紛的彩色建築倒映在港灣中。' },
    ],
    foods: [
      { name: '鼎邊趖', type: '小吃', desc: '米漿沿鍋邊燙熟,配上羹湯。' },
      { name: '營養三明治', type: '小吃', desc: '炸麵包夾滷蛋、火腿、番茄與美乃滋。' },
      { name: '泡泡冰', type: '甜點', desc: '手工反覆攪拌出綿密口感的冰品。' },
    ],
  },
  {
    id: 'yilan', name: '宜蘭', region: '北部', aliases: ['礁溪', '羅東', '宜蘭縣'],
    lat: 24.8270, lng: 121.7735,
    intro: '雪山隧道一穿就到,溫泉、田園與傳統藝術兼具。',
    localTransport: '礁溪、宜蘭、羅東間搭台鐵最快,景點間可搭台灣好行或租車。',
    attractions: [
      { id: 'jiaoxi', name: '礁溪溫泉', tags: ['溫泉', '自然'], hours: 2.5, lat: 24.8270, lng: 121.7735, popular: true, desc: '平地溫泉,車站旁就有免費泡腳池。' },
      { id: 'ncfta', name: '國立傳統藝術中心', tags: ['文化', '親子', '老街', '拍照'], hours: 3, lat: 24.6842, lng: 121.8230, desc: '仿古街道、傳統工藝與戲曲表演。' },
      { id: 'lanyang', name: '蘭陽博物館', tags: ['文化', '室內', '親子'], hours: 1.5, lat: 24.8687, lng: 121.8320, desc: '單面山造型建築,介紹宜蘭山海文化。' },
      { id: 'luodong', evening: true, name: '羅東夜市', tags: ['美食'], hours: 1.5, lat: 24.6772, lng: 121.7697, desc: '宜蘭最熱鬧的夜市。' },
    ],
    foods: [
      { name: '三星蔥油餅', type: '小吃', desc: '滿滿的三星蔥,外酥內香。' },
      { name: '卜肉', type: '小吃', desc: '裹粉油炸的豬肉條,宜蘭特色。' },
      { name: '牛舌餅', type: '伴手禮', desc: '薄脆的長條餅,宜蘭經典伴手禮。' },
    ],
  },
  {
    id: 'taoyuan', name: '桃園', region: '北部', aliases: ['桃園市', '大溪'],
    lat: 25.0130, lng: 121.2150,
    intro: '國門所在地,有大溪老街與大型水族館。',
    localTransport: '高鐵桃園站與機場捷運相連,前往大溪建議搭客運或計程車。',
    attractions: [
      { id: 'daxi', name: '大溪老街', tags: ['老街', '文化', '美食'], hours: 2, lat: 24.8835, lng: 121.2870, desc: '巴洛克式立面街屋,以豆干聞名。' },
      { id: 'xpark', name: 'Xpark 水族館', tags: ['親子', '室內'], hours: 2.5, lat: 24.9895, lng: 121.2156, popular: true, desc: '高鐵桃園站旁的都會型水生公園。' },
    ],
    foods: [
      { name: '大溪豆干', type: '伴手禮', desc: '滷味豆干香Q入味。' },
      { name: '客家菜', type: '餐廳', desc: '客庄特色的鹹香料理。' },
    ],
  },
  {
    id: 'airport', name: '桃園機場', region: '北部', aliases: ['機場', '桃機', '桃園國際機場'],
    lat: 25.0797, lng: 121.2342,
    intro: '台灣主要國際門戶,可搭機場捷運進入台北或轉乘高鐵。',
    localTransport: '機場捷運直達車到台北車站約 35–40 分鐘。',
    attractions: [],
    foods: [],
  },
  {
    id: 'hsinchu', name: '新竹', region: '北部', aliases: ['新竹市', '內灣', '竹北'],
    lat: 24.8045, lng: 120.9656,
    intro: '風城新竹,城隍廟小吃與客家山城內灣。',
    localTransport: '高鐵新竹站在竹北,可轉台鐵六家線進市區。',
    attractions: [
      { id: 'chenghuang', name: '新竹都城隍廟', tags: ['文化', '美食'], hours: 1.5, lat: 24.8045, lng: 120.9656, popular: true, desc: '香火鼎盛的古廟,周邊就是小吃聚集地。' },
      { id: 'neiwan', name: '內灣老街', tags: ['老街', '自然', '美食'], hours: 2.5, lat: 24.7053, lng: 121.1830, desc: '客家山城,可搭台鐵內灣線前往。' },
      { id: 'nanliao', name: '南寮漁港', tags: ['海邊', '親子'], hours: 1.5, lat: 24.8486, lng: 120.9265, desc: '海風、風箏與自行車道。' },
    ],
    foods: [
      { name: '新竹米粉', type: '小吃', desc: '風乾的細米粉,炒或煮湯都好吃。' },
      { name: '貢丸湯', type: '小吃', desc: '彈牙豬肉貢丸,新竹招牌。' },
      { name: '客家粄條', type: '小吃', desc: '內灣、北埔一帶的經典客家味。' },
    ],
  },
  {
    id: 'taichung', name: '台中', region: '中部', aliases: ['臺中', '台中市', '逢甲'],
    lat: 24.1477, lng: 120.6736,
    intro: '氣候宜人的文化城,夜市、文青景點與珍奶發源地之一。',
    localTransport: '高鐵台中站位於烏日,可轉台鐵、捷運綠線或客運進市區(約 15–30 分鐘)。',
    attractions: [
      { id: 'gaomei', name: '高美濕地', tags: ['自然', '拍照', '海邊'], hours: 2, lat: 24.3120, lng: 120.5497, popular: true, desc: '風車與夕陽倒影,台中最美的黃昏。', tip: '查好潮汐與日落時間再出發。' },
      { id: 'opera', name: '台中國家歌劇院', tags: ['文化', '室內', '拍照'], hours: 1.5, lat: 24.1627, lng: 120.6405, desc: '伊東豊雄設計的曲牆建築。' },
      { id: 'fengjia', evening: true, name: '逢甲夜市', tags: ['美食', '購物'], hours: 2, lat: 24.1747, lng: 120.6461, popular: true, desc: '全台最大觀光夜市之一,創意小吃層出不窮。' },
      { id: 'miyahara', name: '宮原眼科・審計新村', tags: ['文化', '拍照', '購物'], hours: 1.5, lat: 24.1378, lng: 120.6835, desc: '日治建築改建的甜點名店與文創聚落。' },
      { id: 'nmns', name: '國立自然科學博物館', tags: ['親子', '室內', '文化'], hours: 3, lat: 24.1570, lng: 120.6660, desc: '恐龍廳、太空劇場,親子首選。' },
      { id: 'rainbow', name: '彩虹眷村', tags: ['拍照', '文化'], hours: 1, lat: 24.1339, lng: 120.6099, desc: '色彩繽紛的彩繪眷村。' },
    ],
    foods: [
      { name: '太陽餅', type: '伴手禮', desc: '麥芽餡的酥皮餅,台中代表伴手禮。' },
      { name: '珍珠奶茶', type: '飲品', desc: '台中是珍奶發源地之一,各大手搖店林立。' },
      { name: '大麵羹', type: '小吃', desc: '加了鹼的粗麵條煮成的台中古早味。' },
      { name: '一中街商圈', type: '夜市', desc: '學生聚集的小吃街,價格實惠。' },
    ],
  },
  {
    id: 'sunmoonlake', name: '日月潭', region: '中部', aliases: ['南投', '伊達邵', '九族'],
    lat: 23.8570, lng: 120.9160,
    intro: '台灣最大的天然湖泊,山水相映、四季皆宜。',
    localTransport: '環湖可搭遊艇、環湖公車或騎自行車,另有纜車通往九族文化村。',
    attractions: [
      { id: 'sml-bike', name: '日月潭環湖自行車道', tags: ['自然', '拍照'], hours: 2.5, lat: 23.8570, lng: 120.9160, popular: true, desc: '曾被評為全球最美自行車道之一。' },
      { id: 'sml-boat', name: '日月潭遊湖船', tags: ['自然', '親子'], hours: 2, lat: 23.8660, lng: 120.9110, desc: '水社、玄光寺、伊達邵三碼頭跳島。' },
      { id: 'formosan', name: '九族文化村', tags: ['親子', '文化'], hours: 4, lat: 23.8710, lng: 120.9500, desc: '遊樂設施結合原住民文化展演。' },
      { id: 'ita-thao', name: '伊達邵商圈', tags: ['美食', '文化'], hours: 1.5, lat: 23.8520, lng: 120.9340, desc: '邵族部落,小吃與手工藝品。' },
    ],
    foods: [
      { name: '日月潭紅茶(台茶18號)', type: '飲品', desc: '帶有天然肉桂與薄荷香的紅玉紅茶。' },
      { name: '香菇茶葉蛋', type: '小吃', desc: '玄光寺旁的人氣茶葉蛋。' },
      { name: '總統魚', type: '餐廳', desc: '日月潭特有的曲腰魚料理。' },
    ],
  },
  {
    id: 'chiayi', name: '嘉義', region: '南部', aliases: ['嘉義市', '故宮南院'],
    lat: 23.4800, lng: 120.4490,
    intro: '前往阿里山的門戶,也是火雞肉飯的故鄉。',
    localTransport: '高鐵嘉義站在太保,可轉 BRT 進市區(約 30 分鐘)。',
    attractions: [
      { id: 'wenhua', evening: true, name: '文化路夜市', tags: ['美食'], hours: 1.5, lat: 23.4800, lng: 120.4490, popular: true, desc: '嘉義最熱鬧的小吃街。' },
      { id: 'hinoki', name: '檜意森活村', tags: ['文化', '拍照'], hours: 1.5, lat: 23.4855, lng: 120.4530, desc: '日式檜木宿舍群。' },
      { id: 'npm-south', name: '故宮南院', tags: ['文化', '室內', '親子'], hours: 2.5, lat: 23.4700, lng: 120.2890, desc: '以亞洲文化為主題的故宮分院。' },
    ],
    foods: [
      { name: '火雞肉飯', type: '小吃', desc: '嘉義靈魂美食,雞油香氣十足。' },
      { name: '方塊酥', type: '伴手禮', desc: '層層酥脆的經典伴手禮。' },
    ],
  },
  {
    id: 'alishan', name: '阿里山', region: '南部', aliases: ['阿里山森林', '奮起湖', '祝山'],
    lat: 23.5100, lng: 120.8030,
    intro: '日出、雲海、森林鐵路與神木,台灣最具代表性的高山景點。',
    localTransport: '園區內可搭森林鐵路支線(祝山線、神木線),也可步行。',
    attractions: [
      { id: 'alishan-forest', name: '阿里山森林遊樂區', tags: ['自然', '登山', '拍照'], hours: 4, lat: 23.5100, lng: 120.8030, popular: true, desc: '巨木群棧道、姊妹潭與櫻花季。' },
      { id: 'zhushan', name: '祝山觀日出', tags: ['自然', '拍照'], hours: 2, lat: 23.5100, lng: 120.8130, desc: '清晨搭祝山線小火車看日出雲海。', tip: '日出時間每天不同,前一晚確認火車發車時刻。' },
      { id: 'fenqihu', name: '奮起湖老街', tags: ['老街', '美食'], hours: 1.5, lat: 23.5050, lng: 120.6960, desc: '森林鐵路中途站,以鐵路便當聞名。' },
    ],
    foods: [
      { name: '奮起湖便當', type: '小吃', desc: '鐵盒裝的古早味鐵路便當。' },
      { name: '阿里山高山茶', type: '飲品', desc: '高海拔烏龍茶,香氣清雅。' },
    ],
  },
  {
    id: 'tainan', name: '台南', region: '南部', aliases: ['臺南', '台南市', '安平'],
    lat: 22.9975, lng: 120.2025,
    intro: '台灣最古老的城市,古蹟密度最高,也是公認的小吃之都。',
    localTransport: '高鐵台南站可轉沙崙線到台南火車站;市區景點建議租機車、YouBike 或叫車。',
    attractions: [
      { id: 'chihkan', name: '赤崁樓', tags: ['文化', '拍照'], hours: 1, lat: 22.9975, lng: 120.2025, popular: true, desc: '荷蘭時期建造的普羅民遮城遺址。' },
      { id: 'anping', name: '安平古堡・安平老街', tags: ['文化', '老街', '美食'], hours: 2.5, lat: 23.0015, lng: 120.1605, popular: true, desc: '台灣最早的城堡與周邊小吃老街。' },
      { id: 'shennong', evening: true, name: '神農街', tags: ['老街', '拍照', '夜景'], hours: 1, lat: 22.9975, lng: 120.1965, desc: '夜晚點燈的老屋街道,文青小店林立。' },
      { id: 'chimei', name: '奇美博物館', tags: ['文化', '室內', '親子', '拍照'], hours: 3, lat: 22.9346, lng: 120.2260, desc: '西洋藝術、樂器與兵器收藏豐富,建築宛如宮殿。' },
      { id: 'sicao', name: '四草綠色隧道', tags: ['自然', '拍照'], hours: 1.5, lat: 23.0200, lng: 120.1370, desc: '搭竹筏穿越紅樹林隧道。' },
      { id: 'garden-nm', evening: true, name: '花園夜市', tags: ['美食'], hours: 1.5, lat: 23.0110, lng: 120.2000, desc: '台南最大夜市。', tip: '只在週四、六、日營業。' },
    ],
    foods: [
      { name: '牛肉湯', type: '小吃', desc: '溫體牛肉以熱湯沖熟,台南人的早餐。' },
      { name: '擔仔麵', type: '小吃', desc: '小碗肉燥麵加鮮蝦,百年老味道。' },
      { name: '碗粿', type: '小吃', desc: '米漿蒸製,淋上醬汁。' },
      { name: '鱔魚意麵', type: '小吃', desc: '大火快炒,帶點甜酸。' },
      { name: '蝦捲', type: '小吃', desc: '安平名物,外酥內鮮。' },
    ],
  },
  {
    id: 'kaohsiung', name: '高雄', region: '南部', aliases: ['高雄市', '左營', '旗津', '駁二'],
    lat: 22.6273, lng: 120.3014,
    intro: '陽光港都,藝術特區、海港與廟宇景觀兼具。',
    localTransport: '高鐵左營站連接高雄捷運,輕軌環繞亞洲新灣區,旗津可搭渡輪。',
    attractions: [
      { id: 'pier2', name: '駁二藝術特區', tags: ['文化', '拍照', '購物'], hours: 2, lat: 22.6200, lng: 120.2820, popular: true, desc: '港邊倉庫改建的藝術園區。' },
      { id: 'cijin', name: '旗津', tags: ['海邊', '美食', '親子'], hours: 3, lat: 22.6120, lng: 120.2680, desc: '搭渡輪上島,騎車吃海鮮看夕陽。' },
      { id: 'lotus', name: '蓮池潭龍虎塔', tags: ['文化', '拍照'], hours: 1, lat: 22.6810, lng: 120.2940, desc: '從龍口入、虎口出,象徵趨吉避凶。' },
      { id: 'fgs', name: '佛陀紀念館', tags: ['文化', '拍照'], hours: 2.5, lat: 22.7560, lng: 120.4430, desc: '宏偉的佛教文化園區。' },
      { id: 'ruifeng', evening: true, name: '瑞豐夜市', tags: ['美食'], hours: 1.5, lat: 22.6660, lng: 120.3000, desc: '在地人最愛的夜市。' },
      { id: 'formosa', name: '美麗島站光之穹頂', tags: ['室內', '拍照'], hours: 0.5, lat: 22.6310, lng: 120.3020, desc: '世界最美捷運站之一。' },
    ],
    foods: [
      { name: '海鮮', type: '餐廳', desc: '旗津海產店現撈現煮。' },
      { name: '木瓜牛奶', type: '飲品', desc: '高雄經典飲品。' },
      { name: '六合夜市', type: '夜市', desc: '觀光客最熟悉的高雄夜市。' },
    ],
  },
  {
    id: 'kenting', name: '墾丁', region: '南部', aliases: ['恆春', '屏東', '墾丁大街'],
    lat: 21.9460, lng: 120.7960,
    intro: '台灣最南端的熱帶海洋國家公園,四季如夏。',
    localTransport: '區內可搭墾丁街車,但班次少,多數旅客租機車或電動車。',
    attractions: [
      { id: 'kt-street', evening: true, name: '墾丁大街', tags: ['美食', '購物', '夜景'], hours: 1.5, lat: 21.9460, lng: 120.7960, popular: true, desc: '入夜後變身熱鬧的夜市街。' },
      { id: 'eluanbi', name: '鵝鑾鼻燈塔', tags: ['海邊', '拍照', '文化'], hours: 1.5, lat: 21.9020, lng: 120.8530, desc: '台灣八景之一的白色燈塔。' },
      { id: 'nmmba', name: '國立海洋生物博物館', tags: ['親子', '室內'], hours: 3, lat: 22.0460, lng: 120.6980, desc: '海底隧道與白鯨,親子必訪。' },
      { id: 'longpan', name: '龍磐公園', tags: ['自然', '拍照', '海邊'], hours: 1, lat: 21.9230, lng: 120.8580, desc: '珊瑚礁台地與太平洋海景,夜晚可觀星。' },
      { id: 'baisha', name: '白沙灣', tags: ['海邊', '親子'], hours: 2, lat: 21.9380, lng: 120.7120, desc: '細白沙灘,適合玩水。' },
    ],
    foods: [
      { name: '綠豆蒜', type: '甜點', desc: '恆春特色甜湯,去殼綠豆熬煮。' },
      { name: '洋蔥料理', type: '小吃', desc: '恆春半島盛產洋蔥,春季最甜。' },
      { name: '海鮮', type: '餐廳', desc: '後壁湖漁港生魚片最新鮮。' },
    ],
  },
  {
    id: 'hualien', name: '花蓮', region: '東部', aliases: ['花蓮市', '七星潭'],
    lat: 23.9920, lng: 121.6010,
    intro: '背山面海的後山,太平洋與中央山脈就在眼前。',
    localTransport: '市區不大可騎 YouBike;前往郊區景點建議包車、租車或搭台灣好行。',
    attractions: [
      { id: 'qixingtan', name: '七星潭', tags: ['海邊', '自然', '拍照'], hours: 1.5, lat: 24.0290, lng: 121.6290, popular: true, desc: '月牙形礫石海灣,看日出的好地點。' },
      { id: 'dongdamen', evening: true, name: '東大門夜市', tags: ['美食'], hours: 1.5, lat: 23.9750, lng: 121.6100, desc: '有原住民一條街的大型夜市。' },
      { id: 'qingshui', name: '清水斷崖', tags: ['自然', '拍照'], hours: 1, lat: 24.2140, lng: 121.6600, desc: '千米斷崖直落太平洋。', tip: '出發前請確認蘇花公路與觀景台開放狀況。' },
    ],
    foods: [
      { name: '扁食', type: '小吃', desc: '皮薄餡多的花蓮餛飩。' },
      { name: '炸彈蔥油餅', type: '小吃', desc: '包入半熟蛋的酥炸蔥油餅。' },
      { name: '花蓮麻糬', type: '伴手禮', desc: '軟Q多口味,經典伴手禮。' },
    ],
  },
  {
    id: 'taroko', name: '太魯閣', region: '東部', aliases: ['太魯閣國家公園', '天祥', '燕子口'],
    lat: 24.1590, lng: 121.6220,
    intro: '大理石峽谷景觀舉世聞名。',
    localTransport: '可搭台灣好行太魯閣線或包車。',
    attractions: [
      { id: 'taroko-np', name: '太魯閣國家公園(開放路段)', tags: ['自然', '登山', '拍照'], hours: 4, lat: 24.1590, lng: 121.6220, popular: true, desc: '峽谷、隧道與溪流交織的壯麗地景。', tip: '震後部分步道與路段仍在修復,出發前務必查詢國家公園管理處公告。' },
    ],
    foods: [],
  },
  {
    id: 'taitung', name: '台東', region: '東部', aliases: ['臺東', '池上', '鹿野', '知本'],
    lat: 22.7540, lng: 121.1510,
    intro: '慢活的後山淨土,稻田、熱氣球與溫泉。',
    localTransport: '景點分散,建議租車或參加一日遊;池上可租自行車。',
    attractions: [
      { id: 'mrbrown', name: '池上伯朗大道', tags: ['自然', '拍照'], hours: 2, lat: 23.0980, lng: 121.2210, popular: true, desc: '一望無際的稻田,騎單車最愜意。' },
      { id: 'luye', name: '鹿野高台', tags: ['自然', '親子', '拍照'], hours: 1.5, lat: 22.9180, lng: 121.1360, desc: '夏季熱氣球嘉年華的舉辦地。' },
      { id: 'sanxiantai', name: '三仙台', tags: ['海邊', '自然', '拍照'], hours: 1.5, lat: 23.1240, lng: 121.4130, desc: '八拱跨海步橋,看日出勝地。' },
      { id: 'tiehua', evening: true, name: '鐵花村音樂聚落', tags: ['文化', '夜景'], hours: 1.5, lat: 22.7540, lng: 121.1510, desc: '夜晚熱氣球燈與現場音樂。' },
      { id: 'zhiben', name: '知本溫泉', tags: ['溫泉'], hours: 2.5, lat: 22.6960, lng: 121.0080, desc: '東部著名的碳酸氫鈉泉。' },
    ],
    foods: [
      { name: '池上便當', type: '小吃', desc: '池上米的香Q一吃就懂。' },
      { name: '釋迦', type: '水果', desc: '台東名產,秋冬盛產。' },
      { name: '原住民風味餐', type: '餐廳', desc: '野菜、竹筒飯與山豬肉。' },
    ],
  },
  {
    id: 'penghu', name: '澎湖', region: '離島', noTransit: true, aliases: ['馬公', '七美', '吉貝'],
    lat: 23.5655, lng: 119.5793,
    intro: '玄武岩與碧海藍天的群島,夏季花火節聞名。',
    localTransport: '主要島嶼可租機車或參加一日遊,跳島需搭船。',
    attractions: [
      { id: 'twinheart', name: '七美雙心石滬', tags: ['海邊', '拍照', '文化'], hours: 3, lat: 23.2050, lng: 119.4340, popular: true, desc: '最浪漫的石滬,需搭船前往七美。' },
      { id: 'bridge', name: '澎湖跨海大橋', tags: ['海邊', '拍照'], hours: 1, lat: 23.6260, lng: 119.5540, desc: '連接白沙與西嶼的跨海大橋。' },
      { id: 'jibei', name: '吉貝沙尾', tags: ['海邊', '親子'], hours: 3, lat: 23.7400, lng: 119.6030, desc: '白色沙嘴與水上活動。' },
    ],
    foods: [
      { name: '仙人掌冰', type: '甜點', desc: '桃紅色的酸甜冰品。' },
      { name: '黑糖糕', type: '伴手禮', desc: '鬆軟Q彈的澎湖名產。' },
      { name: '海鮮', type: '餐廳', desc: '小管、海膽、澎湖絲瓜。' },
    ],
  },
];

// 交通路網(雙向)。min = 分鐘,fare = 新台幣(參考值)。
// line 相同的連續路段會合併為同一段(例如搭同一班高鐵經過多站)。
// 地點標記 noTransit 時(如離島),只能當起點或終點,不會被當成轉乘點。
export const EDGES = [
  // 高鐵
  { a: 'taipei', b: 'taoyuan', mode: 'hsr', line: 'HSR', name: '台灣高鐵', min: 20, fare: 160 },
  { a: 'taoyuan', b: 'hsinchu', mode: 'hsr', line: 'HSR', name: '台灣高鐵', min: 12, fare: 130 },
  { a: 'hsinchu', b: 'taichung', mode: 'hsr', line: 'HSR', name: '台灣高鐵', min: 22, fare: 410 },
  { a: 'taichung', b: 'chiayi', mode: 'hsr', line: 'HSR', name: '台灣高鐵', min: 28, fare: 380 },
  { a: 'chiayi', b: 'tainan', mode: 'hsr', line: 'HSR', name: '台灣高鐵', min: 15, fare: 270 },
  { a: 'tainan', b: 'kaohsiung', mode: 'hsr', line: 'HSR', name: '台灣高鐵', min: 13, fare: 140 },
  // 台鐵
  { a: 'taipei', b: 'keelung', mode: 'tra', line: 'TRA-N', name: '台鐵區間車', min: 45, fare: 41 },
  { a: 'taipei', b: 'hsinchu', mode: 'tra', line: 'TRA-W', name: '台鐵自強號', min: 70, fare: 177 },
  { a: 'hsinchu', b: 'taichung', mode: 'tra', line: 'TRA-W', name: '台鐵自強號', min: 80, fare: 198 },
  { a: 'taichung', b: 'chiayi', mode: 'tra', line: 'TRA-W', name: '台鐵自強號', min: 80, fare: 222 },
  { a: 'chiayi', b: 'tainan', mode: 'tra', line: 'TRA-W', name: '台鐵自強號', min: 55, fare: 145 },
  { a: 'tainan', b: 'kaohsiung', mode: 'tra', line: 'TRA-W', name: '台鐵自強號', min: 35, fare: 106 },
  { a: 'taipei', b: 'pingxi', mode: 'tra', line: 'TRA-PX', name: '台鐵(瑞芳轉平溪線)', min: 90, fare: 80, tip: '瑞芳站轉乘平溪線,可買平溪線一日週遊券。' },
  { a: 'taipei', b: 'yilan', mode: 'tra', line: 'TRA-E', name: '台鐵自強號', min: 75, fare: 199 },
  { a: 'yilan', b: 'hualien', mode: 'tra', line: 'TRA-E', name: '台鐵自強號', min: 85, fare: 239 },
  { a: 'taipei', b: 'hualien', mode: 'tra', line: 'TRA-E', name: '台鐵普悠瑪/太魯閣號', min: 130, fare: 440, tip: '東部幹線熱門,假日車票常需提前 28 天搶訂。' },
  { a: 'hualien', b: 'taitung', mode: 'tra', line: 'TRA-E', name: '台鐵自強號', min: 120, fare: 343 },
  { a: 'kaohsiung', b: 'taitung', mode: 'tra', line: 'TRA-S', name: '台鐵南迴線', min: 150, fare: 362 },
  // 捷運
  { a: 'taipei', b: 'airport', mode: 'mrt', line: 'AIRPORT-MRT', name: '桃園機場捷運(直達車)', min: 38, fare: 150 },
  { a: 'airport', b: 'taoyuan', mode: 'mrt', line: 'AIRPORT-MRT', name: '桃園機場捷運', min: 20, fare: 35, tip: 'A18 高鐵桃園站可直接轉乘高鐵。' },
  { a: 'taipei', b: 'tamsui', mode: 'mrt', line: 'MRT-R', name: '台北捷運淡水信義線', min: 40, fare: 50 },
  // 客運
  { a: 'taipei', b: 'jiufen', mode: 'bus', line: 'BUS-1062', name: '基隆客運 1062', min: 80, fare: 90, tip: '忠孝復興站 2 號出口附近搭車,假日排隊人潮多。' },
  { a: 'keelung', b: 'jiufen', mode: 'bus', line: 'BUS-788', name: '基隆客運 788', min: 45, fare: 30 },
  { a: 'taipei', b: 'yilan', mode: 'bus', line: 'BUS-KAMALAN', name: '葛瑪蘭客運(國道5號)', min: 60, fare: 120, tip: '假日雪隧易塞車,時間可能加倍。' },
  { a: 'taipei', b: 'taichung', mode: 'bus', line: 'BUS-TC', name: '國道客運', min: 150, fare: 260 },
  { a: 'taichung', b: 'sunmoonlake', mode: 'bus', line: 'BUS-6670', name: '南投客運 6670(高鐵台中站發車)', min: 90, fare: 190 },
  { a: 'chiayi', b: 'alishan', mode: 'bus', line: 'BUS-7322', name: '台灣好行 7322 阿里山線', min: 150, fare: 240, tip: '也可搭阿里山林業鐵路,車票熱門需提早預訂。' },
  { a: 'kaohsiung', b: 'kenting', mode: 'bus', line: 'BUS-KT', name: '墾丁快線(高鐵左營站發車)', min: 140, fare: 400 },
  { a: 'hualien', b: 'taroko', mode: 'bus', line: 'BUS-TRK', name: '台灣好行 太魯閣線', min: 50, fare: 90, tip: '部分路段可能因修復而管制,請先查詢公告。' },
  // 飛機 / 船
  { a: 'taipei', b: 'penghu', mode: 'flight', line: 'FLY-TSA', name: '國內線班機(松山—馬公)', min: 110, fare: 2100, tip: '時間含報到與機場接駁約 1 小時,飛行約 50 分鐘。' },
  { a: 'kaohsiung', b: 'penghu', mode: 'flight', line: 'FLY-KHH', name: '國內線班機(小港—馬公)', min: 100, fare: 1800, tip: '時間含報到與機場接駁約 1 小時,飛行約 40 分鐘。' },
  { a: 'chiayi', b: 'penghu', mode: 'ferry', line: 'FERRY-BD', name: '布袋港—馬公 客輪', min: 150, fare: 1000, tip: '含前往布袋港時間,航程約 90 分鐘;夏季航班較多,冬季東北季風常停航。' },
];

export const MODE_INFO = {
  hsr: { label: '高鐵', icon: '🚄', url: 'https://www.thsrc.com.tw/' },
  tra: { label: '台鐵', icon: '🚆', url: 'https://www.railway.gov.tw/' },
  mrt: { label: '捷運', icon: '🚇' },
  bus: { label: '客運', icon: '🚌', url: 'https://www.taiwantrip.com.tw/' },
  flight: { label: '飛機', icon: '✈️' },
  ferry: { label: '船', icon: '⛴️' },
};

export function getDestination(id) {
  return DESTINATIONS.find((d) => d.id === id);
}

// 在地知名店家(依長年口碑與媒體報導整理)。
// 不寫死評分:評分會變動,畫面上一律附 Google 地圖連結,讓旅客看即時星等與評論。
// 營業時間、是否搬遷請以 Google 地圖或店家公告為準。
export const SHOPS = {
  taipei: [
    { name: '阜杭豆漿', dish: '早餐', area: '華山市場 2 樓・善導寺站', note: '厚燒餅夾蛋、鹹豆漿,早上常排隊 30 分鐘以上。' },
    { name: '林東芳牛肉麵', dish: '牛肉麵', area: '八德路', note: '半筋半肉加牛油辣椒是招牌吃法。' },
    { name: '永康牛肉麵', dish: '牛肉麵', area: '永康街・東門站', note: '川味紅燒老店。' },
    { name: '鼎泰豐 信義店', dish: '小籠包', area: '信義路・東門站', note: '十八摺小籠包創始店,可線上取號。' },
    { name: '金峰滷肉飯', dish: '滷肉飯', area: '南昌路・中正紀念堂站', note: '平價排隊名店,翻桌快。' },
    { name: '福州世祖胡椒餅', dish: '饒河街觀光夜市', area: '饒河夜市入口・松山站', note: '炭烤胡椒餅,現烤出爐要等。' },
  ],
  jiufen: [
    { name: '阿柑姨芋圓', dish: '芋圓', area: '九份豎崎路旁', note: '座位可看山海景。' },
    { name: '賴阿婆芋圓', dish: '芋圓', area: '九份基山街', note: '手工芋圓老店。' },
  ],
  tamsui: [
    { name: '淡水文化阿給', dish: '阿給', area: '真理街', note: '淡水阿給老店之一。' },
    { name: '三協成', dish: '伴手禮', area: '淡水中正路', note: '百年糕餅老店。' },
  ],
  keelung: [
    { name: '李鵠餅店', dish: '伴手禮', area: '仁三路・廟口附近', note: '百年餅店,鳳梨酥、綠豆椪。' },
  ],
  taoyuan: [
    { name: '黃日香豆干', dish: '大溪豆干', area: '大溪和平老街', note: '大溪豆干代表品牌。' },
  ],
  taichung: [
    { name: '春水堂 四維創始店', dish: '珍珠奶茶', area: '四維街', note: '珍珠奶茶發源店之一。' },
    { name: '宮原眼科', dish: '甜點', area: '中山路・台中車站旁', note: '冰淇淋與糕點禮盒,建築本身就是景點。' },
    { name: '陳允寶泉', dish: '太陽餅', area: '台中市區多家門市', note: '百年太陽餅老店。' },
  ],
  sunmoonlake: [
    { name: '玄光寺阿婆茶葉蛋', dish: '香菇茶葉蛋', area: '玄光寺碼頭', note: '搭船遊湖時順路買。' },
  ],
  chiayi: [
    { name: '噴水火雞肉飯', dish: '火雞肉飯', area: '中正路・噴水圓環', note: '最知名的火雞肉飯老店。' },
    { name: '劉里長雞肉飯', dish: '火雞肉飯', area: '公明路', note: '在地人常吃的排隊店。' },
  ],
  tainan: [
    { name: '阿堂鹹粥', dish: '早餐', area: '西門路', note: '虱目魚鹹粥,清晨開賣、中午前收。' },
    { name: '六千牛肉湯', dish: '牛肉湯', area: '海安路', note: '清晨開賣,賣完就收。' },
    { name: '阿村第二代牛肉湯', dish: '牛肉湯', area: '保安路', note: '牛肉湯名店,營業到中午前後。' },
    { name: '富盛號碗粿', dish: '碗粿', area: '西門路・赤崁樓附近', note: '碗粿老字號。' },
    { name: '度小月擔仔麵 原始店', dish: '擔仔麵', area: '中正路', note: '擔仔麵起源老店。' },
    { name: '周氏蝦捲', dish: '蝦捲', area: '安平路', note: '安平代表小吃。' },
  ],
  kaohsiung: [
    { name: '興隆居', dish: '早餐', area: '六合二路', note: '湯包、燒餅早餐老店。' },
    { name: '港園牛肉麵', dish: '牛肉麵', area: '大成街・鹽埕', note: '拌牛肉麵是招牌。' },
    { name: '高雄婆婆冰', dish: '甜點', area: '七賢三路・鹽埕', note: '水果冰老店。' },
  ],
  kenting: [
    { name: '阿伯綠豆饌', dish: '綠豆蒜', area: '恆春鎮', note: '恆春綠豆饌老店。' },
  ],
  hualien: [
    { name: '戴記扁食', dish: '扁食', area: '中華路', note: '花蓮扁食代表店之一。' },
    { name: '液香扁食', dish: '扁食', area: '信義街', note: '湯頭清甜的扁食老店。' },
    { name: '曾記麻糬', dish: '花蓮麻糬', area: '花蓮市區多家門市', note: '麻糬伴手禮代表品牌。' },
  ],
  taitung: [
    { name: '悟饕池上飯包文化故事館', dish: '池上便當', area: '池上鄉', note: '結合便當與米食文化展示。' },
    { name: '全美行', dish: '池上便當', area: '池上鄉', note: '池上老字號飯包店。' },
  ],
};

export function shopsOf(destId, dish) {
  const list = SHOPS[destId] ?? [];
  return dish ? list.filter((x) => x.dish === dish) : list;
}
