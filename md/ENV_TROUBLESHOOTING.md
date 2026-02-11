# 🔧 ENVIRONMENT VARIABLES - TROUBLESHOOTING

## ❌ "NetworkError when attempting to fetch resource"

Detta betyder att Supabase credentials saknas eller är felaktiga.

## ✅ FIXA DET:

### Steg 1: Kontrollera `.env.local`

Filen MÅSTE heta exakt `.env.local` (inte `.env` eller `env.local`)

```bash
# Kolla att filen finns:
dir .env.local

# Om den inte finns:
cp .env.local.example .env.local
```

### Steg 2: Lägg till Supabase Credentials

I `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**VIKTIGT:**
- `NEXT_PUBLIC_` prefix är MÅSTE för client-side
- URL ska börja med `https://`
- Anon key är en lång JWT token

### Steg 3: Hitta dina credentials

1. Gå till https://supabase.com/dashboard
2. Välj ditt projekt
3. Gå till **Settings** → **API**
4. Kopiera:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Steg 4: Restart dev server

```powershell
# Stoppa servern (Ctrl+C)

# Starta igen
npm run dev
```

**Environment variables läses ENDAST vid server start!**

## 🔍 VERIF IER A:

Öppna browser console (F12) på `/login`:

- Om du ser: "Missing Supabase environment variables!" → Env vars inte satta
- Om du ser: "NetworkError" → Fel URL eller key
- Om login form visas utan errors → Allt OK!

## 📋 KOMPLETT .env.local TEMPLATE:

```bash
# ============================================================================
# SUPABASE (MÅSTE VARA FÖRST!)
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk1NjIwMDAsImV4cCI6MjAyNTEzODAwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================================================
# REDIS CACHE (Upstash)
# ============================================================================
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx

# ============================================================================
# MARKET DATA
# ============================================================================
TWELVE_DATA_API_KEY=your-key-here
POLYGON_API_KEY=your-key-here
FINNHUB_API_KEY=your-key-here
ALPHA_VANTAGE_API_KEY=demo

# ============================================================================
# CALENDAR
# ============================================================================
FRED_API_KEY=your-fred-key

# ============================================================================
# AI (Optional)
# ============================================================================
OPENAI_API_KEY=sk-proj-xxxxx
```

## 🚨 COMMON MISTAKES:

1. ❌ Glömde `NEXT_PUBLIC_` prefix
2. ❌ Extra spaces i .env.local
3. ❌ Quotes runt värden (ta bort quotes!)
4. ❌ Fel filnamn (`.env` istället för `.env.local`)
5. ❌ Inte restartat servern efter ändring

## ✅ RÄTT FORMAT:

```bash
# ❌ FEL:
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_URL=https://xxx.supabase.co

# ✅ RÄTT:
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
```
