import { courseConfig } from "@/lib/course-config";

const links = [
  { href: "#about", label: "О курсе" },
  { href: "#program", label: "Программа" },
  { href: "#reviews", label: "Отзывы" },
  { href: "#faq", label: "Вопросы" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="text-lg font-semibold tracking-tight">
          {courseConfig.brandName}
        </a>
        <nav className="hidden gap-8 text-sm text-muted md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href="#pricing"
          className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          {courseConfig.hero.ctaLabel}
        </a>
      </div>
    </header>
  );
}
