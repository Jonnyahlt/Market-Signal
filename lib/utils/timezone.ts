import { format, formatInTimeZone } from "date-fns-tz";

export const MARKET_TIMEZONES = {
  EST: "America/New_York",
  CET: "Europe/Stockholm",
  GMT: "Europe/London",
  JST: "Asia/Tokyo",
} as const;

export type MarketTimezone = keyof typeof MARKET_TIMEZONES;

export function formatMarketTime(
  date: Date | string,
  timezone: MarketTimezone = "EST",
  formatString: string = "MMM dd, yyyy 'at' HH:mm zzz"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const tz = MARKET_TIMEZONES[timezone];

  return formatInTimeZone(dateObj, tz, formatString);
}

export function getCurrentMarketTimezone(): MarketTimezone {
  // Default to EST for markets
  return "EST";
}
