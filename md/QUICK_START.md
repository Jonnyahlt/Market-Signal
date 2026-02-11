# 🚀 QUICK START - MarketKollen Complete

## ✅ FIXES DENNA VERSION:

1. **News Feed** - Endast engelska (`sourcelang=eng`)
2. **Calendar** - Visar senaste 30 dagar med 7 indicators
3. **Supabase Login** - Better error handling
4. **Indices Page** - IMPLEMENTERAD!
5. **Dark Mode** - Alla headers

## 🔧 SETUP (5 minuter):

### 1. Environment Variables

```powershell
# Kopiera template
cp .env.local.example .env.local

# Öppna och fyll i:
notepad .env.local
```

**MÅSTE FYLLA I:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
FRED_API_KEY=xxx
```

### 2. Install & Build

```powershell
npm install
npm run build
npm run dev
```

### 3. Verifiera

- http://localhost:3000 → News (engelska)
- /indices → S&P500, NASDAQ, etc
- /login → Ska INTE ge NetworkError

## 📋 NÄSTA IMPLEMENTATION:

Se `IMPLEMENTATION_COMPLETE.md` för:
- Watchlists (SQL + Components)
- Screener (Full filtering)
- Price Alerts (Email notifications)

## ⚠️ TROUBLESHOOTING:

**"NetworkError" på login:**
→ Kolla `.env.local` har `NEXT_PUBLIC_` prefix
→ Restart dev server efter ändring

**News på fel språk:**
→ Rensa .next: `Remove-Item -Recurse -Force .next`

**Inga indices:**
→ Lägg till FRED_API_KEY i .env.local
