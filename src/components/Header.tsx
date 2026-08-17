import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-black">
      <div className="h-1 bg-emerald-600" />
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-[0.08em] text-white sm:text-base">
            ГОЛЬФ-КЛУБ МИНСК
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-xs font-semibold tracking-wide text-stone-300 uppercase sm:text-sm">
          <Link href="/booking/tee-time" className="transition hover:text-white">
            Ти-таймы
          </Link>
          <Link href="/booking/lesson" className="transition hover:text-white">
            Тренировки
          </Link>
        </nav>
      </div>
    </header>
  );
}
