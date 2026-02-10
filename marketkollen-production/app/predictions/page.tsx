"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MarketDriver } from "@/types";
import { DriverCard } from "@/components/ai/DriverCard";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain } from "lucide-react";

export default function PredictionsPage() {
  const [drivers, setDrivers] = useState<MarketDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month">("week");
  const [selectedImpact, setSelectedImpact] = useState<string[]>([]);

  useEffect(() => {
    fetchDrivers();
  }, [timeframe]);

  const fetchDrivers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeframe }),
      });

      const data = await response.json();

      if (data.success) {
        setDrivers(data.data);
      } else {
        setError(data.error || "Failed to fetch market drivers");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const toggleImpact = (impact: string) => {
    setSelectedImpact((prev) =>
      prev.includes(impact) ? prev.filter((i) => i !== impact) : [...prev, impact]
    );
  };

  const filteredDrivers = drivers.filter(
    (driver) => selectedImpact.length === 0 || selectedImpact.includes(driver.impact)
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
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Markets
                </Link>
                <Link
                  href="/predictions"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
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
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">AI Market Predictions</h1>
            </div>
            <p className="text-muted-foreground">
              AI-generated market drivers, scenarios, and risk analysis (not financial advice)
            </p>
            <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-400">
                <strong>Note:</strong> Currently showing mock data. In production, this would
                analyze real-time news and market data using AI.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex gap-2 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setTimeframe("today")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeframe === "today"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setTimeframe("week")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeframe === "week"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setTimeframe("month")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeframe === "month"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                This Month
              </button>
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground">Impact:</span>
              {["high", "medium", "low"].map((impact) => (
                <Badge
                  key={impact}
                  variant={selectedImpact.includes(impact) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleImpact(impact)}
                >
                  {impact}
                </Badge>
              ))}
            </div>
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
                <p className="text-destructive font-medium">Error loading predictions</p>
                <p className="text-sm text-muted-foreground">{error}</p>
                <button
                  onClick={fetchDrivers}
                  className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Drivers */}
          {!loading && !error && (
            <>
              {filteredDrivers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No market drivers found</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDrivers.map((driver) => (
                    <DriverCard key={driver.id} driver={driver} />
                  ))}
                </div>
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
              <span>AI-powered analysis</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
