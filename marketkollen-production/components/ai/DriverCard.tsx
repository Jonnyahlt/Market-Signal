"use client";

import { MarketDriver } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";

interface DriverCardProps {
  driver: MarketDriver;
}

export function DriverCard({ driver }: DriverCardProps) {
  const getDirectionIcon = () => {
    switch (driver.direction) {
      case "bullish":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "bearish":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDirectionColor = () => {
    switch (driver.direction) {
      case "bullish":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      case "bearish":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getImpactColor = () => {
    switch (driver.impact) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Badge className={getImpactColor()}>{driver.impact} impact</Badge>
            <Badge className={getDirectionColor()}>
              <span className="flex items-center gap-1">
                {getDirectionIcon()}
                {driver.direction}
              </span>
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Target className="w-3 h-3" />
            <span>{Math.round(driver.confidence * 100)}%</span>
          </div>
        </div>
        <CardTitle className="text-base font-semibold leading-tight">
          {driver.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{driver.description}</p>

        {driver.affectedAssets.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Affected Assets
            </div>
            <div className="flex flex-wrap gap-1.5">
              {driver.affectedAssets.map((asset) => (
                <Badge key={asset} variant="outline" className="text-xs font-mono">
                  {asset}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {driver.sources && driver.sources.length > 0 && (
          <div className="text-xs text-muted-foreground pt-2 border-t border-border">
            Sources: {driver.sources.join(", ")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
