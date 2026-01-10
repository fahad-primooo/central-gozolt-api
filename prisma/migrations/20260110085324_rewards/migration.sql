-- CreateTable
CREATE TABLE `reward_accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountable_type` VARCHAR(191) NOT NULL,
    `accountable_id` INTEGER NOT NULL,
    `points_balance` INTEGER NOT NULL DEFAULT 0,
    `level` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `reward_accounts_accountable_type_accountable_id_idx`(`accountable_type`, `accountable_id`),
    UNIQUE INDEX `reward_accounts_accountable_type_accountable_id_key`(`accountable_type`, `accountable_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reward_rules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `action_type` VARCHAR(191) NOT NULL,
    `service_type` VARCHAR(191) NULL,
    `points_awarded` INTEGER NOT NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `reward_rules_action_type_service_type_idx`(`action_type`, `service_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reward_transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reward_account_id` INTEGER NOT NULL,
    `action_type` VARCHAR(191) NOT NULL,
    `points` INTEGER NOT NULL,
    `source_type` VARCHAR(191) NULL,
    `source_id` INTEGER NULL,
    `is_redeemed` BOOLEAN NOT NULL DEFAULT false,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `reward_transactions_reward_account_id_idx`(`reward_account_id`),
    INDEX `reward_transactions_source_type_source_id_idx`(`source_type`, `source_id`),
    INDEX `reward_transactions_action_type_idx`(`action_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reward_transactions` ADD CONSTRAINT `reward_transactions_reward_account_id_fkey` FOREIGN KEY (`reward_account_id`) REFERENCES `reward_accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
