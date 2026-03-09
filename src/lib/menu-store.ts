import { prisma } from "@/lib/prisma";
import type { MenuCategoryWithItems } from "@/app/types/menu";

function toCategory(c: {
  id: string;
  name: string;
  icon: string;
  order: number;
  active: boolean;
  createdAt: Date;
  items: {
    id: string;
    categoryId: string;
    name: string;
    description: string;
    price: string;
    order: number;
    active: boolean;
    createdAt: Date;
  }[];
}): MenuCategoryWithItems {
  return {
    ...c,
    createdAt: c.createdAt.toISOString(),
    items: c.items.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

export async function readCategories(): Promise<MenuCategoryWithItems[]> {
  const cats = await prisma.menuCategory.findMany({
    orderBy: { order: "asc" },
    include: { items: { orderBy: { order: "asc" } } },
  });
  return cats.map(toCategory);
}

export async function readActiveMenu(): Promise<MenuCategoryWithItems[]> {
  const cats = await prisma.menuCategory.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: {
      items: {
        where: { active: true },
        orderBy: { order: "asc" },
      },
    },
  });
  return cats.map(toCategory);
}
