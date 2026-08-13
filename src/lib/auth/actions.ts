'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { isAdminRole } from '@/lib/auth/types';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type AuthActionState = {
  error: string | null;
};

function safeDashboardPath(nextPath: FormDataEntryValue | null): string {
  if (typeof nextPath !== 'string') {
    return '/dashboard/overview';
  }
  if (!nextPath.startsWith('/dashboard') || nextPath.startsWith('//')) {
    return '/dashboard/overview';
  }
  return nextPath;
}

export async function signInAdmin(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const nextPath = safeDashboardPath(formData.get('next'));

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !signInData.user) {
    return { error: 'Invalid email or password.' };
  }

  const { data, error: profileError } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', signInData.user.id)
    .maybeSingle();

  const profile = data as { id: string; role: string } | null;

  if (profileError || !profile || !isAdminRole(profile.role)) {
    await supabase.auth.signOut();
    return {
      error:
        'This account is not authorized for dashboard access. Ask an admin to create your staff profile.'
    };
  }

  revalidatePath('/', 'layout');
  redirect(nextPath);
}

export async function signOutAdmin(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/admin/sign-in');
}
