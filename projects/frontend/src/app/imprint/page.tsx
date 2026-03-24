import type { Metadata } from "next";
import { LegalDocLayout } from "@/components/legal/LegalDocLayout";

export const metadata: Metadata = {
  title: "Imprint | Raki",
  description: "Provider information for the Raki open-source project",
};

export default function ImprintPage() {
  return (
    <LegalDocLayout title="Imprint">
      <p>
        Raki is a non-commercial open-source project. The following information identifies the
        service provider within the meaning of applicable German law.
      </p>

      <h2>Responsible for content</h2>
      <p>
        Gregor Nageler
        <br />
        Lindenstr. 20
        <br />
        32545 Bad Oeynhausen
        <br />
        Germany
      </p>
      <p>
        Email:{" "}
        <a
          href="mailto:g.nageler@web.de"
          className="text-foreground underline underline-offset-4"
        >
          g.nageler@web.de
        </a>
      </p>

      <p>
        Abdulmalek Albakkar
        <br />
        Niederbecksener Str. 20
        <br />
        32545 Bad Oeynhausen
        <br />
        Germany
      </p>
      <p>
        Email:{" "}
        <a
          href="mailto:abdulmalekalbakkar@gmail.com"
          className="text-foreground underline underline-offset-4"
        >
          abdulmalekalbakkar@gmail.com
        </a>
      </p>

      <p>
        GitHub:{" "}
        <a
          href="https://github.com/ItIsGreg/Raki"
          className="text-foreground underline underline-offset-4"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://github.com/ItIsGreg/Raki
        </a>
      </p>
    </LegalDocLayout>
  );
}
