-- CreateTable
CREATE TABLE "SyncState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Block" (
    "height" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hash" TEXT NOT NULL,
    "time" DATETIME NOT NULL,
    "proposerAddress" TEXT NOT NULL,
    "numTxs" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Transaction" (
    "hash" TEXT NOT NULL PRIMARY KEY,
    "height" INTEGER NOT NULL,
    "index" INTEGER NOT NULL,
    "tx" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "codespace" TEXT,
    "data" TEXT,
    "events" TEXT NOT NULL,
    "gasUsed" TEXT NOT NULL,
    "gasWanted" TEXT NOT NULL,
    "info" TEXT,
    "log" TEXT,
    "timestamp" DATETIME NOT NULL,
    "senderAddress" TEXT,
    CONSTRAINT "Transaction_height_fkey" FOREIGN KEY ("height") REFERENCES "Block" ("height") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Block_hash_key" ON "Block"("hash");

-- CreateIndex
CREATE INDEX "Block_height_idx" ON "Block"("height" DESC);

-- CreateIndex
CREATE INDEX "Transaction_height_idx" ON "Transaction"("height" DESC);

-- CreateIndex
CREATE INDEX "Transaction_timestamp_idx" ON "Transaction"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "Transaction_senderAddress_height_idx" ON "Transaction"("senderAddress", "height" DESC);
