import { webhookCallback } from "grammy";
import { getBot } from "@/lib/telegram";

export async function POST(req: Request) {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    // Бот ещё не настроен — тихо игнорируем, чтобы Telegram не заваливал ретраями.
    return new Response("ok", { status: 200 });
  }

  try {
    const handleUpdate = webhookCallback(getBot(), "std/http", {
      secretToken: process.env.TELEGRAM_WEBHOOK_SECRET,
    });
    return await handleUpdate(req);
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return new Response("ok", { status: 200 });
  }
}
