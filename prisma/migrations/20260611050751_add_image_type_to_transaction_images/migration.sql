-- DropIndex
DROP INDEX "accounts_userId_idx";

-- DropIndex
DROP INDEX "group_expense_images_groupExpenseId_idx";

-- DropIndex
DROP INDEX "transactions_accountId_idx";

-- AlterTable
ALTER TABLE "accounts" ALTER COLUMN "currency" SET DEFAULT 'USD';

-- AlterTable
ALTER TABLE "transaction_images" ADD COLUMN     "imageType" TEXT NOT NULL DEFAULT 'image';
