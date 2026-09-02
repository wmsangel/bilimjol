-- Счётчики-итоги статистики ученика
ALTER TABLE "ChildStats" ADD COLUMN "totalAnswered" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ChildStats" ADD COLUMN "totalCorrect" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ChildStats" ADD COLUMN "timeSpentSec" INTEGER NOT NULL DEFAULT 0;
