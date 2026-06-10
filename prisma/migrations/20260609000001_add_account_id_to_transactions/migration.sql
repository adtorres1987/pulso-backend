ALTER TABLE "transactions" ADD COLUMN "accountId" TEXT;

ALTER TABLE "transactions" ADD CONSTRAINT "transactions_accountId_fkey"
    FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "transactions_accountId_idx" ON "transactions"("accountId");
