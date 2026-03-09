import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  const where = date ? { availableDate: date } : {};
  const dishes = await prisma.dailyDish.findMany({
    where,
    orderBy: { order: "asc" },
  });

  return NextResponse.json(dishes);
});

export const POST = apiHandler(async (request) => {
  const body = await request.json();
  const { name, description, price, category, photo, availableDate } = body;

  if (!name || !price || !category || !availableDate) {
    return NextResponse.json(
      { error: "name, price, category and availableDate are required" },
      { status: 400 }
    );
  }

  const count = await prisma.dailyDish.count({ where: { availableDate } });

  const dish = await prisma.dailyDish.create({
    data: {
      name,
      description: description || "",
      price,
      category,
      photo: photo || "",
      availableDate,
      order: count,
      active: true,
    },
  });

  return NextResponse.json(dish, { status: 201 });
});
