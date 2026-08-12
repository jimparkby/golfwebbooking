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
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative mx-auto max-w-3xl px-4 py-16">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
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
            className="group rounded-2xl border border-stone-200 bg-white p-8 shadow-sm transition hover:border-emerald-700 hover:shadow-md"
          >
            <div className="text-sm font-medium text-emerald-700">Игра на поле</div>
            <h2 className="mt-2 text-xl font-semibold text-stone-900">Забронировать ти-тайм</h2>
            <p className="mt-2 text-sm text-stone-600">
              Выберите старт с 1-й или 10-й лунки, дату, время и количество игроков.
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-emerald-700 group-hover:underline">
              Забронировать →
            </span>
          </Link>

          <Link
            href="/booking/lesson"
            className="group rounded-2xl border border-stone-200 bg-white p-8 shadow-sm transition hover:border-emerald-700 hover:shadow-md"
          >
            <div className="text-sm font-medium text-emerald-700">Обучение</div>
            <h2 className="mt-2 text-xl font-semibold text-stone-900">
              Записаться на тренировку
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Индивидуальный урок или выход на поле с тренером или golf pro.
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-emerald-700 group-hover:underline">
              Записаться →
            </span>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
