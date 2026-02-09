# MarketKollen

A modern financial markets dashboard inspired by oskollen.se, providing real-time news, market data, economic calendar, and AI-driven market insights.

## Features

- **News Feed**: Real-time financial news aggregation with filtering by categories, tickers, and sentiment
- **Market Data**: Live crypto and stock prices, charts, and market statistics
- **Economic Calendar**: ForexFactory-style macro event calendar
- **AI Predictions**: AI-generated market drivers and scenarios (no financial advice)
- **Modular Architecture**: Easy to swap data providers via adapter pattern

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui-inspired components
- **Animation**: Framer Motion
- **Validation**: Zod
- **Data Sources** (MVP - Free tier):
  - News: GDELT 2.1
  - Crypto: CoinGecko
  - Stocks: Alpha Vantage
  - Calendar: FRED (planned)

## Project Structure

```
marketkollen/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── news/          # News endpoints
│   │   ├── market/        # Market data endpoints
│   │   └── calendar/      # Calendar endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── news/             # News-related components
│   └── market/           # Market-related components
├── adapters/             # Data provider adapters
│   ├── news/             # News adapters (GDELT, etc.)
│   ├── market/           # Market adapters (CoinGecko, Alpha Vantage)
│   └── index.ts          # Adapter factories
├── types/                # TypeScript types
├── lib/                  # Utilities
└── public/               # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd marketkollen
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API keys:
- Alpha Vantage: Get a free key at https://www.alphavantage.co/support/#api-key

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Data Provider Adapters

The app uses an adapter pattern to easily swap data providers:

### News Adapters
- **GDELT** (default): Free, no API key required

### Market Data Adapters
- **CoinGecko** (crypto): Free, no API key required
- **Alpha Vantage** (stocks): Free tier, API key required

### Adding New Adapters

1. Create adapter class implementing the interface:
```typescript
export class MyNewsAdapter implements NewsAdapter {
  getName(): string { return "MyProvider"; }
  async fetchNews(params: NewsAdapterParams): Promise<NewsArticle[]> {
    // Implementation
  }
}
```

2. Register in adapter factory (`adapters/index.ts`)
3. Update configuration

## API Routes

### GET /api/news
Fetch financial news with filtering.

**Query Parameters:**
- `search`: Search query
- `tags`: Comma-separated categories (crypto, stocks, forex, etc.)
- `tickers`: Comma-separated ticker symbols
- `sources`: Comma-separated source domains
- `sentiment`: positive | negative | neutral
- `dateFrom`: ISO date string
- `dateTo`: ISO date string

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "...",
      "url": "...",
      "source": "...",
      "publishedAt": "...",
      "tags": [],
      "tickers": []
    }
  ],
  "count": 50,
  "adapter": "GDELT"
}
```

### GET /api/market
Fetch market data for one or more symbols.

**Query Parameters:**
- `symbols`: Comma-separated symbols (BTC, ETH, AAPL, etc.)
- `type`: crypto | stocks (optional, auto-detected)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "type": "crypto",
      "price": 50000,
      "change": 1000,
      "changePercent": 2.0,
      "volume": 1000000000,
      "marketCap": 950000000000,
      "lastUpdated": "..."
    }
  ],
  "count": 1
}
```

## Design Principles

Following oskollen.se style:

1. **Minimal UI**: Clean, whitespace-heavy, card-based layout
2. **Typography First**: Strong hierarchy, readable fonts
3. **Fast & Responsive**: Optimized loading, smooth interactions
4. **Dark Mode Ready**: Full dark mode support
5. **No Financial Advice**: AI outputs are scenarios/risks only

## Development Guidelines

- Keep components small and focused
- Use TypeScript everywhere
- Validate all external data with Zod
- Cache API calls to respect rate limits
- Write production-ready code from day one
- Follow the adapter pattern for all external services

## Roadmap

- [ ] Economic calendar integration (FRED)
- [ ] AI market driver predictions
- [ ] Advanced charting with indicators
- [ ] Real-time WebSocket data
- [ ] User watchlists and portfolios
- [ ] Premium data provider integrations (Finnhub, Polygon, etc.)
- [ ] Redis caching layer
- [ ] PostgreSQL for user data

## License

MIT

## Disclaimer

This application is for informational purposes only. It does not provide financial advice. Always do your own research before making investment decisions.
