"use client";

import { MarketTicker } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent, formatLargeNumber } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";

interface TickerCardProps {
  ticker: MarketTicker;
}

export function TickerCard({ ticker }: TickerCardProps) {
  const isPositive = ticker.changePercent > 0;
  const isNegative = ticker.changePercent < 0;
  const isNeutral = ticker.changePercent === 0;

  return (
    <Link href={`/asset/${ticker.symbol}`}>
      <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg font-bold">{ticker.symbol}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">{ticker.name}</p>
            </div>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                isPositive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : isNegative
                  ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {isPositive && <TrendingUp className="w-3 h-3" />}
              {isNegative && <TrendingDown className="w-3 h-3" />}
              {isNeutral && <Minus className="w-3 h-3" />}
              {formatPercent(ticker.changePercent)}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="text-2xl font-bold">{formatCurrency(ticker.price)}</div>
              <div
                className={`text-sm ${
                  isPositive
                    ? "text-green-600 dark:text-green-400"
                    : isNegative
                    ? "text-red-600 dark:text-red-400"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {isPositive ? "+" : ""}
                {formatCurrency(ticker.change)}
              </div>
            </div>

            {(ticker.volume || ticker.marketCap) && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                {ticker.volume && (
                  <div>
                    <div className="text-xs text-muted-foreground">Volume</div>
                    <div className="text-sm font-medium">{formatLargeNumber(ticker.volume)}</div>
                  </div>
                )}
                {ticker.marketCap && (
                  <div>
                    <div className="text-xs text-muted-foreground">Market Cap</div>
                    <div className="text-sm font-medium">{formatLargeNumber(ticker.marketCap)}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
