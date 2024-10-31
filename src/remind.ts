import { WebClient } from "@slack/web-api";
import { getUsersWithRemindersEnabled } from "./db";
import { getCurrentTimeEntries } from "./harvest";
import { User, TimeEntry } from "./types";
import dotenv from "dotenv";

dotenv.config();
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

function getReminderMessage(user: User, timeEntries: TimeEntry[]) {
    return `Hey <@${user.slack_id}>, you've only sub submit your time sheet`
}

(async () => {
    console.log('🗓️ Remind is Running!');

    const users = await getUsersWithRemindersEnabled()

    for (const user of users) {
        const timeEntries = await getCurrentTimeEntries(user);

        if (timeEntries.length < 5) {
            console.log(`✉️ Sending message to ${user.slack_id}`);

            await slackClient.chat.postMessage({
                channel: user.slack_id,
                text: getReminderMessage(user, timeEntries),
            });

            console.log(`📫 Sent message to ${user.slack_id}`);
        }
    }

    console.log('✅ Remind complete!');
})();