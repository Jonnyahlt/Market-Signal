"use client";

import { useEffect, useState } from "react";
import { NewsArticle } from "@/types";
import { NewsCard } from "./NewsCard";
import { NewsFilters } from "./NewsFilters";
import { Loader2 } from "lucide-react";

export function NewsFeed() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    search: "",
    tags: [] as string[],
    tickers: [] as string[],
  });

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [news, filters]);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("limit", "50"); // Fetch 50 articles
      if (filters.search) params.append("search", filters.search);
      if (filters.tags.length > 0) params.append("tags", filters.tags.join(","));
      if (filters.tickers.length > 0) params.append("tickers", filters.tickers.join(","));

      const response = await fetch(`/api/news?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setNews(data.data);
      } else {
        setError(data.error || "Failed to fetch news");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...news];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchLower) ||
          article.summary?.toLowerCase().includes(searchLower)
      );
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter((article) =>
        filters.tags.some((tag) => article.tags.includes(tag))
      );
    }

    // Tickers filter
    if (filters.tickers.length > 0) {
      filtered = filtered.filter((article) =>
        filters.tickers.some((ticker) => article.tickers.includes(ticker))
      );
    }

    setFilteredNews(filtered);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <p className="text-destructive font-medium">Error loading news</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={fetchNews}
            className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NewsFilters onFilterChange={handleFilterChange} />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            {filteredNews.length} {filteredNews.length === 1 ? "article" : "articles"}
          </h2>
          <button
            onClick={fetchNews}
            className="text-xs text-primary hover:underline"
          >
            Refresh
          </button>
        </div>
      </div>

      {filteredNews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No articles found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNews.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
