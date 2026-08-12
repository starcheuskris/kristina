import { courseConfig } from "@/lib/course-config";

export function Hero() {
  const { hero } = courseConfig;
  return (
    <section id="top" className="mx-auto max-w-6xl px-6 pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-block rounded-full border border-border bg-card px-4 py-1 text-xs font-medium uppercase tracking-wide text-muted">
          {hero.eyebrow}
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance md:text-6xl">
          {hero.title}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted text-balance">
          {hero.subtitle}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#pricing"
            className="w-full rounded-full bg-accent px-8 py-3 text-base font-medium text-accent-foreground transition-opacity hover:opacity-90 sm:w-auto"
          >
            {hero.ctaLabel}
          </a>
          <a
            href="#program"
            className="w-full rounded-full border border-border px-8 py-3 text-base font-medium transition-colors hover:bg-card sm:w-auto"
          >
            Смотреть программу
          </a>
        </div>
      </div>
    </section>
  );
}
