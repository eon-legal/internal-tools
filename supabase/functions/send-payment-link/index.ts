/**
 * send-payment-link Edge Function
 *
 * Responsibilities:
 * - Authenticated operator action: generate a payment link for an invoice and
 *   email it to the invoice's client.
 * - Allocate a fresh Cecabank Num_operacion + opaque URL token, persist to
 *   tpv_payment_links, then deliver via Resend.
 *
 * Input  (POST JSON): { invoice_id: string }
 * Output (JSON):      { success: true, token: string, sent_to: string }
 *
 * Invariants:
 * - Caller must have a valid Supabase JWT (RLS enforced via user client).
 * - Mutations to tpv_payment_links use the service-role client so the row is
 *   readable from the public tpv-pay endpoint without leaking it via RLS.
 * - Num_operacion ≤50 chars, alphanumeric + `-` only (manual §5: rejects
 *   `?,%,&,*` and similar). Format: `<invoice_number>-<base36 timestamp>`.
 * - amount_cents is the invoice total in integer cents (manual §5 Importe).
 *
 * Secrets (Supabase secrets, never bundled):
 * - PUBLIC_BASE_URL       — e.g. https://<project>.supabase.co
 * - RESEND_API_KEY        — transactional mail provider
 * - RESEND_FROM_EMAIL     — verified sender domain
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PUBLIC_BASE_URL = Deno.env.get('PUBLIC_BASE_URL') ?? SUPABASE_URL;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL')!;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function buildNumOperacion(invoiceNumber: string): string {
  // invoice_number looks like "EON-25-L001". The bank forbids %,&,?,*; `-` is fine.
  const stamp = Date.now().toString(36).toUpperCase();
  const candidate = `${invoiceNumber}-${stamp}`;
  return candidate.slice(0, 50);
}

interface InvoiceRow {
  id: string;
  invoice_number: string;
  total_amount: number;
  paid: boolean;
  client_id: string | null;
}

interface ClientRow {
  id: string;
  email: string | null;
  client_type: 'individual' | 'company';
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
}

async function loadInvoiceAndClient(
  db: SupabaseClient,
  invoiceId: string,
): Promise<{ invoice: InvoiceRow; client: ClientRow }> {
  const { data: invoice, error: invErr } = await db
    .from('invoices')
    .select('id, invoice_number, total_amount, paid, client_id')
    .eq('id', invoiceId)
    .single<InvoiceRow>();
  if (invErr || !invoice) throw new Error(`Invoice not found: ${invErr?.message ?? 'unknown'}`);
  if (invoice.paid) throw new Error('Invoice is already marked as paid');
  if (!invoice.client_id) throw new Error('Invoice has no client_id');

  const { data: client, error: cErr } = await db
    .from('clients')
    .select('id, email, client_type, first_name, last_name, company_name')
    .eq('id', invoice.client_id)
    .single<ClientRow>();
  if (cErr || !client) throw new Error(`Client not found: ${cErr?.message ?? 'unknown'}`);
  if (!client.email) throw new Error('Client has no email on file');

  return { invoice, client };
}

function clientDisplayName(c: ClientRow): string {
  if (c.client_type === 'company') return c.company_name ?? 'Cliente';
  return [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Cliente';
}

async function sendResendEmail(args: {
  to: string;
  invoiceNumber: string;
  amountEuros: string;
  paymentUrl: string;
  clientName: string;
}): Promise<void> {
  const subject = `Enlace de pago — Factura ${args.invoiceNumber}`;
  const html = `
<!doctype html>
<html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#222">
  <p>Hola ${args.clientName},</p>
  <p>Le enviamos el enlace para abonar la factura
     <strong>${args.invoiceNumber}</strong> por importe de
     <strong>${args.amountEuros} €</strong>.</p>
  <p><a href="${args.paymentUrl}"
        style="display:inline-block;padding:12px 20px;background:#0a66c2;
               color:#fff;text-decoration:none;border-radius:6px">Pagar factura</a></p>
  <p>El enlace caduca en 24 horas. Si tiene cualquier duda, responda a este correo.</p>
  <hr><p style="color:#888;font-size:12px">Pago seguro procesado por Cecabank TPV Virtual.</p>
</body></html>`.trim();

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: args.to,
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend rejected: ${res.status} ${text}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonResponse({ error: 'Missing Authorization header' }, 401);

  try {
    const { invoice_id } = await req.json();
    if (!invoice_id || typeof invoice_id !== 'string') {
      return jsonResponse({ error: 'invoice_id required' }, 400);
    }

    // User-scoped client to verify the caller is authenticated (RLS path).
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return jsonResponse({ error: 'Unauthenticated' }, 401);

    // Service-role client for trusted reads/writes (bypasses RLS).
    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { invoice, client } = await loadInvoiceAndClient(db, invoice_id);

    const amountCents = Math.round(Number(invoice.total_amount) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return jsonResponse({ error: 'Invoice total_amount is not a positive number' }, 400);
    }

    const numOperacion = buildNumOperacion(invoice.invoice_number);
    const token = randomHex(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: insErr } = await db.from('tpv_payment_links').insert({
      invoice_id: invoice.id,
      num_operacion: numOperacion,
      token,
      amount_cents: amountCents,
      sent_to_email: client.email,
      expires_at: expiresAt,
    });
    if (insErr) throw new Error(`Failed to persist payment link: ${insErr.message}`);

    const paymentUrl = `${PUBLIC_BASE_URL}/functions/v1/tpv-pay/${token}`;
    await sendResendEmail({
      to: client.email!,
      invoiceNumber: invoice.invoice_number,
      amountEuros: (amountCents / 100).toFixed(2),
      paymentUrl,
      clientName: clientDisplayName(client),
    });

    return jsonResponse({ success: true, token, sent_to: client.email });
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 400);
  }
});
