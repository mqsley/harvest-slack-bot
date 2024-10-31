import type { Block, KnownBlock } from "@slack/types";
import { User } from './types';
import { getMondayAndFriday } from "./util";

export function getAuthenticationHomeViewBlocks(slack_id: string): (KnownBlock | Block)[] {
    return [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "Superfun Harvest Helper's App Home",
                "emoji": true
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "Authenticate with Harvest to begin receiving reminders"
            },
            "accessory": {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "Authenticate",
                    "emoji": true
                },
                "url": `https://id.getharvest.com/oauth2/authorize?client_id=${process.env.HARVEST_CLIENT_ID}&response_type=code&state=${slack_id}`,
                "style": "primary",
            }
        }
    ]
}

export function getHomeViewBlocks(user: User): (KnownBlock | Block)[] {
    return [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "Superfun Harvest Helper's App Home",
                "emoji": true
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `Hi <@${user.slack_id}>, welcome to your Superfun Harvest Helper :tada:`
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "Do you want weekly timesheet reminders?"
            },
            "accessory": {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": user.reminders_enabled ? "Turn off" : "Turn on",
                    "emoji": true,
                },
                "style": user.reminders_enabled ? "danger" : "primary",
                "action_id": user.reminders_enabled ? "turn_off_reminders" : "turn_on_reminders",
            }
        }
    ]
}

export function getReminderMessageBlock(message: string, isComplete: boolean) {
    function formatDate(date: Date): string {
        return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    }

    const { monday, friday } = getMondayAndFriday();

    const blocks: (KnownBlock | Block)[] = [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": message
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `*This week*, ${formatDate(monday)} to ${formatDate(friday)}`
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `*<https://infiniteranges.harvestapp.com/time|Timesheet>*\nStatus: ${isComplete ? ":white_check_mark: Submitted" : ":no_entry: Not Submitted" }`
            }
        }]

    if (!isComplete) {
        blocks.push({
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Complete now",
                        "emoji": true
                    },
                    "style": "primary",
                    "url": "https://infiniteranges.harvestapp.com/time"
                }
            ]
        })
    }

    return blocks;
}

