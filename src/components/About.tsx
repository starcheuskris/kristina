import { courseConfig } from "@/lib/course-config";

export function About() {
  const { about, benefits } = courseConfig;
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">{about.title}</h2>
          <div className="mt-6 space-y-4 text-muted">
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h3 className="font-medium">{b.title}</h3>
              <p className="mt-2 text-sm text-muted">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
