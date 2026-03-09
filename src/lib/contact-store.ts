import { prisma } from "@/lib/prisma";
import type { ContactInfo } from "@/app/types/contact";

const SINGLETON_ID = "singleton";

export async function readContactInfo(): Promise<ContactInfo> {
  let info = await prisma.contactInfo.findUnique({ where: { id: SINGLETON_ID } });

  if (!info) {
    info = await prisma.contactInfo.create({
      data: { id: SINGLETON_ID },
    });
  }

  return {
    ...info,
    updatedAt: info.updatedAt.toISOString(),
  };
}
