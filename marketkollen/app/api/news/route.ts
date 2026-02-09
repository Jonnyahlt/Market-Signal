import { NextRequest, NextResponse } from "next/server";
import { NewsAdapterFactory } from "@/adapters";
import { NewsFilterSchema } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const filter = {
      search: searchParams.get("search") || undefined,
      tags: searchParams.get("tags")?.split(",") || undefined,
      tickers: searchParams.get("tickers")?.split(",") || undefined,
      sources: searchParams.get("sources")?.split(",") || undefined,
      sentiment: searchParams.get("sentiment") as "positive" | "negative" | "neutral" | undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
    };

    // Validate filter
    const validatedFilter = NewsFilterSchema.parse(filter);

    // Get news adapter
    const adapter = NewsAdapterFactory.getAdapter();

    // Fetch news
    const news = await adapter.fetchNews({
      query: validatedFilter.search,
      tickers: validatedFilter.tickers,
      limit: 50,
      dateFrom: validatedFilter.dateFrom ? new Date(validatedFilter.dateFrom) : undefined,
      dateTo: validatedFilter.dateTo ? new Date(validatedFilter.dateTo) : undefined,
    });

    // Apply filters
    let filteredNews = news;

    if (validatedFilter.tags && validatedFilter.tags.length > 0) {
      filteredNews = filteredNews.filter((article) =>
        validatedFilter.tags!.some((tag) => article.tags.includes(tag))
      );
    }

    if (validatedFilter.sources && validatedFilter.sources.length > 0) {
      filteredNews = filteredNews.filter((article) =>
        validatedFilter.sources!.includes(article.source)
      );
    }

    if (validatedFilter.sentiment) {
      filteredNews = filteredNews.filter(
        (article) => article.sentiment === validatedFilter.sentiment
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
