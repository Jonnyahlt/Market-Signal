# Supabase Migration - User API Keys för ALLA providers

Kör detta i Supabase SQL Editor:

```sql
-- Drop old table and recreate with all API keys
DROP TABLE IF EXISTS public.user_api_keys;

CREATE TABLE public.user_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- AI APIs
  openai_api_key TEXT,
  
  -- Market Data APIs
  twelve_data_api_key TEXT,
  polygon_api_key TEXT,
  finnhub_api_key TEXT,
  alpha_vantage_api_key TEXT,
  
  -- Calendar/Economic Data
  fred_api_key TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own API keys"
  ON public.user_api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON public.user_api_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
  ON public.user_api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON public.user_api_keys FOR DELETE
  USING (auth.uid() = user_id);
```

Kör detta nu i Supabase!
