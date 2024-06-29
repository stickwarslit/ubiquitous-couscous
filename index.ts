import { closeBrowser, withPage } from './src/browser';
import { createExport } from './src/export';
import { prisma } from './src/prisma';
import { scrapeVomaUrl } from './src/voma-scrape';
import { scrapeVoparaUrl } from './src/vopara-scrape';

const VOMA_CIRCLE_LISTS = [
  'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm55',
];

const VOPARA_CIRCLE_LISTS = [
  'https://ttc.ninja-web.net/vo-para/vo-para13_list.htm',
];

async function main() {
  for (const url of VOMA_CIRCLE_LISTS) {
    await scrapeVomaUrl(url);
  }

  const workbook = await createExport();

  const data = await workbook.xlsx.writeBuffer();

  await Bun.write('output.xlsx', data);
}

async function main1() {
  for (const url of VOPARA_CIRCLE_LISTS) {
    await scrapeVoparaUrl(url);
  }
}

try {
  await main1();
  await prisma.$disconnect();
} catch (e) {
  console.error(e);
} finally {
  await prisma.$disconnect();
  await closeBrowser();
}
