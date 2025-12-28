-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "bypassPromptCreation" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "directPrompt" TEXT,
ADD COLUMN     "presetAnswers" TEXT,
ADD COLUMN     "referenceImages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "VaultItem" ADD COLUMN     "imageOutputId" TEXT;

-- AddForeignKey
ALTER TABLE "VaultItem" ADD CONSTRAINT "VaultItem_imageOutputId_fkey" FOREIGN KEY ("imageOutputId") REFERENCES "ImageOutput"("id") ON DELETE SET NULL ON UPDATE CASCADE;
