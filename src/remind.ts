import { WebClient } from "@slack/web-api"
import dotenv from "dotenv";

console.log("Creating Web Client")

dotenv.config({ path: '.env.local' });

const token = process.env.SLACK_TOKEN;
const web = new WebClient(token);

(async () => {
    console.log("Sending Slack Message")
    // Post a message to the channel, and await the result.
    // Find more arguments and details of the response: https://api.slack.com/methods/chat.postMessage
    const conversationId = "U07SL6QUM51"
    const result = await web.chat.postMessage({
      text: 'Get your Timesheet in now!',
      channel: conversationId,
    });
  
    // The result contains an identifier for the message, `ts`.
    console.log(`Successfully send message ${result.ts} to user conversation ${conversationId}`);
  })();
