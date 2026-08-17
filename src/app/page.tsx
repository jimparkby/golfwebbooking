import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <section
          className="relative flex min-h-[420px] items-center justify-center bg-cover bg-center text-center sm:min-h-[520px]"
          style={{ backgroundImage: "url(/images/course/hero.webp)" }}
        >
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative mx-auto max-w-3xl px-4 py-16">
            <div className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase">
              Гольф-клуб · Минск
            </div>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Гольф-клуб Минск
            </h1>
            <p className="mt-4 text-lg text-white/90">
              Забронируйте ти-тайм на поле или запишитесь на персональную тренировку с тренером.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-6 px-4 py-16 sm:grid-cols-2">
          <Link
            href="/booking/tee-time"
            className="group rounded-lg border border-stone-200 bg-white p-8 transition hover:border-stone-900"
          >
            <div className="text-xs font-semibold tracking-[0.15em] text-stone-500 uppercase">
              Игра на поле
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-stone-900">
              Забронировать ти-тайм
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Выберите старт с 1-й или 10-й лунки, дату, время и количество игроков.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-stone-900 group-hover:underline">
              Забронировать →
            </span>
          </Link>

          <Link
            href="/booking/lesson"
            className="group rounded-lg border border-stone-200 bg-white p-8 transition hover:border-stone-900"
          >
            <div className="text-xs font-semibold tracking-[0.15em] text-stone-500 uppercase">
              Обучение
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-stone-900">
              Записаться на тренировку
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Индивидуальный урок или выход на поле с тренером или golf pro.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-stone-900 group-hover:underline">
              Записаться →
            </span>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
