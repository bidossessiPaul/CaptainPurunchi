import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const { name, email, phone, subject, message } = body;

  if (!name || !phone || !message) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const msg = await prisma.contactMessage.create({
    data: {
      name,
      email: email || "",
      phone,
      subject: subject || "",
      message,
    },
  });

  return NextResponse.json(msg, { status: 201 });
});

export const GET = apiHandler(async () => {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(messages);
});
