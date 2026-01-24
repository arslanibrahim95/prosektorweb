import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD_HASH: z.string().min(60),
  ENCRYPTION_KEY: z.string().length(32),
  CLOUDFLARE_API_TOKEN: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  SITE_OUTPUT_DIR: z.string().optional(),
  PREVIEW_DOMAIN: z.string().optional(),
  DEFAULT_SERVER_IP: z.string().optional(),
  USE_PYTHON_PIPELINE: z.string().optional(),
});

export function validateEnv() {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map(e => e.path.join('.'));
    throw new Error(`Missing/Invalid ENV vars: ${missing.join(', ')}`);
  }
  return result.data;
}

export function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

export function getOptionalEnvVar(name: string): string | undefined {
  return process.env[name];
}
