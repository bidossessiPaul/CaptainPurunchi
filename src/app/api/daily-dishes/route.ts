import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { readAllDailyDishes, readDishesForDate, countDailyDishesByDate, createDailyDish } from "@/lib/daily-dish-store";

export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  const dishes = date ? await readDishesForDate(date) : await readAllDailyDishes();

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

  const count = await countDailyDishesByDate(availableDate);

  const dish = await createDailyDish({
    name,
    description: description || "",
    price,
    category,
    photo: photo || "",
    availableDate,
    order: count,
    active: true,
  });

  return NextResponse.json(dish, { status: 201 });
});
