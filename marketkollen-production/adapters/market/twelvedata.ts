import { MarketDataAdapter, MarketTicker, ChartDataPoint } from "@/types";

export class TwelveDataAdapter implements MarketDataAdapter {
  private apiKey: string;
  private baseUrl = "https://api.twelvedata.com";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getName(): string {
    return "TwelveData";
  }

  async fetchTicker(symbol: string): Promise<MarketTicker> {
    try {
      const url = `${this.baseUrl}/quote?symbol=${symbol}&apikey=${this.apiKey}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`TwelveData API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.code === 401 || data.status === "error") {
        throw new Error(data.message || "API error");
      }

      return {
        symbol: data.symbol,
        name: data.name || data.symbol,
        type: "stock",
        price: parseFloat(data.close),
        change: parseFloat(data.change),
        changePercent: parseFloat(data.percent_change),
        volume: data.volume ? parseFloat(data.volume) : undefined,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("TwelveData fetch error:", error);
      throw error;
    }
  }

  async fetchMultipleTickers(symbols: string[]): Promise<MarketTicker[]> {
    try {
      // TwelveData supports batch requests
      const symbolString = symbols.join(",");
      const url = `${this.baseUrl}/quote?symbol=${symbolString}&apikey=${this.apiKey}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`TwelveData API error: ${response.status}`);
      }

      const data = await response.json();

      // Handle both single and multiple results
      const quotes = Array.isArray(data) ? data : [data];

      return quotes
        .map((quote): MarketTicker | null => {
          try {
            if (quote.code === 401 || quote.status === "error") {
              console.warn(`Error for ${quote.symbol}:`, quote.message);
              return null;
            }

            return {
              symbol: quote.symbol,
              name: quote.name || quote.symbol,
              type: "stock",
              price: parseFloat(quote.close),
              change: parseFloat(quote.change),
              changePercent: parseFloat(quote.percent_change),
              volume: quote.volume ? parseFloat(quote.volume) : undefined,
              lastUpdated: new Date().toISOString(),
            };
          } catch (error) {
            console.warn(`Failed to parse ticker for ${quote.symbol}:`, error);
            return null;
          }
        })
        .filter((ticker): ticker is MarketTicker => ticker !== null);
    } catch (error) {
      console.error("TwelveData batch fetch error:", error);
      return [];
    }
  }

  async fetchChartData(
    symbol: string,
    interval: string,
    from?: Date,
    to?: Date
  ): Promise<ChartDataPoint[]> {
    try {
      const url = `${this.baseUrl}/time_series?symbol=${symbol}&interval=${interval}&outputsize=100&apikey=${this.apiKey}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`TwelveData API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.code === 401 || data.status === "error") {
        throw new Error(data.message || "API error");
      }

      if (!data.values || !Array.isArray(data.values)) {
        throw new Error("No time series data found");
      }

      return data.values.map((point: any) => ({
        timestamp: new Date(point.datetime).getTime(),
        open: parseFloat(point.open),
        high: parseFloat(point.high),
        low: parseFloat(point.low),
        close: parseFloat(point.close),
        volume: point.volume ? parseFloat(point.volume) : undefined,
      }));
    } catch (error) {
      console.error("TwelveData chart data fetch error:", error);
      return [];
    }
  }
}
