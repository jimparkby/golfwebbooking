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
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Тренеры</h1>

        <div className="mt-6 rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="text-xs font-semibold tracking-[0.15em] text-stone-500 uppercase">
            Добавить тренера
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "golf_pro" | "trainer")}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none"
            >
              <option value="trainer">Тренер</option>
              <option value="golf_pro">Golf Pro</option>
            </select>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold tracking-wide text-white uppercase hover:bg-black disabled:opacity-50"
            >
              Добавить
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-stone-200 bg-white">
          {loading ? (
            <p className="p-6 text-sm text-stone-500">Загрузка…</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b-2 border-stone-900 text-stone-500">
                <tr>
                  <th className="px-4 py-3" />
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">Имя</th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                    Роль
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wide uppercase">
                    Статус
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {trainers.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-stone-100 transition hover:bg-stone-50"
                  >
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
                    <td className="px-4 py-3 font-semibold text-stone-900">{t.name}</td>
                    <td className="px-4 py-3">{t.role === "golf_pro" ? "Golf Pro" : "Тренер"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          t.active
                            ? "text-xs font-bold tracking-wide text-emerald-700 uppercase"
                            : "text-xs font-bold tracking-wide text-stone-400 uppercase"
                        }
                      >
                        {t.active ? "активен" : "скрыт"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleActive(t)}
                        className="text-xs font-semibold text-stone-900 hover:underline"
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
