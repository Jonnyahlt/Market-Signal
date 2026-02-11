import { NextRequest, NextResponse } from "next/server";
import { NewsAdapterFactory } from "@/adapters";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters (no validation needed)
    const search = searchParams.get("search") || undefined;
    const tags = searchParams.get("tags")?.split(",").filter(Boolean) || undefined;
    const tickers = searchParams.get("tickers")?.split(",").filter(Boolean) || undefined;
    const sources = searchParams.get("sources")?.split(",").filter(Boolean) || undefined;
    const sentiment = searchParams.get("sentiment") as "positive" | "negative" | "neutral" | undefined;
    const limit = parseInt(searchParams.get("limit") || "50");

    // Get news adapter
    const adapter = NewsAdapterFactory.getAdapter();

    // Fetch news
    const news = await adapter.fetchNews({
      query: search,
      tickers: tickers,
      limit: limit,
    });

    // Apply filters (articles already validated in adapter)
    let filteredNews = news;

    if (tags && tags.length > 0) {
      filteredNews = filteredNews.filter((article) =>
        tags.some((tag) => article.tags.includes(tag))
      );
    }

    if (sources && sources.length > 0) {
      filteredNews = filteredNews.filter((article) =>
        sources.includes(article.source)
      );
    }

    if (sentiment) {
      filteredNews = filteredNews.filter(
        (article) => article.sentiment === sentiment
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredNews,
      count: filteredNews.length,
      adapter: adapter.getName(),
    });
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
