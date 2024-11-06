import type { ActionsBlockElement, Block, KnownBlock } from "@slack/types";
import { getCurrentTimesheet, getPreviousTimesheet } from "./harvest";
import type { User } from "./types";

export function getAuthenticationHomeViewBlocks(
  slack_id: string,
): (KnownBlock | Block)[] {
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Superfun Harvest Helper's App Home",
        emoji: true,
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Authenticate with Harvest to begin receiving reminders",
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: "Authenticate",
          emoji: true,
        },
        url: `https://id.getharvest.com/oauth2/authorize?client_id=${process.env.HARVEST_CLIENT_ID}&response_type=code&state=${slack_id}`,
        style: "primary",
      },
    },
  ];
}

export function getHomeViewBlocks(user: User): (KnownBlock | Block)[] {
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Superfun Harvest Helper's App Home",
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Hi <@${user.slack_id}>, welcome to your Superfun Harvest Helper :tada:`,
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Do you want weekly timesheet reminders?",
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: user.reminders_enabled ? "Turn off" : "Turn on",
          emoji: true,
        },
        style: user.reminders_enabled ? "danger" : "primary",
        action_id: user.reminders_enabled
          ? "turn_off_reminders"
          : "turn_on_reminders",
      },
    },
  ];
}

export async function getReminderMessage(user: User) {
  function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  }

  const currentTimesheet = await getCurrentTimesheet(user);
  const previousTimesheet = await getPreviousTimesheet(user);

  const lastFridayTimeEntry =
    previousTimesheet.entries[previousTimesheet.entries.length - 1];

  const message = currentTimesheet.isComplete
    ? `Hey <@${user.slack_id}>, great work! You completed your timesheet and are all good! :tada:`
    : `Hey <@${user.slack_id}>, you haven't submitted a timesheet for this week.`;

  const blocks: (KnownBlock | Block)[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: message,
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*<${currentTimesheet.url}|Current Timesheet>*\n*${formatDate(currentTimesheet.monday)} to ${formatDate(currentTimesheet.friday)}*\nStatus: ${currentTimesheet.isComplete ? ":white_check_mark: Submitted" : ":no_entry: Not Submitted"}`,
      },
    },
  ];

  const actionElements: ActionsBlockElement[] = [];

  if (previousTimesheet.isPrefillable) {
    actionElements.push({
      type: "button",
      text: {
        type: "plain_text",
        text: "Copy previous week",
        emoji: true,
      },
      style: "primary",
      action_id: "prefill_timesheet",
    });
  }

  actionElements.push({
    type: "button",
    text: {
      type: "plain_text",
      text: "Edit manually",
      emoji: true,
    },
    url: currentTimesheet.url,
  });

  if (!currentTimesheet.isComplete) {
    blocks.push(
      {
        type: "actions",
        elements: actionElements,
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*<${previousTimesheet.url}|Last Week's Timesheet>*\n*${formatDate(previousTimesheet.monday)} to ${formatDate(previousTimesheet.friday)}*\nStatus: ${previousTimesheet.isComplete ? ":white_check_mark: Submitted" : ":no_entry: Not Submitted"}\n*${previousTimesheet.hours} hours* billed to *${lastFridayTimeEntry.project.name}* as _${lastFridayTimeEntry.task.name}_`,
        },
      },
    );
  }

  return { blocks, message };
}
