# Лендинг курса — оплата и автоматическая выдача доступа

Сайт для продажи курса: лендинг → оплата через Prodamus → доступ выдаётся
автоматически в закрытый Telegram-канал и/или на почту.

Стек: Next.js (App Router) + TypeScript + Tailwind CSS, Prisma (SQLite
локально), grammY (Telegram-бот), Nodemailer (email).

## Как это работает

1. Покупатель вводит email на лендинге и попадает на страницу оплаты Prodamus
   (`src/app/api/order/route.ts` создаёт запись о покупке и ссылку на оплату).
2. После оплаты Prodamus стучится вебхуком на `/api/webhook/prodamus`. Роут
   проверяет подпись, помечает покупку оплаченной и отправляет письмо со
   ссылкой на бота и на страницу с материалами.
3. Покупатель либо переходит по ссылке в Telegram-боте (`/api/telegram/webhook`,
   логика в `src/lib/telegram.ts`) и получает одноразовую invite-ссылку в
   закрытый канал, либо открывает страницу `/access/[token]` прямо с почты.

Весь текстовый контент лендинга (заголовки, программа курса, цена, отзывы,
FAQ) собран в одном месте — `src/lib/course-config.ts`. Замените плейсхолдеры
на реальные тексты, компоненты менять не нужно.

## Локальный запуск

```bash
npm install
cp .env.example .env   # заполните значения, см. ниже
npx prisma migrate dev # создаст локальную SQLite базу
npm run dev
```

Откройте http://localhost:3000.

## Настройка интеграций

### 1. Prodamus (оплата)

1. Зарегистрируйтесь в личном кабинете Prodamus и создайте форму оплаты —
   получите её адрес вида `https://your-shop.payform.ru/`, впишите в
   `PRODAMUS_FORM_URL`.
2. В настройках магазина включите уведомления (webhook) и скопируйте
   секретный ключ подписи в `PRODAMUS_SECRET_KEY`.
3. **Важно:** проверка подписи в `src/lib/prodamus.ts`
   (`computeProdamusSignature`) реализована по образцу официальной схемы
   Prodamus (рекурсивная сортировка ключей + HMAC-SHA256), но перед запуском
   в прод обязательно отправьте тестовое уведомление из личного кабинета
   (Настройки → Уведомления → «Отправить тестовое уведомление») и сверьте
   заголовок `Sign` с тем, что вычисляет функция. При расхождении поправьте
   алгоритм — сама функция изолирована и легко редактируется.
4. Домен `/api/webhook/prodamus` должен быть доступен из интернета (после
   деплоя), укажите его как URL уведомлений в кабинете Prodamus, если он не
   подхватывается автоматически через `urlNotification`.

### 2. Telegram-бот (доступ в закрытый канал)

1. Создайте бота через [@BotFather](https://t.me/BotFather), получите токен →
   `TELEGRAM_BOT_TOKEN`, а username бота (без @) → `TELEGRAM_BOT_USERNAME`.
2. Создайте закрытый канал, добавьте бота администратором с правом
   «Пригласительные ссылки». Узнать числовой ID канала можно, например,
   переслав любое сообщение из канала боту [@userinfobot](https://t.me/userinfobot)
   или через `getUpdates` — впишите его (со знаком «-») в `TELEGRAM_CHANNEL_ID`.
3. После деплоя пропишите вебхук у Telegram (один раз):

   ```bash
   curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
     -d "url=https://your-domain.ru/api/telegram/webhook" \
     -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
   ```

   `TELEGRAM_WEBHOOK_SECRET` — произвольная строка, задайте её и в `.env`, и в
   этой команде — она защищает вебхук от посторонних запросов.

### 3. Email (SMTP)

Впишите данные вашего почтового сервиса (подойдёт Яндекс 360, Mail.ru для
бизнеса, SendPulse, Unisender и т.д.) в `SMTP_HOST` / `SMTP_PORT` /
`SMTP_USER` / `SMTP_PASS` / `SMTP_FROM`.

## Продакшен

- **База данных:** SQLite подходит только для локальной разработки —
  файловая система на serverless-платформах (Vercel и т.п.) эфемерна. Для
  прода поднимите Postgres (например, Neon или Vercel Postgres), обновите
  `DATABASE_URL` и замените адаптер в `src/lib/db.ts` на
  `@prisma/adapter-pg` (`npm install @prisma/adapter-pg pg`), а провайдера в
  `prisma/schema.prisma` — на `postgresql`.
- **Деплой:** проще всего на [Vercel](https://vercel.com/new) — подключите
  репозиторий, впишите переменные окружения из `.env.example` в настройках
  проекта, задайте `SITE_URL` реальным доменом.
- После первого деплоя не забудьте выполнить `setWebhook` для Telegram-бота
  (см. выше) и указать боевой `urlNotification` в кабинете Prodamus.

## Структура проекта

```
src/
  app/                    страницы и API-роуты (App Router)
    api/order             создание заказа + ссылка на оплату
    api/webhook/prodamus  приём оплаты от Prodamus
    api/telegram/webhook  вебхук Telegram-бота
    success, access/[token]  страницы после оплаты
  components/             секции лендинга
  lib/
    course-config.ts      весь контент и цена курса
    prodamus.ts            ссылка на оплату + проверка подписи
    telegram.ts            логика Telegram-бота
    email.ts                отправка письма с доступом
    db.ts                   Prisma client
prisma/schema.prisma       модель Purchase
```
