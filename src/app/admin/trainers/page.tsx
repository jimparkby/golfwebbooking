"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AdminNav from "@/components/AdminNav";
import { createTrainer, listTrainers, updateTrainer } from "@/actions/admin";

type Trainer = Awaited<ReturnType<typeof listTrainers>>[number];

export default function AdminTrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [role, setRole] = useState<"golf_pro" | "trainer">("trainer");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    setTrainers(await listTrainers());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    if (name.trim().length < 2) return;
    setCreating(true);
    await createTrainer({ name: name.trim(), role });
    setName("");
    setCreating(false);
    load();
  }

  async function toggleActive(t: Trainer) {
    await updateTrainer(t.id, { active: !t.active });
    load();
  }

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-stone-900">Тренеры</h1>

        <div className="mt-6 rounded-xl border border-stone-200 bg-white p-4">
          <h2 className="text-sm font-medium text-stone-500">Добавить тренера</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "golf_pro" | "trainer")}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="trainer">Тренер</option>
              <option value="golf_pro">Golf Pro</option>
            </select>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              Добавить
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white">
          {loading ? (
            <p className="p-6 text-sm text-stone-500">Загрузка…</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-medium" />
                  <th className="px-4 py-3 font-medium">Имя</th>
                  <th className="px-4 py-3 font-medium">Роль</th>
                  <th className="px-4 py-3 font-medium">Статус</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {trainers.map((t) => (
                  <tr key={t.id} className="border-t border-stone-100">
                    <td className="px-4 py-3">
                      {t.photoUrl ? (
                        <Image
                          src={t.photoUrl}
                          alt={t.name}
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-200 text-xs text-stone-600">
                          {t.name.charAt(0)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{t.name}</td>
                    <td className="px-4 py-3">{t.role === "golf_pro" ? "Golf Pro" : "Тренер"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          t.active
                            ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                            : "rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500"
                        }
                      >
                        {t.active ? "активен" : "скрыт"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleActive(t)}
                        className="text-xs font-medium text-emerald-700 hover:underline"
                      >
                        {t.active ? "Скрыть" : "Показать"}
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
