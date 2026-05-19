/**
 * tpv-redirect Edge Function (verify_jwt = false — public landing)
 *
 * Responsibilities:
 * - Render a minimal HTML page after the Cecabank UI redirects the client
 *   back to URL_OK or URL_NOK (manual §5).
 *
 * Critical:
 * - Does NOT mark the invoice as paid. That is the job of tpv-callback
 *   (manual §5 warning: URL_OK fires only if the user clicks "Aceptar" —
 *   they may close the tab and leave the invoice in an inconsistent state).
 */

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]!));
}

function page(title: string, body: string): Response {
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:system-ui,sans-serif;max-width:520px;margin:80px auto;padding:0 20px;color:#222;line-height:1.5;text-align:center}
.ok{color:#0a7f2e}.nok{color:#b00020}h1{margin-bottom:8px}</style>
</head><body>${body}</body></html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

Deno.serve((req: Request) => {
  const url = new URL(req.url);
  const status = url.searchParams.get('status');

  if (status === 'ok') {
    return page(
      'Pago recibido',
      `<h1 class="ok">✓ Pago recibido</h1>
       <p>Gracias por su pago. La confirmación definitiva se aplicará en cuanto el banco notifique la operación.</p>
       <p>Puede cerrar esta ventana.</p>`,
    );
  }

  return page(
    'Pago no completado',
    `<h1 class="nok">Pago no completado</h1>
     <p>La operación no se ha podido completar. Si lo desea, puede volver a intentarlo desde el enlace original o solicitar uno nuevo al emisor de la factura.</p>`,
  );
});
