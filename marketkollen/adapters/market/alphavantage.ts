import { MarketDataAdapter, MarketTicker, ChartDataPoint } from "@/types";

export class AlphaVantageAdapter implements MarketDataAdapter {
  private apiKey: string;
  private baseUrl = "https://www.alphavantage.co/query";
  private cacheTTL = 60; // 1 minute

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getName(): string {
    return "AlphaVantage";
  }

  async fetchTicker(symbol: string): Promise<MarketTicker> {
    try {
      const url = `${this.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Alpha Vantage API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data["Error Message"] || data["Note"]) {
        throw new Error(data["Error Message"] || "API rate limit reached");
      }

      const quote = data["Global Quote"];
      if (!quote || Object.keys(quote).length === 0) {
        throw new Error(`No data for symbol: ${symbol}`);
      }

      return {
        symbol: quote["01. symbol"],
        name: quote["01. symbol"], // Alpha Vantage doesn't provide full name in quote
        type: "stock",
        price: parseFloat(quote["05. price"]),
        change: parseFloat(quote["09. change"]),
        changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
        volume: parseFloat(quote["06. volume"]),
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Alpha Vantage fetch error:", error);
      throw error;
    }
  }

  async fetchMultipleTickers(symbols: string[]): Promise<MarketTicker[]> {
    // Alpha Vantage doesn't support batch requests in free tier
    // We need to make individual requests with rate limiting
    const tickers: MarketTicker[] = [];
    
    for (const symbol of symbols.slice(0, 5)) { // Limit to avoid rate limits
      try {
        const ticker = await this.fetchTicker(symbol);
        tickers.push(ticker);
        
        // Rate limiting: 5 calls per minute in free tier
        await this.delay(12000); // 12 seconds between calls
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
      const func = this.getTimeSeriesFunction(interval);
      const url = `${this.baseUrl}?function=${func}&symbol=${symbol}&apikey=${this.apiKey}&outputsize=compact`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Alpha Vantage API error: ${response.status}`);
      }

      const data = await response.json();

      if (data["Error Message"] || data["Note"]) {
        throw new Error(data["Error Message"] || "API rate limit reached");
      }

      const timeSeriesKey = Object.keys(data).find((key) => key.includes("Time Series"));
      if (!timeSeriesKey) {
        throw new Error("No time series data found");
      }

      const timeSeries = data[timeSeriesKey];
      
      return Object.entries(timeSeries).map(([timestamp, values]: [string, any]) => {
        return {
          timestamp: new Date(timestamp).getTime(),
          open: parseFloat(values["1. open"]),
          high: parseFloat(values["2. high"]),
          low: parseFloat(values["3. low"]),
          close: parseFloat(values["4. close"]),
          volume: parseFloat(values["5. volume"]),
        };
      });
    } catch (error) {
      console.error("Alpha Vantage chart data fetch error:", error);
      return [];
    }
  }

  private getTimeSeriesFunction(interval: string): string {
    const map: Record<string, string> = {
      "1min": "TIME_SERIES_INTRADAY&interval=1min",
      "5min": "TIME_SERIES_INTRADAY&interval=5min",
      "15min": "TIME_SERIES_INTRADAY&interval=15min",
      "30min": "TIME_SERIES_INTRADAY&interval=30min",
      "60min": "TIME_SERIES_INTRADAY&interval=60min",
      "1d": "TIME_SERIES_DAILY",
      "1w": "TIME_SERIES_WEEKLY",
      "1M": "TIME_SERIES_MONTHLY",
    };

    return map[interval] || "TIME_SERIES_DAILY";
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
