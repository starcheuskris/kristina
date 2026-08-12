import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { courseConfig } from "@/lib/course-config";
import { buildProdamusPaymentUrl } from "@/lib/prodamus";

const orderSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

function getSiteUrl(req: NextRequest): string {
  return process.env.SITE_URL ?? req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
  }

  const { email } = parsed.data;
  const siteUrl = getSiteUrl(req);

  const purchase = await prisma.purchase.create({
    data: {
      email,
      amount: courseConfig.priceRub,
      productId: courseConfig.productId,
      prodamusOrderId: crypto.randomUUID(),
    },
  });

  try {
    const paymentUrl = buildProdamusPaymentUrl({
      orderId: purchase.prodamusOrderId,
      email,
      amount: purchase.amount,
      productName: courseConfig.brandName,
      successUrl: `${siteUrl}/success?order=${purchase.accessToken}`,
      notificationUrl: `${siteUrl}/api/webhook/prodamus`,
    });

    return NextResponse.json({ paymentUrl });
  } catch {
    return NextResponse.json(
      { error: "Оплата временно недоступна, попробуйте позже" },
      { status: 500 }
    );
  }
}
