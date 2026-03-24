import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocLayout } from "@/components/legal/LegalDocLayout";

export const metadata: Metadata = {
  title: "Terms of Use | Raki",
  description: "Terms of use for the Raki open-source software (Apache License 2.0)",
};

export default function TermsPage() {
  return (
    <LegalDocLayout title="Terms of Use">
      <p className="!mt-0 text-xs text-muted-foreground">Last updated: 2026-03-24</p>

      <h2>1. Purpose</h2>
      <p>
        Raki is <strong>open-source software</strong> to help users <strong>curate and structure
        research-related information</strong> from text (including material related to medical or
        procedural reports). It is provided for <strong>informational and technical purposes
        only</strong>. It does not provide medical advice, diagnosis, or treatment and is not
        intended for clinical use. See also the{" "}
        <Link href="/disclaimer" className="text-foreground underline underline-offset-4">
          Disclaimer
        </Link>
        .
      </p>

      <h2>2. No medical advice</h2>
      <p>
        Raki is <strong>not a substitute</strong> for professional medical advice, diagnosis, or
        treatment. Always seek the advice of a qualified healthcare provider regarding medical
        questions. Do not disregard or delay seeking professional advice because of something you
        encountered in or through Raki.
      </p>

      <h2>3. Open source license (Apache 2.0)</h2>
      <p>
        Raki is made available under the{" "}
        <strong>Apache License, Version 2.0</strong> (the &quot;License&quot;). You may use, modify,
        and distribute the software <strong>in accordance with the License</strong>, including
        keeping required notices and following its patent and attribution terms. The full text is
        published by the Apache Software Foundation at{" "}
        <a
          href="https://www.apache.org/licenses/LICENSE-2.0"
          className="text-foreground underline underline-offset-4"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://www.apache.org/licenses/LICENSE-2.0
        </a>
        .
      </p>
      <p>
        If you build on or redistribute Raki, you are responsible for complying with the License
        and with all applicable laws. Nothing in these Terms of Use restricts rights the License
        expressly grants.
      </p>

      <h2>4. Acceptable use</h2>
      <p>You agree to use Raki only in compliance with applicable laws and regulations. For example, you must not:</p>
      <ul>
        <li>Use Raki for any unlawful purpose or in a way that infringes others&apos; rights.</li>
        <li>Use Raki in a manner that could harm, disable, or overload project infrastructure you do not own (e.g. hosted demos), except as permitted.</li>
        <li>Remove or alter required copyright or license notices when distributing the software contrary to the Apache 2.0 requirements.</li>
      </ul>
      <p>
        Unlike some proprietary apps, <strong>modifying or studying the source code is allowed</strong>{" "}
        when done under the terms of the Apache License 2.0.
      </p>

      <h2>5. Intellectual property</h2>
      <p>
        Copyright in the Raki codebase and project materials belongs to the respective{" "}
        <strong>contributors</strong>. Your rights to use that material come from the Apache
        License 2.0 (and, for third-party dependencies, their licenses). Except as the License
        allows, no additional rights are granted by these Terms.
      </p>

      <h2>6. Data and privacy</h2>
      <p>
        Raki can process text you provide, send it to a <strong>Raki backend</strong> for
        processing, and forward content to <strong>language-model providers you configure</strong>.
        You are responsible for your data and for lawful use. Details are described in the{" "}
        <Link href="/privacy" className="text-foreground underline underline-offset-4">
          Privacy
        </Link>{" "}
        page. These Terms do not replace that notice.
      </p>

      <h2>7. Disclaimer of warranties</h2>
      <p>
        Raki is provided <strong>&quot;as is&quot;</strong> and <strong>&quot;as available&quot;</strong>
        , without warranties of any kind beyond those stated in the Apache License 2.0. To the
        fullest extent permitted by law, the project and contributors disclaim any additional
        warranties, including as to accuracy, reliability, fitness for a particular purpose, or
        uninterrupted or error-free operation.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, the Raki project and its contributors shall not be
        liable for any indirect, incidental, special, consequential, or punitive damages, or any
        loss of profits or revenues, arising out of your use of Raki. The limitations in the Apache
        License 2.0 apply where applicable.
      </p>

      <h2>9. Changes to these terms</h2>
      <p>
        These Terms of Use may be updated from time to time. We will adjust the &quot;Last
        updated&quot; date when we do. Continued use of the software or site after changes
        constitutes acceptance of the revised terms, to the extent reasonable and enforceable under
        applicable law.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These Terms of Use shall be governed by and construed in accordance with the{" "}
        <strong>laws of Germany</strong>, without regard to conflict-of-law principles that would
        require applying another jurisdiction&apos;s law. Mandatory consumer protections where they
        apply remain unaffected.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these Terms may be directed using the contact details on the{" "}
        <Link href="/imprint" className="text-foreground underline underline-offset-4">
          Imprint
        </Link>{" "}
        page.
      </p>

      <h2>12. Acknowledgment</h2>
      <p>
        By using Raki, you acknowledge that you have read and understood these Terms of Use and the
        applicable open-source license, and you agree to be bound by these Terms where they apply
        alongside the License.
      </p>
    </LegalDocLayout>
  );
}
