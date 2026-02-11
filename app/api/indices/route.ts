import { NextResponse } from "next/server";
import { getCachedOrFetch } from "@/lib/redis/cache";

export const dynamic = "force-dynamic";

interface FREDSeries {
  id: string;
  name: string;
  symbol: string;
}

const INDICES: FREDSeries[] = [
  { id: "SP500", name: "S&P 500", symbol: "^GSPC" },
  { id: "NASDAQCOM", name: "NASDAQ Composite", symbol: "^IXIC" },
  { id: "DJIA", name: "Dow Jones Industrial Average", symbol: "^DJI" },
  { id: "VIXCLS", name: "VIX (Volatility Index)", symbol: "^VIX" },
  { id: "DTWEXBGS", name: "US Dollar Index (DXY)", symbol: "DXY" },
  { id: "DGS10", name: "10-Year Treasury Yield", symbol: "^TNX" },
  { id: "DGS2", name: "2-Year Treasury Yield", symbol: "^IRX" },
  { id: "DCOILWTICO", name: "WTI Crude Oil", symbol: "CL=F" },
];

export async function GET() {
  try {
    const data = await getCachedOrFetch(
      "indices:all",
      async () => {
        const fredApiKey = process.env.FRED_API_KEY;
        
        if (!fredApiKey) {
          throw new Error("FRED_API_KEY not configured");
        }

        const indices = await Promise.all(
          INDICES.map(async (series) => {
            try {
              // Get last 2 observations to calculate change
              const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${series.id}&api_key=${fredApiKey}&file_type=json&sort_order=desc&limit=2`;
              
              const response = await fetch(url);
              if (!response.ok) throw new Error(`FRED API error for ${series.id}`);

              const data = await response.json();

              if (!data.observations || data.observations.length === 0) {
                return null;
              }

              const latest = data.observations[0];
              const previous = data.observations[1];

              const value = parseFloat(latest.value);
              const previousValue = previous ? parseFloat(previous.value) : value;
              const change = value - previousValue;
              const changePercent = previousValue !== 0 ? ((change / previousValue) * 100) : 0;

              return {
                symbol: series.symbol,
                name: series.name,
                value,
                change,
                changePercent,
                lastUpdated: new Date(latest.date).toISOString(),
              };
            } catch (error) {
              console.error(`Failed to fetch ${series.id}:`, error);
              return null;
            }
          })
        );

        return indices.filter((index): index is NonNullable<typeof index> => index !== null);
      },
      300 // Cache for 5 minutes
    );

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error("Indices API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
