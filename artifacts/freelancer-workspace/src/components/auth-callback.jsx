import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { getAuthSession, isSupabaseConfigured } from '@/lib/supabase';

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function completeSignIn() {
      const params = new URLSearchParams(window.location.search);
      const providerError = params.get('error_description') || params.get('error');
      if (providerError) {
        if (active) setError(providerError.replaceAll('+', ' '));
        return;
      }

      if (!isSupabaseConfigured) {
        if (active) setError('Authentication is not configured for this deployment.');
        return;
      }

      try {
        const session = await getAuthSession();
        if (!active) return;
        if (session) setLocation('/dashboard');
        else setError('We could not confirm your sign-in. Please try again.');
      } catch (authError) {
        if (active) setError(authError.message || 'We could not complete sign-in. Please try again.');
      }
    }

    completeSignIn();
    return () => { active = false; };
  }, [setLocation]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] px-5 py-12 text-[hsl(var(--foreground))]">
      <section className="content-card w-full max-w-md p-7 text-center sm:p-9">
        <p className="eyebrow text-[hsl(var(--primary))]">SyncFlow access</p>
        <h1 className="mt-4 font-display text-3xl font-semibold">
          {error ? 'Sign-in needs another try' : 'Finishing sign-in…'}
        </h1>
        <p role={error ? 'alert' : 'status'} className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
          {error || 'Your account is being securely connected to your workspace.'}
        </p>
        {error && <Link href="/login" className="primary-button mt-6 inline-flex">Back to sign in</Link>}
      </section>
    </main>
  );
}
