"use client";

import { useEffect, useState } from "react";
import { MarketTicker } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatPercent } from "@/lib/utils";

export function TopMovers() {
  const [gainers, setGainers] = useState<MarketTicker[]>([]);
  const [losers, setLosers] = useState<MarketTicker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovers();
    const interval = setInterval(fetchMovers, 120000); // Update every 2 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchMovers = async () => {
    try {
      const response = await fetch("/api/crypto/top-movers");
      const data = await response.json();
      if (data.success) {
        setGainers(data.data.gainers);
        setLosers(data.data.losers);
      }
    } catch (error) {
      console.error("Failed to fetch top movers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Top Gainers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            Top Gainers (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {gainers.slice(0, 5).map((ticker) => (
              <div key={ticker.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{ticker.symbol}</span>
                  <span className="text-xs text-muted-foreground">{ticker.name}</span>
                </div>
                <div className="text-green-600 dark:text-green-400 font-medium text-sm">
                  {formatPercent(ticker.changePercent)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Losers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            Top Losers (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {losers.slice(0, 5).map((ticker) => (
              <div key={ticker.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{ticker.symbol}</span>
                  <span className="text-xs text-muted-foreground">{ticker.name}</span>
                </div>
                <div className="text-red-600 dark:text-red-400 font-medium text-sm">
                  {formatPercent(ticker.changePercent)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
