import {
  App,
  type BlockAction,
  type BlockButtonAction,
  LogLevel,
} from "@slack/bolt";
import dotenv from "dotenv";
import { getUser, setUserReminder } from "./db";
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
          blocks: await getAuthenticationHomeViewBlocks(event.user),
        },
      });
    } else {
      await client.views.publish({
        user_id: event.user,
        view: {
          type: "home",
          callback_id: "home_view",
          blocks: await getHomeViewBlocks(user),
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
        blocks: await getHomeViewBlocks(user),
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
          blocks: await getHomeViewBlocks(user),
        },
      });
    } catch (error) {
      console.error(error);
    }
  },
);

(async () => {
  await app.start();

  console.log("⚡️ Bolt app is running!");
})();
