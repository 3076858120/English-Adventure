import puppeteer from 'puppeteer-core'
const BASE = 'http://localhost:4173'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader'],
})
const page = await browser.newPage()
await page.setViewport({ width: 900, height: 1200 })
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
await page.type('.namegate-input', '截图' + String(Date.now()).slice(-4))
await page.click('.namegate-card .btn-primary'); await sleep(1200)
await page.goto(BASE + '/#lesson-10'); await sleep(900)
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.innerText.includes('跳过微课'))?.click())
await sleep(300)
await page.screenshot({ path: 'shots/writing-animals.png' })
await page.evaluate(() => [...document.querySelectorAll('.card-animal')][0]?.click())
await sleep(400)
await page.screenshot({ path: 'shots/writing-card.png' })
// 填满
for (let r = 0; r < 30; r++) {
  const chips = await page.$$('.animal-card .chip-btn')
  if (!chips.length) break
  await chips[Math.floor(Math.random() * chips.length)].click()
  await sleep(250)
}
await page.screenshot({ path: 'shots/writing-done.png' })
await browser.close()
console.log('ok')
