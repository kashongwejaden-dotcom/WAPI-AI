-- Create carts table for online sync
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, seller_id)
);

-- Enable RLS
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own cart
CREATE POLICY "Users can view own cart" ON carts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart" ON carts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart" ON carts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart" ON carts
  FOR DELETE USING (auth.uid() = user_id);

-- Analytics logs table
CREATE TABLE IF NOT EXISTS analytics_logs (
  id BIGSERIAL PRIMARY KEY,
  function_name TEXT NOT NULL,
  duration_ms INTEGER,
  status TEXT CHECK (status IN ('success', 'error', 'timeout')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (allow insert from Edge Functions only)
ALTER TABLE analytics_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON analytics_logs
  FOR ALL USING (current_user = 'supabase_admin');
