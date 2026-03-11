import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { readEvents, countEvents, createEvent } from "@/lib/event-store";

export const GET = apiHandler(async () => {
  const events = await readEvents();
  return NextResponse.json(events);
});

export const POST = apiHandler(async (request: Request) => {
  const body = await request.json();
  const { featured, tag, title, shortDesc, description, day, month, time, location, price, thumb, gallery, includes } = body;

  if (!title || !tag) {
    return NextResponse.json({ error: "title and tag are required" }, { status: 400 });
  }

  const count = await countEvents();

  const event = await createEvent({
    featured: Boolean(featured),
    tag,
    title,
    shortDesc: shortDesc || "",
    description: description || "",
    day: day || "",
    month: month || "",
    time: time || "",
    location: location || "",
    price: price || "",
    thumb: thumb || "",
    gallery: gallery || [],
    includes: includes || [],
    order: count,
    active: true,
  });

  return NextResponse.json(event, { status: 201 });
});
