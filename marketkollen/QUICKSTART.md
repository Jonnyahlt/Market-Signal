# MarketKollen - Quick Start Guide

## What You've Got

A complete Next.js 14 application for financial market news and data, inspired by oskollen.se.

## Immediate Next Steps

### 1. Install Dependencies
```bash
cd marketkollen
npm install
```

### 2. Set Up Environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Alpha Vantage API key:
- Get free key: https://www.alphavantage.co/support/#api-key
- Replace `demo` with your actual key

### 3. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000

## What Works Now (MVP)

✅ **News Feed** - GDELT integration, real-time financial news
✅ **Filters** - Search, tags, tickers
✅ **API Routes** - `/api/news`, `/api/market`
✅ **Adapters** - GDELT (news), CoinGecko (crypto), Alpha Vantage (stocks)
✅ **Type Safety** - Full TypeScript + Zod validation
✅ **Dark Mode Ready** - CSS variables configured
✅ **Responsive** - Mobile-first design

## What's Next to Build

### Priority 1 - Complete MVP Pages
1. **Markets Page** (`/markets`)
   - Live ticker table
   - Price charts
   - Market overview cards

2. **Calendar Page** (`/calendar`)
   - Economic events (FRED API)
   - Filterable by country/impact
   - Timeline view

3. **Predictions Page** (`/predictions`)
   - AI market driver cards
   - Weekly outlook
   - Risk/opportunity scenarios

### Priority 2 - Enhancements
- Market ticker bar (header)
- Real-time price updates
- Chart components (recharts)
- News sentiment analysis
- Individual asset pages (`/asset/[symbol]`)

### Priority 3 - Infrastructure
- Redis caching
- PostgreSQL setup
- Rate limit middleware
- Error boundaries

## File Structure Quick Reference

```
marketkollen/
├── app/
│   ├── api/              ← Add new API routes here
│   │   ├── news/
│   │   └── market/
│   ├── globals.css       ← Global styles
│   ├── layout.tsx        ← Site layout
│   └── page.tsx          ← Home page (news feed)
│
├── components/
│   ├── ui/               ← Reusable UI components
│   ├── news/             ← News components
│   └── market/           ← Add market components here
│
├── adapters/             ← Add new data providers here
│   ├── news/
│   ├── market/
│   └── index.ts          ← Adapter factories
│
├── types/                ← Type definitions
│   └── index.ts
│
└── lib/                  ← Utilities
    └── utils/
```

## Adding a New Data Provider

1. **Create Adapter**
```typescript
// adapters/news/newsapi.ts
export class NewsAPIAdapter implements NewsAdapter {
  getName(): string { return "NewsAPI"; }
  
  async fetchNews(params: NewsAdapterParams): Promise<NewsArticle[]> {
    // Implementation
  }
}
```

2. **Register in Factory**
```typescript
// adapters/index.ts
case "newsapi":
  return new NewsAPIAdapter();
```

3. **Update Config**
```typescript
const config = {
  news: {
    available: ["gdelt", "newsapi"], // Add here
  }
};
```

## Adding a New Page

1. **Create Route**
```bash
mkdir app/markets
touch app/markets/page.tsx
```

2. **Build Component**
```typescript
export default function MarketsPage() {
  return <div>Markets content</div>;
}
```

3. **Add to Navigation** (in `app/page.tsx` header)

## Common Tasks

### Fetch News
```typescript
const response = await fetch('/api/news?tags=crypto&limit=20');
const data = await response.json();
```

### Fetch Market Data
```typescript
const response = await fetch('/api/market?symbols=BTC,ETH,AAPL');
const data = await response.json();
```

### Create New Component
```typescript
// components/market/TickerCard.tsx
import { MarketTicker } from "@/types";
import { Card } from "@/components/ui/card";

export function TickerCard({ ticker }: { ticker: MarketTicker }) {
  return <Card>{/* ... */}</Card>;
}
```

## Troubleshooting

### API Rate Limits
- GDELT: No limit
- CoinGecko: 10-50/min (free)
- Alpha Vantage: 5/min (free)

**Solution**: Implement caching or upgrade to paid tier

### CORS Issues
- All API calls go through Next.js API routes
- No direct browser → external API calls

### Type Errors
- Run `npm run build` to check types
- All external data validated with Zod

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Zod**: https://zod.dev
- **GDELT API**: http://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
- **CoinGecko API**: https://www.coingecko.com/en/api
- **Alpha Vantage**: https://www.alphavantage.co/documentation/

## Architecture Details

See `ARCHITECTURE.md` for:
- Full data flow diagrams
- Component hierarchy
- Adapter pattern explanation
- Future enhancement roadmap

## Contributing

1. Keep components small (<200 lines)
2. Add Zod schemas for external data
3. Use adapters for all external APIs
4. Follow existing naming conventions
5. Add TypeScript types everywhere

## Questions?

Check:
1. README.md - General overview
2. ARCHITECTURE.md - Technical deep dive
3. Code comments - Inline documentation

---

**Built with**: Next.js 14 • TypeScript • Tailwind CSS • Zod

**MVP Status**: ✅ News feed complete, ready to expand
