-- CreateTable
CREATE TABLE "AccountBalance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "address" TEXT NOT NULL,
    "balance" TEXT NOT NULL,
    "denom" TEXT NOT NULL DEFAULT 'ahp',
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_address_key" ON "AccountBalance"("address");

-- CreateIndex
CREATE INDEX "AccountBalance_balance_idx" ON "AccountBalance"("balance");
