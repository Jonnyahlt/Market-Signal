import { NextRequest, NextResponse } from "next/server";
import { MarketDataAdapterFactory, detectAssetType } from "@/adapters";

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
      const adapter = MarketDataAdapterFactory.getAdapter("crypto");
      const cryptoData = await adapter.fetchMultipleTickers(cryptoSymbols);
      results.push(...cryptoData);
    }

    if (stockSymbols.length > 0) {
      const adapter = MarketDataAdapterFactory.getAdapter("stocks");
      const stockData = await adapter.fetchMultipleTickers(stockSymbols);
      results.push(...stockData);
    }

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    });
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
