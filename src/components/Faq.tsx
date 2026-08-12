import { courseConfig } from "@/lib/course-config";

export function Faq() {
  const { faq } = courseConfig;
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h2 className="text-3xl font-semibold tracking-tight">Частые вопросы</h2>
      <div className="mt-8 divide-y divide-border border-t border-border">
        {faq.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {item.q}
              <span className="shrink-0 text-muted transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
