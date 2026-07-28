import { AuthService } from './auth.service';

/**
 * Unit tests for the pure/security-critical parts of AuthService that don't
 * require a database — password hashing round-trips and the duration parser
 * that governs token lifetimes.
 */
describe('AuthService', () => {
  describe('hashPassword', () => {
    it('produces an argon2id hash that verifies against the original', async () => {
      const argon2 = await import('argon2');
      const hash = await AuthService.hashPassword('S3cure-Passw0rd');
      expect(hash).toMatch(/^\$argon2id\$/);
      await expect(argon2.verify(hash, 'S3cure-Passw0rd')).resolves.toBe(true);
      await expect(argon2.verify(hash, 'wrong')).resolves.toBe(false);
    });
  });

  describe('durationToSeconds', () => {
    // Access the private method via a minimal instance; no deps are touched.
    const service = Object.create(AuthService.prototype) as AuthService;
    const parse = (value: string) =>
      (service as unknown as { durationToSeconds(v: string): number }).durationToSeconds(value);

    it.each([
      ['30s', 30],
      ['15m', 900],
      ['2h', 7200],
      ['7d', 604800],
    ])('parses %s to %i seconds', (input, expected) => {
      expect(parse(input)).toBe(expected);
    });

    it('falls back to 15 minutes for a malformed duration', () => {
      expect(parse('nonsense')).toBe(900);
    });
  });
});
