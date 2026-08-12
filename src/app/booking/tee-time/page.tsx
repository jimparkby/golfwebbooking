"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PhoneInput from "@/components/PhoneInput";
import {
  createTeeTimeBooking,
  getTeeTimeServices,
  getTeeTimeSlots,
} from "@/actions/booking";

type Service = Awaited<ReturnType<typeof getTeeTimeServices>>[number];
type Slot = { time: string; remaining: number; maxPlayers: number };

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function TeeTimePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<string>("");
  const [dateKey, setDateKey] = useState(todayKey());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [holes, setHoles] = useState<9 | 18>(18);
  const [players, setPlayers] = useState(1);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+375");
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  useEffect(() => {
    getTeeTimeServices().then((list) => {
      setServices(list);
      if (list[0]) setServiceId(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (!serviceId || !dateKey) return;
    setLoadingSlots(true);
    setSelectedTime(null);
    getTeeTimeSlots(dateKey, serviceId)
      .then(setSlots)
      .finally(() => setLoadingSlots(false));
  }, [serviceId, dateKey]);

  const selectedSlot = useMemo(
    () => slots.find((s) => s.time === selectedTime) ?? null,
    [slots, selectedTime]
  );

  const maxSelectablePlayers = selectedSlot?.remaining ?? 4;

  async function handleSubmit() {
    if (!selectedTime) return;
    setSubmitting(true);
    setError(null);
    const result = await createTeeTimeBooking({
      serviceId,
      dateKey,
      time: selectedTime,
      holes,
      players,
      clientName: name,
      clientPhone: phone,
      comment: comment || undefined,
    });
    setSubmitting(false);
    if (result.ok) {
      setConfirmedId(result.bookingId);
    } else {
      setError(result.error);
    }
  }

  if (confirmedId) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-lg px-4 py-20 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              ✓
            </div>
            <h1 className="text-xl font-semibold text-stone-900">Бронь подтверждена</h1>
            <p className="mt-2 text-stone-600">
              {dateKey}, {selectedTime} · {holes} лунок · {players}{" "}
              {players === 1 ? "игрок" : "игрока/игроков"}
            </p>
            <p className="mt-4 text-sm text-stone-500">
              Оплата на месте в клубе. Мы свяжемся с вами по телефону {phone}, если понадобится
              что-то уточнить.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <h1 className="text-2xl font-semibold text-stone-900">Бронирование ти-тайма</h1>

          {/* Step 1: hole + date */}
          <section className="mt-8">
            <h2 className="text-sm font-medium text-stone-500">1. Старт и дата</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setServiceId(s.id)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                    serviceId === s.id
                      ? "border-emerald-700 bg-emerald-700 text-white"
                      : "border-stone-300 bg-white text-stone-700 hover:border-emerald-700"
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>
            <input
              type="date"
              min={todayKey()}
              value={dateKey}
              onChange={(e) => setDateKey(e.target.value)}
              className="mt-3 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </section>

          {/* Step 2: time slot */}
          <section className="mt-8">
            <h2 className="text-sm font-medium text-stone-500">2. Время</h2>
            {loadingSlots ? (
              <p className="mt-3 text-sm text-stone-500">Загрузка…</p>
            ) : slots.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">На эту дату нет доступных слотов.</p>
            ) : (
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    disabled={s.remaining === 0}
                    onClick={() => {
                      setSelectedTime(s.time);
                      setPlayers((p) => Math.min(p, s.remaining));
                    }}
                    className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${
                      s.remaining === 0
                        ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
                        : selectedTime === s.time
                          ? "border-emerald-700 bg-emerald-700 text-white"
                          : "border-stone-300 bg-white text-stone-700 hover:border-emerald-700"
                    }`}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Step 3: round details */}
          {selectedTime && (
            <section className="mt-8 grid grid-cols-2 gap-4">
              <div>
                <h2 className="text-sm font-medium text-stone-500">Количество лунок</h2>
                <div className="mt-2 flex gap-2">
                  {[9, 18].map((h) => (
                    <button
                      key={h}
                      onClick={() => setHoles(h as 9 | 18)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        holes === h
                          ? "border-emerald-700 bg-emerald-700 text-white"
                          : "border-stone-300 bg-white text-stone-700 hover:border-emerald-700"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-sm font-medium text-stone-500">
                  Игроков (доступно {maxSelectablePlayers})
                </h2>
                <select
                  value={players}
                  onChange={(e) => setPlayers(Number(e.target.value))}
                  className="mt-2 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  {Array.from({ length: Math.max(1, maxSelectablePlayers) }, (_, i) => i + 1).map(
                    (n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    )
                  )}
                </select>
              </div>
            </section>
          )}

          {/* Step 4: contact info */}
          {selectedTime && (
            <section className="mt-8">
              <h2 className="text-sm font-medium text-stone-500">3. Ваши данные</h2>
              <div className="mt-3 grid gap-3">
                <input
                  type="text"
                  placeholder="Имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
                <PhoneInput value={phone} onChange={setPhone} />
                <textarea
                  placeholder="Комментарий (необязательно)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  className="rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={
                  submitting || name.trim().length < 2 || !/^\+375\d{9}$/.test(phone)
                }
                className="mt-4 w-full rounded-lg bg-emerald-700 px-4 py-3 font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Отправка…" : "Подтвердить бронь"}
              </button>
              <p className="mt-2 text-center text-xs text-stone-500">Оплата на месте в клубе</p>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
