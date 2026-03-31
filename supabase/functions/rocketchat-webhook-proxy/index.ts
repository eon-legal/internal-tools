/**
 * Rocket.Chat Webhook Proxy Edge Function
 *
 * Responsibilities:
 * - Proxy POST requests from the Angular frontend to the Rocket.Chat incoming webhook.
 * - Add CORS headers so the browser allows cross-origin requests.
 *
 * Why:
 * - Rocket.Chat does not set Access-Control-Allow-Origin for the webhook endpoint,
 *   so the browser blocks direct POST requests from the Angular app.
 *
 * Security:
 * - verify_jwt is disabled so the function can be called without Supabase auth.
 * - TODO: Move WEBHOOK_URL to a Supabase secret (ROCKETCHAT_WEBHOOK_URL) once CLI is available.
 */

const WEBHOOK_URL = 'https://chat.eontechsolutions.com/hooks/69c6efaf371046cf073316a1/AJkrHksbJjAcBZdWR96zCZjvDneCarjAF4YZso8mWpEb7z7f';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload = await req.json();
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    await response.text();
    return new Response(
      JSON.stringify({ success: response.ok, status: response.status }),
      {
        status: response.ok ? 200 : 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

