import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;

export const DB_TABLES = {
  USERS: 'users',
  VPS_PROFILES: 'vps_profiles',
  SESSIONS: 'sessions',
  LOGS: 'audit_logs'
} as const;
