import { MarketDataAdapter, MarketTicker, ChartDataPoint } from "@/types";

export class PolygonAdapter implements MarketDataAdapter {
  private apiKey: string;
  private baseUrl = "https://api.massive.com";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getName(): string {
    return "Massive (Polygon)";
  }

  async fetchTicker(symbol: string): Promise<MarketTicker> {
    try {
      // Get previous close
      const url = `${this.baseUrl}/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${this.apiKey}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Polygon API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== "OK" || !data.results || data.results.length === 0) {
        throw new Error(`No data for symbol: ${symbol}`);
      }

      const result = data.results[0];
      const ticker = data.ticker || symbol; // Use ticker from response or fallback to input symbol

      // Calculate change (we need to get snapshot for real-time price)
      const change = result.c - result.o;
      const changePercent = ((change / result.o) * 100);

      return {
        symbol: ticker.toUpperCase(),
        name: ticker.toUpperCase(), // Polygon doesn't provide name in this endpoint
        type: "stock",
        price: result.c,
        change: change,
        changePercent: changePercent,
        volume: result.v,
        lastUpdated: new Date(result.t).toISOString(),
      };
    } catch (error) {
      console.error("Polygon fetch error:", error);
      throw error;
    }
  }

  async fetchMultipleTickers(symbols: string[]): Promise<MarketTicker[]> {
    // Polygon doesn't have batch endpoint for quotes, need individual calls
    const tickers: MarketTicker[] = [];

    for (const symbol of symbols) {
      try {
        const ticker = await this.fetchTicker(symbol);
        tickers.push(ticker);
        
        // Rate limiting: avoid hitting API limits
        await this.delay(100); // 100ms between calls
      } catch (error) {
        console.warn(`Failed to fetch ticker for ${symbol}:`, error);
      }
    }

    return tickers;
  }

  async fetchChartData(
    symbol: string,
    interval: string,
    from?: Date,
    to?: Date
  ): Promise<ChartDataPoint[]> {
    try {
      const timespan = this.intervalToTimespan(interval);
      const multiplier = this.getMultiplier(interval);
      
      const fromDate = from ? this.formatDate(from) : this.formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
      const toDate = to ? this.formatDate(to) : this.formatDate(new Date());

      const url = `${this.baseUrl}/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${fromDate}/${toDate}?adjusted=true&sort=asc&apiKey=${this.apiKey}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Polygon API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== "OK" || !data.results) {
        throw new Error("No chart data found");
      }

      return data.results.map((point: any) => ({
        timestamp: point.t,
        open: point.o,
        high: point.h,
        low: point.l,
        close: point.c,
        volume: point.v,
      }));
    } catch (error) {
      console.error("Polygon chart data fetch error:", error);
      return [];
    }
  }

  private intervalToTimespan(interval: string): string {
    const map: Record<string, string> = {
      "1min": "minute",
      "5min": "minute",
      "15min": "minute",
      "30min": "minute",
      "1h": "hour",
      "1d": "day",
      "1w": "week",
      "1M": "month",
    };

    return map[interval] || "day";
  }

  private getMultiplier(interval: string): number {
    const map: Record<string, number> = {
      "1min": 1,
      "5min": 5,
      "15min": 15,
      "30min": 30,
      "1h": 1,
      "1d": 1,
      "1w": 1,
      "1M": 1,
    };

    return map[interval] || 1;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
