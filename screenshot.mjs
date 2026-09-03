import puppeteer from 'puppeteer-core'

// NOTE: runs headless so mouse coordinates are exact (headed mode on macOS
// displaces input by the window-chrome height, making clicks unreliable).
const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  args: ['--use-gl=angle', '--use-angle=metal', '--ignore-gpu-blocklist', '--no-sandbox', '--window-size=1440,900', '--enable-unsafe-swiftshader'],
})

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 })
await page.goto('http://localhost:5175/', { waitUntil: 'networkidle0', timeout: 30000 })
await new Promise((r) => setTimeout(r, 9000))

// Overview
await page.screenshot({ path: 'shot-overview.png' })
console.log('overview')

// Click computer (Projects) — verified hit points, headless-exact
await page.mouse.click(800, 390)
await new Promise((r) => setTimeout(r, 2600))
await page.screenshot({ path: 'shot-computer.png' })
console.log('computer')

await page.keyboard.press('Escape')
await new Promise((r) => setTimeout(r, 2000))

// Click mailbox on the desk (Contact)
await page.mouse.click(825, 465)
await new Promise((r) => setTimeout(r, 2600))
await page.screenshot({ path: 'shot-contact.png' })
console.log('contact')

await page.keyboard.press('Escape')
await new Promise((r) => setTimeout(r, 2000))

// Click medicine cabinet on the back wall (Hobbies)
await page.mouse.click(825, 195)
await new Promise((r) => setTimeout(r, 2600))
await page.screenshot({ path: 'shot-hobbies.png' })
console.log('hobbies')

await browser.close()
