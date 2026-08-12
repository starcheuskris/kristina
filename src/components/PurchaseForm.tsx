"use client";

import { useState, type FormEvent } from "react";

export function PurchaseForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.paymentUrl) {
        throw new Error(data.error ?? "Не удалось создать заказ");
      }

      window.location.href = data.paymentUrl;
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Что-то пошло не так");
    }
  }

  return (
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          placeholder="Ваш email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full flex-1 rounded-full border border-border bg-background px-5 py-3 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full bg-accent px-8 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "loading" ? "Секунду…" : "Купить курс"}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </div>
  );
}
