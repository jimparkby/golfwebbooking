"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="text-sm font-medium text-stone-500 hover:text-stone-800"
    >
      Выйти
    </button>
  );
}
