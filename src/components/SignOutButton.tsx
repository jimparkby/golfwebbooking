"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="text-xs font-semibold tracking-wide text-stone-400 uppercase transition hover:text-white"
    >
      Выйти
    </button>
  );
}
