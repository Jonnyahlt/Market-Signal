import { NextResponse } from "next/server";
import { MarketTicker } from "@/types";
import { getCachedOrFetch } from "@/lib/redis/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getCachedOrFetch(
      "crypto:top-movers",
      async () => {
        // Fetch top 500 cryptos from CoinGecko
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=500&page=1&sparkline=false&price_change_percentage=24h"
        );
        
        if (!response.ok) throw new Error("Failed to fetch market data");
        
        const coins = await response.json();
        
        // Convert to MarketTicker format
        const tickers: MarketTicker[] = coins.map((coin: any) => ({
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          type: "crypto" as const,
          price: coin.current_price,
          change: coin.price_change_24h,
          changePercent: coin.price_change_percentage_24h,
          volume: coin.total_volume,
          marketCap: coin.market_cap,
          lastUpdated: new Date().toISOString(),
        }));

        // Sort by changePercent
        const sorted = [...tickers].sort((a, b) => b.changePercent - a.changePercent);
        
        return {
          gainers: sorted.slice(0, 10), // Top 10 gainers
          losers: sorted.slice(-10).reverse(), // Top 10 losers
        };
      },
      120 // Cache for 2 minutes
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Top movers API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
