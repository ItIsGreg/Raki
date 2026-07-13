"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Bump this version if the disclaimer text changes so previously-acknowledged
// users are prompted to accept the updated notice again.
const ACKNOWLEDGED_KEY = "raki-disclaimer-acknowledged-v1";

export function DisclaimerGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(ACKNOWLEDGED_KEY) !== "true") {
        setOpen(true);
      }
    } catch {
      // If storage is unavailable, fail open and still show the notice.
      setOpen(true);
    }
  }, []);

  const acknowledge = () => {
    try {
      localStorage.setItem(ACKNOWLEDGED_KEY, "true");
    } catch {
      // Ignore storage errors; the notice simply reappears next time.
    }
    setOpen(false);
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="max-w-md"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Before you continue</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-left">
              <p>
                Raki is a <strong>research data tool</strong> for curating and structuring text.
              </p>
              <p>
                It is <strong>not intended for clinical use</strong>, diagnosis, or treatment
                decisions.
              </p>
              <p>
                Please use <strong>anonymized data only</strong>—do not enter personal or
                patient-identifying information.
              </p>
              <p className="text-xs">
                See the{" "}
                <Link
                  href="/disclaimer"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Disclaimer
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Privacy
                </Link>{" "}
                for details.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={acknowledge}>I understand and agree</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
