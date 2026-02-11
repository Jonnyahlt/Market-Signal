"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { Loader2, TrendingUp, TrendingDown, Settings, LogIn } from "lucide-react";
import { formatPercent, formatPrice } from "@/lib/utils";

interface IndexData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

export default function IndicesPage() {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchIndices();
    const interval = setInterval(fetchIndices, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchIndices = async () => {
    try {
      const response = await fetch("/api/indices");
      const data = await response.json();

      if (data.success) {
        setIndices(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch indices");
    } finally {
      setLoading(false);
    }
  };

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
                <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  News
                </Link>
                <Link href="/calendar" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Calendar
                </Link>
                <Link href="/markets" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Markets
                </Link>
                <Link href="/indices" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Indices
                </Link>
                <Link href="/predictions" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  AI Predictions
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <Link href="/settings" className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Market Indices</h1>
            <p className="text-muted-foreground">Major US market indices and economic indicators</p>
          </div>

          {loading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
              <button
                onClick={fetchIndices}
                className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {indices.map((index) => (
                <Card key={index.symbol} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {index.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold">
                        {index.value >= 1000 ? index.value.toLocaleString() : index.value.toFixed(2)}
                      </div>
                      <div className={`flex items-center gap-2 text-sm font-medium ${
                        index.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}>
                        {index.change >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span>{index.change >= 0 ? "+" : ""}{index.change.toFixed(2)}</span>
                        <span>({formatPercent(index.changePercent)})</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(index.lastUpdated).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2026 MarketKollen. Not financial advice.</p>
            <div>Data from FRED</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
