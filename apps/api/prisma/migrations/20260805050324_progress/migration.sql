-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildStats" (
    "childId" TEXT NOT NULL,
    "streakCount" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TEXT,
    "dailyDate" TEXT,
    "dailySolved" INTEGER NOT NULL DEFAULT 0,
    "unlockedHelpers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "spentStars" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChildStats_pkey" PRIMARY KEY ("childId")
);

-- CreateIndex
CREATE INDEX "Progress_childId_idx" ON "Progress"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_childId_taskId_key" ON "Progress"("childId", "taskId");

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_childId_fkey" FOREIGN KEY ("childId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildStats" ADD CONSTRAINT "ChildStats_childId_fkey" FOREIGN KEY ("childId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
