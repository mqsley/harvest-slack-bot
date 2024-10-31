import { serve } from "@hono/node-server";
import { WebClient } from "@slack/web-api";
import dotenv from "dotenv";
import { Hono } from "hono";
import { getUser, updateUserToken } from "./db";
import { getInitialAccessToken } from "./harvest";
import { getHomeViewBlocks } from "./ui";

dotenv.config();

const app = new Hono();

app.get("/harvest/oauth/callback", async (context) => {
  const code = context.req.query("code");
  const slack_id = context.req.query("state");

  if (code == null) {
    console.log("Code is missing from Harvest callback");
    return context.text("Authorization code missing in the callback", 400);
  }

  if (slack_id == null) {
    console.log("Slack ID is missing from Harvest callback");
    return context.text("Slack ID is missing in the callback", 400);
  }

  const { access_token, refresh_token, expires_in } =
    await getInitialAccessToken(code);
  await updateUserToken(slack_id, access_token, refresh_token, expires_in);

  const user = await getUser(slack_id);

  // refresh slack app home view
  if (user != null) {
    const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
    await slackClient.views.publish({
      user_id: slack_id,
      view: {
        type: "home",
        callback_id: "home_view",
        blocks: getHomeViewBlocks(user),
      },
    });
  }

  const slackHomeUrl = "slack://TAU9U8B98";

  return context.html(`
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Authentication Successful</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f4f4f8;
                    }
                    h1 {
                        color: orangered;
                    }
                    p {
                        color: #555;
                    }
                </style>
                <script type="text/javascript">
                    setTimeout(() => {
                        window.location.href = "${slackHomeUrl}"; // redirect to Slack after 10 seconds
                    }, 3000);
                </script>
            </head>
            
            <body>
                <h1>Authentication Successful</h1>
                <p>Thank you for authenticating! You will be redirected to the Slack app shortly.</p>
                <p>If you are not redirected, <a href="${slackHomeUrl}">click here</a> to go back to Slack.</p>
            </body>
        </html>
    `);
});

serve({
  fetch: app.fetch,
  port: 3001,
});
