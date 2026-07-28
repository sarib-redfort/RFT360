/**
 * Test-only mock for `sanitize-html`.
 *
 * The real package pulls in an ESM-only parser chain (htmlparser2) that Jest
 * cannot transform without extra config. No unit test exercises sanitisation,
 * so this passthrough keeps the DI/bootstrap tests fast and dependency-free.
 * It is a MOCK — it does not actually sanitise; never import it outside tests.
 */
function sanitizeHtml(dirty: string): string {
  return dirty;
}

export default sanitizeHtml;
