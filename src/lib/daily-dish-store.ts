import { prisma } from "@/lib/prisma";
import type { DailyDish } from "@/app/types/daily-dish";

function toDailyDish(d: {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  photo: string;
  availableDate: string;
  order: number;
  active: boolean;
  createdAt: Date;
}): DailyDish {
  return { ...d, createdAt: d.createdAt.toISOString() };
}

export async function readAllDailyDishes(): Promise<DailyDish[]> {
  const dishes = await prisma.dailyDish.findMany({ orderBy: { order: "asc" } });
  return dishes.map(toDailyDish);
}

export async function readDishesForDate(date: string): Promise<DailyDish[]> {
  const dishes = await prisma.dailyDish.findMany({
    where: { availableDate: date, active: true },
    orderBy: { order: "asc" },
  });
  return dishes.map(toDailyDish);
}

export async function readTodaysDishes(): Promise<DailyDish[]> {
  const today = new Date().toISOString().split("T")[0];
  return readDishesForDate(today);
}
