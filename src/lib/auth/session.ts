import { redirect } from 'next/navigation';

import { isAdminRole, type AdminProfile } from '@/lib/auth/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ProfileRow } from '@/types/database';

function mapProfile(row: ProfileRow): AdminProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    role: row.role
  };
}

/**
 * Resolve the current dashboard admin from Supabase Auth + profiles.
 * Requires a profiles row with role admin | manager | staff.
 */
export async function getAdminUser(): Promise<AdminProfile | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, role, created_at, updated_at')
    .eq('id', user.id)
    .maybeSingle();

  const profile = data as ProfileRow | null;

  if (profileError || !profile) {
    return null;
  }

  if (!isAdminRole(profile.role)) {
    return null;
  }

  return mapProfile(profile);
}

/** Server-side guard for dashboard pages/layouts. */
export async function requireAdminUser(): Promise<AdminProfile> {
  const admin = await getAdminUser();
  if (!admin) {
    redirect('/admin/sign-in');
  }
  return admin;
}
