/*
  Warnings:

  - You are about to drop the column `image` on the `banners` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "banners" DROP COLUMN "image",
ADD COLUMN     "image_en" TEXT,
ADD COLUMN     "image_ru" TEXT,
ADD COLUMN     "image_uz" TEXT;

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "image",
ADD COLUMN     "image_en" TEXT,
ADD COLUMN     "image_ru" TEXT,
ADD COLUMN     "image_uz" TEXT;
