import { getChapterData, wordPool } from './curriculum'

// ============================================================
// 出题引擎:9+ 种题型,普通关"前半单词 → 后半句型/语音"难度阶梯
// 题型:listen 听音选词 / image 看图选词 / cn 中译英 / spell 拼字母
//       sentence 连词成句 / phonics 发音判断 / cloze 选词填空
//       respond 情景应答 / pic 看图选句 / tf 阅读判断(第10章)
// ============================================================

export function shuffle(arr) {
  const a = [...arr]
  for (let i = 0; i < a.length - 1; i++) {
    const j = i + Math.floor(Math.random() * (a.length - i))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function stripTail(s) {
  return s.replace(/[.!?,]+$/, '')
}

function uniqueOptions(correct, pool, n = 3) {
  const opts = [correct]
  const shuffled = shuffle(pool)
  for (const c of shuffled) {
    if (opts.length > n) break
    if (c !== correct && !opts.includes(c)) opts.push(c)
  }
  return shuffle(opts)
}

// ---- 单词级题型 ----
function wordQuestion(type, word, pool) {
  const others = pool.filter((w) => w.word !== word.word).map((w) => w.word)
  return {
    type,
    word: word.word,
    cn: word.cn,
    emoji: word.emoji,
    options: uniqueOptions(word.word, others),
  }
}

function spellQuestion(word, pool) {
  // 短语不拆字母,退回听音题
  if (word.word.includes(' ')) return wordQuestion('listen', word, pool)
  return { type: 'spell', word: word.word, cn: word.cn, letters: shuffle(word.word.split('')) }
}

// ---- 句型级题型 ----
function sentenceQuestion(sent) {
  const tokens = sent.en.split(' ')
  const tiles = shuffle(tokens.map((t, idx) => ({ t, idx })))
  return { type: 'sentence', en: sent.en, tokens, tiles, cn: sent.cn, emoji: sent.emoji, m: sent.m || {} }
}

function clozeQuestion(sent, pool) {
  const tokens = sent.en.split(' ')
  // 优先挖掉语法重点词(key/doing),否则挖最长的实词
  let idx = -1
  for (const [i, role] of Object.entries(sent.m || {})) {
    if (role === 'key' || role === 'doing') { idx = Number(i); break }
  }
  if (idx < 0) {
    let best = -1
    tokens.forEach((t, i) => {
      const w = stripTail(t)
      if (w.length >= 3 && !['the', 'The'].includes(w) && (best < 0 || w.length > stripTail(tokens[best]).length)) best = i
    })
    idx = best >= 0 ? best : 0
  }
  const answer = stripTail(tokens[idx])
  const chipPool = pool.filter((w) => !w.word.includes(' ')).map((w) => w.word)
  const answerCn = (pool.find((w) => w.word === answer) || {}).cn || ''
  return {
    type: 'cloze',
    before: tokens.slice(0, idx).join(' '),
    after: tokens.slice(idx + 1).join(' '),
    answer,
    answerCn,
    options: uniqueOptions(answer, chipPool, 2),
    cn: sent.cn,
    emoji: sent.emoji,
  }
}

function picQuestion(sent, allSents) {
  const others = allSents.filter((s) => s.en !== sent.en).map((s) => s.en)
  return { type: 'pic', emoji: sent.emoji, answer: sent.en, cn: sent.cn, options: uniqueOptions(sent.en, others, 2) }
}

function respondQuestion(item) {
  return { type: 'respond', q: item.q, answer: item.a, options: uniqueOptions(item.a, item.wrong, 2) }
}

function phonicsQuestion(pair, ph) {
  return { type: 'phonics', ...pair, tip: ph.tip, title: ph.title }
}

function tfQuestion(rq, reading) {
  return { type: 'tf', text: rq.text, answer: rq.answer, passage: reading }
}

// 普通关:3 道单词题 + (count-3) 道句型级题(按关卡号轮换类型)
const SENT_TYPES = ['sentence', 'cloze', 'pic', 'respond', 'phonics']

export function makeQuestions(chapterId, count, boss = false, levelId = 0) {
  const data = getChapterData(chapterId)
  const pool = wordPool(chapterId)
  const ph = data.phonics
  const questions = []
  const usedWords = new Set()

  const pickWord = () => {
    let word = pool[Math.floor(Math.random() * pool.length)]
    let guard = 0
    while (usedWords.has(word.word) && guard++ < 40) word = pool[Math.floor(Math.random() * pool.length)]
    usedWords.add(word.word)
    return word
  }

  if (boss) {
    // Boss 混合卷:2 道单词热身 + 全题型覆盖(第 10 章压轴换成阅读判断)
    const plan = ['w', 'w', 'phonics', 'sentence', 'cloze', 'respond', 'pic', data.reading ? 'tf' : 'spell']
    for (const slot of plan) {
      if (slot === 'w') {
        const word = pickWord()
        questions.push(wordQuestion(['listen', 'image', 'cn'][(levelId + questions.length) % 3], word, pool))
      } else if (slot === 'spell') {
        questions.push(spellQuestion(pickWord(), pool))
      } else if (slot === 'phonics' && ph && ph.pairs.length) {
        questions.push(phonicsQuestion(ph.pairs[levelId % ph.pairs.length], ph))
      } else if (slot === 'sentence') {
        questions.push(sentenceQuestion(data.sentences[levelId % data.sentences.length]))
      } else if (slot === 'cloze') {
        questions.push(clozeQuestion(data.sentences[(levelId + 1) % data.sentences.length], pool))
      } else if (slot === 'respond') {
        questions.push(respondQuestion(data.respond[levelId % data.respond.length]))
      } else if (slot === 'pic') {
        questions.push(picQuestion(data.sentences[(levelId + 2) % data.sentences.length], data.sentences))
      } else if (slot === 'tf' && data.reading) {
        questions.push(tfQuestion(data.reading.questions[questions.length % data.reading.questions.length], data.reading))
      }
    }
    return questions
  }

  // 普通关
  const wordCount = Math.max(2, Math.min(3, count - 3))
  for (let i = 0; i < wordCount; i++) {
    const word = pickWord()
    questions.push(wordQuestion(['listen', 'image', 'cn'][(levelId + i) % 3], word, pool))
  }
  const rot = [...SENT_TYPES.slice(levelId % SENT_TYPES.length), ...SENT_TYPES.slice(0, levelId % SENT_TYPES.length)]
  const sentSlots = rot.slice(0, count - wordCount)
  for (const t of sentSlots) {
    if (t === 'phonics') {
      if (ph && ph.pairs.length) questions.push(phonicsQuestion(ph.pairs[levelId % ph.pairs.length], ph))
      else questions.push(wordQuestion('cn', pickWord(), pool))
    } else if (t === 'sentence') {
      questions.push(sentenceQuestion(data.sentences[levelId % data.sentences.length]))
    } else if (t === 'cloze') {
      questions.push(clozeQuestion(data.sentences[(levelId + 1) % data.sentences.length], pool))
    } else if (t === 'respond') {
      questions.push(respondQuestion(data.respond[levelId % data.respond.length]))
    } else if (t === 'pic') {
      questions.push(picQuestion(data.sentences[(levelId + 2) % data.sentences.length], data.sentences))
    }
  }
  return questions
}

// 学习营练习题:5 题,必含语音题 + 句型题;第 10 章附加阅读判断
export function makeQuiz(chapterId) {
  const data = getChapterData(chapterId)
  const pool = wordPool(chapterId)
  const ph = data.phonics
  const quiz = []
  quiz.push(wordQuestion('listen', pool[0], pool))
  quiz.push(wordQuestion('image', pool[1] || pool[0], pool))
  if (ph && ph.pairs.length) quiz.push(phonicsQuestion(ph.pairs[0], ph))
  else quiz.push(wordQuestion('cn', pool[2] || pool[0], pool))
  quiz.push(clozeQuestion(data.sentences[0], pool))
  quiz.push(sentenceQuestion(data.sentences[1 % data.sentences.length]))
  if (data.reading) {
    for (const rq of data.reading.questions) quiz.push(tfQuestion(rq, data.reading))
  }
  return quiz
}

// 例题演示(出战宠物当小老师带做 3 题)
export function makeExamples(chapterId) {
  const data = getChapterData(chapterId)
  const pool = wordPool(chapterId)
  const examples = []

  const w = data.words[0]
  examples.push({
    q: wordQuestion('image', w, pool),
    explain: `看图:${w.emoji} 就是 ${w.word},意思是"${w.cn}"。读音:${w.sound}`,
  })

  if (data.phonics && data.phonics.pairs.length) {
    const p = data.phonics.pairs[0]
    examples.push({
      q: phonicsQuestion(p, data.phonics),
      explain: `「${p.a}」和「${p.b}」里的 ${p.la === p.lb ? p.la : `${p.la} / ${p.lb}`} 读音${p.same ? '相同 ✓' : '不同 ✗'}。${data.phonics.tip}`,
    })
  } else {
    const w2 = data.words[1] || w
    examples.push({
      q: wordQuestion('cn', w2, pool),
      explain: `"${w2.cn}" 的英文是 ${w2.word},读音:${w2.sound}`,
    })
  }

  const s = data.sentences[0]
  examples.push({
    q: sentenceQuestion(s),
    explain: `这句话的意思是:"${s.cn}"${data.grammar ? `。口诀:${data.grammar.formula}` : ''}`,
  })
  return examples
}
