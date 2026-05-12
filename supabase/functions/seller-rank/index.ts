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
    const { category } = await req.json()
    if (!category) throw new Error("Category is required");

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // SQL execution via RPC or complex joined query.
    // Given the stubs, we can construct the reliability score.
    // 1. Fetch sellers who have products in the category.
    // 2. Fetch their orders (delivery_success rate).
    // 3. Fetch their messages (avg response time).
    // 4. Fetch their reviews (avg score).
    
    // In a real app, this should be an optimized Postgres View or RPC.
    // Here we simulate the logic in TS for edge processing.
    
    // Get sellers having matching products
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('seller_id, sellers(id, name, location_lat, location_lng)')
      .eq('category', category);

    if (prodErr) throw prodErr;

    const uniqueSellerIds = [...new Set(products.map((p: any) => p.seller_id))];
    const rankedSellers = [];

    for (const sId of uniqueSellerIds) {
      // Get delivery success rate
      const { data: orders } = await supabase.from('orders').select('delivery_success').eq('seller_id', sId);
      const totalOrders = orders?.length || 0;
      const successOrders = orders?.filter(o => o.delivery_success).length || 0;
      const deliverySuccessRate = totalOrders > 0 ? (successOrders / totalOrders) : 0.5; // Default 50% for new

      // Get avg response time
      const { data: messages } = await supabase.from('messages').select('response_time_minutes').eq('seller_id', sId);
      const totalMsgs = messages?.length || 0;
      const avgResponseMins = totalMsgs > 0 
        ? messages!.reduce((acc, m) => acc + (m.response_time_minutes || 0), 0) / totalMsgs
        : 60; // Default 60 mins

      // Get avg review
      const { data: reviews } = await supabase.from('reviews').select('score').eq('seller_id', sId);
      const totalReviews = reviews?.length || 0;
      const avgReview = totalReviews > 0
        ? reviews!.reduce((acc, r) => acc + (r.score || 0), 0) / totalReviews
        : 3.5; // Default 3.5

      // Simple scoring algorithm (0 to 100)
      // Weight mapping: 
      // Delivery (40%): 100% success = 40 pts
      // Response (30%): < 5 mins = 30 pts, > 120 mins = 0 pts
      // Reviews (30%): 5 stars = 30 pts

      const deliveryScore = deliverySuccessRate * 40;
      
      let responseScore = 30;
      if (avgResponseMins > 120) responseScore = 0;
      else if (avgResponseMins > 5) {
        responseScore = 30 - ((avgResponseMins - 5) / 115) * 30;
      }

      const reviewScore = (avgReview / 5) * 30;

      const finalRank = deliveryScore + responseScore + reviewScore;

      // Find seller details
      const sellerInfo = products.find((p: any) => p.seller_id === sId)?.sellers as any;

      rankedSellers.push({
        seller_id: sId,
        name: sellerInfo.name,
        lat: sellerInfo.location_lat,
        lng: sellerInfo.location_lng,
        trust_score: finalRank.toFixed(1),
        metrics: {
          delivery_rate: (deliverySuccessRate * 100).toFixed(0) + '%',
          avg_response_mins: avgResponseMins.toFixed(0),
          avg_review: avgReview.toFixed(1)
        }
      });
    }

    // Sort heavily by trust score
    rankedSellers.sort((a, b) => parseFloat(b.trust_score) - parseFloat(a.trust_score));

    return new Response(JSON.stringify({ ranked_sellers: rankedSellers }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
