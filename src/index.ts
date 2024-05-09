import { getAccessToken } from "web-auth-library/google";
import { sendTelegram } from "./telegram";
import { addRowToGoogleSheet, isFirstRowPopulated } from "./google_sheets";

export interface Env {
  GOOGLE_CLOUD_CREDENTIALS: string;
  GOOGLE_SHEET_ID: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  TELEGRAM_ENABLED: boolean;
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };

    if (request.method === "OPTIONS") {
      return new Response(JSON.stringify({}), { headers, status: 200 });
    }

    if (request.method === "POST") {
      let data: any;
      try {
        const reqData = await request.json();
        data = {
          timestamp: new Date().toISOString(),
          ...reqData!,
        };
      } catch (err) {
        return new Response(JSON.stringify({ message: "Invalid JSON!" }), {
          headers,
          status: 400,
        });
      }

      // add headers to data
      for (const [key, value] of request.headers.entries()) {
        data[`header_${key}`] = value;
      }

      // Generate a short lived access token from the service account key credentials
      const accessToken = await getAccessToken({
        credentials: JSON.parse(env.GOOGLE_CLOUD_CREDENTIALS),
        scope: "https://www.googleapis.com/auth/spreadsheets",
      });

      // check first row in sheet is populated, if not add header row
      const populated = await isFirstRowPopulated({
        token: accessToken,
        sheetId: env.GOOGLE_SHEET_ID,
      });

      console.log(populated);

      if (!populated.populated) {
        console.log("in here");
        await addRowToGoogleSheet({
          token: accessToken,
          sheetId: env.GOOGLE_SHEET_ID,
          range: "Sheet1!A1",
          values: [Object.keys(data)],
        });
      }

      // add data
      const googleResponse = await addRowToGoogleSheet({
        token: accessToken,
        sheetId: env.GOOGLE_SHEET_ID,
        range: "Sheet1!A1",
        values: [Object.values(data)],
      });

      // Fire and forget
      if (env.TELEGRAM_ENABLED) {
        ctx.waitUntil(
          (async () => {
            let msg = `New data received:\n${JSON.stringify(data, null, 2)}`;
            if (googleResponse.failed) {
              msg += `\n❗ Adding to Sheet ${env.GOOGLE_SHEET_ID} failed:\n${googleResponse.error}`;
            }
            await sendTelegram({
              text: msg,
              chatId: env.TELEGRAM_CHAT_ID,
              botToken: env.TELEGRAM_BOT_TOKEN,
            });
          })()
        );
      }

      return new Response(JSON.stringify({ message: "Saved" }), {
        headers,
        status: 200,
      });
    }

    return new Response(
      JSON.stringify({ message: "Only POST requests are supported" }),
      { headers, status: 405 }
    );
  },
} satisfies ExportedHandler<Env>;
