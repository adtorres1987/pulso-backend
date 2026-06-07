-- CreateTable
CREATE TABLE "transaction_images" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transaction_images" ADD CONSTRAINT "transaction_images_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
