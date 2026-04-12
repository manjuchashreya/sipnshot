import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createContactSchema } from "@/lib/validators";

export async function GET() {
  const contacts = await prisma.contact.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(contacts);
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = createContactSchema.parse(json);

    const contact = await prisma.contact.create({
      data: payload,
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Could not create contact. Check the payload and email uniqueness.",
      },
      { status: 400 },
    );
  }
}
