import { WebClient } from "@slack/web-api";
import dotenv from "dotenv";
import { getUsersWithRemindersEnabled } from "./db";
import { getReminderMessage } from "./ui";

dotenv.config();
const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

(async () => {
  console.log("📅 Remind is Running!");

  const users = await getUsersWithRemindersEnabled();

  for (const user of users) {
    console.log(`\t✉ Sending message to ${user.slack_id}`);

    const { blocks, message } = await getReminderMessage(user);

    await slackClient.chat.postMessage({
      channel: user.slack_id,
      text: message,
      blocks,
    });

    console.log(`\t📫 Sent message to ${user.slack_id}\n`);
  }

  console.log("✅  Remind Complete");
})();
