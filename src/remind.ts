import { WebClient } from "@slack/web-api";
import { getUsersWithRemindersEnabled } from "./db";
import { getCurrentTimeEntries } from "./harvest";
import { getReminderMessageBlock } from "./ui";
import { User, TimeEntry } from "./types";
import dotenv from "dotenv";

dotenv.config();
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

function getReminderMessage(user: User, timeEntries: TimeEntry[]) {
    if (timeEntries.length <= 0) {
        return `Hey <@${user.slack_id}>, you haven't submitted a timesheet for this week.`
    }

    if (timeEntries.length < 5) {
        return `Hey <@${user.slack_id}>, you haven't completed your timesheet for this week.`
    }

    return `Hey <@${user.slack_id}>, great work! You completed your timesheet and are all good! :tada:`
}

(async () => {
    console.log(`📅 Remind is Running!`);

    const users = await getUsersWithRemindersEnabled()

    for (const user of users) {
        const timeEntries = await getCurrentTimeEntries(user);

        console.log(`\t✉️ Sending message to ${user.slack_id}`);

        const message = getReminderMessage(user, timeEntries);

        await slackClient.chat.postMessage({
            channel: user.slack_id,
            text: message,
            blocks: getReminderMessageBlock(message, timeEntries.length >= 5)
        });

        console.log(`\t📫 Sent message to ${user.slack_id}\n`);
    }

    console.log(`✅  Remind Complete`);
})();