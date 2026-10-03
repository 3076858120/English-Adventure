import puppeteer from 'puppeteer-core'
const BASE = 'http://localhost:4173'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader'],
})
const page = await browser.newPage()
await page.setViewport({ width: 900, height: 1500 })
page.on('pageerror', (e) => console.log('PAGEERROR:', String(e).slice(0, 200)))
const bodyText = () => page.evaluate(() => document.body.innerText)
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
await page.goto(BASE, { waitUntil: 'networkidle0' }); await sleep(800)
await page.type('.namegate-input', '调试' + String(Date.now()).slice(-4))
await page.click('.namegate-card .btn-primary'); await sleep(1200)
await page.goto(BASE + '/#lesson-10'); await sleep(900)
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.innerText.includes('跳过微课'))?.click())
await sleep(300)
for (let i = 0; i < 3; i++) {
  await page.evaluate(() => [...document.querySelectorAll('.example-wrap .btn-primary')].at(-1)?.click())
  await sleep(300)
}
// 快速把 quiz 答完
for (let i = 0; i < 150; i++) {
  const t = await bodyText()
  if (t.includes('An animal card')) { console.log('card 出现 @quiz轮', i); break }
  await answerOnce(); await sleep(300)
}
// 卡片交互逐轮打印
for (let r = 0; r < 40; r++) {
  const t = await bodyText()
  if (t.includes('学习营完成')) { console.log('>>> 学习营完成!'); break }
  const animal = await page.$('.card-animal')
  if (animal) { console.log(`[${r}] 点动物`); await animal.click(); await sleep(300); continue }
  const chips = await page.$$('.animal-card .chip-btn')
  console.log(`[${r}] chips=${chips.length} | 片段:`, (t.match(/What they can do[^\n]*\n?[^\n]*/) || [''])[0].slice(0, 60))
  if (chips.length) { await chips[Math.floor(Math.random() * chips.length)].click(); await sleep(300); continue }
  const doneBtn = await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.innerText.includes('完成卡片')) || null)
  if (doneBtn) { console.log(`[${r}] 点完成卡片`); await doneBtn.click(); await sleep(500); continue }
  console.log(`[${r}] 无可点元素!`)
  await sleep(300)
}
await browser.close()
