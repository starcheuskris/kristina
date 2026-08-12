import { Bot, Context } from "grammy";
import { prisma } from "@/lib/db";
import { courseConfig } from "@/lib/course-config";

let botInstance: Bot | null = null;

/**
 * Возвращает singleton Telegram-бота. Бот выдаёт доступ к закрытому каналу
 * курса: покупатель переходит по deep-link вида t.me/<bot>?start=<accessToken>
 * (эта ссылка присылается на почту после оплаты), бот проверяет токен в базе
 * и, если оплата подтверждена, генерирует одноразовую invite-ссылку в канал.
 *
 * Требуется: TELEGRAM_BOT_TOKEN и TELEGRAM_CHANNEL_ID (id канала со знаком
 * "-100..."), бот должен быть администратором канала с правом приглашать
 * пользователей.
 */
export function getBot(): Bot {
  if (botInstance) return botInstance;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN не задан в переменных окружения");
  }

  const bot = new Bot(token);

  bot.command("start", async (ctx) => {
    const token = ctx.match?.toString().trim();

    if (!token) {
      await ctx.reply(
        `Привет! Это бот курса «${courseConfig.brandName}».\n\n` +
          `Чтобы получить доступ, сначала оформите покупку на сайте — ` +
          `после оплаты вы получите персональную ссылку на этого бота.`
      );
      return;
    }

    await deliverTelegramAccess(ctx, token);
  });

  botInstance = bot;
  return bot;
}

async function deliverTelegramAccess(ctx: Context, accessToken: string) {
  const purchase = await prisma.purchase.findUnique({ where: { accessToken } });

  if (!purchase) {
    await ctx.reply("Ссылка недействительна. Проверьте письмо с доступом или напишите в поддержку.");
    return;
  }

  if (purchase.status === "PENDING" || purchase.status === "FAILED") {
    await ctx.reply("Оплата ещё не подтверждена. Обновите страницу через пару минут или напишите в поддержку.");
    return;
  }

  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (!channelId) {
    await ctx.reply("Доступ временно недоступен, мы уже разбираемся. Напишите в поддержку.");
    return;
  }

  try {
    const invite = await ctx.api.createChatInviteLink(channelId, {
      name: `purchase-${purchase.id}`.slice(0, 32),
      member_limit: 1,
    });

    await ctx.reply(
      `Оплата подтверждена ✅\n\nВаша персональная ссылка в закрытый канал курса (одноразовая):\n${invite.invite_link}`
    );

    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        telegramChatId: String(ctx.chat?.id ?? ""),
        telegramUsername: ctx.from?.username ?? null,
        telegramSentAt: new Date(),
        status: "DELIVERED",
      },
    });
  } catch (error) {
    console.error("Не удалось создать invite-ссылку Telegram:", error);
    await ctx.reply(
      "Не получилось создать ссылку на канал. Напишите в поддержку — выдадим доступ вручную."
    );
  }
}
