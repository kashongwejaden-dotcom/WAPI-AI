#!/bin/bash

# Set your local Supabase Edge Functions URL
BASE_URL="http://127.0.0.1:54321/functions/v1"
# For deployed: change to your project ref

echo "=== WapiAI E2E Test ==="

# 1. Test SMS webhook
echo -e "\n1. Testing SMS webhook (maize in Kinshasa)..."
curl -X POST "$BASE_URL/sms-webhook" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=%2B243123456789&Body=cheapest%20maize%20Kinshasa"

# 2. Test AI search (natural language)
echo -e "\n\n2. Testing AI search (cheap rice near me)..."
curl -X POST "$BASE_URL/ai-search" \
  -H "Content-Type: application/json" \
  -d '{"query": "cheap rice near me for 5 people under 10 dollars"}'

# 3. Test Copilot budget optimizer
echo -e "\n\n3. Testing Copilot (food for 10 people under $20)..."
curl -X POST "$BASE_URL/copilot" \
  -H "Content-Type: application/json" \
  -d '{"query": "food for 10 people under 20 dollars"}'

# 4. Test Seller Ranking (category: maize)
echo -e "\n\n4. Testing Seller Ranking (maize)..."
curl -X POST "$BASE_URL/seller-rank" \
  -H "Content-Type: application/json" \
  -d '{"category": "maize", "limit": 5}'

# 5. Test Price Prediction (maize, Kinshasa, 3 days)
echo -e "\n\n5. Testing Price Prediction (maize, Kinshasa, 3 days)..."
curl -X POST "$BASE_URL/price-predict" \
  -H "Content-Type: application/json" \
  -d '{"product_name": "maize", "location": "Kinshasa", "days_ahead": 3}'

echo -e "\n\n=== E2E Test Complete ==="
