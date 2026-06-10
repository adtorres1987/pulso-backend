CREATE TABLE "group_expense_images" (
    "id" TEXT NOT NULL,
    "groupExpenseId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "group_expense_images_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "group_expense_images_groupExpenseId_idx" ON "group_expense_images"("groupExpenseId");

ALTER TABLE "group_expense_images" ADD CONSTRAINT "group_expense_images_groupExpenseId_fkey"
    FOREIGN KEY ("groupExpenseId") REFERENCES "group_expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
