import { CHAPTERS } from './levels'

// 每章 8 个核心单词:学习营学习 + 练习 + 关卡战斗都从这里出题
export const LESSON_WORDS = {
  1: [
    { word: 'hello', cn: '你好', emoji: '👋' },
    { word: 'hi', cn: '嗨', emoji: '🙋' },
    { word: 'bye', cn: '再见', emoji: '👋' },
    { word: 'yes', cn: '是的', emoji: '✅' },
    { word: 'no', cn: '不是', emoji: '❌' },
    { word: 'ok', cn: '好的', emoji: '👌' },
    { word: 'me', cn: '我', emoji: '🧒' },
    { word: 'you', cn: '你', emoji: '👉' },
  ],
  2: [
    { word: 'apple', cn: '苹果', emoji: '🍎' },
    { word: 'ball', cn: '球', emoji: '⚽' },
    { word: 'cat', cn: '猫', emoji: '🐱' },
    { word: 'dog', cn: '狗', emoji: '🐶' },
    { word: 'egg', cn: '鸡蛋', emoji: '🥚' },
    { word: 'fish', cn: '鱼', emoji: '🐟' },
    { word: 'girl', cn: '女孩', emoji: '👧' },
    { word: 'hat', cn: '帽子', emoji: '👒' },
  ],
  3: [
    { word: 'cake', cn: '蛋糕', emoji: '🍰' },
    { word: 'name', cn: '名字', emoji: '📛' },
    { word: 'kite', cn: '风筝', emoji: '🪁' },
    { word: 'bike', cn: '自行车', emoji: '🚲' },
    { word: 'home', cn: '家', emoji: '🏠' },
    { word: 'nose', cn: '鼻子', emoji: '👃' },
    { word: 'five', cn: '五', emoji: '5️⃣' },
    { word: 'nine', cn: '九', emoji: '9️⃣' },
  ],
  4: [
    { word: 'pig', cn: '猪', emoji: '🐷' },
    { word: 'six', cn: '六', emoji: '6️⃣' },
    { word: 'milk', cn: '牛奶', emoji: '🥛' },
    { word: 'bus', cn: '公交车', emoji: '🚌' },
    { word: 'sun', cn: '太阳', emoji: '☀️' },
    { word: 'cup', cn: '杯子', emoji: '🥤' },
    { word: 'map', cn: '地图', emoji: '🗺️' },
    { word: 'bed', cn: '床', emoji: '🛏️' },
  ],
  5: [
    { word: 'lion', cn: '狮子', emoji: '🦁' },
    { word: 'tiger', cn: '老虎', emoji: '🐯' },
    { word: 'panda', cn: '熊猫', emoji: '🐼' },
    { word: 'bird', cn: '鸟', emoji: '🐦' },
    { word: 'duck', cn: '鸭子', emoji: '🦆' },
    { word: 'bear', cn: '熊', emoji: '🐻' },
    { word: 'horse', cn: '马', emoji: '🐴' },
    { word: 'sheep', cn: '绵羊', emoji: '🐑' },
  ],
  6: [
    { word: 'family', cn: '家庭', emoji: '👨‍👩‍👧' },
    { word: 'dad', cn: '爸爸', emoji: '👨' },
    { word: 'mom', cn: '妈妈', emoji: '👩' },
    { word: 'sister', cn: '姐姐/妹妹', emoji: '👧' },
    { word: 'brother', cn: '哥哥/弟弟', emoji: '👦' },
    { word: 'grandma', cn: '奶奶', emoji: '👵' },
    { word: 'grandpa', cn: '爷爷', emoji: '👴' },
    { word: 'baby', cn: '宝宝', emoji: '👶' },
  ],
  7: [
    { word: 'school', cn: '学校', emoji: '🏫' },
    { word: 'book', cn: '书', emoji: '📚' },
    { word: 'pen', cn: '钢笔', emoji: '🖊️' },
    { word: 'desk', cn: '课桌', emoji: '🪑' },
    { word: 'teacher', cn: '老师', emoji: '👩‍🏫' },
    { word: 'ruler', cn: '尺子', emoji: '📏' },
    { word: 'bag', cn: '书包', emoji: '🎒' },
    { word: 'class', cn: '班级', emoji: '👫' },
  ],
  8: [
    { word: 'shop', cn: '商店', emoji: '🏪' },
    { word: 'bread', cn: '面包', emoji: '🍞' },
    { word: 'juice', cn: '果汁', emoji: '🧃' },
    { word: 'candy', cn: '糖果', emoji: '🍬' },
    { word: 'toy', cn: '玩具', emoji: '🧸' },
    { word: 'coin', cn: '硬币', emoji: '🪙' },
    { word: 'price', cn: '价格', emoji: '🏷️' },
    { word: 'buy', cn: '买', emoji: '🛒' },
  ],
  9: [
    { word: 'tree', cn: '树', emoji: '🌳' },
    { word: 'flower', cn: '花', emoji: '🌸' },
    { word: 'rain', cn: '雨', emoji: '🌧️' },
    { word: 'wind', cn: '风', emoji: '💨' },
    { word: 'cloud', cn: '云', emoji: '☁️' },
    { word: 'star', cn: '星星', emoji: '⭐' },
    { word: 'moon', cn: '月亮', emoji: '🌙' },
    { word: 'river', cn: '小河', emoji: '🏞️' },
  ],
  10: [
    { word: 'friend', cn: '朋友', emoji: '🤝' },
    { word: 'happy', cn: '开心的', emoji: '😊' },
    { word: 'smile', cn: '微笑', emoji: '😄' },
    { word: 'dream', cn: '梦想', emoji: '💭' },
    { word: 'brave', cn: '勇敢的', emoji: '🦸' },
    { word: 'magic', cn: '魔法', emoji: '✨' },
    { word: 'world', cn: '世界', emoji: '🌍' },
    { word: 'hero', cn: '英雄', emoji: '🦸‍♂️' },
  ],
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickDistractors(pool, answer, n = 3) {
  const others = pool.filter((w) => w.word !== answer.word)
  return shuffle(others).slice(0, n)
}

// 生成一套战斗/练习题
// type: listen(听音选词) | image(看图选词) | cn(中译英) | spell(拼字母) | mixed(Boss)
export function makeQuestions(chapterId, count, boss = false) {
  const pool = LESSON_WORDS[chapterId] || LESSON_WORDS[1]
  const nonBossTypes = ['listen', 'image', 'cn']
  const bossTypes = ['listen', 'image', 'cn', 'spell']
  const used = new Set()
  const questions = []
  for (let i = 0; i < count; i++) {
    // 尽量不重复同一个单词
    let word = pool[i % pool.length]
    if (used.size < pool.length) {
      let guard = 0
      while (used.has(word.word) && guard++ < 30) {
        word = pool[Math.floor(Math.random() * pool.length)]
      }
    }
    used.add(word.word)
    const type = boss
      ? bossTypes[Math.floor(Math.random() * bossTypes.length)]
      : nonBossTypes[i % nonBossTypes.length]

    const q = { type, word: word.word, cn: word.cn, emoji: word.emoji }
    if (type === 'spell') {
      q.letters = shuffle(word.word.split(''))
    } else {
      const ds = pickDistractors(pool, word)
      q.options = shuffle([word.word, ...ds.map((d) => d.word)])
    }
    questions.push(q)
  }
  return questions
}
