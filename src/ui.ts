import { User } from './types';

export async function getAuthenticationHomeViewBlocks(slack_id: string) {
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

export async function getHomeViewBlocks(user: User) {
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