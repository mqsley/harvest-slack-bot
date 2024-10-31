import type { User as DbUser } from "@prisma/client";

export type User = DbUser;

export interface TimeEntry {
  date: string;
  total_hours: number;
}

export interface HarvestAccessToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
}
