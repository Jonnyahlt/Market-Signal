# MarketKollen - Project Overview

## Architecture Overview

MarketKollen follows a modern, modular architecture designed for scalability and maintainability.

### Core Principles

1. **Adapter Pattern**: All external data sources are accessed through adapters
2. **Type Safety**: Full TypeScript coverage with Zod validation
3. **API-First**: All data flows through Next.js API routes
4. **Component Composition**: Small, reusable UI components
5. **Server-Side Rendering**: Leverages Next.js App Router for performance

## Directory Structure Explained

### `/app` - Next.js App Directory
- **`/api`**: Server-side API routes that proxy external data sources
  - **`/news`**: Aggregates news from configured adapters
  - **`/market`**: Fetches market data (crypto, stocks, etc.)
  - **`/calendar`**: Economic calendar events (planned)
- **`globals.css`**: Tailwind base styles + CSS variables for theming
- **`layout.tsx`**: Root layout with metadata and font configuration
- **`page.tsx`**: Home page (news feed)

### `/components` - React Components
```
components/
├── ui/              # Base UI components (Card, Badge, etc.)
├── news/            # News-specific components
│   ├── NewsCard.tsx       # Individual news article card
│   ├── NewsFilters.tsx    # Search and filter controls
│   └── NewsFeed.tsx       # Main feed component with state
└── market/          # Market-specific components (planned)
```

### `/adapters` - Data Source Adapters
```
adapters/
├── news/
│   └── gdelt.ts           # GDELT 2.1 news adapter
├── market/
│   ├── coingecko.ts       # CoinGecko crypto adapter
│   └── alphavantage.ts    # Alpha Vantage stocks adapter
└── index.ts               # Adapter factories
```

**Adapter Pattern Benefits:**
- Easy to swap providers (e.g., GDELT → NewsAPI)
- Consistent interface across all data sources
- Provider-specific logic encapsulated
- Rate limiting and caching per adapter

### `/types` - TypeScript Definitions
- **Zod Schemas**: Runtime validation for all external data
- **Type Inference**: TypeScript types derived from Zod schemas
- **Adapter Interfaces**: Contract for all data providers

### `/lib` - Shared Utilities
- **utils/index.ts**: Formatting helpers (currency, percentages, time ago)

## Data Flow

```
User Request
    ↓
Next.js Page (SSR/CSR)
    ↓
React Component
    ↓
API Route (/api/news, /api/market)
    ↓
Adapter Factory (selects provider)
    ↓
Specific Adapter (GDELT, CoinGecko, etc.)
    ↓
External API
    ↓
Zod Validation
    ↓
Type-Safe Response
    ↓
Component Updates
```

## Component Architecture

### News Feed Flow
1. **NewsFeed** (container)
   - Fetches data from `/api/news`
   - Manages loading/error states
   - Coordinates filters with display
   
2. **NewsFilters** (controls)
   - Search input
   - Tag selection
   - Ticker input
   - Emits filter changes to parent

3. **NewsCard** (presentation)
   - Displays single article
   - Minimal, card-based design
   - Click to open article

## Styling Approach

### Design System
- **CSS Variables**: All colors defined in `globals.css`
- **Tailwind Utilities**: Component styling
- **Dark Mode**: Automatic with `class` strategy
- **Responsive**: Mobile-first design

### Color Palette
```css
/* Light mode */
--background: white
--foreground: dark blue-gray
--primary: blue
--muted: light gray

/* Dark mode */
--background: dark blue-gray
--foreground: white
--primary: lighter blue
--muted: darker gray
```

## API Design

### REST Endpoints

#### `GET /api/news`
**Purpose**: Fetch and filter financial news

**Query Params:**
- `search`: Free-text search
- `tags`: Category filters (crypto, stocks, etc.)
- `tickers`: Symbol filters (BTC, AAPL, etc.)
- `sources`: Domain filters
- `sentiment`: Sentiment filter
- `dateFrom/dateTo`: Time range

**Response:**
```typescript
{
  success: boolean;
  data: NewsArticle[];
  count: number;
  adapter: string;
}
```

#### `GET /api/market`
**Purpose**: Fetch current market data

**Query Params:**
- `symbols`: Comma-separated tickers
- `type`: Asset type (optional, auto-detected)

**Response:**
```typescript
{
  success: boolean;
  data: MarketTicker[];
  count: number;
}
```

## External Data Sources

### GDELT Project (News)
- **API**: https://api.gdeltproject.org/api/v2/doc/doc
- **Rate Limit**: None documented
- **Cost**: Free
- **Coverage**: Global news in real-time
- **Format**: JSON

### CoinGecko (Crypto)
- **API**: https://api.coingecko.com/api/v3
- **Rate Limit**: 10-50 calls/min (free tier)
- **Cost**: Free (with limits)
- **Coverage**: 10,000+ cryptocurrencies
- **Format**: JSON

### Alpha Vantage (Stocks)
- **API**: https://www.alphavantage.co/query
- **Rate Limit**: 5 calls/min, 500/day (free tier)
- **Cost**: Free tier available
- **Coverage**: US stocks, forex, crypto
- **Format**: JSON

## Future Enhancements

### Short-term (MVP+)
- [ ] Economic calendar (FRED API)
- [ ] Chart components with historical data
- [ ] Market ticker bar (header)
- [ ] AI summarization of news

### Medium-term
- [ ] Redis caching layer
- [ ] PostgreSQL for user preferences
- [ ] Real-time WebSocket updates
- [ ] User watchlists
- [ ] Mobile app (React Native)

### Long-term
- [ ] Premium data providers
- [ ] Advanced charting (TradingView integration)
- [ ] Portfolio tracking
- [ ] Alerts and notifications
- [ ] Social sentiment analysis

## Performance Considerations

### Caching Strategy
1. **Browser Cache**: Static assets (CDN)
2. **API Route Cache**: Server-side response caching
3. **Redis Cache**: Shared cache for multiple instances
4. **Adapter Cache**: Provider-specific TTL

### Rate Limiting
- Respect external API limits
- Implement exponential backoff
- Queue requests if needed
- Display friendly errors to users

### Bundle Size
- Code splitting by route
- Dynamic imports for heavy components
- Tree shaking with Next.js
- Optimize images with next/image

## Testing Strategy (Planned)

### Unit Tests
- Adapters (mock external APIs)
- Utilities (formatting, validation)
- Individual components

### Integration Tests
- API routes
- Full adapter flow
- Component interactions

### E2E Tests
- Critical user flows
- Cross-browser compatibility

## Deployment

### Recommended Stack
- **Hosting**: Vercel (optimized for Next.js)
- **Database**: Vercel Postgres or Supabase
- **Cache**: Upstash Redis
- **Monitoring**: Vercel Analytics
- **Errors**: Sentry

### Environment Variables
```bash
# Required
ALPHA_VANTAGE_API_KEY=your_key_here

# Optional (future)
FINNHUB_API_KEY=
TWELVE_DATA_API_KEY=
POLYGON_API_KEY=
DATABASE_URL=
REDIS_URL=
```

## Contributing Guidelines

1. Follow existing code style
2. Add Zod validation for all external data
3. Create adapters for new data sources
4. Keep components small (<200 lines)
5. Write type-safe code
6. Document complex logic

## License

MIT - See LICENSE file
