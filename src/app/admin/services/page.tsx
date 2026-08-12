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
        <h1 className="text-2xl font-semibold text-stone-900">Услуги</h1>

        <div className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white">
          {loading ? (
            <p className="p-6 text-sm text-stone-500">Загрузка…</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Услуга</th>
                  <th className="px-4 py-3 font-medium">Тип</th>
                  <th className="px-4 py-3 font-medium">Длительность</th>
                  <th className="px-4 py-3 font-medium">Цена, BYN</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} className="border-t border-stone-100">
                    <td className="px-4 py-3">{s.title}</td>
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
                        className="w-28 rounded-lg border border-stone-300 px-2 py-1 text-sm focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          s.active
                            ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                            : "rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500"
                        }
                      >
                        {s.active ? "активна" : "скрыта"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleActive(s)}
                        className="text-xs font-medium text-emerald-700 hover:underline"
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
