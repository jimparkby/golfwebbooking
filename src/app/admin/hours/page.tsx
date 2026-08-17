"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/components/AdminNav";
import {
  addClosedDate,
  listClosedDates,
  listWorkingHours,
  removeClosedDate,
  updateWorkingHours,
} from "@/actions/admin";

type WorkingHours = Awaited<ReturnType<typeof listWorkingHours>>[number];
type ClosedDate = Awaited<ReturnType<typeof listClosedDates>>[number];

const weekdayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export default function AdminHoursPage() {
  const [hours, setHours] = useState<WorkingHours[]>([]);
  const [closedDates, setClosedDates] = useState<ClosedDate[]>([]);
  const [loading, setLoading] = useState(true);

  const [newClosedDate, setNewClosedDate] = useState("");
  const [newClosedReason, setNewClosedReason] = useState("");

  async function load() {
    setLoading(true);
    const [h, c] = await Promise.all([listWorkingHours(), listClosedDates()]);
    setHours(h.sort((a, b) => a.weekday - b.weekday));
    setClosedDates(c);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveHours(weekday: number, openTime: string, closeTime: string) {
    await updateWorkingHours(weekday, openTime, closeTime);
    load();
  }

  async function handleAddClosedDate() {
    if (!newClosedDate) return;
    await addClosedDate(newClosedDate, newClosedReason || undefined);
    setNewClosedDate("");
    setNewClosedReason("");
    load();
  }

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Расписание работы</h1>

        <section className="mt-6 overflow-hidden rounded-lg border border-stone-200 bg-white">
          {loading ? (
            <p className="p-6 text-sm text-stone-500">Загрузка…</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b-2 border-stone-900 text-stone-500">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                    День
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                    Открытие
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                    Закрытие
                  </th>
                </tr>
              </thead>
              <tbody>
                {hours.map((h) => (
                  <tr
                    key={h.id}
                    className="border-t border-stone-100 transition hover:bg-stone-50"
                  >
                    <td className="px-4 py-3 font-semibold text-stone-900">
                      {weekdayNames[h.weekday]}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        defaultValue={h.openTime}
                        onBlur={(e) => saveHours(h.weekday, e.target.value, h.closeTime)}
                        className="rounded-lg border border-stone-300 px-2 py-1 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="time"
                        defaultValue={h.closeTime}
                        onBlur={(e) => saveHours(h.weekday, h.openTime, e.target.value)}
                        className="rounded-lg border border-stone-300 px-2 py-1 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <h2 className="mt-10 text-lg font-bold tracking-tight text-stone-900">
          Выходные / закрытые даты
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={newClosedDate}
            onChange={(e) => setNewClosedDate(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Причина (необязательно)"
            value={newClosedReason}
            onChange={(e) => setNewClosedReason(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
          />
          <button
            onClick={handleAddClosedDate}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold tracking-wide text-white uppercase hover:bg-black"
          >
            Добавить
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-stone-200 bg-white">
          {closedDates.length === 0 ? (
            <p className="p-6 text-sm text-stone-500">Закрытых дат нет.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {closedDates.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between px-4 py-3 text-sm transition hover:bg-stone-50"
                >
                  <span>
                    {c.date.toISOString().slice(0, 10)}
                    {c.reason ? ` — ${c.reason}` : ""}
                  </span>
                  <button
                    onClick={async () => {
                      await removeClosedDate(c.id);
                      load();
                    }}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
