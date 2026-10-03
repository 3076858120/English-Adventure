// 真实(非 headless)浏览器诊断:语音包、TTS 状态、控制台错误、按钮点击审计
import puppeteer from 'puppeteer-core'

const BASE = 'https://3076858120.github.io/English-Adventure/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: false,
  args: ['--no-sandbox', '--disable-gpu', '--window-size=1000,900', '--window-position=60,60'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1000, height: 900 })
const errors = []
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + String(e).slice(0, 200)))
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 200)) })

await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 })
await sleep(2500)

// 1. 语音包列表
const voices = await page.evaluate(() => new Promise((res) => {
  const collect = () => window.speechSynthesis.getVoices().map((v) => `${v.lang}|${v.name}`)
  const vs = collect()
  if (vs.length) return res(vs)
  window.speechSynthesis.onvoiceschanged = () => res(collect())
  setTimeout(() => res(collect()), 2500)
}))
console.log('== 系统语音包 ==')
voices.forEach((v) => console.log('  ', v))
const enVoices = voices.filter((v) => v.startsWith('en'))
console.log(`英语语音包: ${enVoices.length ? '有 (' + enVoices.length + ')' : '❌ 一个都没有'}`)

// 2. TTS 实测:调 speak 后 speechSynthesis 是否进入 speaking/pending
if (voices.length) {
  await page.evaluate(() => {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance('hello')
    u.lang = 'en-US'
    window.speechSynthesis.speak(u)
  })
  await sleep(700)
  const st = await page.evaluate(() => ({ speaking: window.speechSynthesis.speaking, pending: window.speechSynthesis.pending, paused: window.speechSynthesis.paused }))
  console.log('TTS 实测(en-US hello):', JSON.stringify(st))
}

// 3. 昵称进入 → 微课页按钮点击审计
const nick = '诊断' + String(Date.now()).slice(-4)
const hasGate = await page.$('.namegate-input')
if (hasGate) {
  await page.type('.namegate-input', nick)
  await page.click('.namegate-card .btn-primary')
  await sleep(1500)
}
await page.goto(BASE + '#lesson-5'); await sleep(2500)

const audit = async (sel) => page.evaluate((s) => {
  const el = [...document.querySelectorAll(s)].find((b) => !b.disabled)
  if (!el) return null
  const r = el.getBoundingClientRect()
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return { text: el.innerText.slice(0, 14), covered: hit ? !(el === hit || el.contains(hit) || hit.contains(el)) : 'offscreen', hitTag: hit ? hit.tagName + '.' + String(hit.className).slice(0, 30) : null }
}, sel)

console.log('== 微课按钮点击命中审计 ==')
console.log('  下一个:', JSON.stringify(await audit('.teach-controls .btn-primary')))
console.log('  上一个:', JSON.stringify(await audit('.teach-controls .btn-ghost')))
// 实际点击验证响应
const before = await page.evaluate(() => document.querySelector('.header-stats')?.innerText)
await page.click('.teach-controls .btn-primary'); await sleep(400)
const after = await page.evaluate(() => document.querySelector('.header-stats')?.innerText)
console.log(`  点"下一个"页码变化: ${before} -> ${after} ${before !== after ? '✅' : '❌'}`)

// 4. 宠物小窝 overlay 审计(远端改动过)
await page.goto(BASE + '#pets'); await sleep(2000)
console.log('== PetRoom 按钮命中审计 ==')
for (const sel of ['.tab-btn', '.petroom-tabs .tab-btn:nth-child(3)']) {
  console.log('  ', sel, JSON.stringify(await audit(sel)))
}
const allTabs = await page.evaluate(() => [...document.querySelectorAll('.tab-btn')].map((b) => {
  const r = b.getBoundingClientRect()
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return b.innerText.slice(0, 4) + ':' + ((hit && (b === hit || b.contains(hit))) ? 'ok' : 'BLOCKED by ' + (hit ? hit.tagName + '.' + String(hit.className).slice(0, 24) : 'null'))
}))
console.log('  tabs:', JSON.stringify(allTabs))

// 5. 首页按钮审计
await page.goto(BASE + '#home'); await sleep(1200)
console.log('== Home 按钮命中审计 ==')
const homeBtns = await page.evaluate(() => ['button'].flatMap((t) => [...document.querySelectorAll(t)]).slice(0, 8).map((b) => {
  const r = b.getBoundingClientRect()
  if (!r.width) return null
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return b.innerText.slice(0, 8) + ':' + ((hit && (b === hit || b.contains(hit))) ? 'ok' : 'BLOCKED(' + hit?.className?.slice?.(0, 20) + ')')
}).filter(Boolean))
console.log(JSON.stringify(homeBtns))

console.log('\n== 页面错误 ==')
console.log(errors.length ? errors.join('\n') : '无')
await browser.close()
