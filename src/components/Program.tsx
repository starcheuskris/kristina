import { courseConfig } from "@/lib/course-config";

export function Program() {
  const { program } = courseConfig;
  return (
    <section id="program" className="border-y border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <h2 className="text-3xl font-semibold tracking-tight">Программа курса</h2>
        <ol className="mt-10 divide-y divide-border border-t border-border">
          {program.map((module, i) => (
            <li key={module.title} className="flex gap-6 py-6">
              <span className="font-mono text-sm text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-medium">{module.title}</h3>
                <p className="mt-1 text-sm text-muted">{module.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
