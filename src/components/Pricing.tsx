import { courseConfig } from "@/lib/course-config";
import { PurchaseForm } from "@/components/PurchaseForm";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("ru-RU").format(value);

export function Pricing() {
  const { priceRub, priceOldRub } = courseConfig;
  return (
    <section id="pricing" className="border-y border-border bg-card">
      <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-24">
        <h2 className="text-3xl font-semibold tracking-tight">Доступ к курсу</h2>
        <p className="mt-4 text-muted">
          Оплата картой или через СБП. Доступ откроется автоматически — в Telegram
          и на почту, сразу после оплаты.
        </p>
        <div className="mt-8 flex items-end justify-center gap-3">
          <span className="text-5xl font-semibold tracking-tight">
            {formatPrice(priceRub)} ₽
          </span>
          {priceOldRub && (
            <span className="pb-2 text-lg text-muted line-through">
              {formatPrice(priceOldRub)} ₽
            </span>
          )}
        </div>
        <div className="mx-auto max-w-md">
          <PurchaseForm />
        </div>
      </div>
    </section>
  );
}
