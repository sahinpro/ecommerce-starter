'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInAdmin, type AuthActionState } from '@/lib/auth/actions';

const initialState: AuthActionState = { error: null };

export function AdminSignInForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') ?? '/dashboard/overview';
  const [state, formAction, isPending] = useActionState(signInAdmin, initialState);

  return (
    <form action={formAction} className='w-full space-y-4'>
      <input type='hidden' name='next' value={nextPath} />
      <div className='space-y-2'>
        <Label htmlFor='email'>Email</Label>
        <Input
          id='email'
          name='email'
          type='email'
          autoComplete='email'
          required
          placeholder='admin@sukoon.com'
          disabled={isPending}
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='password'>Password</Label>
        <Input
          id='password'
          name='password'
          type='password'
          autoComplete='current-password'
          required
          disabled={isPending}
        />
      </div>
      {state.error ? (
        <p className='text-destructive text-sm' role='alert'>
          {state.error}
        </p>
      ) : null}
      <Button type='submit' className='w-full' isLoading={isPending}>
        Sign in
      </Button>
    </form>
  );
}
