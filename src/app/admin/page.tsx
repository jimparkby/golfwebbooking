import AdminNav from "@/components/AdminNav";
import { listBookings } from "@/actions/admin";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default async function AdminDashboard() {
  const bookings = await listBookings(todayKey());
  const active = bookings.filter((b) => b.status === "confirmed");

  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-stone-900">Сегодня, {todayKey()}</h1>
        <p className="mt-1 text-stone-500">{active.length} активных записей</p>

        <div className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white">
          {active.length === 0 ? (
            <p className="p-6 text-sm text-stone-500">На сегодня записей нет.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Время</th>
                  <th className="px-4 py-3 font-medium">Услуга</th>
                  <th className="px-4 py-3 font-medium">Тренер</th>
                  <th className="px-4 py-3 font-medium">Клиент</th>
                  <th className="px-4 py-3 font-medium">Телефон</th>
                </tr>
              </thead>
              <tbody>
                {active.map((b) => (
                  <tr key={b.id} className="border-t border-stone-100">
                    <td className="px-4 py-3">{b.startTime}</td>
                    <td className="px-4 py-3">{b.service.title}</td>
                    <td className="px-4 py-3">{b.trainer?.name ?? "—"}</td>
                    <td className="px-4 py-3">{b.clientName}</td>
                    <td className="px-4 py-3">{b.clientPhone}</td>
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
