// 截图复现 v2:随机作答,题干一变就截图(每个题型恰好一张)
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'

const BASE = 'http://localhost:4173'
const OUT = 'shots'
fs.mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader', '--window-size=900,1400'],
})
const page = await browser.newPage()
await page.setViewport({ width: 900, height: 1500 })
let counter = 0
let lastPrompt = ''

const shotIfNew = async () => {
  const p = await page.evaluate(() => document.querySelector('.quiz-prompt')?.innerText || '')
  if (p && p !== lastPrompt) {
    lastPrompt = p
    counter++
    const name = `${String(counter).padStart(2, '0')}-${p.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').slice(0, 12)}`
    await page.screenshot({ path: `${OUT}/${name}.png` })
    console.log('📸', name)
  }
}

async function answerOnce() {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
  const st = await page.$$('.sentence-tile:not(:disabled):not(.used)')
  if (st.length) { await pick(st).click(); return }
  const sp = await page.$$('.spell-tile:not(:disabled):not(.used)')
  if (sp.length) { await pick(sp).click(); return }
  const tf = await page.$$('.tf-btn:not(:disabled)')
  if (tf.length) { await pick(tf).click(); return }
  const chip = await page.$$('.chip-btn:not(:disabled):not(.correct)')
  if (chip.length) { await pick(chip).click(); return }
  const opt = await page.$$('.option-btn:not(:disabled):not(.correct):not(.dim)')
  if (opt.length) { await pick(opt).click(); return }
}

async function runUntil(doneRe, maxMs) {
  const t0 = Date.now()
  while (Date.now() - t0 < maxMs) {
    await shotIfNew()
    const t = await page.evaluate(() => document.body.innerText)
    if (doneRe.test(t)) return true
    await answerOnce()
    await sleep(320)
  }
  return false
}

// 登录
await page.goto(BASE, { waitUntil: 'networkidle0' })
await sleep(800)
await page.type('.namegate-input', '截图' + String(Date.now()).slice(-4))
await page.click('.namegate-card .btn-primary')
await sleep(1200)

// ===== 1. 第5章学习营:例题 + 练习 =====
await page.goto(BASE + '#lesson-5'); await sleep(900)
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.innerText.includes('跳过微课'))?.click())
await sleep(300)
for (let i = 0; i < 3; i++) {
  const p = await page.evaluate(() => document.querySelector('.quiz-prompt')?.innerText || '')
  const name = `demo-${i + 1}-${p.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').slice(0, 10)}`
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('📸', name)
  await page.evaluate(() => [...document.querySelectorAll('.example-wrap .btn-primary')].at(-1)?.click())
  await sleep(300)
}
await runUntil(/学习营完成/, 60000)

// ===== 2. 第5章第1关战斗 =====
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('english-adventure-save-v3'))
  s.completed = [1, 2, 3, 4]; s.unlocked = 5; s.lessonsDone = [1, 2]
  localStorage.setItem('english-adventure-save-v3', JSON.stringify(s))
})
await page.reload({ waitUntil: 'networkidle0' }); await sleep(600)
lastPrompt = ''
await page.goto(BASE + '#level-5'); await sleep(900)
await runUntil(/战斗胜利/, 90000)

// ===== 3. Boss 第10关(可能含看图选句/情景应答) =====
await page.evaluate(() => {
  const s = JSON.parse(localStorage.getItem('english-adventure-save-v3'))
  s.completed = [1, 2, 3, 4, 5, 6, 7, 8, 9]; s.unlocked = 10; s.lessonsDone = [1, 2, 3]
  localStorage.setItem('english-adventure-save-v3', JSON.stringify(s))
})
await page.reload({ waitUntil: 'networkidle0' }); await sleep(600)
lastPrompt = ''
await page.goto(BASE + '#level-10'); await sleep(900)
await runUntil(/战斗胜利/, 120000)

await browser.close()
console.log('done, total', counter)
