import { NextResponse } from "next/server";

import { generateDraftFromTemplate } from "@/lib/draft-template";
import { prisma } from "@/lib/prisma";
import { contactIdSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { contactId } = contactIdSchema.parse(json);

    const contact = await prisma.contact.findUnique({
      where: {
        id: contactId,
      },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found." }, { status: 404 });
    }

    const draft = generateDraftFromTemplate(contact);

    const updated = await prisma.contact.update({
      where: {
        id: contactId,
      },
      data: {
        subject: draft.subject,
        body: draft.body,
        status: "draft_generated",
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not generate draft." }, { status: 400 });
  }
}
