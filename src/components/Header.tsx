import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight text-emerald-800">
            ГОЛЬФ-КЛУБ МИНСК
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-stone-600">
          <Link href="/booking/tee-time" className="hover:text-emerald-800">
            Ти-таймы
          </Link>
          <Link href="/booking/lesson" className="hover:text-emerald-800">
            Тренировки
          </Link>
        </nav>
      </div>
    </header>
  );
}
