import { updateUserToken } from "./db";
import type { HarvestAccessToken, TimeEntry, User } from "./types";
import { getMondayAndFriday } from "./util";

export async function getInitialAccessToken(
  harvest_auth_token: string,
): Promise<HarvestAccessToken> {
  const params = new URLSearchParams({
    code: harvest_auth_token,
    client_id: process.env.HARVEST_CLIENT_ID,
    client_secret: process.env.HARVEST_CLIENT_SECRET,
    grant_type: "authorization_code",
    redirect_uri:
      "https://ca78-73-119-109-179.ngrok-free.app/harvest/oauth/callback",
  });

  const response = await fetch(
    "https://id.getharvest.com/api/v2/oauth2/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Superfun Harvest Helper",
      },
      body: params.toString(),
    },
  );

  const data = await response.json();

  if (!response.ok || data.access_token == null) {
    throw new Error(
      `Unable to retrieve initial access token (${response.status})`,
    );
  }

  return data;
}

export async function getAccessToken(user: User): Promise<string> {
  // current token is still valid
  if (user.harvest_access_token_expiration > new Date()) {
    return user.harvest_access_token;
  }

  const params = new URLSearchParams({
    refresh_token: user.harvest_refresh_token,
    client_id: process.env.HARVEST_CLIENT_ID,
    client_secret: process.env.HARVEST_CLIENT_SECRET,
    grant_type: "refresh_token",
  });

  // current token is not valid, refresh token
  const response = await fetch(
    "https://id.getharvest.com/api/v2/oauth2/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Superfun Harvest Helper",
      },
      body: params.toString(),
    },
  );

  const data = await response.json();

  if (!response.ok || data.access_token == null) {
    throw new Error(
      `Unable to refresh access token (${response.status}) for user: ${user.slack_id}`,
    );
  }

  await updateUserToken(
    user.slack_id,
    data.access_token,
    data.refresh_token,
    data.expires_in,
  );

  return data.access_token;
}

export async function getCurrentTimeEntries(user: User): Promise<TimeEntry[]> {
  const accessToken = await getAccessToken(user);

  const { monday, friday } = getMondayAndFriday();

  function formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  const response = await fetch(
    `https://api.harvestapp.com/v2/time_entries?from=${formatDate(monday)}&to=${formatDate(friday)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Harvest-Account-ID": process.env.HARVEST_ACCOUNT_ID,
        "User-Agent": "Superfun Harvest Helper",
      },
    },
  );

  const data = await response.json();

  if (!response.ok || !Array.isArray(data.time_entries)) {
    throw new Error(`Failed to retrieve time entries (${response.status})`);
  }

  return data.time_entries;
}
