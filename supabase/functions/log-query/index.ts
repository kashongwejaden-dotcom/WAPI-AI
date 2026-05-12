import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface LogPayload {
  function_name: string;
  duration_ms?: number;
  status: 'success' | 'error' | 'timeout';
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const payload: LogPayload = await req.json();
  
  const { error } = await supabase
    .from('analytics_logs')
    .insert({
      function_name: payload.function_name,
      duration_ms: payload.duration_ms,
      status: payload.status,
      metadata: payload.metadata || {},
    });

  if (error) {
    console.error('Log insert failed:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
