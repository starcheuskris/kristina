-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accessToken" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "productId" TEXT NOT NULL DEFAULT 'main-course',
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "prodamusOrderId" TEXT NOT NULL,
    "telegramChatId" TEXT,
    "telegramUsername" TEXT,
    "emailSentAt" DATETIME,
    "telegramSentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_accessToken_key" ON "Purchase"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_prodamusOrderId_key" ON "Purchase"("prodamusOrderId");

-- CreateIndex
CREATE INDEX "Purchase_email_idx" ON "Purchase"("email");

-- CreateIndex
CREATE INDEX "Purchase_status_idx" ON "Purchase"("status");
