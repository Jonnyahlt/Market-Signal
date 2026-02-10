import { z } from "zod";

// ============================================================================
// NEWS TYPES
// ============================================================================

export const NewsArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string().optional(),
  url: z.string().url(),
  source: z.string(),
  publishedAt: z.string().datetime(),
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  sentiment: z.enum(["positive", "negative", "neutral"]).nullable().optional(),
  relevanceScore: z.number().min(0).max(1).optional(),
  tickers: z.array(z.string()).default([]),
});

export type NewsArticle = z.infer<typeof NewsArticleSchema>;

// ============================================================================
// MARKET DATA TYPES
// ============================================================================

export const MarketTickerSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  type: z.enum(["crypto", "stock", "forex", "commodity", "index", "futures"]),
  price: z.number(),
  change: z.number(),
  changePercent: z.number(),
  volume: z.number().optional(),
  marketCap: z.number().optional(),
  lastUpdated: z.string().datetime(),
});

export type MarketTicker = z.infer<typeof MarketTickerSchema>;

export const ChartDataPointSchema = z.object({
  timestamp: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number().optional(),
});

export type ChartDataPoint = z.infer<typeof ChartDataPointSchema>;

// ============================================================================
// CALENDAR TYPES
// ============================================================================

export const CalendarEventSchema = z.object({
  id: z.string(),
  date: z.string().datetime(),
  country: z.string(),
  event: z.string(),
  impact: z.enum(["low", "medium", "high"]),
  actual: z.string().optional(),
  forecast: z.string().optional(),
  previous: z.string().optional(),
  currency: z.string().optional(),
});

export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

// ============================================================================
// AI PREDICTIONS TYPES
// ============================================================================

export const MarketDriverSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  impact: z.enum(["low", "medium", "high"]),
  direction: z.enum(["bullish", "bearish", "neutral"]),
  affectedAssets: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  timeframe: z.enum(["today", "week", "month"]),
  sources: z.array(z.string()).optional(),
  createdAt: z.string().datetime(),
});

export type MarketDriver = z.infer<typeof MarketDriverSchema>;

// ============================================================================
// FILTER TYPES
// ============================================================================

export const NewsFilterSchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  tickers: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
  sentiment: z.enum(["positive", "negative", "neutral"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export type NewsFilter = z.infer<typeof NewsFilterSchema>;

// ============================================================================
// ADAPTER INTERFACE TYPES
// ============================================================================

export interface NewsAdapter {
  fetchNews(params: NewsAdapterParams): Promise<NewsArticle[]>;
  getName(): string;
}

export interface NewsAdapterParams {
  query?: string;
  tickers?: string[];
  limit?: number;
  offset?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface MarketDataAdapter {
  fetchTicker(symbol: string): Promise<MarketTicker>;
  fetchMultipleTickers(symbols: string[]): Promise<MarketTicker[]>;
  fetchChartData(symbol: string, interval: string, from?: Date, to?: Date): Promise<ChartDataPoint[]>;
  getName(): string;
}

export interface CalendarAdapter {
  fetchEvents(params: CalendarAdapterParams): Promise<CalendarEvent[]>;
  getName(): string;
}

export interface CalendarAdapterParams {
  dateFrom?: Date;
  dateTo?: Date;
  countries?: string[];
  impact?: ("low" | "medium" | "high")[];
}
