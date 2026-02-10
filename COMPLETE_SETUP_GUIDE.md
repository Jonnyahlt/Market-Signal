# COMPLETE SETUP GUIDE - Windows + User API Keys

## STEG 1: Fixa Windows-problemet

### Lösning (Välj EN):

**A) Rensa cache (SNABBAST):**
```powershell
# Stoppa dev server (Ctrl+C)
Remove-Item -Recurse -Force .next
npm run build
npm run dev
```

**B) WSL (BÄST för långsiktigt):**
```powershell
wsl --install
# Restart
# I Ubuntu terminal:
cd /mnt/d/Programering/marketkollen
npm install
npm run dev
```

## STEG 2: Supabase Setup

1. Gå till https://supabase.com
2. Skapa projekt: `marketkollen`
3. Kopiera credentials från **Settings → API**
4. Lägg till i `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

5. **VIKTIGT**: Kör SQL-migrationen:
   - Öppna `SUPABASE_MIGRATION_API_KEYS.sql`
   - Kopiera hela SQL
   - Gå till Supabase → **SQL Editor**
   - Klistra in och kör

## STEG 3: Upstash Redis

1. Gå till https://upstash.com
2. Skapa databas: `marketkollen-cache`
3. Kopiera credentials
4. Lägg till i `.env.local`:
```bash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

## STEG 4: Sätt System API Keys (Optional)

I `.env.local`, lägg till de keys du redan har:
```bash
# Dina befintliga keys (system defaults)
TWELVE_DATA_API_KEY=xxx
POLYGON_API_KEY=xxx
ALPHA_VANTAGE_API_KEY=xxx
FRED_API_KEY=xxx
```

**VIKTIGT**: Dessa är SYSTEM defaults. Users kan override dem med sina egna!

## STEG 5: Testa!

```bash
npm run build
npm run dev
```

Gå till: http://localhost:3000

### Test User Journey:

1. **Utan inloggning:**
   - Besök /markets
   - Ser du live prices? ✅ System keys fungerar!

2. **Skapa konto:**
   - Gå till /signup
   - Skapa konto
   - Verifiera email (kolla inbox)
   - Logga in på /login

3. **Lägg till egna keys:**
   - Gå till /settings
   - Scrolla ner till "API Integrations"
   - Lägg till dina keys (eller låt dem vara tomma för system defaults)
   - Klicka "Save All Settings"

4. **Test att user keys fungerar:**
   - Gå till /markets
   - Data ska nu komma från DINA keys!
   - Gå till /predictions
   - Om du lagt till OpenAI key → Real AI!
   - Om inte → Mock data

## 🎯 HUR DET FUNGERAR:

### System vs User Keys:

**SYSTEM KEYS (i .env.local):**
- Default för alla users
- Fungerar utan inloggning
- Du betalar för alla requests

**USER KEYS (i Settings):**
- Override system keys
- User betalar själv
- Varje user kan ha egna premium providers

### Exempel:

```
System har: Alpha Vantage (gratis, slow)
User lägger till: TwelveData (premium, fast)

→ User får TwelveData
→ Andra users får Alpha Vantage
```

### Priority Order:

1. **User's key** (från database)
2. **System key** (från .env.local)
3. **Fallback** (demo/free tier)

## ✅ FEATURES MED USER KEYS:

### För ALLA users (utan premium keys):
- ✅ News feed (GDELT - gratis)
- ✅ Markets med system keys
- ✅ Calendar med system FRED key
- ✅ AI predictions (mock data)

### För users med egna keys:
- ✅ Faster market data (TwelveData/Polygon/Finnhub)
- ✅ REAL AI predictions (OpenAI)
- ✅ Unlimited requests (betalar själv)
- ✅ Premium features

## 💰 COST MANAGEMENT:

### Som site owner:
- Du kan ha inga keys alls → Users måste lägga till sina
- Du kan ha free tier keys → Alla kan använda (begränsat)
- Du kan ha premium keys → Du betalar för alla

### Rekommenderad strategi:
```bash
# .env.local - Minimal cost
ALPHA_VANTAGE_API_KEY=demo  # Free tier
FRED_API_KEY=xxx            # Free
# Inget annat!

# Users som vill premium lägger till sina egna keys
```

## 🐛 TROUBLESHOOTING:

### "User keys not working"
→ Har du kört SQL-migrationen? (SUPABASE_MIGRATION_API_KEYS.sql)

### "Still getting Windows errors"
→ Prova WSL istället

### "Markets showing no data"
→ Kolla att minst EN system key finns ELLER user har lagt till sina

### "AI predictions not working"
→ OpenAI key måste läggas till i Settings av user

## 📝 SUMMARY:

**Du behöver:**
1. ✅ Supabase account (gratis)
2. ✅ Upstash account (gratis)
3. ✅ Minst EN market data key (kan vara Alpha Vantage demo)
4. ✅ FRED key för calendar (gratis)

**Users kan lägga till:**
- TwelveData (premium stocks)
- Polygon/Massive (premium stocks)
- Finnhub (stocks + news)
- OpenAI (AI predictions)
- Alpha Vantage (stocks - egen key)
- FRED (calendar - egen key)

**Result:**
- Du kör gratis med free tier
- Power users betalar själva för premium
- Win-win! 🎉
