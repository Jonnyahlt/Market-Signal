# ✅ TROUBLESHOOTING CHECKLIST

## 🔴 PROBLEM 1: CORS Error på Login

### Symptom:
```
Cross-Origin request blocked
NetworkError when attempting to fetch resource
```

### Lösning:

**Steg 1:** Kolla .env.local existerar
```powershell
Get-Content .env.local
```

**Steg 2:** Verifiera format
```bash
# Ska se ut SÅ HÄR:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR...

# INTE så här:
SUPABASE_URL="https://xxxxx.supabase.co/auth/v1"  # ❌ FEL!
```

**Steg 3:** Verifiera Supabase projekt är AKTIVT
1. https://supabase.com/dashboard
2. Klicka på projekt
3. Ser du "Resume Project"? → Klicka det!

**Steg 4:** Kopiera RÄTT credentials
- Settings → API
- **Project URL** (utan /auth/v1)
- **anon public** key (INTE service_role!)

**Steg 5:** Restart
```powershell
# Stoppa server (Ctrl+C)
Remove-Item -Recurse -Force .next
npm run dev
```

---

## 🔴 PROBLEM 2: News på fel språk

### Symptom:
Artiklar på spanska, franska, tyska, etc

### Lösning:

**Steg 1:** Rensa cache
```powershell
Remove-Item -Recurse -Force .next
```

**Steg 2:** Bygg om
```powershell
npm run build
npm run dev
```

**Verifiering:**
- Gå till http://localhost:3000
- Alla titlar ska vara på engelska
- Om fortfarande fel språk → Refresh (Ctrl+Shift+R)

---

## 🔴 PROBLEM 3: Calendar tom eller fel data

### Symptom:
Inga events eller gamla events

### Orsak:
FRED data uppdateras inte dagligen för alla indicators!

### Lösning:

Nuvarande implementation visar:
- **Daily data**: Treasury yields, Oil price, EUR/USD
- **Monthly data**: CPI, Unemployment, Fed Funds
- **Quarterly data**: GDP

**Detta är normalt!** Economic data kommer inte varje dag.

### Förbättring:
Om du vill mer data, lägg till fler daily indicators:

```typescript
// I adapters/calendar/fred.ts lägg till:
{ id: "VIXCLS", name: "VIX Volatility Index", impact: "high" as const },
{ id: "DEXJPUS", name: "USD/JPY Exchange Rate", impact: "medium" as const },
```

---

## 🔴 PROBLEM 4: Markets Search fungerar inte

### Symptom:
Custom search returnerar inga resultat

### Lösning:

**Test:**
1. Gå till /markets
2. Välj "Crypto" tab
3. Skriv: `DOGE,SHIB,PEPE`
4. Klicka "Search"

**Om det inte fungerar:**
- Kolla browser console (F12)
- Leta efter `/api/market?symbols=DOGE,SHIB,PEPE`
- Vad är response?

**Common issues:**
- Symbols med mellanslag: `BTC, ETH` → Ska vara `BTC,ETH`
- Fel typ: Söker crypto symbols med "Stocks" tab vald
- API rate limit: Vänta 30 sekunder och försök igen

---

## 🔴 PROBLEM 5: Indices Page tom

### Symptom:
/indices visar "Error loading"

### Lösning:

**Steg 1:** Verifiera FRED API key
```powershell
# I .env.local:
FRED_API_KEY=din-key-här
```

**Steg 2:** Testa FRED API direkt
```
https://api.stlouisfed.org/fred/series/observations?series_id=SP500&api_key=DIN-KEY&file_type=json&limit=1
```

Ska returnera JSON med SP500 data.

**Steg 3:** Restart
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

---

## ✅ QUICK DIAGNOSTIC

Kör detta i PowerShell:

```powershell
# Check .env.local exists
if (Test-Path .env.local) {
    Write-Host "✅ .env.local exists" -ForegroundColor Green
    
    # Check for required vars
    $content = Get-Content .env.local
    
    if ($content -match "NEXT_PUBLIC_SUPABASE_URL") {
        Write-Host "✅ SUPABASE_URL set" -ForegroundColor Green
    } else {
        Write-Host "❌ SUPABASE_URL missing!" -ForegroundColor Red
    }
    
    if ($content -match "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
        Write-Host "✅ SUPABASE_ANON_KEY set" -ForegroundColor Green
    } else {
        Write-Host "❌ SUPABASE_ANON_KEY missing!" -ForegroundColor Red
    }
    
    if ($content -match "FRED_API_KEY") {
        Write-Host "✅ FRED_API_KEY set" -ForegroundColor Green
    } else {
        Write-Host "⚠️ FRED_API_KEY missing (optional)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .env.local NOT FOUND!" -ForegroundColor Red
    Write-Host "Run: cp .env.local.example .env.local" -ForegroundColor Yellow
}
```

---

## 📋 FÖRE DU FRÅGAR MIG:

Kolla följande:

1. ✅ `.env.local` finns och har rätt format?
2. ✅ Supabase projekt är aktivt (inte pausat)?
3. ✅ Dev server restarted efter .env ändringar?
4. ✅ `.next` rensad med `Remove-Item -Recurse -Force .next`?
5. ✅ Browser cache rensad (Ctrl+Shift+R)?
6. ✅ Browser console (F12) visar inga errors?

Om JA på allt ovan → Skicka mig:
- Screenshot av browser console errors
- Första 20 tecken av SUPABASE_URL
- Vilket problem exakt
