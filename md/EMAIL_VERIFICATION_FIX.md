# 📧 SUPABASE EMAIL VERIFICATION FIX

## Problem:
Inget verification email efter signup.

## Lösning - 2 Alternativ:

### Option 1: Disable Email Confirmation (Snabbast för development)

1. Gå till Supabase Dashboard
2. **Authentication** → **Providers** → **Email**
3. Scrolla ner till **Email Settings**
4. **Disable "Confirm email"**
5. Spara

**Nu kan du logga in direkt utan email!**

### Option 2: Konfigurera Email Service (Production)

Supabase skickar inte emails automatiskt på gratis tier.

**Steg:**

1. I Supabase Dashboard:
   - **Project Settings** → **Auth**
   - Scrolla till **SMTP Settings**

2. Använd gratis email service:

**Resend (Rekommenderat - 100 emails/dag gratis):**
```
SMTP Server: smtp.resend.com
Port: 587
Username: resend
Password: [Din Resend API key]
```

**SendGrid (300 emails/dag gratis):**
```
SMTP Server: smtp.sendgrid.net
Port: 587
Username: apikey
Password: [Din SendGrid API key]
```

**Gmail (Enklast för test):**
```
SMTP Server: smtp.gmail.com
Port: 587
Username: din.email@gmail.com
Password: [App-specific password]
```

### För Development (Rekommenderat):

**DISABLE email confirmation:**

1. Supabase Dashboard
2. Authentication → Email provider
3. **Turn OFF "Confirm email"**
4. Save

Nu fungerar signup direkt!

## Quick Test:

Efter disable:
```
1. Gå till /signup
2. Skapa konto
3. Redirects automatiskt
4. Gå till /login
5. Logga in direkt!
```

## Production Setup (Senare):

När du går live:
- Enable email confirmation
- Setup Resend eller SendGrid
- Custom email templates
