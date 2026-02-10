"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MarketTicker, NewsArticle } from "@/types";
import { PriceChart } from "@/components/market/PriceChart";
import { NewsCard } from "@/components/news/NewsCard";
import { formatCurrency, formatPercent, formatLargeNumber } from "@/lib/utils";
import { Loader2, TrendingUp, TrendingDown, ArrowLeft } from "lucide-react";

export default function AssetPage() {
  const params = useParams();
  const symbol = params.symbol as string;

  const [ticker, setTicker] = useState<MarketTicker | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (symbol) {
      fetchAssetData();
    }
  }, [symbol]);

  const fetchAssetData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch ticker data
      const tickerResponse = await fetch(`/api/market?symbols=${symbol.toUpperCase()}`);
      const tickerData = await tickerResponse.json();

      if (tickerData.success && tickerData.data.length > 0) {
        setTicker(tickerData.data[0]);
      }

      // Fetch related news
      const newsResponse = await fetch(`/api/news?tickers=${symbol.toUpperCase()}&limit=10`);
      const newsData = await newsResponse.json();

      if (newsData.success) {
        setNews(newsData.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !ticker) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">Failed to load asset data</p>
          <p className="text-sm text-muted-foreground">{error || "Asset not found"}</p>
          <Link
            href="/markets"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Markets
          </Link>
        </div>
      </div>
    );
  }

  const isPositive = ticker.changePercent > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold tracking-tight">
              MarketKollen
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Back Button */}
          <Link
            href="/markets"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Markets
          </Link>

          {/* Asset Header */}
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold">{ticker.symbol}</h1>
              <p className="text-lg text-muted-foreground mt-1">{ticker.name}</p>
            </div>

            <div className="flex items-baseline gap-4">
              <div className="text-5xl font-bold">{formatCurrency(ticker.price)}</div>
              <div
                className={`flex items-center gap-2 text-xl ${
                  isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                {formatPercent(ticker.changePercent)} ({isPositive ? "+" : ""}
                {formatCurrency(ticker.change)})
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              {ticker.volume && (
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-xs text-muted-foreground mb-1">Volume</div>
                  <div className="text-lg font-bold">{formatLargeNumber(ticker.volume)}</div>
                </div>
              )}
              {ticker.marketCap && (
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-xs text-muted-foreground mb-1">Market Cap</div>
                  <div className="text-lg font-bold">{formatLargeNumber(ticker.marketCap)}</div>
                </div>
              )}
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-xs text-muted-foreground mb-1">Type</div>
                <div className="text-lg font-bold capitalize">{ticker.type}</div>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <div className="text-xs text-muted-foreground mb-1">Last Updated</div>
                <div className="text-sm font-medium">
                  {new Date(ticker.lastUpdated).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="p-8 rounded-lg border border-border bg-card">
            <h2 className="text-xl font-bold mb-4">Price Chart</h2>
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <p>Chart will display here (requires historical data API call)</p>
            </div>
          </div>

          {/* Related News */}
          {news.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Related News</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {news.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
