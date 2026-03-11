import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { readContactInfo, updateContactInfo } from "@/lib/contact-store";

export const GET = apiHandler(async () => {
  const info = await readContactInfo();
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

  const info = await updateContactInfo(data);
  return NextResponse.json(info);
});
