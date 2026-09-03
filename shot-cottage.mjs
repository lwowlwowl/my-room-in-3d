import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--use-gl=angle', '--use-angle=metal', '--ignore-gpu-blocklist', '--no-sandbox', '--window-size=1440,900', '--enable-unsafe-swiftshader'],
})

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
page.on('pageerror', (e) => console.log('ERR:', e.message))
await page.goto('http://localhost:5177/', { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise((r) => setTimeout(r, 12000))

await page.screenshot({ path: 'shot-day.png' })
console.log('base view saved')

// click the three signpost boards (CSS coords in the default camera view)
await page.mouse.click(1094, 353)   // MY WORK
await new Promise((r) => setTimeout(r, 2500))
await page.screenshot({ path: 'shot-modal-work.png' })
console.log('work modal saved')

await page.mouse.click(8, 8)        // close via backdrop
await new Promise((r) => setTimeout(r, 1500))

await page.mouse.click(1105, 382)   // ABOUT
await new Promise((r) => setTimeout(r, 2500))
await page.screenshot({ path: 'shot-modal-about.png' })
console.log('about modal saved')

await page.mouse.click(8, 8)
await new Promise((r) => setTimeout(r, 1500))

await page.mouse.click(1103, 415)   // CONTACT
await new Promise((r) => setTimeout(r, 2500))
await page.screenshot({ path: 'shot-modal-contact.png' })
console.log('contact modal saved')

await browser.close()
