/**
 * tpv-callback Edge Function (verify_jwt = false — Cecabank cannot send a JWT)
 *
 * Responsibilities:
 * - Receive Comunicación on-line POST from Cecabank (manual §7).
 * - Verify the SHA-256 firma against our stored clave_encriptacion.
 * - Mark the payment link + invoice as paid.
 * - Respond `$*$OKY$*$` within 30 s, else Cecabank auto-anula the operation
 *   (manual §7.1).
 *
 * Trust boundary:
 * - Anything in the request body is attacker-controlled until firma matches.
 * - We DO NOT respond with $*$OKY$*$ unless firma verifies AND the invoice
 *   was successfully updated. Otherwise respond with $*$NOK$*$ (rollback) or
 *   a non-matching body so Cecabank does not consider it confirmed.
 *
 * Invariants:
 * - Importe arrives zero-padded to 12 digits per manual §7. We feed it
 *   verbatim into the verification firma — do NOT trim leading zeros.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { computeCallbackFirma, CecabankEnv } from '../_shared/cecabank.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CECABANK_ENV = (Deno.env.get('CECABANK_ENV') ?? 'test') as CecabankEnv;

function getClave(): string {
  const suffix = CECABANK_ENV === 'prod' ? '_PROD' : '';
  return Deno.env.get(`CECABANK_CLAVE_ENCRIPTACION${suffix}`)!;
}

function plain(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return plain('$*$NOK$*$', 405);

  try {
    const raw = await req.text();
    const params = new URLSearchParams(raw);
    const get = (k: string) => params.get(k) ?? '';

    const merchantId = get('MerchantID');
    const acquirerBin = get('AcquirerBIN');
    const terminalId = get('TerminalID');
    const numOperacion = get('Num_operacion');
    const importe = get('Importe');
    const tipoMoneda = get('TipoMoneda');
    const exponente = get('Exponente');
    const referencia = get('Referencia');
    const firma = get('Firma');
    const numAut = get('Num_aut');

    if (!numOperacion || !firma) return plain('$*$NOK$*$', 400);

    const expected = await computeCallbackFirma({
      clave: getClave(),
      merchantId,
      acquirerBin,
      terminalId,
      numOperacion,
      importe,
      tipoMoneda,
      exponente,
      referencia,
    });

    if (expected.toLowerCase() !== firma.toLowerCase()) {
      console.warn(`[tpv-callback] firma mismatch for num_operacion=${numOperacion}`);
      return plain('$*$NOK$*$', 400);
    }

    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: link, error: lookErr } = await db
      .from('tpv_payment_links')
      .select('id, invoice_id, status, amount_cents')
      .eq('num_operacion', numOperacion)
      .single();

    if (lookErr || !link) {
      console.warn(`[tpv-callback] unknown num_operacion=${numOperacion}`);
      return plain('$*$NOK$*$', 404);
    }

    // Amount sanity: manual §7 says Importe is zero-padded to 12 chars.
    const reportedCents = parseInt(importe, 10);
    if (!Number.isFinite(reportedCents) || reportedCents !== link.amount_cents) {
      console.warn(
        `[tpv-callback] amount mismatch for ${numOperacion}: expected ${link.amount_cents}, got ${importe}`,
      );
      return plain('$*$NOK$*$', 400);
    }

    // Idempotent: if already paid, just ack.
    if (link.status === 'paid') return plain('$*$OKY$*$');

    const { error: upLinkErr } = await db
      .from('tpv_payment_links')
      .update({
        status: 'paid',
        referencia: referencia || null,
        num_aut: numAut || null,
        cod_aut: '000',
      })
      .eq('id', link.id);
    if (upLinkErr) {
      console.error('[tpv-callback] failed to update payment link', upLinkErr);
      return plain('$*$NOK$*$', 500);
    }

    const { error: upInvErr } = await db
      .from('invoices')
      .update({ paid: true, paid_at: new Date().toISOString() })
      .eq('id', link.invoice_id);
    if (upInvErr) {
      console.error('[tpv-callback] failed to update invoice', upInvErr);
      return plain('$*$NOK$*$', 500);
    }

    return plain('$*$OKY$*$');
  } catch (err) {
    console.error('[tpv-callback] error', err);
    return plain('$*$NOK$*$', 500);
  }
});
