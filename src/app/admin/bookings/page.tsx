"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/components/AdminNav";
import { cancelBooking, listBookings } from "@/actions/admin";

type Booking = Awaited<ReturnType<typeof listBookings>>[number];

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminBookingsPage() {
  const [dateKey, setDateKey] = useState(todayKey());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const list = await listBookings(dateKey);
    setBookings(list);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey]);

  async function handleCancel(id: string) {
    await cancelBooking(id);
    load();
  }

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Записи</h1>
          <input
            type="date"
            value={dateKey}
            onChange={(e) => setDateKey(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-stone-200 bg-white">
          {loading ? (
            <p className="p-6 text-sm text-stone-500">Загрузка…</p>
          ) : bookings.length === 0 ? (
            <p className="p-6 text-sm text-stone-500">На эту дату записей нет.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b-2 border-stone-900 text-stone-500">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                    Время
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                    Услуга
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                    Тренер
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                    Клиент
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                    Телефон
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                    Статус
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-t border-stone-100 transition hover:bg-stone-50"
                  >
                    <td className="px-4 py-3 font-semibold text-stone-900">
                      {b.startTime}–{b.endTime}
                    </td>
                    <td className="px-4 py-3">{b.service.title}</td>
                    <td className="px-4 py-3">{b.trainer?.name ?? "—"}</td>
                    <td className="px-4 py-3">{b.clientName}</td>
                    <td className="px-4 py-3">{b.clientPhone}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          b.status === "confirmed"
                            ? "text-xs font-bold tracking-wide text-emerald-700 uppercase"
                            : "text-xs font-bold tracking-wide text-red-600 uppercase"
                        }
                      >
                        {b.status === "confirmed" ? "подтверждена" : "отменена"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {b.status === "confirmed" && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          Отменить
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}
