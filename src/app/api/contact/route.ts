import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

const SINGLETON_ID = "singleton";

export const GET = apiHandler(async () => {
  let info = await prisma.contactInfo.findUnique({ where: { id: SINGLETON_ID } });

  if (!info) {
    info = await prisma.contactInfo.create({ data: { id: SINGLETON_ID } });
  }

  return NextResponse.json(info);
});

export const PUT = apiHandler(async (request) => {
  const body = await request.json();

  const data: Record<string, string> = {};
  const fields = [
    "phone", "email", "address", "whatsapp", "facebook", "instagram",
    "hours1Label", "hours1Value", "hours2Label", "hours2Value",
    "hours3Label", "hours3Value", "footerDesc",
  ];

  for (const field of fields) {
    if (body[field] !== undefined) {
      data[field] = String(body[field]);
    }
  }

  const info = await prisma.contactInfo.upsert({
    where: { id: SINGLETON_ID },
    update: data,
    create: { id: SINGLETON_ID, ...data },
  });

  return NextResponse.json(info);
});
