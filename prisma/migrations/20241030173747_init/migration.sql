-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slack_id" TEXT NOT NULL,
    "harvest_auth_token" TEXT NOT NULL,
    "reminders_enabled" BOOLEAN NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_slack_id_key" ON "User"("slack_id");
