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
    try {
      // Economic indicators that update weekly
      const series = [
        { id: "UNRATE", name: "Unemployment Rate", impact: "high" as const, freq: "monthly" },
        { id: "CPIAUCSL", name: "Consumer Price Index (CPI)", impact: "high" as const, freq: "monthly" },
        { id: "GDP", name: "GDP Growth", impact: "high" as const, freq: "quarterly" },
        { id: "FEDFUNDS", name: "Federal Funds Rate", impact: "high" as const, freq: "monthly" },
        { id: "DGS10", name: "10-Year Treasury Yield", impact: "medium" as const, freq: "daily" },
        { id: "DGS2", name: "2-Year Treasury Yield", impact: "medium" as const, freq: "daily" },
        { id: "T10Y2Y", name: "10Y-2Y Yield Spread", impact: "high" as const, freq: "daily" },
        { id: "DCOILWTICO", name: "WTI Crude Oil Price", impact: "medium" as const, freq: "daily" },
        { id: "DEXUSEU", name: "USD/EUR Exchange Rate", impact: "medium" as const, freq: "daily" },
      ];

      const events: CalendarEvent[] = [];

      // Get data from start of this week (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const thisMonday = new Date(now);
      thisMonday.setDate(now.getDate() - daysToMonday);
      thisMonday.setHours(0, 0, 0, 0);
      
      const observationStart = thisMonday.toISOString().split('T')[0];

      for (const s of series) {
        try {
          const url = `${this.baseUrl}/series/observations?series_id=${s.id}&api_key=${this.apiKey}&file_type=json&observation_start=${observationStart}&sort_order=desc&limit=10`;
          
          const response = await fetch(url);
          if (!response.ok) continue;

          const data = await response.json();
          
          if (data.observations && data.observations.length > 0) {
            data.observations.forEach((obs: any, index: number) => {
              const eventDate = new Date(obs.date + "T14:30:00Z");
              
              // Only include if from this week
              if (eventDate >= thisMonday && eventDate <= now) {
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
              }
            });
          }
        } catch (error) {
          console.warn(`Failed to fetch ${s.id}:`, error);
        }
      }

      // Sort by date descending
      return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error("FRED calendar fetch error:", error);
      return [];
    }
  }
}
