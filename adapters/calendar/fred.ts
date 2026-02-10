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
    
    try {
      const series = [
        { id: "UNRATE", name: "Unemployment Rate", impact: "high" as const },
        { id: "CPIAUCSL", name: "CPI", impact: "high" as const },
        { id: "GDP", name: "GDP", impact: "high" as const },
        { id: "FEDFUNDS", name: "Fed Funds Rate", impact: "high" as const },
        { id: "DGS10", name: "10-Year Treasury", impact: "medium" as const },
      ];

      const events: CalendarEvent[] = [];

      // Get observations from last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const observationStart = sixMonthsAgo.toISOString().split('T')[0];

      for (const s of series) {
        try {
          const url = `${this.baseUrl}/series/observations?series_id=${s.id}&api_key=${this.apiKey}&file_type=json&observation_start=${observationStart}&sort_order=desc&limit=3`;
          
          const response = await fetch(url);
          if (!response.ok) continue;

          const data = await response.json();
          
          if (data.observations && data.observations.length > 0) {
            data.observations.forEach((obs: any, index: number) => {
              const eventDate = new Date(obs.date + "T14:30:00Z");
              
              events.push({
                id: `fred-${s.id}-${obs.date}`,
                date: eventDate.toISOString(),
                country: "US",
                event: s.name,
                impact: s.impact,
                actual: obs.value,
                forecast: undefined,
                previous: index < data.observations.length - 1 ? data.observations[index + 1].value : undefined,
                currency: "USD",
              });
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch ${s.id}:`, error);
        }
      }

      return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error("FRED calendar fetch error:", error);
      return [];
    }
  }
}
