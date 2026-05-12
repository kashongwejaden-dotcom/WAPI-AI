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
    const { query, user_lat, user_lng } = await req.json()
    if (!query) throw new Error("query is required.")

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openAiKey = Deno.env.get('OPENAI_API_KEY');

    if (!supabaseUrl || !supabaseKey || !openAiKey) {
      throw new Error("Missing config")
    }

    const configuration = new Configuration({ apiKey: openAiKey })
    const openai = new OpenAIApi(configuration)
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. NLP Parse to list of items and budget constraint
    const parsePrompt = `You are a shopping copilot. Parse this query into a JSON object strictly like this: { "items": [{ "name": "product name", "quantity_hint": 1 }], "budget": null, "currency": "CDF" }.
Query: "${query}"`
    
    let structuredData: any = { items: [] };

    try {
      const chatCompletion = await openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: parsePrompt }]
      });
      const respText = chatCompletion.data.choices[0].message?.content || "{}";
      const jsonStr = respText.match(/\{[\s\S]*\}/)?.[0] || respText;
      structuredData = JSON.parse(jsonStr);
    } catch(e) {
      if (Deno.env.get('ENVIRONMENT') === 'development') {
        console.warn("Copilot parsing failed", e);
      }
      throw new Error("Could not understand the shopping list.")
    }

    const items = structuredData.items || [];
    let shoppingList = [];
    let grandTotal = 0;

    // 2. Query products for each item and find cheapest that fits
    for (const item of items) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, price, currency, unit, sellers(name)')
        .ilike('name', `%${item.name}%`)
        .order('price', { ascending: true })
        .limit(1)

      if (products && products.length > 0) {
        const p = products[0];
        const cost = p.price * (item.quantity_hint || 1);
        shoppingList.push({
          product_id: p.id,
          name: p.name,
          unit_price: p.price,
          qty: item.quantity_hint || 1,
          total_cost: cost,
          currency: p.currency,
          seller: (p.sellers as any)?.name || 'Unknown'
        });
        grandTotal += cost;
      }
    }

    // 3. Compare with budget
    const budget = structuredData.budget || 0;
    const withinBudget = budget > 0 ? grandTotal <= budget : true;

    let message = withinBudget ? "We found the items within your budget!" : `This goes over your budget of ${budget}.`;
    if (shoppingList.length === 0) {
      message = "We couldn't find any items matching your list.";
    }

    return new Response(JSON.stringify({ 
      parsed_budget: budget,
      shopping_list: shoppingList,
      grand_total: grandTotal,
      within_budget: withinBudget,
      message: message
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
