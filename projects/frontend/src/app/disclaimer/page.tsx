import type { Metadata } from "next";
import { LegalDocLayout } from "@/components/legal/LegalDocLayout";

export const metadata: Metadata = {
  title: "Disclaimer | Raki",
  description: "Disclaimer for the Raki open-source research data curation tool",
};

export default function DisclaimerPage() {
  return (
    <LegalDocLayout title="Disclaimer">
      <p className="!mt-0 text-xs text-muted-foreground">Last updated: 2026-03-24</p>

      <p>
        Raki is <strong>open-source software</strong> intended to help <strong>curate and structure
        research-related text</strong> (for example material derived from clinical or procedural
        reports). It is an <strong>informational and technical tool</strong>, not a medical product.
      </p>

      <p>
        Raki <strong>does not provide medical advice</strong> and is <strong>not for clinical use
        </strong>, diagnosis, treatment decisions, or emergency care. It is not a medical device and
        must not replace professional medical judgment, institutional workflows, or regulatory
        requirements that apply to your work.
      </p>

      <p>
        If you are not a qualified healthcare or research professional with appropriate oversight,
        <strong> do not rely on Raki</strong> for decisions about your health or anyone else&apos;s.
        If you have a medical condition or concerns about your health, consult a qualified
        healthcare provider.
      </p>

      <p>
        Outputs from language models and automated extraction <strong>may be incomplete, biased, or
        wrong</strong>. Information may come from sources or models that are not error-free;
        neither the Raki project nor contributors warrant the accuracy of information produced or
        derived through the app. Standards and best practices evolve—we do not guarantee
        completeness or reliability.
      </p>

      <p>
        Raki <strong>does not endorse</strong> specific tests, treatments, providers, or uses. Use
        of the software is <strong>at your own risk</strong>. To the extent permitted by law, the
        project and its contributors are <strong>not liable</strong> for consequences arising from
        use of the software or any content it helps produce.
      </p>

      <p>
        Nothing on this site or in the application constitutes medical, legal, or professional
        advice. The software is provided &quot;as is&quot;, without warranty of any kind, to the
        extent permitted by law.
      </p>
    </LegalDocLayout>
  );
}
