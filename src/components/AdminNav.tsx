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
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-8">
          <span className="font-semibold text-emerald-800">Админ · Гольф-клуб Минск</span>
          <nav className="flex gap-5 text-sm font-medium text-stone-600">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-emerald-800">
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
