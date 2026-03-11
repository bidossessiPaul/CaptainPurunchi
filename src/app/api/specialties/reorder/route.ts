import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { updateSpecialty, readSpecialties } from "@/lib/specialty-store";

export const PUT = apiHandler(async (request: Request) => {
  const { orderedIds } = (await request.json()) as { orderedIds: string[] };

  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds array is required" }, { status: 400 });
  }

  for (let i = 0; i < orderedIds.length; i++) {
    await updateSpecialty(orderedIds[i], { order: i });
  }

  const items = await readSpecialties();
  return NextResponse.json(items);
});
