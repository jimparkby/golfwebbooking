import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

const links = [
  { href: "/admin", label: "Дашборд" },
  { href: "/admin/bookings", label: "Записи" },
  { href: "/admin/trainers", label: "Тренеры" },
  { href: "/admin/services", label: "Услуги" },
  { href: "/admin/hours", label: "Расписание" },
];

export default function AdminNav() {
  return (
    <header className="sticky top-0 z-40 bg-black">
      <div className="h-1 bg-emerald-600" />
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-8">
          <span className="text-sm font-bold tracking-[0.08em] text-white uppercase">
            Админ · Гольф-клуб Минск
          </span>
          <nav className="flex gap-5 text-xs font-semibold tracking-wide text-stone-300 uppercase sm:text-sm">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="transition hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
