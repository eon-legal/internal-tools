/**
 * Cecabank TPV Virtual — shared helpers.
 *
 * Responsibilities:
 * - Compute SHA-256 firma for outgoing payment forms (manual §6).
 * - Compute SHA-256 firma for incoming Comunicación on-line callbacks (manual §7).
 * - Provide the live action URL for the chosen environment (manual §5).
 *
 * Side effects:
 * - On module load, asserts the manual's worked example reproduces exactly.
 *   If not, throws — better to fail boot than silently mis-sign every payment.
 *
 * Invariants:
 * - All firmas are hex-encoded lowercase (manual §6).
 * - `Importe` in the outgoing firma is the raw integer string with NO zero
 *   padding (matches manual example: importe 500 → "500", not "000000000500").
 * - The callback `Importe` arrives zero-padded to 12 chars (manual §7 explicit
 *   note) and must be fed verbatim into the verification firma.
 */

const encoder = new TextEncoder();

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface OutgoingFirmaArgs {
  clave: string;
  merchantId: string;
  acquirerBin: string;
  terminalId: string;
  numOperacion: string;
  importe: string;
  tipoMoneda: string;
  exponente: string;
  cifrado: 'SHA2' | 'SHA21';
  urlOk: string;
  urlNok: string;
  descripcion?: string;
  exencionSca?: string;
}

export async function computeOutgoingFirma(args: OutgoingFirmaArgs): Promise<string> {
  const base =
    args.clave +
    args.merchantId +
    args.acquirerBin +
    args.terminalId +
    args.numOperacion +
    args.importe +
    args.tipoMoneda +
    args.exponente +
    args.cifrado +
    args.urlOk +
    args.urlNok;

  // SHA21 adds Descripcion before Exencion_SCA (manual §6 SHA21 variant)
  const withDesc = args.cifrado === 'SHA21' ? base + (args.descripcion ?? '') : base;
  const full = withDesc + (args.exencionSca ?? '');
  return sha256Hex(full);
}

export interface CallbackFirmaArgs {
  clave: string;
  merchantId: string;
  acquirerBin: string;
  terminalId: string;
  numOperacion: string;
  importe: string;
  tipoMoneda: string;
  exponente: string;
  referencia: string;
}

export async function computeCallbackFirma(args: CallbackFirmaArgs): Promise<string> {
  const cadena =
    args.clave +
    args.merchantId +
    args.acquirerBin +
    args.terminalId +
    args.numOperacion +
    args.importe +
    args.tipoMoneda +
    args.exponente +
    args.referencia;
  return sha256Hex(cadena);
}

export type CecabankEnv = 'test' | 'prod';

export function getActionUrl(env: CecabankEnv): string {
  return env === 'prod'
    ? 'https://pgw.ceca.es/tpvweb/tpv/compra.action'
    : 'https://tpv.ceca.es/tpvweb/tpv/compra.action';
}

// =====================================================================
// Self-test: reproduce manual §6 SHA2 example. Throw if anything drifted.
// =====================================================================
await (async () => {
  const expected = '2b7f686593f1a424c510321e4bc354d21924e02e980a90f4d46c41f92a06f5a9';
  const actual = await computeOutgoingFirma({
    clave: '99888888',
    merchantId: '111950028',
    acquirerBin: '0000554052',
    terminalId: '00000003',
    numOperacion: '123',
    importe: '500',
    tipoMoneda: '978',
    exponente: '2',
    cifrado: 'SHA2',
    urlOk: 'http://www.ceca.es',
    urlNok: 'http://www.ceca.es',
  });
  if (actual !== expected) {
    throw new Error(
      `Cecabank firma self-test failed. Expected ${expected}, got ${actual}. ` +
        `Refusing to boot — check computeOutgoingFirma implementation.`,
    );
  }
})();
