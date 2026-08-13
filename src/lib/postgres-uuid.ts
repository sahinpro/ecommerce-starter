import { z } from 'zod';

/** Postgres uuid shape (not RFC-strict). Seed IDs like 2222…2201 are valid in DB. */
export const POSTGRES_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isPostgresUuid(value: string): boolean {
  return POSTGRES_UUID_RE.test(value.trim());
}

export function postgresUuidSchema(message = 'Invalid id'): z.ZodString {
  return z.string().trim().regex(POSTGRES_UUID_RE, message);
}
