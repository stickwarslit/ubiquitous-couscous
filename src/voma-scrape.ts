import { prisma } from './prisma';
import { JSDOM } from 'jsdom';
import { withPage } from './browser';
import { EventSeries } from './event-series';
import assert from 'node:assert';

export async function scrapeVomaUrl(url: string) {
  const webPage = await getOrFetchVomaPageHTML(url);

  const dom = new JSDOM(webPage.html);
  const document = dom.window.document;

  const title =
    document.querySelector('center > font:nth-child(1)')?.textContent ?? '';
  const vomaNumber = title?.match(/THE VOC＠LOiD 超 M＠STER (\d+)/)?.[1];
  const eventTag = `ボーマス${vomaNumber}`;

  if (!title || !vomaNumber) {
    console.log({ title, vomaNumber, url });
    process.exit(1);
  }

  const event = await prisma.event.upsert({
    where: { tag: eventTag },
    create: {
      tag: eventTag,
      title,
      webPage: { connect: { id: webPage.id } },
      series: EventSeries.Voma,
    },
    update: {},
  });

  const circleList = [
    ...document.querySelectorAll('center > table > tbody > tr'),
  ].filter(($tr) => !$tr.textContent?.includes('サークル名'));

  const circlesFormatted = circleList.map(($tr, i) => {
    try {
      const rowCells = $tr.querySelectorAll('td');
      const name = rowCells[2].textContent;
      const penname = rowCells[3].textContent;
      const booth = rowCells[4].textContent;

      assert(name);
      assert(penname);
      assert(booth);

      const links = [...$tr.querySelectorAll('a')]
        .map(($a) => $a.href)
        .filter((href) => href.includes('http'));
      return { name, penname, booth, links };
    } catch (e) {
      console.error(e);
      console.log({ html: $tr.outerHTML, text: $tr.textContent, i });
      process.exit(1);
    }
  });

  for (const circle of circlesFormatted) {
    const { name, penname, booth, links } = circle;

    await prisma.circleEventInfo.upsert({
      where: { eventCircle: { name, eventId: event.id } },
      create: {
        name,
        penname,
        booth,
        event: { connect: { id: event.id } },
        links: { create: links.map((url) => ({ url })) },
      },
      update: {},
    });
  }
}

async function getOrFetchVomaPageHTML(url: string) {
  const webPage = await prisma.webPage.findFirst({ where: { url } });

  if (webPage) {
    return webPage;
  }

  const html = await fetchVomaPageHTML(url);
  return await prisma.webPage.create({
    data: {
      html,
      url,
    },
  });
}

async function fetchVomaPageHTML(url: string) {
  return await withPage(async (page) => {
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.waitForSelector('center > table', { visible: true });
    const html = await page.$eval('html', (el) => el.outerHTML);
    return html;
  });
}
