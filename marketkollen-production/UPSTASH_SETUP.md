# Upstash Redis Setup Guide

Upstash ger dig GRATIS Redis:
- 10,000 commands per day
- Serverless (pay per request)
- REST API (inga connections)

## Steg 1: Skapa Upstash Databas

1. Gå till: https://upstash.com/
2. Logga in med GitHub
3. Klicka "Create Database"
4. Välj:
   - Name: `marketkollen-cache`
   - Type: Regional
   - Region: EU-West-1 (Ireland)
   - Eviction: OFF
   - TLS: Enabled

## Steg 2: Hämta Credentials

1. Klicka på din databas
2. Gå till **REST API** tab
3. Kopiera:
   - **UPSTASH_REDIS_REST_URL**
   - **UPSTASH_REDIS_REST_TOKEN**

4. Lägg till i `.env.local`:
```bash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

## Färdig!

Nu har du:
- ✅ Gratis Redis caching
- ✅ REST API (inga connections)
- ✅ 10k requests/dag
