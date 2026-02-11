# 🗄️ COMPLETE SQL MIGRATIONS

Kör dessa i Supabase SQL Editor:

## 1. Watchlists

```sql
-- Watchlists table
CREATE TABLE IF NOT EXISTS public.watchlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watchlist items
CREATE TABLE IF NOT EXISTS public.watchlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  watchlist_id UUID REFERENCES public.watchlists(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('crypto', 'stock')),
  notes TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(watchlist_id, symbol)
);

-- RLS for watchlists
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlists"
  ON public.watchlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create watchlists"
  ON public.watchlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlists"
  ON public.watchlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlists"
  ON public.watchlists FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own watchlist items"
  ON public.watchlist_items FOR SELECT
  USING (watchlist_id IN (SELECT id FROM public.watchlists WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own watchlist items"
  ON public.watchlist_items FOR ALL
  USING (watchlist_id IN (SELECT id FROM public.watchlists WHERE user_id = auth.uid()));
```

## 2. Price Alerts

```sql
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  target_price NUMERIC NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('above', 'below')),
  triggered BOOLEAN DEFAULT FALSE,
  triggered_at TIMESTAMP WITH TIME ZONE,
  notification_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts"
  ON public.price_alerts FOR ALL
  USING (auth.uid() = user_id);

-- Index for quick alert checking
CREATE INDEX idx_alerts_active ON public.price_alerts(symbol, triggered) WHERE triggered = FALSE;
```

## 3. Screener Saved Filters

```sql
CREATE TABLE IF NOT EXISTS public.screener_filters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.screener_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own filters"
  ON public.screener_filters FOR ALL
  USING (auth.uid() = user_id);
```

## 4. Email Notification Settings

```sql
-- Add to user_api_keys table
ALTER TABLE public.user_api_keys 
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notification_frequency TEXT DEFAULT 'instant' CHECK (notification_frequency IN ('instant', 'daily', 'weekly'));
```

## ✅ Verifiera Installation

Kör detta för att se att allt skapades:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('watchlists', 'watchlist_items', 'price_alerts', 'screener_filters')
ORDER BY table_name;
```

Du ska se alla 4 tabeller!

## 🔒 Security Check

```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('watchlists', 'watchlist_items', 'price_alerts', 'screener_filters');
```

Alla ska ha `rowsecurity = true`!
