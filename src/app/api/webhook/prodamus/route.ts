import { NextRequest, NextResponse } from "next/server";
import qs from "qs";
import { prisma } from "@/lib/db";
import { verifyProdamusSignature, isProdamusPaymentSuccessful } from "@/lib/prodamus";
import { sendAccessEmail } from "@/lib/email";

function getSiteUrl(req: NextRequest): string {
  return process.env.SITE_URL ?? req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const contentType = req.headers.get("content-type") ?? "";

  const payload: Record<string, unknown> = contentType.includes("application/json")
    ? JSON.parse(rawBody || "{}")
    : qs.parse(rawBody);

  const signature = req.headers.get("sign") ?? req.headers.get("Sign");

  if (!verifyProdamusSignature(payload, signature)) {
    console.warn("Prodamus webhook: неверная подпись", { payload });
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const orderId = String(payload["order_id"] ?? "");
  if (!orderId) {
    return NextResponse.json({ error: "order_id отсутствует" }, { status: 400 });
  }

  const purchase = await prisma.purchase.findUnique({
    where: { prodamusOrderId: orderId },
  });

  if (!purchase) {
    console.warn("Prodamus webhook: заказ не найден", orderId);
    // Отвечаем 200, чтобы Prodamus не повторял уведомление бесконечно.
    return NextResponse.json({ ok: true });
  }

  if (!isProdamusPaymentSuccessful(payload)) {
    return NextResponse.json({ ok: true });
  }

  if (purchase.status === "PENDING") {
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: "PAID" },
    });

    try {
      await sendAccessEmail({
        to: purchase.email,
        accessToken: purchase.accessToken,
        siteUrl: getSiteUrl(req),
      });
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: { emailSentAt: new Date() },
      });
    } catch (error) {
      // Оплата уже засчитана, письмо можно переотправить вручную —
      // не роняем обработку вебхука из-за проблем с почтой.
      console.error("Не удалось отправить email с доступом:", error);
    }
  }

  return NextResponse.json({ ok: true });
}
