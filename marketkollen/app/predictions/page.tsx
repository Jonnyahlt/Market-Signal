import Link from "next/link";

export default function PredictionsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold tracking-tight">
                MarketKollen
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  News
                </Link>
                <Link
                  href="/calendar"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Calendar
                </Link>
                <Link
                  href="/markets"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Markets
                </Link>
                <Link
                  href="/predictions"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  AI Predictions
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">AI Market Predictions</h1>
            <p className="text-muted-foreground">
              AI-driven market insights, scenarios, and risk analysis (not financial advice)
            </p>
          </div>

          {/* Coming Soon */}
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="text-6xl">🤖</div>
              <h2 className="text-2xl font-bold">AI Predictions Coming Soon</h2>
              <p className="text-muted-foreground max-w-md">
                This page will display AI-generated market drivers, scenarios, and risk analysis based on current events.
              </p>
              <div className="pt-4">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  Back to News Feed
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2026 MarketKollen. Not financial advice.</p>
            <div className="flex items-center gap-4">
              <span>Powered by GDELT & CoinGecko</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
