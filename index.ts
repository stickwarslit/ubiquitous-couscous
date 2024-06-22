import { closeBrowser, withPage } from "./src/browser"

const url = 'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm55'

await withPage(async (page) => {
    await page.goto(url, { waitUntil: 'networkidle0' })
    await page.waitForSelector('center > table', { visible: true })
    const text = await page.$eval('html', (el) => el.innerHTML)
    await Bun.write('./test.html', text)
})

await closeBrowser()
