# 📅 CALENDAR - FRED vs ForexFactory

## Skillnaden:

### ForexFactory:
- Visar **FRAMTIDA** events (scheduled releases)
- "Today at 14:30 EST" → Event kommer publiceras senare idag
- Har forecast värden (vad marknaden förväntar sig)
- Täcker ALLA ekonomiska events (100+ per vecka)

### FRED (Federal Reserve Economic Data):
- Visar **HISTORISK** data (redan publicerad)
- "Feb 09 at 09:30 EST" → Data från igår/förra veckan
- Har actual + previous värden
- Täcker ~20 nyckel-indicators

## Problemet:

FRED har INTE:
- ❌ Framtida events
- ❌ Forecast värden
- ❌ Exakta release schedules
- ❌ Alla minor indicators

## Lösning - 3 Alternativ:

### Option 1: Använd Trading Economics API (Gratis tier)

Trading Economics har economic calendar API med framtida events.

**Setup:**
1. Registrera: https://tradingeconomics.com/
2. Få API key (gratis för 500 calls/month)
3. Ersätt FRED adapter

**Fördelar:**
- ✅ Framtida events
- ✅ Forecast värden
- ✅ Många indicators

**Nackdelar:**
- ⚠️ 500 calls/month limit
- ⚠️ Mindre data än betald

### Option 2: Scrape ForexFactory (Gratis men mot TOS)

ForexFactory har public calendar, men scraping är mot deras Terms of Service.

**Inte rekommenderat!**

### Option 3: Kombination FRED + Mock Schedule

Använd FRED för actual data + hårdkoda release schedule.

**Implementation:**
```typescript
// Visa dagens scheduled events (hardcoded):
const TODAY_EVENTS = [
  {
    time: "14:30 EST",
    event: "Average Hourly Earnings",
    forecast: "0.3%",
    impact: "high"
  },
  {
    time: "14:30 EST",
    event: "Non-Farm Employment",
    forecast: "66K",
    impact: "high"
  }
];

// När klockan passerat 14:30, hämta actual från FRED
```

## Min Rekommendation:

**För nu:**
Behåll FRED som visar "denna veckans publicerade data".

Det är KORREKT data, bara inte framtida.

**För produktions version:**
Använd Trading Economics API (gratis tier) för calendar.

## Vill du att jag implementerar Trading Economics?

Säg till så lägger jag till det! Det ger:
- Real framtida events
- Forecast värden
- Samma stil som ForexFactory
- Gratis för 500 calls/month

Alternativt kan jag göra en hybrid som visar:
- **Dagens scheduled**: Hardcoded times (uppdateras manuellt varje vecka)
- **Historical actual**: FRED data när publicerat

Vad föredrar du? 🎯
