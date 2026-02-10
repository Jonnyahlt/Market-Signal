import { NewsFeed } from "@/components/news/NewsFeed";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Settings, LogIn } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
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
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  AI Predictions
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Market News</h1>
            <p className="text-muted-foreground">
              Latest financial news, market updates, and analysis
            </p>
          </div>

          {/* News Feed */}
          <NewsFeed />
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
