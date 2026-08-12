import crypto from "crypto";

interface BuildPaymentUrlParams {
  orderId: string;
  email: string;
  amount: number;
  productName: string;
  successUrl: string;
  notificationUrl: string;
}

/**
 * Строит ссылку на оплату в Prodamus (Payform) через query-параметры формы.
 * PRODAMUS_FORM_URL — адрес вашей формы вида https://your-shop.payform.ru/,
 * его нужно взять из личного кабинета Prodamus (Магазин → Настройки).
 */
export function buildProdamusPaymentUrl(params: BuildPaymentUrlParams): string {
  const formUrl = process.env.PRODAMUS_FORM_URL;
  if (!formUrl) {
    throw new Error("PRODAMUS_FORM_URL не задан в переменных окружения");
  }

  const url = new URL(formUrl);
  url.searchParams.set("order_id", params.orderId);
  url.searchParams.set("customer_email", params.email);
  url.searchParams.set("do", "pay");
  url.searchParams.set("urlSuccess", params.successUrl);
  url.searchParams.set("urlNotification", params.notificationUrl);
  url.searchParams.set("products[0][name]", params.productName);
  url.searchParams.set("products[0][price]", params.amount.toFixed(2));
  url.searchParams.set("products[0][quantity]", "1");

  return url.toString();
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.keys(value as Record<string, unknown>).sort();
    const sorted: Record<string, unknown> = {};
    for (const key of entries) {
      sorted[key] = sortValue((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

/**
 * Пересчитывает HMAC-подпись вебхука Prodamus (реализация по образцу их
 * официальной библиотеки hmac.php: рекурсивная сортировка ключей + JSON +
 * HMAC-SHA256). Prodamus не всегда явно документирует нюансы формата —
 * ПЕРЕД ЗАПУСКОМ В ПРОД отправьте тестовое уведомление из личного кабинета
 * (Настройки магазина → Уведомления → «Отправить тестовое уведомление»),
 * сверьте заголовок Sign с результатом этой функции и при расхождении
 * поправьте её здесь.
 */
export function computeProdamusSignature(
  payload: Record<string, unknown>,
  secretKey: string
): string {
  const sorted = sortValue(payload);
  const serialized = JSON.stringify(sorted);
  return crypto.createHmac("sha256", secretKey).update(serialized).digest("hex");
}

export function verifyProdamusSignature(
  payload: Record<string, unknown>,
  signature: string | null | undefined
): boolean {
  const secretKey = process.env.PRODAMUS_SECRET_KEY;
  if (!signature || !secretKey) return false;

  const expected = computeProdamusSignature(payload, secretKey);

  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== actualBuf.length) return false;

  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

/** Prodamus считает оплату успешной при статусе "success" в поле payment_status. */
export function isProdamusPaymentSuccessful(payload: Record<string, unknown>): boolean {
  const status = payload["payment_status"];
  return status === "success";
}
