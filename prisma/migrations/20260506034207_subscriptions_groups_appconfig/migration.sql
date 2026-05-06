-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('trial', 'active', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "GroupMemberRole" AS ENUM ('owner', 'member');

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "app_config" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_config_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceAmount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "intervalDays" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stripePriceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'trial',
    "trialEndsAt" TIMESTAMP(3) NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "discountPercent" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "cancelledAt" TIMESTAMP(3),
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "GroupMemberRole" NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_expenses" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "paidById" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "description" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_expense_shares" (
    "id" TEXT NOT NULL,
    "groupExpenseId" TEXT NOT NULL,
    "groupMemberId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "includeInPersonal" BOOLEAN NOT NULL DEFAULT false,
    "transactionId" TEXT,

    CONSTRAINT "group_expense_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_groupId_userId_key" ON "group_members"("groupId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "group_expense_shares_transactionId_key" ON "group_expense_shares"("transactionId");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_expenses" ADD CONSTRAINT "group_expenses_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_expenses" ADD CONSTRAINT "group_expenses_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_expense_shares" ADD CONSTRAINT "group_expense_shares_groupExpenseId_fkey" FOREIGN KEY ("groupExpenseId") REFERENCES "group_expenses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_expense_shares" ADD CONSTRAINT "group_expense_shares_groupMemberId_fkey" FOREIGN KEY ("groupMemberId") REFERENCES "group_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_expense_shares" ADD CONSTRAINT "group_expense_shares_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
