import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type LegalDocLayoutProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function LegalDocLayout({ title, children, className }: LegalDocLayoutProps) {
  return (
    <div className={cn("mx-auto max-w-2xl px-4 py-8", className)}>
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to home
      </Link>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">{title}</h1>
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-medium [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:text-foreground">
        {children}
      </div>
    </div>
  );
}
