"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MarketTicker } from "@/types";
import { TickerCard } from "@/components/market/TickerCard";
import { TickerTable } from "@/components/market/TickerTable";
import { Loader2, Grid3x3, List } from "lucide-react";

const DEFAULT_CRYPTO = ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "AVAX", "DOT", "MATIC", "LINK"];
const DEFAULT_STOCKS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "AMD"];

export default function MarketsPage() {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [tab, setTab] = useState<"crypto" | "stocks">("crypto");
  const [tickers, setTickers] = useState<MarketTicker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [tab]);

  const fetchMarketData = async () => {
    setLoading(true);
    setError(null);

    try {
      const symbols = tab === "crypto" ? DEFAULT_CRYPTO : DEFAULT_STOCKS;
      const response = await fetch(`/api/market?symbols=${symbols.join(",")}&type=${tab === "crypto" ? "crypto" : "stocks"}`);
      const data = await response.json();

      if (data.success) {
        setTickers(data.data);
      } else {
        setError(data.error || "Failed to fetch market data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const filteredTickers = tickers.filter(
    (ticker) =>
      ticker.symbol.toLowerCase().includes(search.toLowerCase()) ||
      ticker.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold tracking-tight">
                MarketKollen
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  News
                </Link>
                <Link
                  href="/calendar"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Calendar
                </Link>
                <Link
                  href="/markets"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Markets
                </Link>
                <Link
                  href="/predictions"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  AI Predictions
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Markets</h1>
              <p className="text-muted-foreground">Real-time market data and prices</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  view === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView("table")}
                className={`p-2 rounded-lg transition-colors ${
                  view === "table"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4">
            <div className="flex gap-2 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setTab("crypto")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  tab === "crypto"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Crypto
              </button>
              <button
                onClick={() => setTab("stocks")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  tab === "stocks"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Stocks
              </button>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search markets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 max-w-sm px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-2">
                <p className="text-destructive font-medium">Error loading market data</p>
                <p className="text-sm text-muted-foreground">{error}</p>
                <button
                  onClick={fetchMarketData}
                  className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Market Data */}
          {!loading && !error && (
            <>
              {filteredTickers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No tickers found</p>
                </div>
              ) : view === "grid" ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredTickers.map((ticker) => (
                    <TickerCard key={ticker.symbol} ticker={ticker} />
                  ))}
                </div>
              ) : (
                <TickerTable tickers={filteredTickers} />
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2026 MarketKollen. Not financial advice.</p>
            <div className="flex items-center gap-4">
              <span>Auto-updates every 30s</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
