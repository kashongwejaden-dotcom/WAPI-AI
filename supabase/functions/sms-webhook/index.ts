import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

// Twilio/Africa's Talking formats forms as urlencoded, but we will accept JSON or form data
serve(async (req) => {
  try {
    let sender = '';
    let body = ''; // the SMS text

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      sender = formData.get("From")?.toString() || formData.get("from")?.toString() || "";
      body = formData.get("Body")?.toString() || formData.get("text")?.toString() || "";
    } else {
      const json = await req.json();
      sender = json.From || json.from || json.sender || "";
      body = json.Body || json.text || json.body || "";
    }

    if (!body) {
      throw new Error("No SMS body provided");
    }

    // Call the ai-search function internally.
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY'); // Can use anon key for public search

    if (!supabaseUrl || !anonKey) {
      throw new Error("Missing Supabase config");
    }

    const searchApiUrl = \`\${supabaseUrl}/functions/v1/ai-search\`;
    const searchResponse = await fetch(searchApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${anonKey}\`
      },
      body: JSON.stringify({
        query: body,
        user_lat: 0, // In reality, infer from user profile if exists
        user_lng: 0
      })
    });

    if (!searchResponse.ok) {
      throw new Error("Failed to fetch from ai-search");
    }

    const searchData = await searchResponse.json();
    const smsReply = searchData.summary || "Results found. View app for details.";

    // Update the logged query in 'user_queries' to indicate source = 'sms'
    // Note: ai-search already logged it, but we can update or just rely on a new insert.
    // For simplicity, let's insert a separate log or let ai-search handle it.
    // We will update the latest row with this sender or just insert a new one overriding it.
    
    // Using service role to insert exact SMS log
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || anonKey;
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    await supabase.from('user_queries').insert({
      user_phone: sender,
      raw_query: body,
      parsed_intent: searchData.parsed_query,
      response_sent: smsReply,
      source: 'sms'
    });

    // Return TwiML or plain text reply depending on provider
    // Twilio requires TwiML
    const twimlResponse = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Message>\${smsReply}</Message>
</Response>\`;

    return new Response(twimlResponse, {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (err: any) {
    if (Deno.env.get('ENVIRONMENT') === 'development') {
      console.error("SMS Webhook error:", err);
    }
    const twimlError = \`<?xml version="1.0" encoding="UTF-8"?><Response><Message>Service temporarily unavailable.</Message></Response>\`;
    return new Response(twimlError, { status: 200, headers: { 'Content-Type': 'text/xml' } });
  }
})
