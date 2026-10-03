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
const prompt = () => page.evaluate(() => document.querySelector('.quiz-prompt')?.innerText || '(no-prompt)')

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
console.log('进入练习,开始逐题...')
for (let i = 0; i < 100; i++) {
  const p = await prompt()
  const step = await page.evaluate(() => document.querySelector('.header-stats')?.innerText || '')
  console.log(`[${i}] step=${step} prompt=${p}`)
  const t = await bodyText()
  if (t.includes('学习营完成')) { console.log('>>> 学习营完成'); break }
  if (t.includes('An animal card')) {
    console.log('>>> 写作卡出现!')
    const animal = await page.$('.card-animal')
    console.log('animal btn:', !!animal)
    break
  }
  await answerOnce()
  await sleep(500)
}
await browser.close()
