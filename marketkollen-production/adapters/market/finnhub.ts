import { MarketDataAdapter, MarketTicker, ChartDataPoint } from "@/types";

export class FinnhubAdapter implements MarketDataAdapter {
  private apiKey: string;
  private baseUrl = "https://finnhub.io/api/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getName(): string {
    return "Finnhub";
  }

  async fetchTicker(symbol: string): Promise<MarketTicker> {
    try {
      const url = `${this.baseUrl}/quote?symbol=${symbol}&token=${this.apiKey}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return {
        symbol: symbol,
        name: symbol, // Finnhub quote doesn't include name
        type: "stock",
        price: data.c, // current price
        change: data.d, // change
        changePercent: data.dp, // percent change
        lastUpdated: new Date(data.t * 1000).toISOString(),
      };
    } catch (error) {
      console.error("Finnhub fetch error:", error);
      throw error;
    }
  }

  async fetchMultipleTickers(symbols: string[]): Promise<MarketTicker[]> {
    // Finnhub doesn't have batch endpoint, need individual calls
    const tickers: MarketTicker[] = [];

    for (const symbol of symbols) {
      try {
        const ticker = await this.fetchTicker(symbol);
        tickers.push(ticker);
        
        // Rate limiting for free tier (60 calls/min)
        await this.delay(1000); // 1 second between calls
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
      const resolution = this.intervalToResolution(interval);
      const fromTimestamp = from ? Math.floor(from.getTime() / 1000) : Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
      const toTimestamp = to ? Math.floor(to.getTime() / 1000) : Math.floor(Date.now() / 1000);

      const url = `${this.baseUrl}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${fromTimestamp}&to=${toTimestamp}&token=${this.apiKey}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.s !== "ok" || !data.t) {
        throw new Error("No chart data found");
      }

      return data.t.map((timestamp: number, index: number) => ({
        timestamp: timestamp * 1000,
        open: data.o[index],
        high: data.h[index],
        low: data.l[index],
        close: data.c[index],
        volume: data.v[index],
      }));
    } catch (error) {
      console.error("Finnhub chart data fetch error:", error);
      return [];
    }
  }

  private intervalToResolution(interval: string): string {
    const map: Record<string, string> = {
      "1min": "1",
      "5min": "5",
      "15min": "15",
      "30min": "30",
      "1h": "60",
      "1d": "D",
      "1w": "W",
      "1M": "M",
    };

    return map[interval] || "D";
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
