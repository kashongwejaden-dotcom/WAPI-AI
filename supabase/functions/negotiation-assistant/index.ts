import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { product_id, seller_id, buyer_proposed_price, role } = await req.json()
    if (!product_id || !seller_id || !role) {
      throw new Error("product_id, seller_id, and role (buyer/seller) are required.")
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openAiKey = Deno.env.get('OPENAI_API_KEY');

    if (!supabaseUrl || !supabaseKey || !openAiKey) {
      throw new Error("Missing config")
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Fetch current product price
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('name, price, currency, unit, category')
      .eq('id', product_id)
      .single()

    if (prodErr || !product) throw new Error("Product not found")

    // 2. Fetch competitive insights (simplified query for MVP)
    const { data: competitors } = await supabase
      .from('products')
      .select('price')
      .eq('category', product.category)
      .neq('seller_id', seller_id)

    const prices = competitors?.map(c => c.price) || []
    let avgMarketPrice = product.price
    if (prices.length > 0) {
       avgMarketPrice = prices.reduce((a, b) => a + b, 0) / prices.length
    }

    const priceDiffRaw = product.price - avgMarketPrice
    const priceDiffPercent = Math.round((Math.abs(priceDiffRaw) / avgMarketPrice) * 100)
    const isAboveAvg = priceDiffRaw > 0

    // 3. Generate prompt for assistant
    let prompt = "";
    if (role === "buyer") {
      let insight = isAboveAvg 
        ? `This price is ${priceDiffPercent}% above the local average.` 
        : `This price is matching the local average.`;
      let targetPrice = buyer_proposed_price || (isAboveAvg ? avgMarketPrice : product.price * 0.95);
      
      prompt = `You are an AI negotiation assistant for buyers in African informal markets.
Product: ${product.name}
Listed Price: ${product.price} ${product.currency}
Insight: ${insight}
Target Price: ${targetPrice} ${product.currency}

Write a polite, conversational counter-offer message the buyer can send to the seller. Keep it under 2 sentences.`;
    } else {
      let insight = `Competitors within 2km are averaging ${avgMarketPrice.toFixed(0)} ${product.currency} (${priceDiffPercent}% ${isAboveAvg ? 'lower' : 'higher'} than yours).`;
      
      prompt = `You are a business advisor for a seller in an African market.
Product: ${product.name}
Your Price: ${product.price} ${product.currency}
Market Update: ${insight}

Write a short, engaging tip explaining why they might want to adjust their price to ${avgMarketPrice.toFixed(0)} to remain competitive. Keep it strictly to 2 sentences.`;
    }

    // 4. Get NLP generation
    const configuration = new Configuration({ apiKey: openAiKey })
    const openai = new OpenAIApi(configuration)

    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    const aiMessage = chatCompletion.data.choices[0].message?.content || "Consider adjusting your price based on local market trends.";

    return new Response(
      JSON.stringify({ 
        base_price: product.price,
        avg_market_price: avgMarketPrice,
        difference_percent: priceDiffPercent,
        is_above_average: isAboveAvg,
        ai_suggestion: aiMessage 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
