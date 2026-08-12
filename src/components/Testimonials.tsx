import { courseConfig } from "@/lib/course-config";

export function Testimonials() {
  const { testimonials } = courseConfig;
  return (
    <section id="reviews" className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <h2 className="text-3xl font-semibold tracking-tight">Отзывы</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <figure
            key={i}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <blockquote className="text-sm text-muted">“{t.text}”</blockquote>
            <figcaption className="mt-4 text-sm font-medium">{t.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
