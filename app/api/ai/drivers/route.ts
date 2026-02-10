import { NextRequest, NextResponse } from "next/server";
import { MarketDriver } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { generateMarketDrivers } from "@/lib/openai/client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { timeframe = "week", assets = [] } = body;

    // Get user's OpenAI API key
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userApiKey: string | null = null;

    if (user) {
      const { data } = await supabase
        .from("user_api_keys")
        .select("openai_api_key")
        .eq("user_id", user.id)
        .single();

      userApiKey = data?.openai_api_key || null;
    }

    // Try to generate real AI predictions if we have a key
    if (userApiKey || process.env.OPENAI_API_KEY) {
      try {
        // Fetch recent news for context
        const newsResponse = await fetch(
          `${request.nextUrl.origin}/api/news?limit=20`,
          {
            headers: request.headers,
          }
        );

        if (newsResponse.ok) {
          const newsData = await newsResponse.json();

          if (newsData.success && newsData.data.length > 0) {
            const newsContext = newsData.data
              .map((article: any) => `${article.title}: ${article.summary || ""}`)
              .join("\n");

            const aiDrivers = await generateMarketDrivers(
              newsContext,
              timeframe,
              userApiKey || undefined
            );

            return NextResponse.json({
              success: true,
              data: aiDrivers,
              count: aiDrivers.length,
              source: "openai",
            });
          }
        }
      } catch (error) {
        console.error("OpenAI generation failed, falling back to mock:", error);
      }
    }

    // Fallback to mock data if no API key or error
    const mockDrivers: MarketDriver[] = [
      {
        id: "driver-1",
        title: "Federal Reserve Rate Decision Approaching",
        description:
          "The Fed is expected to hold rates steady at 5.25-5.50%, but dovish signals could emerge given recent inflation data showing signs of cooling. Markets are pricing in a 65% chance of cuts beginning in Q2.",
        impact: "high",
        direction: "neutral",
        affectedAssets: ["USD", "SPY", "TLT", "GLD"],
        confidence: 0.75,
        timeframe: "week",
        sources: ["Federal Reserve", "CME FedWatch"],
        createdAt: new Date().toISOString(),
      },
      {
        id: "driver-2",
        title: "Tech Earnings Season Momentum",
        description:
          "Major tech companies have beaten earnings expectations, with strong guidance for Q1. AI infrastructure spending remains robust, supporting semiconductor and cloud providers. However, valuations are stretched.",
        impact: "high",
        direction: "bullish",
        affectedAssets: ["NVDA", "MSFT", "GOOGL", "AMD"],
        confidence: 0.82,
        timeframe: "week",
        sources: ["Company earnings", "Analyst consensus"],
        createdAt: new Date().toISOString(),
      },
      {
        id: "driver-3",
        title: "Bitcoin ETF Inflows Accelerating",
        description:
          "Bitcoin spot ETFs have seen cumulative inflows of $2.1B over the past week, marking the strongest sustained demand since launch. Institutional adoption is gaining momentum as regulatory clarity improves.",
        impact: "medium",
        direction: "bullish",
        affectedAssets: ["BTC", "ETH", "COIN", "MSTR"],
        confidence: 0.68,
        timeframe: "week",
        sources: ["ETF flow data", "Bloomberg"],
        createdAt: new Date().toISOString(),
      },
      {
        id: "driver-4",
        title: "Oil Supply Concerns from Middle East",
        description:
          "Geopolitical tensions in the Middle East are raising concerns about oil supply disruptions. OPEC+ production cuts remain in effect, supporting prices above $80/barrel despite weak Chinese demand.",
        impact: "medium",
        direction: "bearish",
        affectedAssets: ["USO", "XLE", "XOM", "CVX"],
        confidence: 0.62,
        timeframe: "month",
        sources: ["OPEC", "Energy Information Administration"],
        createdAt: new Date().toISOString(),
      },
      {
        id: "driver-5",
        title: "Dollar Weakness on Global Growth Optimism",
        description:
          "The US dollar index has declined 2.3% as global growth expectations improve and the Fed approaches its easing cycle. Emerging market currencies are strengthening, particularly in Asia.",
        impact: "low",
        direction: "bearish",
        affectedAssets: ["DXY", "UUP", "EEM"],
        confidence: 0.55,
        timeframe: "today",
        createdAt: new Date().toISOString(),
      },
    ];

    const filteredDrivers =
      timeframe === "all"
        ? mockDrivers
        : mockDrivers.filter((d) => d.timeframe === timeframe);

    return NextResponse.json({
      success: true,
      data: filteredDrivers,
      count: filteredDrivers.length,
      source: "mock",
      note: user
        ? "Add your OpenAI API key in Settings to enable real AI predictions."
        : "Sign in and add your OpenAI API key to enable real AI predictions.",
    });
  } catch (error) {
    console.error("AI drivers API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
