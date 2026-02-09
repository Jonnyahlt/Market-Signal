# API Testing Guide

## Testa dina API-nycklar

Innan du kör MarketKollen, testa att dina API-nycklar fungerar:

### TwelveData
```bash
curl "https://api.twelvedata.com/quote?symbol=AAPL&apikey=DIN_NYCKEL"
```

**Förväntat svar:**
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc",
  "exchange": "NASDAQ",
  "currency": "USD",
  "close": "150.00",
  "change": "2.50",
  "percent_change": "1.69"
}
```

### Massive (Polygon)
```bash
curl "https://api.massive.com/v2/aggs/ticker/AAPL/prev?adjusted=true&apiKey=DIN_NYCKEL"
```

**Förväntat svar:**
```json
{
  "status": "OK",
  "results": [{
    "o": 148.50,
    "h": 151.00,
    "l": 148.00,
    "c": 150.00,
    "v": 50000000
  }]
}
```

**OBS:** Om Massive har bytt API-format från Polygon, skicka mig exempel-responses så fixar jag adaptern!

### Finnhub
```bash
curl "https://finnhub.io/api/v1/quote?symbol=AAPL&token=DIN_NYCKEL"
```

**Förväntat svar:**
```json
{
  "c": 150.00,
  "d": 2.50,
  "dp": 1.69,
  "h": 151.00,
  "l": 148.00,
  "o": 148.50,
  "pc": 147.50,
  "t": 1644537600
}
```

## Om API-responses skiljer sig

Om du får andra responses än ovanstående, **kopiera hela JSON-svaret** och skicka till mig så uppdaterar jag adaptern för att matcha det verkliga API:et.

## Vanliga problem

### Problem: "API key invalid"
**Lösning:** Kontrollera att nyckeln är rätt kopierad i `.env.local`

### Problem: "Rate limit exceeded"
**Lösning:** Vänta en minut och försök igen. Free tiers har begränsningar.

### Problem: "Symbol not found"
**Lösning:** Vissa API:er kräver exchange-prefix (t.ex. "NASDAQ:AAPL" istället för "AAPL")

## Debug i MarketKollen

Om något inte fungerar, kör:
```bash
npm run dev
```

Titta i **browser console** (F12) och **terminal** för error messages. Skicka hela felmeddelandet till mig.

## Environment Variables

Din `.env.local` ska se ut så här:
```bash
TWELVE_DATA_API_KEY=din_riktiga_nyckel_här
POLYGON_API_KEY=din_riktiga_nyckel_här
FINNHUB_API_KEY=din_riktiga_nyckel_här
ALPHA_VANTAGE_API_KEY=din_riktiga_nyckel_här
```

**VIKTIGT:** Inga quotes, inga spaces, bara nyckeln.

## Next Steps

1. Testa API-nycklarna med curl (ovan)
2. Lägg till i `.env.local`
3. Starta appen: `npm run dev`
4. Om något inte fungerar, rapportera:
   - Vilket API
   - Felmeddelande
   - Exempel på faktiskt API-svar (från curl)
