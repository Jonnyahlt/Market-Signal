import { MarketDataAdapter, MarketTicker, ChartDataPoint } from "@/types";
import { z } from "zod";

const CoinGeckoTickerSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  current_price: z.number(),
  price_change_24h: z.number(),
  price_change_percentage_24h: z.number(),
  total_volume: z.number().optional(),
  market_cap: z.number().optional(),
});

const CoinGeckoChartSchema = z.object({
  prices: z.array(z.tuple([z.number(), z.number()])),
  market_caps: z.array(z.tuple([z.number(), z.number()])).optional(),
  total_volumes: z.array(z.tuple([z.number(), z.number()])).optional(),
});

export class CoinGeckoAdapter implements MarketDataAdapter {
  private baseUrl = "https://api.coingecko.com/api/v3";
  private cacheTTL = 60; // 1 minute

  getName(): string {
    return "CoinGecko";
  }

  async fetchTicker(symbol: string): Promise<MarketTicker> {
    const tickers = await this.fetchMultipleTickers([symbol]);
    if (tickers.length === 0) {
      throw new Error(`Ticker not found: ${symbol}`);
    }
    return tickers[0];
  }

  async fetchMultipleTickers(symbols: string[]): Promise<MarketTicker[]> {
    try {
      // CoinGecko uses IDs, not symbols, so we need to convert
      const ids = symbols.map((s) => this.symbolToId(s)).join(",");
      
      const url = `${this.baseUrl}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`;

      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data
        .map((coin: any): MarketTicker | null => {
          try {
            const validated = CoinGeckoTickerSchema.parse(coin);
            
            return {
              symbol: validated.symbol.toUpperCase(),
              name: validated.name,
              type: "crypto" as const,
              price: validated.current_price,
              change: validated.price_change_24h,
              changePercent: validated.price_change_percentage_24h,
              volume: validated.total_volume,
              marketCap: validated.market_cap,
              lastUpdated: new Date().toISOString(),
            };
          } catch (error) {
            console.warn("Failed to parse CoinGecko ticker:", error);
            return null;
          }
        })
        .filter((ticker): ticker is MarketTicker => ticker !== null);
    } catch (error) {
      console.error("CoinGecko fetch error:", error);
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
      const id = this.symbolToId(symbol);
      const days = this.intervalToDays(interval);
      
      const url = `${this.baseUrl}/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`;

      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const validated = CoinGeckoChartSchema.parse(data);

      // CoinGecko only provides price data, not OHLC
      // We'll simulate OHLC using the price points
      return validated.prices.map((point, index) => {
        const [timestamp, price] = point;
        const volume = validated.total_volumes?.[index]?.[1] || 0;

        return {
          timestamp,
          open: price,
          high: price,
          low: price,
          close: price,
          volume,
        } as ChartDataPoint;
      });
    } catch (error) {
      console.error("CoinGecko chart data fetch error:", error);
      return [];
    }
  }

  private symbolToId(symbol: string): string {
    // Common symbol to CoinGecko ID mappings
    const map: Record<string, string> = {
      BTC: "bitcoin",
      ETH: "ethereum",
      USDT: "tether",
      BNB: "binancecoin",
      SOL: "solana",
      XRP: "ripple",
      USDC: "usd-coin",
      ADA: "cardano",
      AVAX: "avalanche-2",
      DOGE: "dogecoin",
      DOT: "polkadot",
      MATIC: "matic-network",
      LINK: "chainlink",
      UNI: "uniswap",
      ATOM: "cosmos",
    };

    const upper = symbol.toUpperCase();
    return map[upper] || symbol.toLowerCase();
  }

  private intervalToDays(interval: string): number {
    const map: Record<string, number> = {
      "1h": 1,
      "4h": 2,
      "1d": 30,
      "1w": 90,
      "1M": 365,
    };

    return map[interval] || 7;
  }
}
