#!/bin/bash
# test/sms_webhook_test.sh

# This script simulates an incoming SMS from Twilio/Africa's Talking to your local Supabase Edge Function.
# Ensure your local Supabase stack is running with `supabase start` and Edge Functions are served.

# Set your local or remote Edge Function URL
LOCAL_URL="http://127.0.0.1:54321/functions/v1/sms-webhook"

# Simulate sending an SMS: "rice price Kinshasa"
echo "Simulating incoming SMS..."

curl -X POST "$LOCAL_URL" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=+243810000000" \
  -d "Body=rice price Kinshasa"

echo -e "\n\nDone. Check the Supabase logs to verify the 'user_queries' table was updated."
