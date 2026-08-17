"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageBanner from "@/components/PageBanner";
import PhoneInput from "@/components/PhoneInput";
import {
  createLessonBooking,
  getLessonServices,
  getLessonSlots,
  getTrainersByRole,
} from "@/actions/booking";

type Service = Awaited<ReturnType<typeof getLessonServices>>[number];
type Trainer = Awaited<ReturnType<typeof getTrainersByRole>>[number];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

const roleLabel: Record<string, string> = {
  golf_pro: "Golf Pro",
  trainer: "Тренер",
};

export default function LessonPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<string>("");
  const service = useMemo(
    () => services.find((s) => s.id === serviceId) ?? null,
    [services, serviceId]
  );

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [trainerId, setTrainerId] = useState<string>("");
  const [viewingTrainer, setViewingTrainer] = useState<Trainer | null>(null);

  const [dateKey, setDateKey] = useState(todayKey());
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+375");
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  useEffect(() => {
    getLessonServices().then((list) => {
      setServices(list);
      if (list[0]) setServiceId(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (!service?.trainerRole) return;
    setTrainerId("");
    setSelectedTime(null);
    getTrainersByRole(service.trainerRole).then((list) => {
      setTrainers(list);
      if (list[0]) setTrainerId(list[0].id);
    });
  }, [service]);

  useEffect(() => {
    if (!trainerId || !service) return;
    setLoadingSlots(true);
    setSelectedTime(null);
    getLessonSlots(dateKey, trainerId, service.durationMin)
      .then(setSlots)
      .finally(() => setLoadingSlots(false));
  }, [trainerId, dateKey, service]);

  async function handleSubmit() {
    if (!selectedTime || !service || !trainerId) return;
    setSubmitting(true);
    setError(null);
    const result = await createLessonBooking({
      serviceId: service.id,
      trainerId,
      dateKey,
      time: selectedTime,
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
    const trainer = trainers.find((t) => t.id === trainerId);
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-lg px-4 py-20 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-white">
              ✓
            </div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900">
              Запись подтверждена
            </h1>
            <p className="mt-2 text-stone-600">
              {service?.title} с {trainer?.name} · {dateKey}, {selectedTime}
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
        <PageBanner image="/images/course/lessons.webp" title="Запись на тренировку" />
        <div className="mx-auto max-w-2xl px-4 py-10">
          {/* Step 1: service */}
          <section className="mt-8">
            <h2 className="text-xs font-semibold tracking-[0.15em] text-stone-500 uppercase">
              1. Услуга
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setServiceId(s.id)}
                  className={`rounded-lg border p-4 text-left transition ${
                    serviceId === s.id
                      ? "border-stone-900 bg-stone-50"
                      : "border-stone-300 bg-white hover:border-stone-900"
                  }`}
                >
                  <div className="font-semibold text-stone-900">{s.title}</div>
                  <div className="mt-1 text-sm text-stone-500">
                    {s.durationMin} мин · {s.priceByn ? `${s.priceByn} BYN` : "цена по запросу"}
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Step 2: trainer */}
          {service && (
            <section className="mt-8">
              <h2 className="text-xs font-semibold tracking-[0.15em] text-stone-500 uppercase">
                2. {roleLabel[service.trainerRole ?? ""] ?? "Тренер"}
              </h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {trainers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTrainerId(t.id);
                      setViewingTrainer(t);
                    }}
                    className={`overflow-hidden rounded-lg border text-left transition ${
                      trainerId === t.id
                        ? "border-stone-900 ring-1 ring-stone-900"
                        : "border-stone-300 hover:border-stone-900"
                    }`}
                  >
                    {t.photoUrl ? (
                      <Image
                        src={t.photoUrl}
                        alt={t.name}
                        width={240}
                        height={240}
                        className="aspect-square w-full object-cover"
                      />
                    ) : (
                      <span className="flex aspect-square w-full items-center justify-center bg-stone-200 text-2xl text-stone-500">
                        {t.name.charAt(0)}
                      </span>
                    )}
                    <span className="block px-3 py-2">
                      <span className="block text-sm font-semibold text-stone-900">
                        {t.name}
                      </span>
                      <span className="text-xs text-stone-500">
                        {roleLabel[t.role] ?? t.role}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Step 3: date + time */}
          {trainerId && (
            <section className="mt-8">
              <h2 className="text-xs font-semibold tracking-[0.15em] text-stone-500 uppercase">
                3. Дата и время
              </h2>
              <input
                type="date"
                min={todayKey()}
                value={dateKey}
                onChange={(e) => setDateKey(e.target.value)}
                className="mt-3 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
              />
              {loadingSlots ? (
                <p className="mt-3 text-sm text-stone-500">Загрузка…</p>
              ) : slots.length === 0 ? (
                <p className="mt-3 text-sm text-stone-500">
                  На эту дату нет свободного времени у этого тренера.
                </p>
              ) : (
                <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {slots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`rounded-full border px-2 py-2 text-sm font-semibold transition ${
                        selectedTime === time
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-stone-300 bg-white text-stone-700 hover:border-stone-900"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Step 4: contact info */}
          {selectedTime && (
            <section className="mt-8">
              <h2 className="text-xs font-semibold tracking-[0.15em] text-stone-500 uppercase">
                4. Ваши данные
              </h2>
              <div className="mt-3 grid gap-3">
                <input
                  type="text"
                  placeholder="Имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
                />
                <PhoneInput value={phone} onChange={setPhone} />
                <textarea
                  placeholder="Комментарий (необязательно)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  className="rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
                />
              </div>

              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={
                  submitting || name.trim().length < 2 || !/^\+375\d{9}$/.test(phone)
                }
                className="mt-4 w-full rounded-full bg-stone-900 px-4 py-3 font-semibold tracking-wide text-white uppercase transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Отправка…" : "Подтвердить запись"}
              </button>
              <p className="mt-2 text-center text-xs text-stone-500">Оплата на месте в клубе</p>
            </section>
          )}
        </div>
      </main>
      <Footer />

      {viewingTrainer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setViewingTrainer(null)}
        >
          <div
            className="max-h-full w-full max-w-sm overflow-y-auto rounded-lg bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {viewingTrainer.photoUrl ? (
                <Image
                  src={viewingTrainer.photoUrl}
                  alt={viewingTrainer.name}
                  width={480}
                  height={480}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <span className="flex aspect-square w-full items-center justify-center bg-stone-200 text-5xl text-stone-500">
                  {viewingTrainer.name.charAt(0)}
                </span>
              )}
              <button
                onClick={() => setViewingTrainer(null)}
                aria-label="Закрыть"
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black"
              >
                ✕
              </button>
            </div>
            <div className="p-5">
              <div className="text-xs font-semibold tracking-[0.15em] text-stone-500 uppercase">
                {roleLabel[viewingTrainer.role] ?? viewingTrainer.role}
              </div>
              <h3 className="mt-1 text-lg font-bold tracking-tight text-stone-900">
                {viewingTrainer.name}
              </h3>
              {viewingTrainer.bio && (
                <ul className="mt-3 space-y-1.5 text-sm text-stone-600">
                  {viewingTrainer.bio.split("\n").map((line, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-stone-400">·</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={() => setViewingTrainer(null)}
                className="mt-5 w-full rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold tracking-wide text-white uppercase transition hover:bg-black"
              >
                {trainerId === viewingTrainer.id ? "Выбрано" : "Выбрать"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
