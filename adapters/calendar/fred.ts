import { CalendarAdapter, CalendarAdapterParams, CalendarEvent } from "@/types";

export class FREDCalendarAdapter implements CalendarAdapter {
  private apiKey: string;
  private baseUrl = "https://api.stlouisfed.org/fred";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getName(): string {
    return "FRED";
  }

  async fetchEvents(params: CalendarAdapterParams): Promise<CalendarEvent[]> {
    // FRED doesn't have a calendar API, but we can fetch recent releases
    // This is a simplified implementation using economic indicators as "events"
    
    try {
      const series = [
        { id: "UNRATE", name: "Unemployment Rate", impact: "high" as const },
        { id: "CPIAUCSL", name: "CPI", impact: "high" as const },
        { id: "GDP", name: "GDP", impact: "high" as const },
        { id: "FEDFUNDS", name: "Fed Funds Rate", impact: "high" as const },
        { id: "DGS10", name: "10-Year Treasury", impact: "medium" as const },
      ];

      const events: CalendarEvent[] = [];

      for (const s of series) {
        try {
          const url = `${this.baseUrl}/series/observations?series_id=${s.id}&api_key=${this.apiKey}&file_type=json&limit=1&sort_order=desc`;
          
          const response = await fetch(url);
          if (!response.ok) continue;

          const data = await response.json();
          
          if (data.observations && data.observations.length > 0) {
            const obs = data.observations[0];
            
            events.push({
              id: `fred-${s.id}-${obs.date}`,
              date: new Date(obs.date).toISOString(),
              country: "US",
              event: s.name,
              impact: s.impact,
              actual: obs.value,
              forecast: undefined,
              previous: undefined,
              currency: "USD",
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch ${s.id}:`, error);
        }
      }

      return events;
    } catch (error) {
      console.error("FRED calendar fetch error:", error);
      return [];
    }
  }
}
