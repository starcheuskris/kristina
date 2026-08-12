import { courseConfig } from "@/lib/course-config";

export function Footer() {
  const { footer, brandName } = courseConfig;
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-10 text-sm text-muted md:flex-row md:justify-between">
        <p>
          © {new Date().getFullYear()} {brandName}
        </p>
        <div className="flex gap-6">
          <a href={`mailto:${footer.contactEmail}`} className="hover:text-foreground">
            {footer.contactEmail}
          </a>
          <a
            href={`https://t.me/${footer.telegramChannelPublicName.replace("@", "")}`}
            className="hover:text-foreground"
          >
            {footer.telegramChannelPublicName}
          </a>
        </div>
      </div>
    </footer>
  );
}
