import { NextResponse } from "next/server";
import { getCachedOrFetch } from "@/lib/redis/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getCachedOrFetch(
      "crypto:stats",
      async () => {
        // Fetch from CoinGecko global data
        const response = await fetch("https://api.coingecko.com/api/v3/global");
        if (!response.ok) throw new Error("Failed to fetch global data");
        
        const globalData = await response.json();
        
        // Fetch Fear & Greed Index
        const fngResponse = await fetch("https://api.alternative.me/fng/");
        const fngData = await fngResponse.json();
        
        return {
          fearGreedIndex: parseInt(fngData.data[0].value),
          fearGreedValue: fngData.data[0].value_classification,
          btcDominance: globalData.data.market_cap_percentage.btc,
          totalMarketCap: globalData.data.total_market_cap.usd,
        };
      },
      300 // Cache for 5 minutes
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Crypto stats API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
