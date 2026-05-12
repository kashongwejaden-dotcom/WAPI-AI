import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, user_lat, user_lng } = await req.json()
    if (!query) throw new Error("Query is required")

    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // We use the service role key to securely query products inside the Edge Function
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!openAiKey || !supabaseUrl || !supabaseKey) {
      throw new Error("Missing environment variable configuration.");
    }

    const configuration = new Configuration({ apiKey: openAiKey })
    const openai = new OpenAIApi(configuration)
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. NLP Parsing: Convert unstructured query to structured JSON intent
    const parsePrompt = `Convert this shopping query into JSON: { "product": "", "max_price": null, "quantity_kg": null, "location_radius_km": 5, "budget": null }\nQuery: "${query}"`
    let structuredData: any = { product: query }; // Fallback struct

    try {
      const chatCompletion = await openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: parsePrompt }]
      });
      
      const respText = chatCompletion.data.choices[0].message?.content || "{}";
      const jsonStr = respText.match(/\\{[\\s\\S]*\\}/)?.[0] || respText;
      structuredData = JSON.parse(jsonStr);
    } catch(e: any) {
      if (Deno.env.get('ENVIRONMENT') === 'development') {
        console.error("Fast parsing failed/timed out, using rule-based fallback.", e.message);
      }
    }

    // 2. Vector search (assuming pgvector is setup) or fallback to basic ilike text match
    // In production, you would embed the text: await openai.createEmbedding(...) and query the vector.
    // For MVPs/Phase 1 we simulate standard match with AI parsed 'product'
    
    let { data: products, error } = await supabase
      .from('products')
      .select('name, price, currency, unit, sellers(name, reliability_score)')
      .ilike('name', `%${structuredData.product || query}%`)
      .limit(5);

    if (error) throw error;

    // 3. Log query to demand forecasting asynchronously (Fire and forget)
    supabase.from('user_queries').insert({
      raw_query: query,
      parsed_intent: structuredData,
      response_sent: "Processing..."
    }).then();

    // 4. Summarize for SMS/Chat consumption
    const summaryPrompt = `Based on these WapiBei marketplace results: ${JSON.stringify(products)}. Write a short, friendly SMS-style summary to the user answering their query: "${query}". Be very concise. No markdown.`;
    
    let summaryText = "Found matches.";
    try {
      const summaryCompletion = await openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: summaryPrompt }]
      });
      summaryText = summaryCompletion.data.choices[0].message?.content || summaryText;
    } catch {
      summaryText = "Results found. View app for details.";
    }

    return new Response(
      JSON.stringify({ 
        parsed_query: structuredData,
        results: products,
        summary: summaryText 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
