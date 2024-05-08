# post2sheet

Cloudflare worker that accepts HTTP JSON POST data and writes it to a google sheets document.

Optional: send a Message via Telegram when new data was received (will also notify if the Google Sheets API call did not work).

## Google Sheets

To make the Google Sheets API call work proceed as follow:

1. Enable Google Sheets API on the [Cloud console](https://console.cloud.google.com/apis/library/sheets.googleapis.com)
2. Create a [Google Cloud service account key](https://cloud.google.com/iam/docs/creating-managing-service-account-keys). Click in the [Cloud console](https://console.cloud.google.com/apis/credentials) on `Create Credentials` --> `Service account`, after creation add a JSON key.
3. Add the resulting JSON key to the worker Secret `GOOGLE_CLOUD_CREDENTIALS` the value must be in the format `{"type": "service_account","project_id": "defa...`
4. Add the created User (`client_email` from service account json key) as Editor to your Google Sheet where Data should be added
5. Add the Sheet id to the environment variable `GOOGLE_SHEET_ID`

## Telegram

The following environment variables need to be set to enable Telegram notifications when receiving new data:

```
TELEGRAM_ENABLED=true
TELEGRAM_BOT_TOKEN=<YOUR TELEGRAM BOT TOKEN FROM BOTFATHER>
TELEGRAM_CHAT_ID=<TELEGRAM CHAT ID WHERE MESSAGES ARE SENT TO>
```

### Get chatId

The `TELEGRAM_CHAT_ID` can be found with a simple curl message.
Open a chat with your bot and send a message, then get the chat id from the following API response:

´´´
curl https://api.telegram.org/bot<Bot_token>/getUpdates
´´´
