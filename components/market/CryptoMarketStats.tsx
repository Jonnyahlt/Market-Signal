"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CryptoStats {
  fearGreedIndex: number;
  fearGreedValue: string;
  btcDominance: number;
  totalMarketCap: number;
}

export function CryptoMarketStats() {
  const [stats, setStats] = useState<CryptoStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/crypto/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch crypto stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return null;
  }

  const getFearGreedColor = (value: number) => {
    if (value <= 25) return "text-red-600 dark:text-red-400";
    if (value <= 45) return "text-orange-600 dark:text-orange-400";
    if (value <= 55) return "text-yellow-600 dark:text-yellow-400";
    if (value <= 75) return "text-green-600 dark:text-green-400";
    return "text-emerald-600 dark:text-emerald-400";
  };

  const getFearGreedLabel = (value: number) => {
    if (value <= 25) return "Extreme Fear";
    if (value <= 45) return "Fear";
    if (value <= 55) return "Neutral";
    if (value <= 75) return "Greed";
    return "Extreme Greed";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Fear & Greed Index */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Fear & Greed Index
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className={`text-4xl font-bold ${getFearGreedColor(stats.fearGreedIndex)}`}>
              {stats.fearGreedIndex}
            </div>
            <div className="text-sm text-muted-foreground">
              {getFearGreedLabel(stats.fearGreedIndex)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BTC Dominance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            BTC Dominance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-bold">{stats.btcDominance.toFixed(2)}%</div>
          </div>
        </CardContent>
      </Card>

      {/* Total Market Cap */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Market Cap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-bold">
              ${(stats.totalMarketCap / 1000000000000).toFixed(2)}T
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
