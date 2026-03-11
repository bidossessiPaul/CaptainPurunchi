import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/api-handler";
import { getUnifiedCalendarEvents } from "@/lib/calendar-store";

/**
 * GET /api/calendar/reservations?start=2026-03-01&end=2026-03-31&type=all&status=all
 * Returns unified calendar events for the specified date range
 */
export const GET = apiHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const type = (searchParams.get("type") || "all") as 'all' | 'table' | 'room' | 'event';
  const status = searchParams.get("status") || undefined;

  // Validate required params
  if (!start || !end) {
    return NextResponse.json(
      { error: "start and end date parameters are required (YYYY-MM-DD format)" },
      { status: 400 }
    );
  }

  // Validate date format (basic check)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(start) || !dateRegex.test(end)) {
    return NextResponse.json(
      { error: "Invalid date format. Use YYYY-MM-DD" },
      { status: 400 }
    );
  }

  // Fetch unified events
  const events = await getUnifiedCalendarEvents(
    start,
    end,
    type,
    status && status !== 'all' ? status : undefined
  );

  // Serialize dates to ISO strings for JSON response
  const serializedEvents = events.map(event => ({
    ...event,
    start: event.start.toISOString(),
    end: event.end.toISOString(),
  }));

  return NextResponse.json(serializedEvents);
});
