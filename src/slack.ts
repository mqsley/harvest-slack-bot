import {
  App,
  type BlockAction,
  type BlockButtonAction,
  LogLevel,
} from "@slack/bolt";
import dotenv from "dotenv";
import { getUser, setUserReminder } from "./db";
import { getPreviousTimesheet, prefillTimeEntries } from "./harvest";
import { getAuthenticationHomeViewBlocks, getHomeViewBlocks } from "./ui";

dotenv.config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG,
  installerOptions: {
    port: Number(process.env.PORT) || 3000,
  },
});

app.event("app_home_opened", async ({ event, client }) => {
  try {
    console.log(`App Home Opened Event Received: ${event.user}`);

    const user = await getUser(event.user);

    console.log("App Home Opened Event User:", user);

    if (user == null) {
      await client.views.publish({
        user_id: event.user,
        view: {
          type: "home",
          callback_id: "home_view",
          blocks: getAuthenticationHomeViewBlocks(event.user),
        },
      });
    } else {
      await client.views.publish({
        user_id: event.user,
        view: {
          type: "home",
          callback_id: "home_view",
          blocks: getHomeViewBlocks(user),
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
});

app.action<BlockAction>("turn_on_reminders", async ({ ack, body, client }) => {
  await ack();

  await setUserReminder(body.user.id, true);

  if (body?.view == null) {
    throw new Error("Body is not available");
  }

  const user = await getUser(body.user.id);

  if (user == null) {
    throw new Error("Could not retrieve existing user");
  }

  try {
    await client.views.update({
      view_id: body.view.id,
      hash: body.view.hash,
      view: {
        type: "home",
        callback_id: "home_view",
        blocks: getHomeViewBlocks(user),
      },
    });
  } catch (error) {
    console.error(error);
  }
});

app.action<BlockButtonAction>(
  "turn_off_reminders",
  async ({ ack, body, client }) => {
    await ack();

    await setUserReminder(body.user.id, false);

    if (body?.view == null) {
      throw new Error("Body is not available");
    }

    const user = await getUser(body.user.id);

    if (user == null) {
      throw new Error("Could not retrieve existing user");
    }

    try {
      await client.views.update({
        view_id: body.view.id,
        hash: body.view.hash,
        view: {
          type: "home",
          callback_id: "home_view",
          blocks: getHomeViewBlocks(user),
        },
      });
    } catch (error) {
      console.error(error);
    }
  },
);

app.action<BlockButtonAction>(
  "prefill_timesheet",
  async ({ ack, body, respond }) => {
    await ack();

    const user = await getUser(body.user.id);

    if (user == null) {
      throw new Error("Could not retrieve existing user");
    }
    const previousTimesheet = await getPreviousTimesheet(user);

    try {
      if (!previousTimesheet.isPrefillable) {
        throw new Error("Previous timesheet is not prefillable");
      }

      const submitUrl = await prefillTimeEntries(user);

      await respond({
        text: "Go to Harvest to submit",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Your hours have been prefilled, please *<${submitUrl}|proceed to Harvest>* to submit`,
            },
          },
        ],
        replace_original: true,
      });
    } catch (error) {
      await respond({
        text: "Go to Harvest to submit",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Unfortunately an issue arose and we cannot prefill your hours, please *<https://infiniteranges.harvestapp.com/time|proceed to Harvest>* to fix and submit",
            },
          },
        ],
        replace_original: true,
      });
    }
  },
);

(async () => {
  await app.start();

  console.log("⚡ Bolt app is running!");
})();
