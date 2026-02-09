"use client";

import { NewsArticle } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTimeAgo } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface NewsCardProps {
  article: NewsArticle;
  onClick?: () => void;
}

export function NewsCard({ article, onClick }: NewsCardProps) {
  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
      onClick={onClick}
    >
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </CardTitle>
          {article.imageUrl && (
            <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden">
              <img
                src={article.imageUrl}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{article.source}</span>
          <span>•</span>
          <span>{formatTimeAgo(article.publishedAt)}</span>
        </div>
      </CardHeader>

      {(article.tags.length > 0 || article.tickers.length > 0) && (
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1.5">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {article.tickers.map((ticker) => (
              <Badge key={ticker} variant="outline" className="text-xs font-mono">
                {ticker}
              </Badge>
            ))}
            {article.sentiment && (
              <Badge
                variant={
                  article.sentiment === "positive"
                    ? "default"
                    : article.sentiment === "negative"
                    ? "destructive"
                    : "secondary"
                }
                className="text-xs"
              >
                {article.sentiment}
              </Badge>
            )}
          </div>
        </CardContent>
      )}

      {article.summary && (
        <CardContent className="pt-3">
          <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
        </CardContent>
      )}

      <div className="px-6 pb-4">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          <span>Read article</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </Card>
  );
}
