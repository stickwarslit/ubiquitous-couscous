import { PrismaClient } from "@prisma/client"
import { closeBrowser, withPage } from "./src/browser"

const VOMA_CIRCLE_LISTS = [
'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm55'
]

const prisma = new PrismaClient()

async function main() {
    for (const url of VOMA_CIRCLE_LISTS) {
        await withPage(async (page) => {
            await page.goto(url, { waitUntil: 'networkidle0' })
            await page.waitForSelector('center > table', { visible: true })
            const html = await page.$eval('html', (el) => el.outerHTML)

            await prisma.htmlScrape.create({
                data: {
                    html,
                    url
                }
            })

        })
    }
}

try {
    await main()
    await prisma.$disconnect()
} catch (e) {
    console.error(e)
} finally {
    await prisma.$disconnect()
    await closeBrowser()
}
