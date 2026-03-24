import type { Metadata } from "next";
import { LegalDocLayout } from "@/components/legal/LegalDocLayout";

export const metadata: Metadata = {
  title: "Privacy | Raki",
  description: "Privacy information for the Raki application and website",
};

export default function PrivacyPage() {
  return (
    <LegalDocLayout title="Privacy">
      <p>
        This page explains how data flows in Raki from a privacy perspective. It is{" "}
        <strong>not</strong> legal advice. Have it reviewed if you process sensitive or
        health-related information.
      </p>

      <h2>Your responsibility</h2>
      <p>
        <strong>You are solely responsible</strong> for all data you enter, upload, or otherwise
        make available in Raki—including whether that data may include personal or sensitive
        information. You decide what to submit, how to anonymise or aggregate it, and whether use
        complies with your laws, contracts, and internal policies.
      </p>

      <h2>Raki backend</h2>
      <p>
        When you use features that call the application, your content is <strong>sent to the Raki
        backend</strong> for processing (for example to prepare or run extraction and segmentation).
        The backend <strong>does not store</strong> that content for later use: it processes the
        request and <strong>does not persist your data</strong> after processing is finished. There
        is no database or long-term retention of your submitted text on the backend for these
        operations.
      </p>

      <h2>Language models you configure</h2>
      <p>
        Raki can forward data to <strong>large language model (LLM) services that you configure</strong>{" "}
        (API keys, endpoints, or providers you choose). That means the text you send may be
        transmitted to those third parties and processed under <strong>their</strong> terms and
        privacy policies. Raki does not control those providers or their handling of your data.
      </p>

      <h2>No assumption of responsibility</h2>
      <p>
        The Raki open-source project and its contributors <strong>do not assume responsibility</strong>{" "}
        for your data, for how you use the software, or for processing by the Raki backend or by any
        LLM or other third-party service you connect. You use Raki at your own risk and are
        responsible for lawful and appropriate use.
      </p>

      <h2>Local data on your device</h2>
      <p>
        Workspace data such as profiles, settings, or cached texts may be kept{" "}
        <strong>locally on your device</strong> (e.g. browser or app storage) so the tool can
        function. That storage is under your control on your machine; clear or manage it as you
        see fit.
      </p>
    </LegalDocLayout>
  );
}
