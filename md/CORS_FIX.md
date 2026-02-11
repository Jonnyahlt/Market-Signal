# 🚨 CORS ERROR FIX - SUPABASE

## Problemet:
```
Cross-Origin request blocked: CORS request did not succeed
```

Detta betyder att din Supabase URL är **HELT FEL** eller projekt är pausat.

## ✅ LÖSNING - GÖR DETTA NU:

### Steg 1: Verifiera Supabase Projektet

1. Gå till: https://supabase.com/dashboard
2. Ser du ditt projekt? 
   - **JA** → Fortsätt till steg 2
   - **NEJ** → Skapa nytt projekt först

### Steg 2: Är projektet PAUSAT?

Supabase pausar gratis projekt efter inaktivitet!

1. Klicka på ditt projekt
2. Ser du "Resume Project" eller "Paused"?
   - **JA** → Klicka "Resume Project" och vänta 2 minuter
   - **NEJ** → Projektet är aktivt, fortsätt

### Steg 3: Kopiera RÄTT URL

1. I Supabase Dashboard
2. **Settings** → **API**
3. Kopiera exakt:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
```

**VIKTIGT:**
- Ska börja med `https://`
- Ska sluta med `.supabase.co`
- INGEN `/auth/v1` eller andra paths!
- Exempel: `https://abcdefghijklmno.supabase.co`

### Steg 4: Kopiera RÄTT Anon Key

På samma sida (Settings → API):

```
anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

Detta är en LÅNG sträng (flera hundra tecken)!

### Steg 5: Uppdatera .env.local

```bash
# TA BORT allt annat i filen och lägg endast detta:

NEXT_PUBLIC_SUPABASE_URL=https://dittaktuella.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=din-långa-key-här

# ANDRA KEYS (optional för nu):
FRED_API_KEY=din-fred-key
TWELVE_DATA_API_KEY=din-twelve-data-key
```

**KRITISKT:**
- Inga quotes: `"` runt värden
- Inga spaces före/efter `=`
- Korrekt `NEXT_PUBLIC_` prefix

### Steg 6: Restart ALLT

```powershell
# Stoppa dev server (Ctrl+C)

# Rensa build
Remove-Item -Recurse -Force .next

# Starta igen
npm run dev
```

### Steg 7: Testa

Öppna: http://localhost:3000/login

**I Browser Console (F12):**
- Ska INTE visa CORS error
- Ska INTE visa "NetworkError"
- Login form ska visas

## 🔍 DUBBELKOLLA:

Skriv detta i PowerShell:

```powershell
# Kolla att .env.local existerar:
Get-Content .env.local

# Du ska se:
# NEXT_PUBLIC_SUPABASE_URL=https://...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## ⚠️ VANLIGA FEL:

1. **Glömt `NEXT_PUBLIC_` prefix**
   ```bash
   # ❌ FEL:
   SUPABASE_URL=https://xxx.supabase.co
   
   # ✅ RÄTT:
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   ```

2. **Extra path i URL**
   ```bash
   # ❌ FEL:
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co/auth/v1
   
   # ✅ RÄTT:
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   ```

3. **Fel key (service_role istället för anon)**
   - Använd "anon public" key, INTE "service_role"!

4. **Projekt pausat**
   - Resume project i Supabase dashboard

## 🎯 OM DET FORTFARANDE INTE FUNGERAR:

Skicka mig:
1. Första 20 tecken av din SUPABASE_URL
2. Första 20 tecken av din ANON_KEY
3. Screenshot från Supabase Dashboard som visar "Project is active"

Jag kan verifiera att formatet är rätt!
