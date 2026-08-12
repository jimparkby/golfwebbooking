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
          <h1 className="text-2xl font-semibold text-stone-900">Записи</h1>
          <input
            type="date"
            value={dateKey}
            onChange={(e) => setDateKey(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white">
          {loading ? (
            <p className="p-6 text-sm text-stone-500">Загрузка…</p>
          ) : bookings.length === 0 ? (
            <p className="p-6 text-sm text-stone-500">На эту дату записей нет.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Время</th>
                  <th className="px-4 py-3 font-medium">Услуга</th>
                  <th className="px-4 py-3 font-medium">Тренер</th>
                  <th className="px-4 py-3 font-medium">Клиент</th>
                  <th className="px-4 py-3 font-medium">Телефон</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t border-stone-100">
                    <td className="px-4 py-3">
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
                            ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                            : "rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500"
                        }
                      >
                        {b.status === "confirmed" ? "подтверждена" : "отменена"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {b.status === "confirmed" && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          className="text-xs font-medium text-red-600 hover:underline"
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
