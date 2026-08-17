"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/components/AdminNav";
import { listServices, updateService } from "@/actions/admin";

type Service = Awaited<ReturnType<typeof listServices>>[number];

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setServices(await listServices());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function savePrice(s: Service, price: string) {
    setSavingId(s.id);
    const priceByn = price.trim() === "" ? null : Number(price);
    await updateService(s.id, { priceByn: Number.isNaN(priceByn) ? null : priceByn });
    setSavingId(null);
    load();
  }

  async function toggleActive(s: Service) {
    await updateService(s.id, { active: !s.active });
    load();
  }

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Услуги</h1>

        <div className="mt-6 overflow-hidden rounded-lg border border-stone-200 bg-white">
          {loading ? (
            <p className="p-6 text-sm text-stone-500">Загрузка…</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b-2 border-stone-900 text-stone-500">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                    Услуга
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">Тип</th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                    Длительность
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                    Цена, BYN
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                    Статус
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-stone-100 transition hover:bg-stone-50"
                  >
                    <td className="px-4 py-3 font-semibold text-stone-900">{s.title}</td>
                    <td className="px-4 py-3 text-stone-500">
                      {s.type === "lesson" ? "Тренировка" : "Ти-тайм"}
                    </td>
                    <td className="px-4 py-3 text-stone-500">{s.durationMin} мин</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        defaultValue={s.priceByn ?? ""}
                        placeholder="по запросу"
                        onBlur={(e) => savePrice(s, e.target.value)}
                        disabled={savingId === s.id}
                        className="w-28 rounded-lg border border-stone-300 px-2 py-1 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          s.active
                            ? "text-xs font-bold tracking-wide text-emerald-700 uppercase"
                            : "text-xs font-bold tracking-wide text-stone-400 uppercase"
                        }
                      >
                        {s.active ? "активна" : "скрыта"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleActive(s)}
                        className="text-xs font-semibold text-stone-900 hover:underline"
                      >
                        {s.active ? "Скрыть" : "Показать"}
                      </button>
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
