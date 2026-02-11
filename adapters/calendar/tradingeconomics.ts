import { CalendarAdapter, CalendarAdapterParams, CalendarEvent } from "@/types";
import { z } from "zod";

// Trading Economics API response schema
const TEEventSchema = z.object({
  Date: z.string(),
  Country: z.string(),
  Category: z.string(),
  Event: z.string(),
  Reference: z.string().optional(),
  Actual: z.union([z.string(), z.number(), z.null()]).optional(),
  Previous: z.union([z.string(), z.number(), z.null()]).optional(),
  Forecast: z.union([z.string(), z.number(), z.null()]).optional(),
  TEForecast: z.union([z.string(), z.number(), z.null()]).optional(),
  Importance: z.number().optional(),
});

export class TradingEconomicsAdapter implements CalendarAdapter {
  private baseUrl = "https://api.tradingeconomics.com";
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.TRADING_ECONOMICS_API_KEY || "";
  }

  getName(): string {
    return "TradingEconomics";
  }

  async fetchEvents(params: CalendarAdapterParams): Promise<CalendarEvent[]> {
    if (!this.apiKey) {
      console.warn("Trading Economics API key not configured, returning empty");
      return [];
    }

    try {
      // Get events for next 7 days
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const url = `${this.baseUrl}/calendar/country/united%20states/${this.formatDate(today)}/${this.formatDate(nextWeek)}?c=${this.apiKey}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Trading Economics API error: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        return [];
      }

      return data
        .map((event: any) => {
          try {
            const validated = TEEventSchema.parse(event);

            // Map importance (1-3) to impact level
            let impact: "high" | "medium" | "low" = "low";
            if (validated.Importance === 3) impact = "high";
            else if (validated.Importance === 2) impact = "medium";

            return {
              id: `te-${validated.Date}-${validated.Event}`,
              date: new Date(validated.Date).toISOString(),
              country: validated.Country,
              event: validated.Event,
              impact,
              actual: validated.Actual?.toString(),
              forecast: validated.Forecast?.toString() || validated.TEForecast?.toString(),
              previous: validated.Previous?.toString(),
              currency: "USD",
            } as CalendarEvent;
          } catch (error) {
            console.warn("Failed to parse TE event:", error);
            return null;
          }
        })
        .filter((event): event is CalendarEvent => event !== null)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      console.error("Trading Economics fetch error:", error);
      return [];
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
