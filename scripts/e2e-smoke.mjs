// E2E 冒烟测试(课程升级版):微课→例题→练习→战斗(新题型)→Boss→阅读判断→回归项
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:4173'
const results = []
const ok = (name, cond, extra = '') => {
  results.push({ name, pass: Boolean(cond), extra })
  console.log(`${cond ? '✅' : '❌'} ${name}${extra ? ' — ' + extra : ''}`)
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader', '--window-size=900,1400'],
})
const page = await browser.newPage()
await page.setViewport({ width: 900, height: 1400 })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))

// 万能答题器:词块(优先提示高亮)/判断题/词块填空/选项
async function answerOnce() {
  const hintTile = await page.$('.sentence-tile.hintnext:not(:disabled), .spell-tile.hintnext:not(:disabled)')
  if (hintTile) { await hintTile.click(); return true }
  const st = await page.$('.sentence-tile:not(:disabled):not(.used)')
  if (st) { await st.click(); return true }
  const sp = await page.$('.spell-tile:not(:disabled):not(.used)')
  if (sp) { await sp.click(); return true }
  const tf = await page.$$('.tf-btn:not(:disabled)')
  if (tf.length) { await tf[Math.floor(Math.random() * tf.length)].click(); return true }
  const chip = await page.$$('.chip-btn:not(:disabled):not(.correct)')
  if (chip.length) { await chip[Math.floor(Math.random() * chip.length)].click(); return true }
  const opt = await page.$$('.option-btn:not(:disabled):not(.correct):not(.dim)')
  if (opt.length) { await opt[Math.floor(Math.random() * opt.length)].click(); return true }
  return false
}

async function answerUntil(re, maxMs = 90000) {
  const t0 = Date.now()
  while (Date.now() - t0 < maxMs) {
    const text = await page.evaluate(() => document.body.innerText)
    if (re.test(text)) return true
    await answerOnce()
    await sleep(400)
  }
  return false
}

const bodyText = () => page.evaluate(() => document.body.innerText)

// 1. NameGate
await page.goto(BASE + '/', { waitUntil: 'networkidle0' })
await sleep(500)
let text = await bodyText()
ok('NameGate 显示欢迎语', text.includes('勇敢的冒险家，你叫什么名字？'))

// 2. 昵称 → 首页
await page.type('.namegate-input', '小勇士测试')
await page.click('.namegate-card .btn-primary')
await sleep(600)
text = await bodyText()
ok('首页显示昵称/XP/金币/进度/连续学习', text.includes('小勇士测试') && text.includes('XP') && text.includes('金币') && text.includes('冒险进度') && text.includes('连续学习'))

// 3. 地图:40 关 10 Boss
await page.goto(BASE + '/#map'); await sleep(600)
const levelCount = await page.$$eval('.level-node', (els) => els.length)
const bossCount = await page.$$eval('.level-node.boss', (els) => els.length)
ok('地图 40 关 / 10 Boss', levelCount === 40 && bossCount === 10, `${levelCount}/${bossCount}`)

// 4. 学习营三步:微课 → 例题 → 练习
await page.goto(BASE + '/#lesson-1')
text = await (async () => { const t0 = Date.now(); while (Date.now() - t0 < 8000) { const t = await bodyText(); if (t.includes('学习营')) return t; await sleep(300) } return bodyText() })()
ok('微课打开(第1章 新手村)', text.includes('新手村'))
ok('微课显示自动播放提示', text.includes('自动播放'))
// 跳过微课
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.innerText.includes('跳过微课'))?.click())
await sleep(500)
text = await bodyText()
ok('例题步骤:宠物老师示范', text.includes('宠物老师') || text.includes('看我的示范'))
// 3 道例题逐个过
for (let i = 0; i < 3; i++) {
  await page.evaluate(() => [...document.querySelectorAll('.example-wrap .btn-primary')].at(-1)?.click())
  await sleep(400)
}
text = await bodyText()
ok('例题后进入练习', text.includes('连词成句') || text.includes('听一听') || text.includes('看图片') || text.includes('发音小侦探') || text.includes('选词填空'))
// 练习 5 题答完
const quizDone = await answerUntil(/学习营完成/, 60000)
ok('练习 5 题可完成(含句型/语音题)', quizDone)
await sleep(400)

