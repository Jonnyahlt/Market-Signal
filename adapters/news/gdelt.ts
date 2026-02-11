import { NewsAdapter, NewsAdapterParams, NewsArticle } from "@/types";
import { z } from "zod";

// GDELT 2.1 API response schema
const GDELTArticleSchema = z.object({
  url: z.string(),
  title: z.string(),
  seendate: z.string(),
  socialimage: z.string().optional(),
  domain: z.string(),
  language: z.string().optional(),
  sourcecountry: z.string().optional(),
});

export class GDELTNewsAdapter implements NewsAdapter {
  private baseUrl = "https://api.gdeltproject.org/api/v2/doc/doc";
  private cacheTTL = 300; // 5 minutes

  getName(): string {
    return "GDELT";
  }

  async fetchNews(params: NewsAdapterParams): Promise<NewsArticle[]> {
    const query = this.buildQuery(params);
    const url = `${this.baseUrl}?${query}`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "MarketKollen/1.0",
        },
      });

      if (!response.ok) {
        throw new Error(`GDELT API error: ${response.status}`);
      }

      const text = await response.text();
      const articles = this.parseGDELTResponse(text);
      
      return articles.slice(0, params.limit || 50);
    } catch (error) {
      console.error("GDELT fetch error:", error);
      return [];
    }
  }

  private buildQuery(params: NewsAdapterParams): string {
    const queryParts: string[] = [];

    // Build search query
    let searchTerms: string[] = [];
    
    if (params.query) {
      searchTerms.push(params.query);
    }

    if (params.tickers && params.tickers.length > 0) {
      searchTerms.push(...params.tickers);
    }

    const query = searchTerms.length > 0 ? searchTerms.join(" OR ") : "market finance";
    
    queryParts.push(`query=${encodeURIComponent(query)}`);
    queryParts.push("mode=artlist");
    queryParts.push("maxrecords=250");
    queryParts.push("format=json");
    queryParts.push("sort=datedesc");
    queryParts.push("sourcelang=eng"); // ONLY ENGLISH

    // Time range
    if (params.dateFrom) {
      const startDate = this.formatGDELTDate(params.dateFrom);
      queryParts.push(`startdatetime=${startDate}`);
    }

    if (params.dateTo) {
      const endDate = this.formatGDELTDate(params.dateTo);
      queryParts.push(`enddatetime=${endDate}`);
    }

    return queryParts.join("&");
  }

  private formatGDELTDate(date: Date): string {
    // GDELT format: YYYYMMDDhhmmss
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  private parseGDELTResponse(text: string): NewsArticle[] {
    try {
      const data = JSON.parse(text);
      
      if (!data.articles || !Array.isArray(data.articles)) {
        return [];
      }

      return data.articles
        .filter((article: any) => {
          // Filter out non-English articles
          if (article.language && article.language !== 'English') {
            return false;
          }
          return true;
        })
        .map((article: any) => {
          try {
            const validated = GDELTArticleSchema.parse(article);
            
            return {
              id: `gdelt-${validated.url}-${validated.seendate}`,
              title: validated.title,
              url: validated.url,
              source: validated.domain,
              publishedAt: this.parseGDELTDate(validated.seendate),
              imageUrl: validated.socialimage,
              tags: this.extractTags(validated.title),
              tickers: [],
              sentiment: null, // GDELT doesn't provide sentiment
            } as NewsArticle;
          } catch (error) {
            console.warn("Failed to parse GDELT article:", error);
            return null;
          }
        })
        .filter((article: NewsArticle | null): article is NewsArticle => article !== null);
    } catch (error) {
      console.error("Failed to parse GDELT response:", error);
      return [];
    }
  }

  private parseGDELTDate(seendate: string): string {
    // GDELT seendate format: YYYYMMDDThhmmssZ
    const year = seendate.slice(0, 4);
    const month = seendate.slice(4, 6);
    const day = seendate.slice(6, 8);
    const hour = seendate.slice(9, 11);
    const minute = seendate.slice(11, 13);
    const second = seendate.slice(13, 15);
    
    return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
  }

  private extractTags(title: string): string[] {
    const tags: string[] = [];
    const lowerTitle = title.toLowerCase();

    const tagMap: Record<string, string[]> = {
      crypto: ["bitcoin", "ethereum", "crypto", "blockchain", "btc", "eth"],
      stocks: ["stock", "shares", "equity", "nasdaq", "s&p", "dow"],
      forex: ["forex", "currency", "dollar", "euro", "yen", "pound"],
      commodities: ["gold", "oil", "silver", "commodity", "crude"],
      fed: ["fed", "federal reserve", "interest rate", "powell"],
      earnings: ["earnings", "revenue", "profit", "quarterly"],
      macro: ["gdp", "inflation", "unemployment", "cpi", "ppi"],
    };

    for (const [tag, keywords] of Object.entries(tagMap)) {
      if (keywords.some((keyword) => lowerTitle.includes(keyword))) {
        tags.push(tag);
      }
    }

    return tags;
  }
}
