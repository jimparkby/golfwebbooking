"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Неверный email или пароль");
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-stone-200 p-8"
      >
        <div className="mb-1 h-1 w-10 bg-emerald-600" />
        <h1 className="text-lg font-bold tracking-tight text-stone-900">
          Вход для администратора
        </h1>
        <p className="mt-1 text-xs font-semibold tracking-wide text-stone-500 uppercase">
          Гольф-клуб Минск
        </p>

        <div className="mt-6 grid gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-full bg-stone-900 px-4 py-2.5 font-semibold tracking-wide text-white uppercase transition hover:bg-black disabled:opacity-50"
        >
          {loading ? "Вход…" : "Войти"}
        </button>
      </form>
    </main>
  );
}
