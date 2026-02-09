import { NewsAdapter, MarketDataAdapter, CalendarAdapter } from "@/types";
import { GDELTNewsAdapter } from "./news/gdelt";
import { CoinGeckoAdapter } from "./market/coingecko";
import { AlphaVantageAdapter } from "./market/alphavantage";
import { TwelveDataAdapter } from "./market/twelvedata";
import { PolygonAdapter } from "./market/polygon";
import { FinnhubAdapter } from "./market/finnhub";

// ============================================================================
// CONFIGURATION
// ============================================================================

interface AdapterConfig {
  news: {
    default: string;
    available: string[];
  };
  market: {
    crypto: string;
    stocks: string;
    available: string[];
  };
  calendar: {
    default: string;
    available: string[];
  };
}

const config: AdapterConfig = {
  news: {
    default: "gdelt",
    available: ["gdelt"],
  },
  market: {
    crypto: "coingecko",
    stocks: process.env.TWELVE_DATA_API_KEY 
      ? "twelvedata" 
      : process.env.POLYGON_API_KEY
      ? "polygon"
      : process.env.FINNHUB_API_KEY
      ? "finnhub"
      : "alphavantage",
    available: ["coingecko", "alphavantage", "twelvedata", "polygon", "finnhub"],
  },
  calendar: {
    default: "fred", // To be implemented
    available: ["fred"],
  },
};

// ============================================================================
// NEWS ADAPTER FACTORY
// ============================================================================

export class NewsAdapterFactory {
  private static adapters: Map<string, NewsAdapter> = new Map();

  static getAdapter(name?: string): NewsAdapter {
    const adapterName = name || config.news.default;

    if (!this.adapters.has(adapterName)) {
      this.adapters.set(adapterName, this.createAdapter(adapterName));
    }

    return this.adapters.get(adapterName)!;
  }

  private static createAdapter(name: string): NewsAdapter {
    switch (name.toLowerCase()) {
      case "gdelt":
        return new GDELTNewsAdapter();
      default:
        throw new Error(`Unknown news adapter: ${name}`);
    }
  }

  static getAvailableAdapters(): string[] {
    return config.news.available;
  }
}

// ============================================================================
// MARKET DATA ADAPTER FACTORY
// ============================================================================

export class MarketDataAdapterFactory {
  private static adapters: Map<string, MarketDataAdapter> = new Map();

  static getAdapter(type: "crypto" | "stocks", name?: string): MarketDataAdapter {
    const adapterName = name || config.market[type];

    const key = `${type}-${adapterName}`;
    if (!this.adapters.has(key)) {
      this.adapters.set(key, this.createAdapter(adapterName));
    }

    return this.adapters.get(key)!;
  }

  private static createAdapter(name: string): MarketDataAdapter {
    switch (name.toLowerCase()) {
      case "coingecko":
        return new CoinGeckoAdapter();
      case "alphavantage":
        const alphaKey = process.env.ALPHA_VANTAGE_API_KEY || "demo";
        return new AlphaVantageAdapter(alphaKey);
      case "twelvedata":
        const twelveKey = process.env.TWELVE_DATA_API_KEY;
        if (!twelveKey) throw new Error("TWELVE_DATA_API_KEY not configured");
        return new TwelveDataAdapter(twelveKey);
      case "polygon":
        const polygonKey = process.env.POLYGON_API_KEY;
        if (!polygonKey) throw new Error("POLYGON_API_KEY not configured");
        return new PolygonAdapter(polygonKey);
      case "finnhub":
        const finnhubKey = process.env.FINNHUB_API_KEY;
        if (!finnhubKey) throw new Error("FINNHUB_API_KEY not configured");
        return new FinnhubAdapter(finnhubKey);
      default:
        throw new Error(`Unknown market data adapter: ${name}`);
    }
  }

  static getAvailableAdapters(): string[] {
    return config.market.available;
  }
}

// ============================================================================
// CALENDAR ADAPTER FACTORY (Placeholder)
// ============================================================================

export class CalendarAdapterFactory {
  static getAdapter(name?: string): CalendarAdapter {
    throw new Error("Calendar adapters not yet implemented");
  }

  static getAvailableAdapters(): string[] {
    return config.calendar.available;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getAdapterConfig(): AdapterConfig {
  return config;
}

export function detectAssetType(symbol: string): "crypto" | "stocks" {
  // Simple heuristic: if symbol is in common crypto list, it's crypto
  const cryptoSymbols = [
    "BTC",
    "ETH",
    "USDT",
    "BNB",
    "SOL",
    "XRP",
    "USDC",
    "ADA",
    "AVAX",
    "DOGE",
    "DOT",
    "MATIC",
    "LINK",
    "UNI",
    "ATOM",
  ];

  return cryptoSymbols.includes(symbol.toUpperCase()) ? "crypto" : "stocks";
}
