"use client";

import { useActionState, Suspense } from "react";
import { signIn, type LoginState } from "./actions";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useSearchParams } from "next/navigation";

const initialState: LoginState = {};

function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-8 shadow-sm">
        <h1 className="font-display text-2xl text-ink">Studio Admin</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Sign in to manage the portfolio.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />
          <Field label="Email" required>
            <Input type="email" name="email" autoComplete="email" required />
          </Field>
          <Field label="Password" required>
            <Input
              type="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </Field>

          {state.error && (
            <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={pending}
          >
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