// 5. 战斗第 1 关(含新题型)
await page.goto(BASE + '/#level-1'); await sleep(800)
text = await bodyText()
ok('战斗页打开(咕噜蜗牛)', text.includes('咕噜蜗牛'))
const battleWin = await answerUntil(/战斗胜利/, 120000)
ok('战斗通关(单词+句型混合)', battleWin)
await sleep(2200)
const after1 = await page.evaluate(() => JSON.parse(localStorage.getItem('english-adventure-save-v3') || '{}'))
ok('进度写入:completed=[1] unlocked=2', after1.completed?.includes(1) && after1.unlocked >= 2, `completed=${JSON.stringify(after1.completed)}`)
ok('奖励到账 +50XP +金币', (after1.xp || 0) >= 60 && (after1.coins || 0) >= 38, `xp=${after1.xp} coins=${after1.coins}`)

// 6. 盲盒/宠物小窝回归
await page.goto(BASE + '/#gacha'); await sleep(500)
const pullDisabled = await page.$eval('.gacha-machine-card .btn-primary', (b) => b.disabled).catch(() => null)
ok('盲盒金币不足时禁用', pullDisabled === (after1.coins < 60))
await page.goto(BASE + '/#pets'); await sleep(800)
const petOk = (await page.$('.pet-stage')) && ((await page.$('.pet2d')) || (await page.$$eval('canvas', (e) => e.length)) >= 1)
ok('宠物小窝打开(2D/3D 宠物渲染)', Boolean(petOk))

// 7. Boss 战(level-10,第3章 mixed:含 respond/cloze/pic/spell/phonics)
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('english-adventure-save-v3'))
  s.completed = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  s.unlocked = 10
  s.lessonsDone = [1, 2, 3]
  localStorage.setItem('english-adventure-save-v3', JSON.stringify(s))
})
await page.reload({ waitUntil: 'networkidle0' }); await sleep(800)
await page.goto(BASE + '/#level-10'); await sleep(900)
text = await bodyText()
ok('BOSS 战打开(魔法发音森林 Boss)', text.includes('BOSS') && text.includes('音素蝙蝠'))
// 期间记录出现过的题型
const seenTypes = new Set()
const winBoss = await (async () => {
  const t0 = Date.now()
  while (Date.now() - t0 < 150000) {
    const t = await bodyText()
    if (t.includes('战斗胜利')) return true
    if (t.includes('连词成句')) seenTypes.add('sentence')
    if (t.includes('发音小侦探')) seenTypes.add('phonics')
    if (t.includes('选词填空')) seenTypes.add('cloze')
    if (t.includes('正确的回答')) seenTypes.add('respond')
    if (t.includes('看图选句子')) seenTypes.add('pic')
    if (t.includes('拼出这个单词')) seenTypes.add('spell')
    if (t.includes('听一听')) seenTypes.add('listen')
    await answerOnce()
    await sleep(400)
  }
  return false
})()
ok('BOSS mixed 通关', winBoss)
ok('Boss 卷出现 ≥4 种题型', seenTypes.size >= 4, [...seenTypes].join(','))

// 8. 第 10 章学习营:阅读判断(tf)
await page.goto(BASE + '/#lesson-10'); await sleep(700)
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.innerText.includes('跳过微课'))?.click())
await sleep(400)
for (let i = 0; i < 3; i++) {
  await page.evaluate(() => [...document.querySelectorAll('.example-wrap .btn-primary')].at(-1)?.click())
  await sleep(400)
}
const readingSeen = await (async () => {
  const t0 = Date.now()
  while (Date.now() - t0 < 90000) {
    const t = await bodyText()
    if (t.includes('学习营完成')) return true
    if (t.includes('Love and Protect')) page.__sawReading = true
    await answerOnce()
    await sleep(400)
  }
  return false
})()
ok('第10章学习营含阅读短文+判断题并完成', readingSeen && page.__sawReading === true)

// 9. 未解锁拦截 + 刷新恢复
await page.goto(BASE + '/#level-23'); await sleep(600)
text = await bodyText()
ok('未解锁关卡被拦截', text.includes('还没解锁'))
await page.goto(BASE + '/#home'); await sleep(400)
await page.reload({ waitUntil: 'networkidle0' }); await sleep(900)
text = await bodyText()
ok('刷新后数据仍在', text.includes('小勇士测试'))

// 10. 无 JS 崩溃
ok('全程无页面 JS 错误', errors.length === 0, errors.slice(0, 3).join(' | '))

const passed = results.filter((r) => r.pass).length
console.log(`\n=== ${passed}/${results.length} 项通过 ===`)
await browser.close()
process.exit(passed === results.length ? 0 : 1)
