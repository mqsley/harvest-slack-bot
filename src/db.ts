import { PrismaClient } from '@prisma/client'
import { User } from "./types"

const prisma = new PrismaClient()
prisma.$connect()

export async function updateUserToken(slack_id: string, harvest_access_token: string, harvest_refresh_token: string, expires_in: number): Promise<User> {
    const tokenExpirationDate = new Date(Date.now() + expires_in)

    return prisma.user.upsert({
        where: {
            slack_id
        },
        update: {
            slack_id,
            harvest_access_token,
            harvest_refresh_token,
            harvest_access_token_expiration: tokenExpirationDate
        },
        create: {
            slack_id,
            reminders_enabled: false,
            harvest_access_token,
            harvest_refresh_token,
            harvest_access_token_expiration: tokenExpirationDate
        },
    });
}

export async function getUser(slack_id: string): Promise<User | null> {
    return prisma.user.findFirst({
        where: {
            slack_id,
        },
    });
}

export async function getUsersWithRemindersEnabled(): Promise<User[]> {
    return prisma.user.findMany({
        where: {
            reminders_enabled: true,
        },
    });
}

export async function setUserReminder(slack_id: string, reminders_enabled: boolean): Promise<void> {
    await prisma.user.update({
        where: {
          slack_id,
        },
        data: {
            reminders_enabled
        }
      })
}