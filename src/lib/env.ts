/**
 * Server-only environment configuration checks. Never returns secret
 * values — only booleans and variable *names* — so it is safe to log or to
 * surface derived flags to client components as props.
 */

export const SUPABASE_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export const RESEND_ENV_VARS = ["RESEND_API_KEY", "CONTACT_RECEIVER_EMAIL"] as const;

export function getMissingEnvVars(names: readonly string[]): string[] {
  return names.filter((name) => !process.env[name]);
}

export function isSupabaseConfigured(): boolean {
  return getMissingEnvVars(SUPABASE_ENV_VARS).length === 0;
}

export function isResendConfigured(): boolean {
  return getMissingEnvVars(RESEND_ENV_VARS).length === 0;
}

export const isDevelopment = process.env.NODE_ENV === "development";
