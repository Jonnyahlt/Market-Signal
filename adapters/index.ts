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

interface UserApiKeys {
  twelve_data_api_key?: string;
  polygon_api_key?: string;
  finnhub_api_key?: string;
  alpha_vantage_api_key?: string;
}

export class MarketDataAdapterFactory {
  private static adapters: Map<string, MarketDataAdapter> = new Map();

  static getAdapter(
    type: "crypto" | "stocks",
    name?: string,
    userKeys?: UserApiKeys
  ): MarketDataAdapter {
    // Determine which adapter to use based on available keys
    let adapterName = name;

    if (!adapterName && type === "stocks") {
      // Priority: User's keys > Env keys
      if (userKeys?.twelve_data_api_key || process.env.TWELVE_DATA_API_KEY) {
        adapterName = "twelvedata";
      } else if (userKeys?.polygon_api_key || process.env.POLYGON_API_KEY) {
        adapterName = "polygon";
      } else if (userKeys?.finnhub_api_key || process.env.FINNHUB_API_KEY) {
        adapterName = "finnhub";
      } else {
        adapterName = "alphavantage";
      }
    } else if (!adapterName && type === "crypto") {
      adapterName = config.market.crypto;
    }

    const key = `${type}-${adapterName}`;
    
    // Don't cache adapters if using user keys (they might change)
    if (userKeys) {
      return this.createAdapter(adapterName || "alphavantage", userKeys);
    }

    if (!this.adapters.has(key)) {
      this.adapters.set(key, this.createAdapter(adapterName || "alphavantage", userKeys));
    }

    return this.adapters.get(key)!;
  }

  private static createAdapter(name: string, userKeys?: UserApiKeys): MarketDataAdapter {
    switch (name.toLowerCase()) {
      case "coingecko":
        return new CoinGeckoAdapter();
      case "alphavantage":
        const alphaKey = userKeys?.alpha_vantage_api_key || process.env.ALPHA_VANTAGE_API_KEY || "demo";
        return new AlphaVantageAdapter(alphaKey);
      case "twelvedata":
        const twelveKey = userKeys?.twelve_data_api_key || process.env.TWELVE_DATA_API_KEY;
        if (!twelveKey) throw new Error("TWELVE_DATA_API_KEY not configured");
        return new TwelveDataAdapter(twelveKey);
      case "polygon":
        const polygonKey = userKeys?.polygon_api_key || process.env.POLYGON_API_KEY;
        if (!polygonKey) throw new Error("POLYGON_API_KEY not configured");
        return new PolygonAdapter(polygonKey);
      case "finnhub":
        const finnhubKey = userKeys?.finnhub_api_key || process.env.FINNHUB_API_KEY;
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
// CALENDAR ADAPTER FACTORY
// ============================================================================

export class CalendarAdapterFactory {
  static getAdapter(name?: string): CalendarAdapter {
    // Try Trading Economics first (future events)
    if (process.env.TRADING_ECONOMICS_API_KEY && !name) {
      const { TradingEconomicsAdapter } = require("./calendar/tradingeconomics");
      return new TradingEconomicsAdapter(process.env.TRADING_ECONOMICS_API_KEY);
    }

    const adapterName = name || config.calendar.default;

    switch (adapterName.toLowerCase()) {
      case "tradingeconomics":
        const teKey = process.env.TRADING_ECONOMICS_API_KEY;
        if (!teKey) throw new Error("TRADING_ECONOMICS_API_KEY not configured");
        const { TradingEconomicsAdapter } = require("./calendar/tradingeconomics");
        return new TradingEconomicsAdapter(teKey);
      case "fred":
        const fredKey = process.env.FRED_API_KEY;
        if (!fredKey) {
          console.warn("FRED_API_KEY not configured, using mock data");
          // Return mock adapter or throw
          throw new Error("FRED_API_KEY not configured");
        }
        const { FREDCalendarAdapter } = require("./calendar/fred");
        return new FREDCalendarAdapter(fredKey);
      default:
        throw new Error(`Unknown calendar adapter: ${adapterName}`);
    }
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
