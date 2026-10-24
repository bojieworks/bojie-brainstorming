"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";
import { FormError } from "@/components/public/form-error";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { message: "" });
  return (
    <form action={action} className="form" style={{ marginTop: 20 }}>
      <input type="hidden" name="next" value={next} />
      <div className="row">
        <label htmlFor="password">密碼</label>
        <input className="input" id="password" name="password" type="password" autoComplete="current-password" autoFocus required />
      </div>
      {state.message && <FormError message={state.message} className="hint" />}
      <div>
        <button className="btn primary" type="submit" disabled={pending} style={{ width: "auto" }}>
          {pending ? "進去中…" : "進後台"}
        </button>
      </div>
    </form>
  );
}
