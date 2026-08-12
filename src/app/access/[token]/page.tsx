import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { courseConfig } from "@/lib/course-config";

export default async function AccessPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const purchase = await prisma.purchase.findUnique({ where: { accessToken: token } });

  if (!purchase) {
    notFound();
  }

  if (purchase.status === "PENDING" || purchase.status === "FAILED") {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold">Доступ пока недоступен</h1>
        <p className="mt-4 text-muted">
          Мы не видим подтверждения оплаты по этой ссылке. Если вы уже оплатили курс, напишите на{" "}
          {courseConfig.footer.contactEmail}.
        </p>
      </main>
    );
  }

  const botUsername = process.env.TELEGRAM_BOT_USERNAME;
  const telegramLink = botUsername
    ? `https://t.me/${botUsername}?start=${purchase.accessToken}`
    : null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Добро пожаловать на курс «{courseConfig.brandName}»</h1>
      <p className="mt-4 text-muted">
        Это страница с материалами курса — замените этот блок ссылками на уроки, файлы или
        плеер, когда контент будет готов.
      </p>

      {telegramLink && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-medium">Закрытый Telegram-канал курса</h2>
          <p className="mt-2 text-sm text-muted">
            Там разборы, ответы куратора и все обновления курса.
          </p>
          <a
            href={telegramLink}
            className="mt-4 inline-block rounded-full bg-accent px-6 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Получить доступ в Telegram
          </a>
        </div>
      )}

      <ol className="mt-8 divide-y divide-border border-t border-border">
        {courseConfig.program.map((module, i) => (
          <li key={module.title} className="py-5">
            <span className="text-xs font-mono text-muted">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-medium">{module.title}</h3>
          </li>
        ))}
      </ol>
    </main>
  );
}
