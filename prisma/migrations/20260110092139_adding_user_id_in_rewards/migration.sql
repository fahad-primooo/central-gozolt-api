/*
  Warnings:

  - You are about to drop the column `accountable_id` on the `reward_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `accountable_type` on the `reward_accounts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `reward_accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `reward_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `reward_accounts_accountable_type_accountable_id_idx` ON `reward_accounts`;

-- DropIndex
DROP INDEX `reward_accounts_accountable_type_accountable_id_key` ON `reward_accounts`;

-- AlterTable
ALTER TABLE `reward_accounts` DROP COLUMN `accountable_id`,
    DROP COLUMN `accountable_type`,
    ADD COLUMN `user_id` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `reward_accounts_user_id_key` ON `reward_accounts`(`user_id`);

-- CreateIndex
CREATE INDEX `reward_accounts_user_id_idx` ON `reward_accounts`(`user_id`);

-- AddForeignKey
ALTER TABLE `reward_accounts` ADD CONSTRAINT `reward_accounts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
