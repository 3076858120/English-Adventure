// ============================================================
// 课程内容(对齐校内四年级上难度,以"沪学习 4A Week4 Unit3 通关卷"为基准)
// 每章:核心词(words)+ 短语(phrases)+ 核心句型(sentences,带语法色标)
//      + 语音点(phonics,自然拼读判断)+ 语法小课堂(grammar)+ 阅读(第10章)
// 说明:不教 IPA 音标,用"拼读提示 sound"(音节拆分)和口型小贴士,
//      适合零基础的孩子建立字母-声音对应。
// ============================================================

export const CHAPTER_CONTENT = {
  // ---------------- 1 新手村:打招呼与自我介绍 ----------------
  1: {
    words: [
      { word: 'hello', cn: '你好', emoji: '👋', sound: 'hel-lo' },
      { word: 'hi', cn: '嗨', emoji: '🙋', sound: 'hi' },
      { word: 'bye', cn: '再见', emoji: '👋', sound: 'bye' },
      { word: 'name', cn: '名字', emoji: '📛', sound: 'name' },
      { word: 'nice', cn: '友好的', emoji: '😊', sound: 'nice' },
      { word: 'meet', cn: '遇见', emoji: '🤝', sound: 'meet' },
      { word: 'from', cn: '来自', emoji: '🌍', sound: 'from' },
      { word: 'friend', cn: '朋友', emoji: '🫂', sound: 'friend' },
      { word: 'you', cn: '你;你们', emoji: '👉', sound: 'you' },
      { word: 'me', cn: '我', emoji: '🧒', sound: 'me' },
    ],
    phrases: [{ word: 'China', cn: '中国', emoji: '🇨🇳', sound: 'Chi-na' }],
    sentences: [
      { en: 'What is your name?', cn: '你叫什么名字?', emoji: '🙋', m: { 1: 'be' } },
      { en: 'My name is Doudou.', cn: '我的名字叫豆豆。', emoji: '📛', m: { 2: 'be' } },
      { en: 'Where are you from?', cn: '你来自哪里?', emoji: '🌍', m: { 1: 'be', 3: 'key' } },
      { en: 'I am from China.', cn: '我来自中国。', emoji: '🌏', m: { 1: 'be', 2: 'key' } },
    ],
    respond: [
      { q: 'What is your name?', a: 'My name is Lily.', wrong: ['I am from China.', 'Nice to meet you!'] },
      { q: 'Where are you from?', a: 'I am from China.', wrong: ['My name is Lily.', 'Goodbye!'] },
    ],
    phonics: {
      title: '字母 n 和 m 的发音',
      tip: 'n:舌尖顶住上牙,鼻子嗡嗡"嗯~";m:闭上嘴巴,鼻子"姆~"。都是鼻音哦!',
      focusWords: ['name', 'nice', 'me', 'mom'],
      pairs: [
        { a: 'hello', la: 'h', b: 'hi', lb: 'h', same: true },
        { a: 'name', la: 'n', b: 'nice', lb: 'n', same: true },
        { a: 'hello', la: 'h', b: 'me', lb: 'm', same: false },
        { a: 'name', la: 'n', b: 'me', lb: 'm', same: false },
      ],
    },
    grammar: {
      title: '自我介绍公式',
      formula: 'My name is + 名字  /  I am from + 地方',
      explain: '介绍自己:说名字用 My name is…;说来自哪里用 I am from…',
      examples: [
        { en: 'My name is Doudou.', cn: '我叫豆豆。' },
        { en: 'I am from China.', cn: '我来自中国。' },
      ],
    },
  },

  // ---------------- 2 字母森林:动物初见 + 颜色 ----------------
  2: {
    words: [
      { word: 'cat', cn: '猫', emoji: '🐱', sound: 'cat' },
      { word: 'dog', cn: '狗', emoji: '🐶', sound: 'dog' },
      { word: 'panda', cn: '熊猫', emoji: '🐼', sound: 'pan-da' },
      { word: 'monkey', cn: '猴子', emoji: '🐵', sound: 'mon-key' },
      { word: 'tiger', cn: '老虎', emoji: '🐯', sound: 'ti-ger' },
      { word: 'bird', cn: '鸟', emoji: '🐦', sound: 'bird' },
      { word: 'fish', cn: '鱼', emoji: '🐟', sound: 'fish' },
      { word: 'black', cn: '黑色的', emoji: '⬛', sound: 'black' },
      { word: 'white', cn: '白色的', emoji: '⬜', sound: 'white' },
      { word: 'cute', cn: '可爱的', emoji: '🥰', sound: 'cute' },
    ],
    phrases: [{ word: 'big', cn: '大的', emoji: '🐘', sound: 'big' }],
    sentences: [
      { en: 'I have a cat.', cn: '我有一只猫。', emoji: '🐱', m: { 1: 'key' } },
      { en: 'The panda is black and white.', cn: '熊猫是黑白相间的。', emoji: '🐼', m: { 2: 'be' } },
      { en: 'Look at the monkey!', cn: '看这只猴子!', emoji: '🐵', m: { 3: 'key' } },
      { en: 'It is so cute!', cn: '它太可爱啦!', emoji: '🥰', m: { 1: 'be' } },
    ],
    respond: [
      { q: 'What is this?', a: 'It is a cat.', wrong: ['It is black and white.', 'I have a dog.'] },
      { q: 'Do you like pandas?', a: 'Yes, I do.', wrong: ['No, I am not.', 'It is a tiger.'] },
    ],
    phonics: {
      title: 'b / p / d 的发音',
      tip: 'b 和 p 像双胞胎:都是先把嘴唇闭紧再弹开,p 要喷一口气,b 不喷;d 是舌尖弹一下上牙背。',
      focusWords: ['panda', 'pig', 'cat', 'dog'],
      pairs: [
        { a: 'panda', la: 'p', b: 'pig', lb: 'p', same: true },
        { a: 'cat', la: 'c', b: 'cup', lb: 'c', same: true },
        { a: 'dog', la: 'd', b: 'duck', lb: 'd', same: true },
        { a: 'panda', la: 'p', b: 'dog', lb: 'd', same: false },
      ],
    },
    grammar: {
      title: '介绍小动物',
      formula: 'I have a + 动物  /  It is + 颜色',
      explain: '"我有一只……"用 I have a…;说它的颜色用 It is…(它 是……)',
      examples: [
        { en: 'I have a cat.', cn: '我有一只猫。' },
        { en: 'The panda is black and white.', cn: '熊猫是黑白相间的。' },
      ],
    },
  },

  // ---------------- 3 魔法发音森林:魔法 e 长元音 ----------------
  3: {
    words: [
      { word: 'cake', cn: '蛋糕', emoji: '🍰', sound: 'cake' },
      { word: 'kite', cn: '风筝', emoji: '🪁', sound: 'kite' },
      { word: 'bike', cn: '自行车', emoji: '🚲', sound: 'bike' },
      { word: 'home', cn: '家', emoji: '🏠', sound: 'home' },
      { word: 'nose', cn: '鼻子', emoji: '👃', sound: 'nose' },
      { word: 'five', cn: '五', emoji: '5️⃣', sound: 'five' },
      { word: 'nine', cn: '九', emoji: '9️⃣', sound: 'nine' },
      { word: 'grape', cn: '葡萄', emoji: '🍇', sound: 'grape' },
      { word: 'rose', cn: '玫瑰', emoji: '🌹', sound: 'rose' },
      { word: 'lake', cn: '湖', emoji: '🏞️', sound: 'lake' },
    ],
    phrases: [],
    sentences: [
      { en: 'This is my home.', cn: '这是我的家。', emoji: '🏠', m: { 1: 'be' } },
      { en: 'The cake is so big!', cn: '蛋糕好大呀!', emoji: '🍰', m: { 2: 'be' } },
      { en: 'I can ride a bike.', cn: '我会骑自行车。', emoji: '🚲', m: { 1: 'key' } },
      { en: 'The kite is white.', cn: '风筝是白色的。', emoji: '🪁', m: { 2: 'be' } },
    ],
    respond: [
      { q: 'Is this your bike?', a: 'Yes, it is.', wrong: ['Yes, I am.', 'It is a kite.'] },
      { q: 'How many kites?', a: 'Five kites.', wrong: ['It is white.', 'I can ride a bike.'] },
    ],
    phonics: {
      title: '魔法 e 的变身术',
      tip: '结尾的 e 不发音,但它有魔法!它会让前面的元音字母喊出自己的名字:cat → cake(a 变长音),kit → kite(i 变长音)。',
      focusWords: ['cake', 'name', 'kite', 'five', 'home', 'nose'],
      pairs: [
        { a: 'cake', la: 'a', b: 'name', lb: 'a', same: true },
        { a: 'bike', la: 'i', b: 'five', lb: 'i', same: true },
        { a: 'home', la: 'o', b: 'nose', lb: 'o', same: true },
        { a: 'cake', la: 'a', b: 'cat', lb: 'a', same: false },
        { a: 'kite', la: 'i', b: 'fish', lb: 'i', same: false },
        { a: 'home', la: 'o', b: 'dog', lb: 'o', same: false },
      ],
    },
    grammar: null,
  },

  // ---------------- 4 Phonics Valley:拼读规律 + /v/ ----------------
  4: {
    words: [
      { word: 'pig', cn: '猪', emoji: '🐷', sound: 'pig' },
      { word: 'milk', cn: '牛奶', emoji: '🥛', sound: 'milk' },
      { word: 'bus', cn: '公交车', emoji: '🚌', sound: 'bus' },
      { word: 'sun', cn: '太阳', emoji: '☀️', sound: 'sun' },
      { word: 'cup', cn: '杯子', emoji: '🥤', sound: 'cup' },
      { word: 'map', cn: '地图', emoji: '🗺️', sound: 'map' },
      { word: 'bed', cn: '床', emoji: '🛏️', sound: 'bed' },
      { word: 'pen', cn: '钢笔', emoji: '🖊️', sound: 'pen' },
      { word: 'river', cn: '河;河流', emoji: '🏞️', sound: 'ri-ver' },
      { word: 'very', cn: '非常', emoji: '⚡', sound: 've-ry' },
      { word: 'give', cn: '给', emoji: '🎁', sound: 'give' },
      { word: 'have', cn: '有;拥有', emoji: '🤲', sound: 'have' },
    ],
    phrases: [{ word: 'near', cn: '在附近', emoji: '📍', sound: 'near' }],
    sentences: [
      { en: 'I have a pen.', cn: '我有一支钢笔。', emoji: '🖊️', m: { 1: 'key' } },
      { en: 'The sun is very big.', cn: '太阳非常大。', emoji: '☀️', m: { 2: 'be', 3: 'key' } },
      { en: 'We are near the river.', cn: '我们在河边。', emoji: '🏞️', m: { 1: 'be', 2: 'key' } },
      { en: 'Give me the map, please.', cn: '请把地图给我。', emoji: '🗺️', m: { 0: 'key' } },
    ],
    respond: [
      { q: 'What do you have?', a: 'I have a pen.', wrong: ['I am a student.', 'It is a map.'] },
      { q: 'Where is the river?', a: 'It is near the bus.', wrong: ['It is a cup.', 'I have a map.'] },
    ],
    phonics: {
      title: '辅音 v /v/(本周校内语音点)',
      tip: '上牙轻轻咬住下嘴唇,喉咙嗡嗡响,就是 v!f 嘴型一样但不响。river、give、have、very 里都有它!',
      focusWords: ['river', 'give', 'have', 'very'],
      pairs: [
        { a: 'river', la: 'v', b: 'give', lb: 'v', same: true },
        { a: 'have', la: 'v', b: 'very', lb: 'v', same: true },
        { a: 'five', la: 'v', b: 'river', lb: 'v', same: true },
        { a: 'fish', la: 'f', b: 'river', lb: 'v', same: false },
        { a: 'bus', la: 'u', b: 'cup', lb: 'u', same: true },
        { a: 'bed', la: 'e', b: 'pen', lb: 'e', same: true },
      ],
    },
    grammar: null,
  },

  // ---------------- 5 单词草原:动物与它们的家(校内 Unit 3 全量) ----------------
  5: {
    words: [
      { word: 'panda', cn: '大熊猫', emoji: '🐼', sound: 'pan-da' },
      { word: 'monkey', cn: '猴子', emoji: '🐵', sound: 'mon-key' },
      { word: 'elephant', cn: '大象', emoji: '🐘', sound: 'el-e-phant' },
      { word: 'polar bear', cn: '北极熊', emoji: '🐻‍❄️', sound: 'po-lar bear' },
      { word: 'seal', cn: '海豹', emoji: '🦭', sound: 'seal' },
      { word: 'hometown', cn: '家乡', emoji: '🏘️', sound: 'home-town' },
      { word: 'family', cn: '家庭', emoji: '👨‍👩‍👧', sound: 'fa-mi-ly' },
      { word: 'tail', cn: '尾巴', emoji: '➰', sound: 'tail' },
      { word: 'fur', cn: '皮毛', emoji: '🧶', sound: 'fur' },
      { word: 'Africa', cn: '非洲', emoji: '🦁', sound: 'Af-ri-ca' },
      { word: 'India', cn: '印度', emoji: '🛕', sound: 'In-di-a' },
      { word: 'weather', cn: '天气', emoji: '🌤️', sound: 'wea-ther' },
    ],
    phrases: [
      { word: 'baby elephant', cn: '小象', emoji: '🐘', sound: 'ba-by el-e-phant' },
      { word: 'jump in trees', cn: '在树上跳跃', emoji: '🌳', sound: 'jump in trees' },
      { word: 'play in the river', cn: '在河里玩耍', emoji: '💦', sound: 'play in the ri-ver' },
      { word: 'keep warm', cn: '保暖', emoji: '🧥', sound: 'keep warm' },
      { word: 'the North Pole', cn: '北极', emoji: '🧊', sound: 'the North Pole' },
    ],
    sentences: [
      { en: 'The elephant is swimming in the river.', cn: '大象正在河里游泳。', emoji: '🐘', m: { 2: 'be', 3: 'doing' } },
      { en: 'The baby elephant is playing in the river.', cn: '小象正在河里玩耍。', emoji: '🐘', m: { 3: 'be', 4: 'doing' } },
      { en: 'The monkeys are playing in the trees.', cn: '猴子们正在树上嬉戏。', emoji: '🐵', m: { 2: 'be', 3: 'doing' } },
      { en: 'Polar bears live near the North Pole.', cn: '北极熊住在北极附近。', emoji: '🐻‍❄️', m: { 2: 'key' } },
    ],
    respond: [
      { q: 'Where do polar bears live?', a: 'They live near the North Pole.', wrong: ['They live in the trees.', 'It is black and white.'] },
      { q: 'What is the elephant doing?', a: 'It is swimming in the river.', wrong: ['It is a seal.', 'They are playing.'] },
    ],
    phonics: {
      title: '/v/ 大巩固',
      tip: 'v:上牙咬下唇,喉咙震动。live、love、five、very 里都是它!',
      focusWords: ['river', 'give', 'live', 'love', 'five', 'very'],
      pairs: [
        { a: 'river', la: 'v', b: 'give', lb: 'v', same: true },
        { a: 'very', la: 'v', b: 'five', lb: 'v', same: true },
        { a: 'fish', la: 'f', b: 'very', lb: 'v', same: false },
        { a: 'monkey', la: 'o', b: 'moon', lb: 'oo', same: false },
      ],
    },
    grammar: {
      title: '现在进行时(正在做……)',
      formula: '主语 + be(am/is/are) + doing',
      explain: '表示"正在做……":我 用 am,他/她/它 用 is,你们/我们/他们 用 are。动词要变成 doing 哦!',
      examples: [
        { en: 'The elephant is swimming in the river.', cn: '大象正在河里游泳。' },
        { en: 'The monkeys are playing in the trees.', cn: '猴子们正在树上嬉戏。' },
      ],
    },
  },

  // ---------------- 6 家庭城堡 ----------------
  6: {
    words: [
      { word: 'family', cn: '家庭', emoji: '👨‍👩‍👧', sound: 'fa-mi-ly' },
      { word: 'dad', cn: '爸爸', emoji: '👨', sound: 'dad' },
      { word: 'mom', cn: '妈妈', emoji: '👩', sound: 'mom' },
      { word: 'sister', cn: '姐姐;妹妹', emoji: '👧', sound: 'sis-ter' },
      { word: 'brother', cn: '哥哥;弟弟', emoji: '👦', sound: 'bro-ther' },
      { word: 'grandma', cn: '奶奶;外婆', emoji: '👵', sound: 'grand-ma' },
      { word: 'grandpa', cn: '爷爷;外公', emoji: '👴', sound: 'grand-pa' },
      { word: 'baby', cn: '宝宝', emoji: '👶', sound: 'ba-by' },
      { word: 'people', cn: '人们', emoji: '👥', sound: 'peo-ple' },
      { word: 'love', cn: '爱', emoji: '❤️', sound: 'love' },
    ],
    phrases: [{ word: 'years old', cn: '……岁', emoji: '🎂', sound: 'years old' }],
    sentences: [
      { en: 'There are four people in my family.', cn: '我家有四口人。', emoji: '👨‍👩‍👧', m: { 1: 'be', 6: 'key' } },
      { en: 'This is my dad.', cn: '这是我爸爸。', emoji: '👨', m: { 1: 'be' } },
      { en: 'My sister is nine years old.', cn: '我妹妹九岁。', emoji: '👧', m: { 2: 'be' } },
      { en: 'I love my family.', cn: '我爱我家。', emoji: '❤️', m: { 1: 'key' } },
    ],
    respond: [
      { q: 'How many people are in your family?', a: 'There are four.', wrong: ['I am nine years old.', 'It is a baby.'] },
      { q: 'Who is this?', a: 'She is my grandma.', wrong: ['He is a teacher.', 'It is a school.'] },
    ],
    phonics: {
      title: 'f 和 g 的发音',
      tip: 'f:上牙碰下唇轻轻吹气,嗓子不响;g:喉咙后面发"咕"。family、fish、grandpa 里都有!',
      focusWords: ['family', 'fish', 'grandpa', 'girl'],
      pairs: [
        { a: 'family', la: 'f', b: 'fish', lb: 'f', same: true },
        { a: 'girl', la: 'g', b: 'grandpa', lb: 'g', same: true },
        { a: 'dad', la: 'a', b: 'bag', lb: 'a', same: true },
        { a: 'fish', la: 'f', b: 'very', lb: 'v', same: false },
      ],
    },
    grammar: {
      title: 'There be 句型(有……)',
      formula: 'There is + 一个 / There are + 多个',
      explain: '表示"有……":一个人或东西用 There is,两个以上用 There are。',
      examples: [
        { en: 'There are four people in my family.', cn: '我家有四口人。' },
        { en: 'There is a baby in the room.', cn: '房间里有一个宝宝。' },
      ],
    },
  },

  // ---------------- 7 学校城堡:学校 + 现在进行时进阶 ----------------
  7: {
    words: [
      { word: 'school', cn: '学校', emoji: '🏫', sound: 'school' },
      { word: 'book', cn: '书', emoji: '📖', sound: 'book' },
      { word: 'pencil', cn: '铅笔', emoji: '✏️', sound: 'pen-cil' },
      { word: 'desk', cn: '课桌', emoji: '🪑', sound: 'desk' },
      { word: 'teacher', cn: '老师', emoji: '👩‍🏫', sound: 'tea-cher' },
      { word: 'student', cn: '学生', emoji: '🧑‍🎓', sound: 'stu-dent' },
      { word: 'ruler', cn: '尺子', emoji: '📏', sound: 'ru-ler' },
      { word: 'bag', cn: '书包', emoji: '🎒', sound: 'bag' },
      { word: 'read', cn: '读;阅读', emoji: '📖', sound: 'read' },
      { word: 'write', cn: '写', emoji: '✍️', sound: 'write' },
      { word: 'draw', cn: '画画', emoji: '🎨', sound: 'draw' },
      { word: 'sing', cn: '唱歌', emoji: '🎤', sound: 'sing' },
    ],
    phrases: [{ word: 'play football', cn: '踢足球', emoji: '⚽', sound: 'play foot-ball' }],
    sentences: [
      { en: 'The girl is reading a book.', cn: '女孩正在读书。', emoji: '📖', m: { 2: 'be', 3: 'doing' } },
      { en: 'The boys are playing football.', cn: '男孩们正在踢足球。', emoji: '⚽', m: { 2: 'be', 3: 'doing' } },
      { en: 'I am writing my name.', cn: '我正在写我的名字。', emoji: '✍️', m: { 1: 'be', 2: 'doing' } },
      { en: 'Look! The teacher is coming.', cn: '看!老师来了。', emoji: '👩‍🏫', m: { 3: 'be', 4: 'doing' } },
    ],
    respond: [
      { q: 'What is the girl doing?', a: 'She is reading a book.', wrong: ['She is my sister.', 'It is a book.'] },
      { q: 'What are the boys doing?', a: 'They are playing football.', wrong: ['It is raining outside.', 'He is writing.'] },
    ],
    phonics: {
      title: 'ea / i_e / -ing 的读音',
      tip: 'ea 在 teacher、read 里读长音"衣~";write 里的 i_e 跟 kite 一样读"爱";-ing 读"英"像小铃铛!',
      focusWords: ['read', 'teacher', 'write', 'sing', 'kite'],
      pairs: [
        { a: 'read', la: 'ea', b: 'teacher', lb: 'ea', same: true },
        { a: 'write', la: 'i', b: 'kite', lb: 'i', same: true },
        { a: 'sing', la: 'i', b: 'swim', lb: 'i', same: true },
        { a: 'read', la: 'ea', b: 'bed', lb: 'e', same: false },
      ],
    },
    grammar: {
      title: '-ing 三规则(正在进行时第二步)',
      formula: '直接加 ing / 去 e 加 ing / 双写尾字母加 ing',
      explain: '大多数动词直接加:read→reading;结尾有 e 先去掉:write→writing;重读闭音节双写:run→running、swim→swimming。',
      examples: [
        { en: 'She is writing her name.', cn: '她正在写她的名字。' },
        { en: 'The frog is swimming.', cn: '青蛙正在游泳。' },
      ],
    },
  },

  // ---------------- 8 快乐商店:食物购物 + lots of / so ----------------
  8: {
    words: [
      { word: 'shop', cn: '商店', emoji: '🏪', sound: 'shop' },
      { word: 'bread', cn: '面包', emoji: '🍞', sound: 'bread' },
      { word: 'juice', cn: '果汁', emoji: '🧃', sound: 'juice' },
      { word: 'water', cn: '水', emoji: '💧', sound: 'wa-ter' },
      { word: 'candy', cn: '糖果', emoji: '🍬', sound: 'can-dy' },
      { word: 'fruit', cn: '水果', emoji: '🍎', sound: 'fruit' },
      { word: 'egg', cn: '鸡蛋', emoji: '🥚', sound: 'egg' },
      { word: 'rice', cn: '米饭', emoji: '🍚', sound: 'rice' },
      { word: 'banana', cn: '香蕉', emoji: '🍌', sound: 'ba-na-na' },
      { word: 'buy', cn: '买', emoji: '🛒', sound: 'buy' },
      { word: 'money', cn: '钱', emoji: '💰', sound: 'mo-ney' },
    ],
    phrases: [{ word: 'how much', cn: '多少钱', emoji: '🏷️', sound: 'how much' }],
    sentences: [
      { en: 'I like bread and juice.', cn: '我喜欢面包和果汁。', emoji: '🧃', m: { 1: 'key' } },
      { en: 'There are lots of fruits in the shop.', cn: '商店里有许多水果。', emoji: '🍇', m: { 1: 'be', 2: 'key', 3: 'key' } },
      { en: 'It is hot, so I want cold juice.', cn: '天好热,所以我想要冰果汁。', emoji: '🥤', m: { 1: 'be', 3: 'key' } },
      { en: 'How much is the candy?', cn: '这糖果多少钱?', emoji: '🍬', m: { 2: 'be' } },
    ],
    respond: [
      { q: 'What do you like?', a: 'I like candy.', wrong: ['I am fine, thank you.', 'It is a shop.'] },
      { q: 'How much is the bread?', a: 'Five yuan, please.', wrong: ['I like bread.', 'There are lots of eggs.'] },
    ],
    phonics: {
      title: '长得像,读音巧判断',
      tip: 'bread 里的 ea 读短音"哎",和 bed 一样!money 和 monkey 开头都读"妈"。不要被长相骗到哦!',
      focusWords: ['bread', 'bed', 'money', 'monkey'],
      pairs: [
        { a: 'money', la: 'o', b: 'monkey', lb: 'o', same: true },
        { a: 'bread', la: 'ea', b: 'bed', lb: 'e', same: true },
        { a: 'candy', la: 'a', b: 'bag', lb: 'a', same: true },
        { a: 'cat', la: 'a', b: 'cake', lb: 'a', same: false },
      ],
    },
    grammar: {
      title: 'lots of(许多)和 so(所以)',
      formula: 'lots of + 名词  /  原因, so 结果',
      explain: "lots of 表示'许多',后面跟名词;so 表示'所以',连接结果:天气热,所以我想喝冰果汁。",
      examples: [
        { en: 'There are lots of fruits in the shop.', cn: '商店里有许多水果。' },
        { en: 'It is hot, so I want cold juice.', cn: '天好热,所以我想要冰果汁。' },
      ],
    },
  },

  // ---------------- 9 自然公园:天气 + because / so ----------------
  9: {
    words: [
      { word: 'tree', cn: '树', emoji: '🌳', sound: 'tree' },
      { word: 'flower', cn: '花', emoji: '🌸', sound: 'flow-er' },
      { word: 'rain', cn: '雨', emoji: '🌧️', sound: 'rain' },
      { word: 'wind', cn: '风', emoji: '💨', sound: 'wind' },
      { word: 'cloud', cn: '云', emoji: '☁️', sound: 'cloud' },
      { word: 'sky', cn: '天空', emoji: '🌈', sound: 'sky' },
      { word: 'star', cn: '星星', emoji: '⭐', sound: 'star' },
      { word: 'moon', cn: '月亮', emoji: '🌙', sound: 'moon' },
      { word: 'snow', cn: '雪', emoji: '❄️', sound: 'snow' },
      { word: 'warm', cn: '温暖的', emoji: '🔆', sound: 'warm' },
      { word: 'cold', cn: '寒冷的', emoji: '🥶', sound: 'cold' },
      { word: 'melt', cn: '融化', emoji: '💦', sound: 'melt' },
    ],
    phrases: [{ word: 'get warmer', cn: '变得 warmer(更暖)', emoji: '📈', sound: 'get war-mer' }],
    sentences: [
      { en: 'It is raining outside.', cn: '外面正在下雨。', emoji: '🌧️', m: { 1: 'be', 2: 'doing' } },
      { en: 'It is cold, so they have thick fur.', cn: '天气寒冷,所以它们有厚厚的皮毛。', emoji: '🐻‍❄️', m: { 1: 'be', 3: 'key' } },
      { en: 'The ice is melting because the weather is getting warmer.', cn: '冰雪正在融化,因为天气渐渐变暖了。', emoji: '❄️', m: { 2: 'be', 3: 'doing', 4: 'key' } },
      { en: 'There are lots of stars in the sky.', cn: '天上有许多星星。', emoji: '⭐', m: { 1: 'be', 2: 'key', 3: 'key' } },
    ],
    respond: [
      { q: 'What is the weather like?', a: 'It is rainy and cold.', wrong: ['It is a cloud.', 'They are playing.'] },
      { q: 'Why do polar bears have thick fur?', a: 'Because it is cold.', wrong: ['Because it is hot.', 'So it is warm.'] },
    ],
    phonics: {
      title: 'oo 和 ow 的两种读音',
      tip: 'oo 在 moon、zoo 里读长长的"呜~";ow 有两副面孔:snow 里读"欧",now 里读"傲"!',
      focusWords: ['moon', 'snow', 'rain', 'wind'],
      pairs: [
        { a: 'moon', la: 'oo', b: 'zoo', lb: 'oo', same: true },
        { a: 'rain', la: 'ai', b: 'tail', lb: 'ai', same: true },
        { a: 'wind', la: 'i', b: 'fish', lb: 'i', same: true },
        { a: 'snow', la: 'ow', b: 'now', lb: 'ow', same: false },
      ],
    },
    grammar: {
      title: 'so(所以)和 because(因为)',
      formula: '原因, so 结果  /  结果 because 原因',
      explain: "因为冷 → 所以有厚皮毛。说原因用 because,说结果用 so。考试常考:Why…? 用 Because… 回答!",
      examples: [
        { en: 'It is cold, so they have thick fur.', cn: '天气寒冷,所以它们有厚厚的皮毛。' },
        { en: 'The ice is melting because the weather is getting warmer.', cn: '冰雪正在融化,因为天气渐渐变暖了。' },
      ],
    },
  },

  // ---------------- 10 英语王国:综合复习 + 阅读 ----------------
  10: {
    words: [
      { word: 'friend', cn: '朋友', emoji: '🤝', sound: 'friend' },
      { word: 'happy', cn: '开心的', emoji: '😊', sound: 'hap-py' },
      { word: 'help', cn: '帮助', emoji: '🙋', sound: 'help' },
      { word: 'animal', cn: '动物', emoji: '🐾', sound: 'an-i-mal' },
      { word: 'strong', cn: '强壮的', emoji: '💪', sound: 'strong' },
      { word: 'kind', cn: '友善的', emoji: '💗', sound: 'kind' },
      { word: 'world', cn: '世界', emoji: '🌍', sound: 'world' },
      { word: 'brave', cn: '勇敢的', emoji: '🦸', sound: 'brave' },
      { word: 'plant', cn: '种植', emoji: '🌱', sound: 'plant' },
      { word: 'together', cn: '一起', emoji: '🫂', sound: 'to-ge-ther' },
    ],
    phrases: [{ word: 'lose their homes', cn: '失去家园', emoji: '🏚️', sound: 'lose their homes' }],
    sentences: [
      { en: 'Animals are our good friends.', cn: '动物是我们的好朋友。', emoji: '🐾', m: { 1: 'be' } },
      { en: 'We should plant trees.', cn: '我们应该种树。', emoji: '🌳', m: { 1: 'key' } },
      { en: "Let's protect nature together.", cn: '让我们一起保护大自然。', emoji: '🌍', m: { 1: 'key' } },
      { en: 'Animals are losing their homes.', cn: '动物们正在失去家园。', emoji: '🏚️', m: { 1: 'be', 2: 'doing' } },
    ],
    respond: [
      { q: 'What can we do for animals?', a: 'We can plant trees.', wrong: ['We are students.', 'It is a tree.'] },
      { q: 'Are animals our friends?', a: 'Yes, they are.', wrong: ['Yes, it is.', 'They are playing.'] },
    ],
    phonics: {
      title: '全书发音大混战',
      tip: 'v 要响、f 不响;-ing 像铃铛;oo 在 moon 里长又长。全部回忆一遍,准备决战!',
      focusWords: ['river', 'give', 'sing', 'moon', 'family', 'snow'],
      pairs: [
        { a: 'river', la: 'v', b: 'give', lb: 'v', same: true },
        { a: 'sing', la: 'ng', b: 'ring', lb: 'ng', same: true },
        { a: 'snow', la: 'ow', b: 'now', lb: 'ow', same: false },
        { a: 'family', la: 'f', b: 'fish', lb: 'f', same: true },
      ],
    },
    grammar: {
      title: '英语王国大复习',
      formula: 'be + doing · so · because · lots of',
      explain: '决战前把全书法宝再拿一遍:正在做→be+doing;结果→so;原因→because;许多→lots of!',
      examples: [
        { en: 'Animals are losing their homes.', cn: '动物们正在失去家园。' },
        { en: 'We plant trees, so animals have homes.', cn: '我们种树,所以动物们有家。' },
      ],
    },
    // 第 10 章专属:短文阅读判断(对齐校内 Part 3)
    reading: {
      title: 'Love and Protect Our Animal Friends',
      lines: [
        'Animals are our good friends. They live all over the world.',
        'Some live in forests. Some live on grasslands, and others live in the sea.',
        'But now, some animals are losing their homes and cannot find enough food.',
        'We can plant trees and keep rivers clean.',
        "Let's protect nature together!",
      ],
      cn: '动物是我们的好朋友,它们住在世界各地。有的住森林,有的住草原,还有的住在大海。可是现在,一些动物正在失去家园,找不到足够的食物。我们可以种树、保护河水干净。一起保护大自然吧!',
      questions: [
        { text: 'Animals are our good friends.', answer: true },
        { text: 'All the animals live in the sea.', answer: false },
        { text: 'We can plant trees to help animals.', answer: true },
      ],
    },
  },
}

const FALLBACK = CHAPTER_CONTENT[1]

export function getChapterData(chapterId) {
  return CHAPTER_CONTENT[chapterId] || FALLBACK
}

// 词 + 短语合并出题池
export function wordPool(chapterId) {
  const d = getChapterData(chapterId)
  return [...d.words, ...(d.phrases || [])]
}
