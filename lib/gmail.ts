import { google } from "googleapis";

import { getGmailContext } from "@/lib/google-oauth";

function toBase64Url(input: string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function buildRawMessage({
  from,
  to,
  subject,
  body,
}: {
  from: string;
  to: string;
  subject: string;
  body: string;
}) {
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    body,
  ].join("\n");

  return toBase64Url(message);
}

export async function createRawMessage(input: {
  to: string;
  subject: string;
  body: string;
}) {
  const { senderEmail } = await getGmailContext();

  return buildRawMessage({
    from: senderEmail,
    ...input,
  });
}

export { getGmailContext };
