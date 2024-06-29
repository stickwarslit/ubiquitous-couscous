import { prisma } from './prisma';
import { JSDOM } from 'jsdom';
import { withPage } from './browser';
import { EventSeries } from './event-series';
import assert from 'node:assert';

const FIRST_VOPARA_URL = 'https://ttc.ninja-web.net/vo-para/vo-para_list.htm';

export async function scrapeVoparaUrl(url: string) {
  const webPage = await getOrFetchVoparaPageHTML(url);

  const dom = new JSDOM(webPage.html);
  const document = dom.window.document;

  const title =
    document.querySelector('body > p:nth-of-type(1)')?.textContent ?? '';
  const number =
    url === FIRST_VOPARA_URL
      ? '01'
      : title?.match(/ボーパラ(\d+)/)?.[1] ??
        url.match(/vo-para(\d+)_list/)?.[1];
  const eventTag = `ボーパラ${number}`;

  if (!title || !eventTag) {
    console.log({ title, eventTag, url });
    process.exit(1);
  }

  const event = await prisma.event.upsert({
    where: { tag: eventTag },
    create: {
      tag: eventTag,
      title,
      webPage: { connect: { id: webPage.id } },
      series: EventSeries.Vopara,
    },
    update: {},
  });

  const circleList = [
    ...document.querySelectorAll('body > table > tbody > tr'),
  ].filter(($tr) => {
    const text = $tr.textContent ?? '';
    return (
      !text.includes('サークル名') &&
      $tr.children.length > 1 &&
      !text.includes('AHSストア') &&
      text.trim() !== ''
    );
  });

  const circlesFormatted = circleList.map(($tr, i) => {
    try {
      const rowCells = $tr.querySelectorAll('td');
      const name = rowCells[0].textContent;
      const penname = rowCells[1].textContent;
      const booth = rowCells[rowCells.length - 1].textContent;

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

async function getOrFetchVoparaPageHTML(url: string) {
  const webPage = await prisma.webPage.findFirst({ where: { url } });

  if (webPage) {
    return webPage;
  }

  const html = await fetchVoparaPageHTML(url);
  return await prisma.webPage.create({
    data: {
      html,
      url,
    },
  });
}

async function fetchVoparaPageHTML(url: string) {
  return await withPage(async (page) => {
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.waitForSelector('body > table:nth-of-type(2)', {
      visible: true,
    });
    const html = await page.$eval('html', (el) => el.outerHTML);
    return html;
  });
}
