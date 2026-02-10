"use client";

import { CalendarEvent } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatInTimeZone } from "date-fns-tz";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface EventCardProps {
  event: CalendarEvent;
}

export function EventCard({ event }: EventCardProps) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getValueChange = () => {
    if (!event.actual || !event.previous) return null;
    
    const actual = parseFloat(event.actual);
    const previous = parseFloat(event.previous);
    
    if (isNaN(actual) || isNaN(previous)) return null;
    
    return actual - previous;
  };

  const valueChange = getValueChange();

  // Format date in EST timezone
  const formattedDate = formatInTimeZone(
    new Date(event.date),
    "America/New_York",
    "MMM dd, yyyy 'at' HH:mm 'EST'"
  );

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getImpactColor(event.impact)}>{event.impact}</Badge>
              <span className="text-xs text-muted-foreground">{event.country}</span>
            </div>
            <h3 className="font-semibold text-base">{event.event}</h3>
            <p className="text-sm text-muted-foreground mt-1">{formattedDate}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {event.actual && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Actual</div>
              <div className="font-mono font-medium flex items-center gap-1">
                {event.actual}
                {valueChange !== null && (
                  <>
                    {valueChange > 0 && <TrendingUp className="w-3 h-3 text-green-600" />}
                    {valueChange < 0 && <TrendingDown className="w-3 h-3 text-red-600" />}
                    {valueChange === 0 && <Minus className="w-3 h-3 text-gray-600" />}
                  </>
                )}
              </div>
            </div>
          )}
          {event.forecast && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Forecast</div>
              <div className="font-mono font-medium">{event.forecast}</div>
            </div>
          )}
          {event.previous && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Previous</div>
              <div className="font-mono font-medium">{event.previous}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
