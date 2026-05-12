-- supabase/migrations/001_initial_schema.sql
-- Extension for vector embeddings (Supabase pgvector)
CREATE EXTENSION IF NOT EXISTS vector;

-- Table: sellers
CREATE TABLE sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE,
  location_lat FLOAT,
  location_lng FLOAT,
  reliability_score FLOAT DEFAULT 0, -- Algorithmically ranked
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES sellers(id),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'CDF',
  unit TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI embedding vector for semantic search
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: price_reports (Crowdsourced data, phase 0)
CREATE TABLE price_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  market_name TEXT NOT NULL,
  reputation_score INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: seller_analytics_cache 
-- Holds pre-computed market averages for the dashboard (updated asynchronously)
CREATE TABLE seller_analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES sellers(id),
  date DATE NOT NULL,
  avg_market_price NUMERIC,
  local_demand_index TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: user_queries
-- Logs USSD/SMS/Search queries for demand forecasting
CREATE TABLE user_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_phone TEXT,
  raw_query TEXT NOT NULL,
  parsed_intent JSONB,
  response_sent TEXT,
  source TEXT DEFAULT 'chat',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_analytics_cache ENABLE ROW LEVEL SECURITY;

-- Allow read access to products for everyone
CREATE POLICY "Products are readable by everyone" ON products FOR SELECT USING (true);
-- Sellers can update their own products
CREATE POLICY "Sellers can update their own products" ON products FOR UPDATE USING (auth.uid() = seller_id);

-- Table: orders (Stub for seller ranking)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES sellers(id),
  buyer_phone TEXT,
  delivery_success BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: messages (Stub for seller ranking - response time)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES sellers(id),
  buyer_phone TEXT,
  response_time_minutes INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: reviews (Stub for seller ranking)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES sellers(id),
  score INT CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

