"use client";

import { useActionState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { loginAction } from "@/app/actions/auth.actions";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 18px",
  border: "1px solid #E4E1DC",
  background: "#F6F4F1",
  fontFamily: "Archivo, sans-serif",
  fontSize: 14,
  fontWeight: 300,
  outline: "none",
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction, isPending] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.ok) {
      const callbackUrl = searchParams.get("callbackUrl") ?? state.data.redirectTo;
      router.push(callbackUrl);
      router.refresh();
    }
  }, [state, router, searchParams]);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <input
          name="email"
          type="email"
          placeholder="Email address"
          autoComplete="email"
          required
          style={inputStyle}
        />
        {state && !state.ok && state.fieldErrors?.email && (
          <p style={{ color: "#B3261E", fontSize: 12, marginTop: 6 }}>
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <div>
        <input
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          required
          style={inputStyle}
        />
        {state && !state.ok && state.fieldErrors?.password && (
          <p style={{ color: "#B3261E", fontSize: 12, marginTop: 6 }}>
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      {state && !state.ok && !state.fieldErrors && (
        <p style={{ color: "#B3261E", fontSize: 13 }}>{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        style={{
          background: "#121110",
          color: "#FFFFFF",
          border: 0,
          padding: "15px 32px",
          fontFamily: "Archivo, sans-serif",
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          cursor: isPending ? "default" : "pointer",
          opacity: isPending ? 0.6 : 1,
        }}
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
