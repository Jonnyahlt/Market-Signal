import { NextRequest, NextResponse } from "next/server";
import { MarketDataAdapterFactory, detectAssetType } from "@/adapters";
import { getUserApiKeys } from "@/lib/user-api-keys";
import { cacheGet, cacheSet } from "@/lib/redis/cache";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbols = searchParams.get("symbols")?.split(",") || [];
    const type = searchParams.get("type") as "crypto" | "stocks" | undefined;

    if (symbols.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No symbols provided",
        },
        { status: 400 }
      );
    }

    // Get user's API keys
    const userKeys = await getUserApiKeys();

    // Check cache first
    const cacheKey = `market:${type}:${symbols.join(",")}`;
    const cached = await cacheGet<any>(cacheKey);
    
    if (cached) {
      return NextResponse.json({
        ...cached,
        cached: true,
      });
    }

    // Group symbols by type
    const cryptoSymbols: string[] = [];
    const stockSymbols: string[] = [];

    for (const symbol of symbols) {
      const detectedType = type || detectAssetType(symbol);
      if (detectedType === "crypto") {
        cryptoSymbols.push(symbol);
      } else {
        stockSymbols.push(symbol);
      }
    }

    // Fetch data from appropriate adapters
    const results = [];

    if (cryptoSymbols.length > 0) {
      const adapter = MarketDataAdapterFactory.getAdapter("crypto", undefined, userKeys);
      const cryptoData = await adapter.fetchMultipleTickers(cryptoSymbols);
      results.push(...cryptoData);
    }

    if (stockSymbols.length > 0) {
      const adapter = MarketDataAdapterFactory.getAdapter("stocks", undefined, userKeys);
      const stockData = await adapter.fetchMultipleTickers(stockSymbols);
      results.push(...stockData);
    }

    // Filter out any invalid/null tickers
    const validResults = results.filter(
      (ticker) => ticker && ticker.symbol && ticker.name && ticker.price
    );

    const response = {
      success: true,
      data: validResults,
      count: validResults.length,
    };

    // Cache for 60 seconds
    await cacheSet(cacheKey, response, 60);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Market API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
