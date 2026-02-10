"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

interface NewsFiltersProps {
  onFilterChange: (filters: {
    search: string;
    tags: string[];
    tickers: string[];
  }) => void;
}

const AVAILABLE_TAGS = [
  "crypto",
  "stocks",
  "forex",
  "commodities",
  "fed",
  "earnings",
  "macro",
  "tech",
  "energy",
];

export function NewsFilters({ onFilterChange }: NewsFiltersProps) {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tickerInput, setTickerInput] = useState("");
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange({
      search: value,
      tags: selectedTags,
      tickers: selectedTickers,
    });
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    onFilterChange({
      search,
      tags: newTags,
      tickers: selectedTickers,
    });
  };

  const addTicker = () => {
    if (tickerInput.trim() && !selectedTickers.includes(tickerInput.toUpperCase())) {
      const newTickers = [...selectedTickers, tickerInput.toUpperCase()];
      setSelectedTickers(newTickers);
      setTickerInput("");
      onFilterChange({
        search,
        tags: selectedTags,
        tickers: newTickers,
      });
    }
  };

  const removeTicker = (ticker: string) => {
    const newTickers = selectedTickers.filter((t) => t !== ticker);
    setSelectedTickers(newTickers);
    onFilterChange({
      search,
      tags: selectedTags,
      tickers: newTickers,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search news..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Categories
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tickers */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Tickers
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add ticker (e.g. BTC, AAPL)"
            value={tickerInput}
            onChange={(e) => setTickerInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTicker();
              }
            }}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={addTicker}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Add
          </button>
        </div>
        {selectedTickers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTickers.map((ticker) => (
              <Badge key={ticker} variant="outline" className="gap-1 pr-1">
                <span className="font-mono">{ticker}</span>
                <button
                  onClick={() => removeTicker(ticker)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
