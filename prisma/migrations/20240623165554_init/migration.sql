-- CreateTable
CREATE TABLE "WebPage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "html" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "webPageId" INTEGER NOT NULL,
    "tag" TEXT NOT NULL,
    CONSTRAINT "Event_webPageId_fkey" FOREIGN KEY ("webPageId") REFERENCES "WebPage" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CircleEventInfo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "penname" TEXT NOT NULL,
    "booth" TEXT NOT NULL,
    "eventId" INTEGER NOT NULL,
    CONSTRAINT "CircleEventInfo_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CircleEventInfoLink" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "circleEventInfoId" INTEGER NOT NULL,
    CONSTRAINT "CircleEventInfoLink_circleEventInfoId_fkey" FOREIGN KEY ("circleEventInfoId") REFERENCES "CircleEventInfo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_tag_key" ON "Event"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "CircleEventInfo_eventId_name_key" ON "CircleEventInfo"("eventId", "name");
