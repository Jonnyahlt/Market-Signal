"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CalendarEvent } from "@/types";
import { EventCard } from "@/components/calendar/EventCard";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImpact, setSelectedImpact] = useState<string[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedImpact.length > 0) {
        params.append("impact", selectedImpact.join(","));
      }

      const response = await fetch(`/api/calendar?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.data);
      } else {
        setError(data.error || "Failed to fetch calendar events");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const toggleImpact = (impact: string) => {
    setSelectedImpact((prev) =>
      prev.includes(impact) ? prev.filter((i) => i !== impact) : [...prev, impact]
    );
  };

  const filteredEvents = events.filter(
    (event) => selectedImpact.length === 0 || selectedImpact.includes(event.impact)
  );

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
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Economic Calendar</h1>
            <p className="text-muted-foreground">
              Track important economic events and market-moving announcements
            </p>
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Impact Level</label>
            <div className="flex gap-2">
              {["high", "medium", "low"].map((impact) => (
                <Badge
                  key={impact}
                  variant={selectedImpact.includes(impact) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleImpact(impact)}
                >
                  {impact}
                </Badge>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-2">
                <p className="text-destructive font-medium">Error loading calendar</p>
                <p className="text-sm text-muted-foreground">{error}</p>
                <button
                  onClick={fetchEvents}
                  className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Events */}
          {!loading && !error && (
            <>
              {filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No events found</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2026 MarketKollen. Not financial advice.</p>
            <div className="flex items-center gap-4">
              <span>Powered by FRED</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
