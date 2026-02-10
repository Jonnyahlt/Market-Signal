import { NextRequest, NextResponse } from "next/server";
import { CalendarAdapterFactory } from "@/adapters";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const params = {
      dateFrom: searchParams.get("dateFrom")
        ? new Date(searchParams.get("dateFrom")!)
        : undefined,
      dateTo: searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : undefined,
      countries: searchParams.get("countries")?.split(","),
      impact: searchParams.get("impact")?.split(",") as ("low" | "medium" | "high")[] | undefined,
    };

    const adapter = CalendarAdapterFactory.getAdapter();
    const events = await adapter.fetchEvents(params);

    return NextResponse.json({
      success: true,
      data: events,
      count: events.length,
      adapter: adapter.getName(),
    });
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
