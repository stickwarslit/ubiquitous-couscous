import { closeBrowser, withPage } from './src/browser';
import { prisma } from './src/prisma';
import { scrapeVomaUrl } from './src/voma-scrape';

const VOMA_CIRCLE_LISTS = [
  'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm55',
];

async function main() {
  for (const url of VOMA_CIRCLE_LISTS) {
    await scrapeVomaUrl(url);
  }
}

try {
  await main();
  await prisma.$disconnect();
} catch (e) {
  console.error(e);
} finally {
  await prisma.$disconnect();
  await closeBrowser();
}
