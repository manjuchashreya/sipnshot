import { NextResponse } from "next/server";

import { createRawMessage, getGmailContext } from "@/lib/gmail";
import { prisma } from "@/lib/prisma";
import { contactIdSchema } from "@/lib/validators";

export async function POST(request: Request) {
  let contactId: number | undefined;

  try {
    const json = await request.json();
    const parsed = contactIdSchema.parse(json);
    contactId = parsed.contactId;

    const contact = await prisma.contact.findUnique({
      where: {
        id: contactId,
      },
    });

    if (!contact || !contact.subject || !contact.body) {
      return NextResponse.json(
        { error: "Contact not found or draft content is missing." },
        { status: 404 },
      );
    }

    const { gmail } = await getGmailContext();
    const raw = await createRawMessage({
      to: contact.email,
      subject: contact.subject,
      body: contact.body,
    });

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw,
      },
    });

    const updated = await prisma.contact.update({
      where: {
        id: contactId,
      },
      data: {
        status: "sent",
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);

    if (typeof contactId === "number") {
      await prisma.contact
        .update({
          where: { id: contactId },
          data: { status: "failed" },
        })
        .catch(() => undefined);
    }

    return NextResponse.json({ error: "Could not send Gmail message." }, { status: 500 });
  }
}
