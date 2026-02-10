"use client";

import { MarketTicker } from "@/types";
import { formatCurrency, formatPercent, formatLargeNumber } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface TickerTableProps {
  tickers: MarketTicker[];
}

type SortKey = "symbol" | "price" | "change" | "changePercent" | "volume" | "marketCap";
type SortDirection = "asc" | "desc";

export function TickerTable({ tickers }: TickerTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const sortedTickers = [...tickers].sort((a, b) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return sortDirection === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-border">
          <tr className="text-left text-sm text-muted-foreground">
            <th className="pb-3 font-medium cursor-pointer hover:text-foreground" onClick={() => handleSort("symbol")}>
              Symbol
            </th>
            <th className="pb-3 font-medium cursor-pointer hover:text-foreground text-right" onClick={() => handleSort("price")}>
              Price
            </th>
            <th className="pb-3 font-medium cursor-pointer hover:text-foreground text-right" onClick={() => handleSort("change")}>
              Change
            </th>
            <th className="pb-3 font-medium cursor-pointer hover:text-foreground text-right" onClick={() => handleSort("changePercent")}>
              Change %
            </th>
            <th className="pb-3 font-medium cursor-pointer hover:text-foreground text-right" onClick={() => handleSort("volume")}>
              Volume
            </th>
            <th className="pb-3 font-medium cursor-pointer hover:text-foreground text-right" onClick={() => handleSort("marketCap")}>
              Market Cap
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedTickers.map((ticker) => {
            const isPositive = ticker.changePercent > 0;
            const isNegative = ticker.changePercent < 0;

            return (
              <tr
                key={ticker.symbol}
                className="border-b border-border/50 hover:bg-muted/50 transition-colors"
              >
                <td className="py-4">
                  <Link href={`/asset/${ticker.symbol}`} className="hover:text-primary">
                    <div className="font-medium">{ticker.symbol}</div>
                    <div className="text-xs text-muted-foreground">{ticker.name}</div>
                  </Link>
                </td>
                <td className="py-4 text-right font-mono">{formatCurrency(ticker.price)}</td>
                <td
                  className={`py-4 text-right font-mono ${
                    isPositive
                      ? "text-green-600 dark:text-green-400"
                      : isNegative
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-600"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {formatCurrency(ticker.change)}
                </td>
                <td className="py-4 text-right">
                  <div
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                      isPositive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : isNegative
                        ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {isPositive && <TrendingUp className="w-3 h-3" />}
                    {isNegative && <TrendingDown className="w-3 h-3" />}
                    {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
                    {formatPercent(ticker.changePercent)}
                  </div>
                </td>
                <td className="py-4 text-right font-mono text-sm">
                  {ticker.volume ? formatLargeNumber(ticker.volume) : "—"}
                </td>
                <td className="py-4 text-right font-mono text-sm">
                  {ticker.marketCap ? formatLargeNumber(ticker.marketCap) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
