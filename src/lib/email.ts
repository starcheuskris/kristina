import nodemailer from "nodemailer";
import { courseConfig } from "@/lib/course-config";

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP_HOST / SMTP_USER / SMTP_PASS не настроены");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

interface SendAccessEmailParams {
  to: string;
  accessToken: string;
  siteUrl: string;
}

export async function sendAccessEmail({ to, accessToken, siteUrl }: SendAccessEmailParams) {
  const transport = getTransport();
  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  const telegramLink = botUsername
    ? `https://t.me/${botUsername}?start=${accessToken}`
    : null;
  const directAccessLink = `${siteUrl}/access/${accessToken}`;

  const telegramBlock = telegramLink
    ? `<p>Быстрее всего — открыть нашего Telegram-бота, он сразу пришлёт приглашение в закрытый канал курса:</p>
       <p><a href="${telegramLink}" style="display:inline-block;padding:12px 24px;background:#7c5cff;color:#fff;border-radius:999px;text-decoration:none;">Открыть в Telegram</a></p>`
    : "";

  await transport.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject: `Доступ к курсу «${courseConfig.brandName}»`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2>Оплата прошла успешно 🎉</h2>
        <p>Спасибо за покупку курса «${courseConfig.brandName}».</p>
        ${telegramBlock}
        <p>Или откройте материалы курса прямо на сайте по ссылке ниже:</p>
        <p><a href="${directAccessLink}">${directAccessLink}</a></p>
        <p style="color:#888;font-size:12px;margin-top:32px;">
          Если у вас есть вопросы, ответьте на это письмо или напишите на
          ${courseConfig.footer.contactEmail}.
        </p>
      </div>
    `,
  });
}
