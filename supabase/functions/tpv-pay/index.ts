/**
 * tpv-pay Edge Function (verify_jwt = false — public link)
 *
 * Responsibilities:
 * - Resolve an opaque token from the email link.
 * - Render an HTML page that auto-submits the signed Cecabank form to
 *   compra.action (manual §5.1(a) — datos de tarjeta los pide el TPV).
 *
 * Why a server-side render instead of a static link with prebaked params:
 * - clave_encriptacion must never leave the server (manual §6 — it signs every
 *   operation). The firma is computed here and only the result is sent.
 *
 * Invariants:
 * - Importe in the outgoing form is the raw integer string of amount_cents,
 *   no zero padding (matches manual §6 example).
 * - URL_OK and URL_NOK route to tpv-redirect, NOT to the bank callback path.
 *   Marking the invoice paid is the job of tpv-callback (manual §5 explicit
 *   warning: URL_OK is unreliable — user may close the tab).
 * - If the link is expired or already paid we render a friendly stop-page
 *   instead of forwarding to the bank.
 *
 * Secrets:
 * - CECABANK_ENV                  — "test" | "prod"
 * - CECABANK_MERCHANT_ID, CECABANK_ACQUIRER_BIN, CECABANK_TERMINAL_ID,
 *   CECABANK_CLAVE_ENCRIPTACION    — test creds (default)
 * - CECABANK_MERCHANT_ID_PROD, ..._ACQUIRER_BIN_PROD, ..._TERMINAL_ID_PROD,
 *   ..._CLAVE_ENCRIPTACION_PROD    — prod creds
 * - PUBLIC_BASE_URL                — used to build URL_OK / URL_NOK
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { computeOutgoingFirma, getActionUrl, CecabankEnv } from '../_shared/cecabank.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const PUBLIC_BASE_URL = Deno.env.get('PUBLIC_BASE_URL') ?? SUPABASE_URL;
const CECABANK_ENV = (Deno.env.get('CECABANK_ENV') ?? 'test') as CecabankEnv;

function getCreds() {
  const suffix = CECABANK_ENV === 'prod' ? '_PROD' : '';
  return {
    merchantId: Deno.env.get(`CECABANK_MERCHANT_ID${suffix}`)!,
    acquirerBin: Deno.env.get(`CECABANK_ACQUIRER_BIN${suffix}`)!,
    terminalId: Deno.env.get(`CECABANK_TERMINAL_ID${suffix}`)!,
    clave: Deno.env.get(`CECABANK_CLAVE_ENCRIPTACION${suffix}`)!,
  };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]!));
}

function stopPage(message: string): Response {
  const body = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>Enlace de pago</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:system-ui,sans-serif;max-width:520px;margin:80px auto;padding:0 20px;color:#222;line-height:1.5}</style>
</head><body><h1>Enlace de pago</h1><p>${escapeHtml(message)}</p></body></html>`;
  return new Response(body, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  // Path arrives as /tpv-pay/<token>
  const parts = url.pathname.split('/').filter(Boolean);
  const token = parts[parts.length - 1];
  if (!token || token === 'tpv-pay') return stopPage('Enlace inválido.');

  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: link, error } = await db
    .from('tpv_payment_links')
    .select('id, num_operacion, amount_cents, status, expires_at')
    .eq('token', token)
    .single();

  if (error || !link) return stopPage('Este enlace no existe o ha sido revocado.');
  if (link.status === 'paid') return stopPage('Esta factura ya ha sido pagada. Gracias.');
  if (link.status === 'expired' || new Date(link.expires_at) < new Date()) {
    // Mark expired on first access past the deadline.
    if (link.status !== 'expired') {
      await db.from('tpv_payment_links').update({ status: 'expired' }).eq('id', link.id);
    }
    return stopPage('Este enlace de pago ha caducado. Solicite uno nuevo al emisor de la factura.');
  }

  const creds = getCreds();
  const importe = String(link.amount_cents); // raw integer, no padding (manual §6 example)
  const urlOk = `${PUBLIC_BASE_URL}/functions/v1/tpv-redirect?status=ok&t=${token}`;
  const urlNok = `${PUBLIC_BASE_URL}/functions/v1/tpv-redirect?status=nok&t=${token}`;

  const firma = await computeOutgoingFirma({
    clave: creds.clave,
    merchantId: creds.merchantId,
    acquirerBin: creds.acquirerBin,
    terminalId: creds.terminalId,
    numOperacion: link.num_operacion,
    importe,
    tipoMoneda: '978',
    exponente: '2',
    cifrado: 'SHA2',
    urlOk,
    urlNok,
  });

  const action = getActionUrl(CECABANK_ENV);
  const fields: Record<string, string> = {
    MerchantID: creds.merchantId,
    AcquirerBIN: creds.acquirerBin,
    TerminalID: creds.terminalId,
    URL_OK: urlOk,
    URL_NOK: urlNok,
    Firma: firma,
    Cifrado: 'SHA2',
    Num_operacion: link.num_operacion,
    Importe: importe,
    TipoMoneda: '978',
    Exponente: '2',
    Pago_soportado: 'SSL',
    Idioma: '1',
  };

  const inputs = Object.entries(fields)
    .map(([k, v]) => `<input type="hidden" name="${escapeHtml(k)}" value="${escapeHtml(v)}">`)
    .join('\n  ');

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>Redirigiendo a pago seguro…</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:system-ui,sans-serif;max-width:520px;margin:80px auto;padding:0 20px;color:#222;text-align:center}</style>
</head><body>
<h1>Redirigiendo a la pasarela de pago…</h1>
<p>Si no se le redirige automáticamente, pulse el botón.</p>
<form id="tpv" method="POST" action="${escapeHtml(action)}" enctype="application/x-www-form-urlencoded">
  ${inputs}
  <button type="submit">Continuar al pago</button>
</form>
<script>document.getElementById('tpv').submit();</script>
</body></html>`;

  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
});
