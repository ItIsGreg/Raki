import Link from "next/link";
import { cn } from "@/lib/utils";

const linkClass =
  "text-muted-foreground underline-offset-4 hover:text-foreground hover:underline";

type LegalFooterProps = {
  className?: string;
};

export function LegalFooter({ className }: LegalFooterProps) {
  return (
    <footer
      role="contentinfo"
      className={cn(
        "shrink-0 border-t border-border bg-muted/30 px-3 py-2 text-center text-xs text-muted-foreground",
        className
      )}
    >
      <p className="mb-1.5 leading-snug">
        Open-source tool for research data curation—not medical advice, not for clinical use. AI
        outputs may be wrong; verify before you rely on them.
      </p>
      <nav
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1"
        aria-label="Legal"
      >
        <Link href="/disclaimer" className={linkClass}>
          Disclaimer
        </Link>
        <span className="text-border" aria-hidden>
          |
        </span>
        <Link href="/imprint" className={linkClass}>
          Imprint
        </Link>
        <span className="text-border" aria-hidden>
          |
        </span>
        <Link href="/privacy" className={linkClass}>
          Privacy
        </Link>
        <span className="text-border" aria-hidden>
          |
        </span>
        <Link href="/terms" className={linkClass}>
          Terms
        </Link>
      </nav>
    </footer>
  );
}
