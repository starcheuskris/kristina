import Link from "next/link";
import { prisma } from "@/lib/db";
import { courseConfig } from "@/lib/course-config";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const purchase = order
    ? await prisma.purchase.findUnique({ where: { accessToken: order } })
    : null;

  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  const telegramLink =
    botUsername && purchase ? `https://t.me/${botUsername}?start=${purchase.accessToken}` : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      {!purchase ? (
        <>
          <h1 className="text-3xl font-semibold">Заказ не найден</h1>
          <p className="mt-4 text-muted">
            Если вы уже оплатили курс, доступ придёт на почту в течение нескольких минут.
          </p>
        </>
      ) : purchase.status === "PENDING" ? (
        <>
          <h1 className="text-3xl font-semibold">Обрабатываем оплату…</h1>
          <p className="mt-4 text-muted">
            Обычно это занимает не больше минуты. Доступ придёт на {purchase.email} и появится
            здесь автоматически — обновите страницу через минуту.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-semibold">Оплата прошла успешно 🎉</h1>
          <p className="mt-4 text-muted">
            Мы отправили доступ на {purchase.email}. Выберите удобный способ получить материалы
            курса «{courseConfig.brandName}»:
          </p>
          <div className="mt-8 flex w-full flex-col gap-3">
            {telegramLink && (
              <a
                href={telegramLink}
                className="rounded-full bg-accent px-8 py-3 text-sm font-medium text-accent-foreground hover:opacity-90"
              >
                Открыть Telegram-бота
              </a>
            )}
            <Link
              href={`/access/${purchase.accessToken}`}
              className="rounded-full border border-border px-8 py-3 text-sm font-medium hover:bg-card"
            >
              Открыть материалы на сайте
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
