import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { product_name, location, days_ahead } = await req.json()
    if (!product_name) {
      throw new Error("product_name is required.")
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing supabase config")
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Using basic Edge Function aggregation over price_reports since we don't have a direct Time-series view yet.
    // Fetch last 7 days of price_reports for this product
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let query = supabase
      .from('price_reports')
      .select('price, created_at')
      .ilike('product_name', `%${product_name}%`)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    if (location) {
      query = query.ilike('market_name', `%${location}%`)
    }

    const { data: reports, error } = await query

    if (error) throw error;

    if (!reports || reports.length === 0) {
      return new Response(JSON.stringify({ 
        message: "Not enough data for prediction.",
        prediction: null 
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const prices = reports.map(r => r.price)
    prices.sort((a, b) => a - b)
    
    const min = prices[0]
    const max = prices[prices.length - 1]
    const median = prices[Math.floor(prices.length / 2)]

    // Simple prediction baseline
    // MVP logic: It remains stable around median. No ML yet.
    return new Response(JSON.stringify({
      product: product_name,
      prediction: {
        predicted_min: min,
        predicted_max: max,
        predicted_median: median,
        trend: max > median ? 'rising' : 'stable'
      },
      confidence_note: "Based on 7-day trend. Accuracy improves with more data."
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
