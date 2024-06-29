import { closeBrowser, withPage } from './src/browser';
import { createExport } from './src/export';
import { prisma } from './src/prisma';
import { scrapeVomaUrl } from './src/voma-scrape';
import { scrapeVoparaUrl } from './src/vopara-scrape';

const VOMA_CIRCLE_LISTS = [
  'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm55',
  'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm54',
  'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm53',
  'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm52',
  'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm51',
  'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm50',
  'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm49',
  'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm48',
  'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm47',
  'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm46',
  'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm45',
  'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm44',
  'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm43',
  'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm42',
  'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm41',
  'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm40',
  'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm39',
  'https://ketto.xsrv.jp/html/mimiken/clist.cgi?tvm38',
];

const VOPARA_CIRCLE_LISTS = [
  'https://ttc.ninja-web.net/vo-para/vo-para13_list.htm',
  'https://ttc.ninja-web.net/vo-para/vo-para12_list.htm',
  'https://ttc.ninja-web.net/vo-para/vo-para11_list.htm',
  'https://ttc.ninja-web.net/vo-para/vo-para10_list.htm',
  'https://ttc.ninja-web.net/vo-para/vo-para09_list.htm',
  'https://ttc.ninja-web.net/vo-para/vo-para08_list.htm',
  'https://ttc.ninja-web.net/vo-para/vo-para07_list.htm',
  'https://ttc.ninja-web.net/vo-para/vo-para06_list.htm',
  'https://ttc.ninja-web.net/vo-para/vo-para05_list.htm',
  'https://ttc.ninja-web.net/vo-para/vo-para04_list.htm',
  'https://ttc.ninja-web.net/vo-para/vo-para03_list.htm',
  'https://ttc.ninja-web.net/vo-para/vo-para02_list.htm',
  'https://ttc.ninja-web.net/vo-para/vo-para_list.htm',
];

async function main() {
  for (const url of VOMA_CIRCLE_LISTS) {
    console.log('Scraping Voma URL:', url);
    await scrapeVomaUrl(url);
  }
  for (const url of VOPARA_CIRCLE_LISTS) {
    console.log('Scraping Vopara URL:', url);
    await scrapeVoparaUrl(url);
  }

  console.log('Creating export');
  const workbook = await createExport();

  const data = await workbook.xlsx.writeBuffer();

  await Bun.write('output.xlsx', data);
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
