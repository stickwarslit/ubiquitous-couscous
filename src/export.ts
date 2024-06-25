import ExcelJS from 'exceljs';
import { prisma } from './prisma';

const columnKeys = [
  'event',
  'circleName',
  'penName',
  'booth',
  'links',
] as const;

type Column = (typeof columnKeys)[number];

const columns: Record<
  Column,
  {
    name: string;
    width: number;
    style?: Partial<ExcelJS.Style>;
  }
> = {
  event: {
    name: 'Event',
    width: 15,
  },
  circleName: {
    name: 'Circle Name',
    width: 30,
  },
  penName: {
    name: 'Pen Name',
    width: 50,
  },
  booth: {
    name: 'Booth',
    width: 15,
  },
  links: {
    name: 'Links',
    width: 60,
    style: { alignment: { wrapText: true } },
  },
};

export async function createExport() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('All');

  sheet.columns = Object.entries(columns).map(([key, info]) => ({
    key,
    header: info.name,
    width: info.width,
    style: info.style,
  }));

  const events = await prisma.event.findMany({
    select: { id: true, tag: true },
  });

  for (const event of events) {
    await appendEvent(sheet, event);
  }

  return workbook;
}

async function appendEvent(
  allSheet: ExcelJS.Worksheet,
  event: { id: number; tag: string }
) {
  const circles = await prisma.circleEventInfo.findMany({
    where: { eventId: event.id },
    include: { links: true },
  });

  for (const circle of circles) {
    allSheet.addRow({
      event: event.tag,
      circleName: circle.name,
      penName: circle.penname,
      booth: circle.booth,
      links: circle.links.map((link) => link.url).join('\n'),
    } satisfies Record<Column, string>);
  }
}
