// 线上站点终检:github.io 域名下 React 挂载 + Supabase 云端同步(真实浏览器)
import puppeteer from 'puppeteer-core'

const BASE = 'https://3076858120.github.io/English-Adventure/'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitText(page, re, timeout = 15000) {
  const t0 = Date.now()
  let text = ''
  while (Date.now() - t0 < timeout) {
    text = await page.evaluate(() => document.body.innerText)
    if (re.test(text)) return text
    await sleep(400)
  }
  return text
}

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu'],
})
const page = await browser.newPage()
await page.setViewport({ width: 900, height: 1400 })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
const results = []
const ok = (name, cond, extra = '') => {
  results.push(Boolean(cond))
  console.log(`${cond ? '✅' : '❌'} ${name}${extra ? ' — ' + extra : ''}`)
}

await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 60000 })
let text = await waitText(page, /勇敢的冒险家|冒险进度/)
ok('线上站点打开且 React 挂载', /勇敢的冒险家|冒险进度/.test(text), text.slice(0, 24).replace(/\n/g, ' '))

if (text.includes('勇敢的冒险家')) {
  const nick = '云端小英雄' + String(Date.now()).slice(-4)
  await page.type('.namegate-input', nick)
  await page.click('.namegate-card .btn-primary')
  text = await waitText(page, /云端已同步|本地模式/)
  ok('首页昵称显示', text.includes(nick))
  ok('云端徽章=已同步(github.io 直连 Supabase OK)', text.includes('云端已同步'), (text.match(/(云端已同步|本地模式[^\n]*)/) || [''])[0])

  // PetRoom 云存档面板:手动同步验证 upsert
  await page.goto(BASE + '#pets')
  await waitText(page, /宠物小窝/)
  await page.evaluate(() => [...document.querySelectorAll('.tab-btn')].find((b) => b.innerText.includes('云存档'))?.click())
  await sleep(400)
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.innerText.includes('立即同步'))?.click())
  text = await waitText(page, /已同步到云端|云端不可用|仍保存在本机/, 10000)
  ok('「立即同步」= 已同步到云端(upsert OK)', text.includes('已同步到云端'), (text.match(/(已同步到云端|云端不可用[^\n]*|仍保存在本机)/) || [''])[0])

  // 刷新后数据仍在
  await page.reload({ waitUntil: 'networkidle2' })
  await page.goto(BASE + '#home')
  text = await waitText(page, new RegExp(nick + '|勇敢的冒险家'))
  ok('刷新后昵称仍在', text.includes(nick))
}

ok('全程无 JS 错误', errors.length === 0, errors.slice(0, 2).join(' | '))
console.log(`=== ${results.filter(Boolean).length}/${results.length} 项通过 ===`)
await browser.close()
process.exit(results.every(Boolean) ? 0 : 1)
