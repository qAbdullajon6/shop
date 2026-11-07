/*
  Warnings:

  - You are about to drop the column `title` on the `banners` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `category_attributes` table. All the data in the column will be lost.
  - You are about to drop the column `body` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `products` table. All the data in the column will be lost.
  - Added the required column `name_en` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_ru` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_uz` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_en` to the `category_attributes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_ru` to the `category_attributes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_uz` to the `category_attributes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `body_en` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `body_ru` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `body_uz` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_en` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_ru` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_uz` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_en` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_ru` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_uz` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "banners" DROP COLUMN "title",
ADD COLUMN     "title_en" TEXT,
ADD COLUMN     "title_ru" TEXT,
ADD COLUMN     "title_uz" TEXT;

-- AlterTable
ALTER TABLE "brands" DROP COLUMN "description",
ADD COLUMN     "description_en" TEXT,
ADD COLUMN     "description_ru" TEXT,
ADD COLUMN     "description_uz" TEXT;

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "description",
DROP COLUMN "name",
ADD COLUMN     "description_en" TEXT,
ADD COLUMN     "description_ru" TEXT,
ADD COLUMN     "description_uz" TEXT,
ADD COLUMN     "name_en" TEXT NOT NULL,
ADD COLUMN     "name_ru" TEXT NOT NULL,
ADD COLUMN     "name_uz" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "category_attributes" DROP COLUMN "name",
ADD COLUMN     "name_en" TEXT NOT NULL,
ADD COLUMN     "name_ru" TEXT NOT NULL,
ADD COLUMN     "name_uz" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "body",
DROP COLUMN "title",
ADD COLUMN     "body_en" TEXT NOT NULL,
ADD COLUMN     "body_ru" TEXT NOT NULL,
ADD COLUMN     "body_uz" TEXT NOT NULL,
ADD COLUMN     "title_en" TEXT NOT NULL,
ADD COLUMN     "title_ru" TEXT NOT NULL,
ADD COLUMN     "title_uz" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "description",
DROP COLUMN "name",
ADD COLUMN     "description_en" TEXT,
ADD COLUMN     "description_ru" TEXT,
ADD COLUMN     "description_uz" TEXT,
ADD COLUMN     "name_en" TEXT NOT NULL,
ADD COLUMN     "name_ru" TEXT NOT NULL,
ADD COLUMN     "name_uz" TEXT NOT NULL;
