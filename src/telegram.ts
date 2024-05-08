interface TelegramInput {
  text: string;
  chatId: string;
  botToken: string;
}

interface TelegramResponse {
  message: string | null;
  error: string | null;
  failed: boolean;
}

export async function sendTelegram({
  text,
  chatId,
  botToken,
}: TelegramInput): Promise<TelegramResponse> {
  const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(telegramApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        message: null,
        error: JSON.stringify(errorData) || "Unknown error",
        failed: true,
      };
    }

    return {
      message: "Message sent successfully",
      error: null,
      failed: false,
    };
  } catch (error) {
    return {
      message: null,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
      failed: true,
    };
  }
}
