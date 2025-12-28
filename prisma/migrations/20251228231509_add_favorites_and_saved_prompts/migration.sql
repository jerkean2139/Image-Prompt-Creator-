-- AlterTable
ALTER TABLE "VaultItem" ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SavedPrompt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "promptText" TEXT NOT NULL,
    "negativePrompt" TEXT,
    "presetKey" TEXT,
    "aspectRatio" TEXT,
    "moodTags" TEXT,
    "seed" INTEGER,
    "guidanceScale" DOUBLE PRECISION DEFAULT 7.5,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedPrompt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SavedPrompt" ADD CONSTRAINT "SavedPrompt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
