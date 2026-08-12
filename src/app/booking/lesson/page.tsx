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
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              ✓
            </div>
            <h1 className="text-xl font-semibold text-stone-900">Запись подтверждена</h1>
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
            <h2 className="text-sm font-medium text-stone-500">1. Услуга</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setServiceId(s.id)}
                  className={`rounded-lg border p-4 text-left transition ${
                    serviceId === s.id
                      ? "border-emerald-700 bg-emerald-50"
                      : "border-stone-300 bg-white hover:border-emerald-700"
                  }`}
                >
                  <div className="font-medium text-stone-900">{s.title}</div>
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
              <h2 className="text-sm font-medium text-stone-500">
                2. {roleLabel[service.trainerRole ?? ""] ?? "Тренер"}
              </h2>
              <div className="mt-3 flex flex-wrap gap-3">
                {trainers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTrainerId(t.id)}
                    className={`flex items-center gap-3 rounded-lg border py-2 pl-2 pr-4 text-sm font-medium transition ${
                      trainerId === t.id
                        ? "border-emerald-700 bg-emerald-700 text-white"
                        : "border-stone-300 bg-white text-stone-700 hover:border-emerald-700"
                    }`}
                  >
                    {t.photoUrl ? (
                      <Image
                        src={t.photoUrl}
                        alt={t.name}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200 text-xs text-stone-600">
                        {t.name.charAt(0)}
                      </span>
                    )}
                    {t.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Step 3: date + time */}
          {trainerId && (
            <section className="mt-8">
              <h2 className="text-sm font-medium text-stone-500">3. Дата и время</h2>
              <input
                type="date"
                min={todayKey()}
                value={dateKey}
                onChange={(e) => setDateKey(e.target.value)}
                className="mt-3 rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
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
                      className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${
                        selectedTime === time
                          ? "border-emerald-700 bg-emerald-700 text-white"
                          : "border-stone-300 bg-white text-stone-700 hover:border-emerald-700"
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
              <h2 className="text-sm font-medium text-stone-500">4. Ваши данные</h2>
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
                {submitting ? "Отправка…" : "Подтвердить запись"}
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
