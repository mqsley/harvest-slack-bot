import type { TimeEntry, User } from "../types";
import { getMondayAndFriday } from "../util";
import { getAccessToken } from "./auth";

export async function getCurrentTimesheet(user: User) {
  const { monday, friday } = getMondayAndFriday();

  const entries = await getTimeEntries(user, monday, friday);
  const isComplete =
    entries.length >= 5 && entries.every((timeEntry) => timeEntry.is_locked);

  const hours = entries.reduce((total, entry) => total + entry.hours, 0);

  const url = `${process.env.HARVEST_URL}/time/week/${monday.getFullYear()}/${monday.getMonth() + 1}/${monday.getDate()}`;

  return {
    entries,
    hours,
    url,
    isComplete,
    monday,
    friday,
  };
}

export async function getPreviousTimesheet(user: User) {
  const { monday, friday } = getMondayAndFriday();

  const lastMonday = new Date(monday);
  lastMonday.setDate(lastMonday.getDate() - 7);

  const lastFriday = new Date(friday);
  lastFriday.setDate(lastFriday.getDate() - 7);

  const entries = await getTimeEntries(user, lastMonday, lastFriday);

  const isComplete =
    entries.length >= 5 && entries.every((timeEntry) => timeEntry.is_locked);

  const hours = entries.reduce((total, entry) => total + entry.hours, 0);
  const url = `https://infiniteranges.harvestapp.com/time/week/${lastMonday.getFullYear()}/${lastMonday.getMonth() + 1}/${lastMonday.getDate()}`;

  const projectId = entries[0].project.id;

  const isPrefillable =
    entries.length === 5 &&
    entries.every((timeEntry) => timeEntry.hours === 8) &&
    entries.every((timeEntry) => timeEntry.project.id === projectId);

  return {
    entries,
    hours,
    url,
    isComplete,
    monday: lastMonday,
    friday: lastFriday,
    isPrefillable,
  };
}

export async function getTimeEntries(
  user: User,
  from?: Date,
  to?: Date,
): Promise<TimeEntry[]> {
  const accessToken = await getAccessToken(user);

  function formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  const baseUrl = "https://api.harvestapp.com/v2/time_entries";

  const params = new URLSearchParams();
  if (from != null) {
    params.append("from", formatDate(from));
  }
  if (to != null) {
    params.append("to", formatDate(to));
  }

  const response = await fetch(`${baseUrl}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Harvest-Account-ID": process.env.HARVEST_ACCOUNT_ID,
      "User-Agent": "Superfun Harvest Helper",
    },
  });

  const data = await response.json();

  if (!response.ok || !Array.isArray(data.time_entries)) {
    throw new Error(`Failed to retrieve time entries (${response.status})`);
  }

  return data.time_entries;
}

export async function prefillTimeEntries(user: User): Promise<string> {
  const accessToken = await getAccessToken(user);

  const { monday, friday } = getMondayAndFriday();

  const dates: Date[] = [];
  const currentDate = new Date(monday);

  while (currentDate <= friday) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const previousTimesheet = await getPreviousTimesheet(user);
  const lastFridayTimeEntry =
    previousTimesheet.entries[previousTimesheet.entries.length - 1];

  for (const date of dates) {
    const timeEntry = {
      user_id: lastFridayTimeEntry.user.id,
      project_id: lastFridayTimeEntry.project.id,
      task_id: 23418987, // FIXME: in future, handle errors such that user edits manually
      // task_id: lastFridayTimeEntry.task.id,
      spent_date: date.toISOString().split("T")[0],
      hours: 8,
    };

    try {
      const response = await fetch(
        "https://api.harvestapp.com/v2/time_entries",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Harvest-Account-ID": process.env.HARVEST_ACCOUNT_ID,
            "User-Agent": "Superfun Harvest Helper",
          },
          body: JSON.stringify(timeEntry),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to create time entry for ${timeEntry.spent_date}: ${response.statusText}`,
        );
      }
    } catch (error) {
      console.error(
        `Failed to create entry for ${timeEntry.spent_date}`,
        error,
      );
      throw error;
    }
  }

  const currentTimesheet = await getCurrentTimesheet(user);

  return currentTimesheet.url;
}
