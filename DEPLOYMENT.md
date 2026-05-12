# WapiAI Deployment Guide

## Prerequisites
- Supabase Project setup
- OpenAI API Key
- Twilio or Africa's Talking Credentials
- Flutter SDK installed

## Environment Variables
Create a `.env` file in the `supabase/` directory (or configure in Supabase dashboard):
```env
OPENAI_API_KEY=your-openai-api-key
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Database Setup
1. Apply migrations: `supabase db push`
2. Seed initial data: Import `seed_data.csv` to the `products` table via Supabase Dashboard or script.

## Deploying Edge Functions
Run the following commands to deploy the functions (skip JWT verification for webhook):
```sh
supabase functions deploy sms-webhook --no-verify-jwt
supabase functions deploy ai-search
supabase functions deploy seller-rank
supabase functions deploy negotiation-assistant
supabase functions deploy price-predict
supabase functions deploy copilot
supabase functions deploy log-query
```

## Flutter Build
For Android APK:
```sh
flutter build apk --release
```
For Web:
```sh
flutter build web --release
```
