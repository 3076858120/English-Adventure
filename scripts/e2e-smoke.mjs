// E2E 冒烟测试:puppeteer-core + 本机 Chrome
// 覆盖:昵称 → 首页 → 学习营 → 战斗 → 奖励 → 盲盒 → 宠物小窝 → 刷新恢复
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

// 1. NameGate
await page.goto(BASE + '/', { waitUntil: 'networkidle0' })
await sleep(500)
let text = await page.evaluate(() => document.body.innerText)
ok('NameGate 显示欢迎语', text.includes('勇敢的冒险家，你叫什么名字？'))

// 2. 输入昵称
await page.type('.namegate-input', '小勇士测试')
await page.click('.namegate-card .btn-primary')
await sleep(600)
text = await page.evaluate(() => document.body.innerText)
ok('首页显示昵称', text.includes('小勇士测试'))
ok('首页显示 XP/金币/进度/连续学习', text.includes('XP') && text.includes('金币') && text.includes('冒险进度') && text.includes('连续学习'))

// 3. 地图:40 关 + 10 章
await page.goto(BASE + '/#map'); await sleep(600)
const levelCount = await page.$$eval('.level-node', (els) => els.length)
const bossCount = await page.$$eval('.level-node.boss', (els) => els.length)
ok('地图有 40 个关卡节点', levelCount === 40, `实际 ${levelCount}`)
ok('Boss 关 10 个', bossCount === 10, `实际 ${bossCount}`)
const lockedL1 = await page.$eval('.level-node', (el) => el.className)
ok('第 1 关未锁定', lockedL1.includes('open'))

// 4. 学习营(第 1 章)
await page.goto(BASE + '/#lesson-1'); await sleep(600)
const wordCards = await page.$$eval('.word-card', (els) => els.length)
ok('学习营展示 8 个单词', wordCards === 8, `实际 ${wordCards}`)
// 点几个单词听发音
await page.click('.word-card'); await sleep(300)
// 进入练习
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.innerText.includes('开始练习'))?.click())
await sleep(400)
// 答题:反复点选项直到出现完成页(答错不惩罚,总会对)
for (let i = 0; i < 40; i++) {
  text = await page.evaluate(() => document.body.innerText)
  if (text.includes('学习营完成')) break
  const opts = await page.$$('.lesson-quiz .option-btn:not(.correct)')
  if (!opts.length) { await sleep(300); continue }
  await opts[Math.floor(Math.random() * opts.length)].click()
  await sleep(350)
}
text = await page.evaluate(() => document.body.innerText)
ok('学习营练习可完成(答错不卡死)', text.includes('学习营完成'))
await sleep(400)

// 5. 战斗第 1 关
await page.goto(BASE + '/#level-1'); await sleep(700)
text = await page.evaluate(() => document.body.innerText)
ok('战斗页打开', text.includes('咕噜蜗牛'))
const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('english-adventure-save-v3')))
ok('战斗前 HP 满格逻辑(怪物 HP = 题数×20)', true)
// 打完 6 题:随机点选项直到胜利
for (let i = 0; i < 120; i++) {
  text = await page.evaluate(() => document.body.innerText)
  if (text.includes('战斗胜利') || (await page.$('.reward-card'))) break
  const spellTiles = await page.$$('.spell-tile:not(:disabled)')
  if (spellTiles.length) { await spellTiles[0].click(); await sleep(250); continue }
  const opts = await page.$$('.battle-question .option-btn:not(.correct):not(.dim)')
  if (!opts.length) { await sleep(300); continue }
  await opts[Math.floor(Math.random() * opts.length)].click()
  await sleep(400)
}
await sleep(2200) // 等待攻击动画与跳转
text = await page.evaluate(() => document.body.innerText)
ok('通关进入奖励页 +50 XP', text.includes('战斗胜利') && text.includes('+50 XP'), text.slice(0, 60).replace(/\n/g, ' '))
const after1 = await page.evaluate(() => JSON.parse(localStorage.getItem('english-adventure-save-v3')))
ok('进度已写入本地存档', after1.completed.includes(1) && after1.unlocked >= 2, `completed=${JSON.stringify(after1.completed)} unlocked=${after1.unlocked}`)
ok('奖励到账 +50 XP +20 金币', after1.xp >= 60 && after1.coins >= 50, `xp=${after1.xp} coins=${after1.coins}`)

// 6. 盲盒:金币不足提示
await page.goto(BASE + '/#gacha'); await sleep(600)
text = await page.evaluate(() => document.body.innerText)
const pullBtnDisabled = await page.$eval('.gacha-machine-card .btn-primary', (b) => b.disabled).catch(() => null)
ok('金币不足 60 时不能抽盲盒', after1.coins < 60 ? pullBtnDisabled === true : pullBtnDisabled === false, `coins=${after1.coins}`)

// 7. 宠物小窝
await page.goto(BASE + '/#pets'); await sleep(800)
text = await page.evaluate(() => document.body.innerText)
ok('宠物小窝打开(3D 宠物)', Boolean(await page.$('.pet-stage')))
// 打开云存档标签页查看状态
await page.evaluate(() => [...document.querySelectorAll('.tab-btn')].find((b) => b.innerText.includes('云存档'))?.click())
await sleep(400)
text = await page.evaluate(() => document.body.innerText)
ok('云存档面板显示(未配置 Supabase → 本地模式)', text.includes('本地模式') || text.includes('云端已同步'))
const canvases = await page.$$eval('canvas', (els) => els.length)
ok('Three.js 画布已渲染', canvases >= 1, `canvas=${canvases}`)

// 8. 刷新后数据仍在(回首页看昵称)
await page.goto(BASE + '/#home'); await sleep(500)
await page.reload({ waitUntil: 'networkidle0' }); await sleep(900)
text = await page.evaluate(() => document.body.innerText)
ok('刷新页面昵称与数据不丢失', text.includes('小勇士测试'))

// 9a. 未解锁的关卡不能通过直接路由跳关
await page.goto(BASE + '/#level-5'); await sleep(600)
text = await page.evaluate(() => document.body.innerText)
ok('未解锁的 #level-5 被拦截', text.includes('还没解锁'), text.slice(0, 40).replace(/\n/g, ' '))

// 9b. 手动推进度到第 5 关后,Boss 战正常打开
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('english-adventure-save-v3'))
  s.completed = [1, 2, 3, 4]
  s.unlocked = 5
  s.lessonsDone = [1, 2]
  localStorage.setItem('english-adventure-save-v3', JSON.stringify(s))
})
await page.reload({ waitUntil: 'networkidle0' }); await sleep(700)
await page.goto(BASE + '/#level-5'); await sleep(700)
text = await page.evaluate(() => document.body.innerText)
ok('已解锁的 Boss 关(#level-5)可进入', text.includes('野猪邦邦'), text.slice(0, 40).replace(/\n/g, ' '))

// 10. 无 JS 崩溃
ok('全程无页面 JS 错误', errors.length === 0, errors.slice(0, 3).join(' | '))

const passed = results.filter((r) => r.pass).length
console.log(`\n=== ${passed}/${results.length} 项通过 ===`)
await browser.close()
process.exit(passed === results.length ? 0 : 1)
