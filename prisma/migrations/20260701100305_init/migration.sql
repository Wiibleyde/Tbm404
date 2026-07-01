-- CreateEnum
CREATE TYPE "TransportMode" AS ENUM ('TRAM', 'BUS', 'BOAT', 'OTHER');

-- CreateEnum
CREATE TYPE "InfoChannel" AS ENUM ('PERTURBATION', 'INFORMATION');

-- CreateEnum
CREATE TYPE "IncidentCategory" AS ENUM ('UNPLANNED', 'PLANNED_WORKS', 'RECURRING', 'INFORMATION');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('MINOR', 'MAJOR', 'CRITICAL');

-- CreateTable
CREATE TABLE "Line" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "longName" TEXT,
    "mode" "TransportMode" NOT NULL,
    "color" TEXT,
    "textColor" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "channel" "InfoChannel" NOT NULL,
    "category" "IncidentCategory" NOT NULL,
    "severity" "Severity",
    "title" TEXT NOT NULL,
    "description" TEXT,
    "stopRefs" TEXT[],
    "sourceUrl" TEXT,
    "version" INTEGER NOT NULL,
    "validUntil" TIMESTAMP(3),
    "startsAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentLine" (
    "incidentId" TEXT NOT NULL,
    "lineId" TEXT NOT NULL,

    CONSTRAINT "IncidentLine_pkey" PRIMARY KEY ("incidentId","lineId")
);

-- CreateTable
CREATE TABLE "IncidentRevision" (
    "id" SERIAL NOT NULL,
    "incidentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollLog" (
    "id" SERIAL NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMs" INTEGER NOT NULL,
    "ok" BOOLEAN NOT NULL,
    "messageCount" INTEGER,
    "newCount" INTEGER,
    "endedCount" INTEGER,
    "error" TEXT,

    CONSTRAINT "PollLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Line_code_key" ON "Line"("code");

-- CreateIndex
CREATE INDEX "Incident_active_idx" ON "Incident"("active");

-- CreateIndex
CREATE INDEX "Incident_startedAt_idx" ON "Incident"("startedAt");

-- CreateIndex
CREATE INDEX "Incident_category_idx" ON "Incident"("category");

-- CreateIndex
CREATE INDEX "IncidentLine_lineId_idx" ON "IncidentLine"("lineId");

-- CreateIndex
CREATE INDEX "IncidentRevision_incidentId_observedAt_idx" ON "IncidentRevision"("incidentId", "observedAt");

-- CreateIndex
CREATE INDEX "PollLog_startedAt_idx" ON "PollLog"("startedAt");

-- AddForeignKey
ALTER TABLE "IncidentLine" ADD CONSTRAINT "IncidentLine_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentLine" ADD CONSTRAINT "IncidentLine_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "Line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentRevision" ADD CONSTRAINT "IncidentRevision_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
