"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ImpressumRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/imprint");
  }, [router]);

  return (
    <p className="p-4 text-center text-sm text-muted-foreground">
      Redirecting to Imprint…
    </p>
  );
}
