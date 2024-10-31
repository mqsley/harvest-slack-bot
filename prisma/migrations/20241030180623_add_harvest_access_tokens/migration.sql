/*
  Warnings:

  - You are about to drop the column `harvest_auth_token` on the `User` table. All the data in the column will be lost.
  - Added the required column `harvest_access_token` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `harvest_access_token_expiration` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `harvest_refresh_token` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slack_id" TEXT NOT NULL,
    "harvest_access_token" TEXT NOT NULL,
    "harvest_refresh_token" TEXT NOT NULL,
    "harvest_access_token_expiration" DATETIME NOT NULL,
    "reminders_enabled" BOOLEAN NOT NULL
);
INSERT INTO "new_User" ("id", "reminders_enabled", "slack_id") SELECT "id", "reminders_enabled", "slack_id" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_slack_id_key" ON "User"("slack_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
