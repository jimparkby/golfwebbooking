"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { dateKeyToDate } from "@/lib/slots";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Требуется авторизация");
  return session;
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

export async function listBookings(dateKey?: string) {
  await requireAdmin();
  return prisma.booking.findMany({
    where: dateKey ? { date: dateKeyToDate(dateKey) } : {},
    include: { service: true, trainer: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
}

export async function cancelBooking(id: string) {
  await requireAdmin();
  await prisma.booking.update({ where: { id }, data: { status: "cancelled" } });
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}

// ---------------------------------------------------------------------------
// Trainers
// ---------------------------------------------------------------------------

export async function listTrainers() {
  await requireAdmin();
  return prisma.trainer.findMany({ orderBy: { name: "asc" } });
}

const trainerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  role: z.enum(["golf_pro", "trainer"]),
  bio: z.string().trim().max(1000).optional(),
});

export async function createTrainer(input: z.infer<typeof trainerSchema>) {
  await requireAdmin();
  const data = trainerSchema.parse(input);
  await prisma.trainer.create({ data });
  revalidatePath("/admin/trainers");
}

export async function updateTrainer(
  id: string,
  input: Partial<z.infer<typeof trainerSchema>> & { active?: boolean }
) {
  await requireAdmin();
  await prisma.trainer.update({ where: { id }, data: input });
  revalidatePath("/admin/trainers");
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export async function listServices() {
  await requireAdmin();
  return prisma.service.findMany({ orderBy: [{ type: "asc" }, { title: "asc" }] });
}

export async function updateService(
  id: string,
  input: { title?: string; priceByn?: number | null; durationMin?: number; active?: boolean }
) {
  await requireAdmin();
  await prisma.service.update({ where: { id }, data: input });
  revalidatePath("/admin/services");
}

// ---------------------------------------------------------------------------
// Working hours
// ---------------------------------------------------------------------------

export async function listWorkingHours() {
  await requireAdmin();
  return prisma.workingHours.findMany({ orderBy: { weekday: "asc" } });
}

export async function updateWorkingHours(
  weekday: number,
  openTime: string,
  closeTime: string
) {
  await requireAdmin();
  const existing = await prisma.workingHours.findFirst({ where: { weekday } });
  if (existing) {
    await prisma.workingHours.update({ where: { id: existing.id }, data: { openTime, closeTime } });
  } else {
    await prisma.workingHours.create({ data: { weekday, openTime, closeTime } });
  }
  revalidatePath("/admin/hours");
}

// ---------------------------------------------------------------------------
// Closed dates
// ---------------------------------------------------------------------------

export async function listClosedDates() {
  await requireAdmin();
  return prisma.closedDate.findMany({ orderBy: { date: "asc" } });
}

export async function addClosedDate(dateKey: string, reason?: string) {
  await requireAdmin();
  await prisma.closedDate.create({ data: { date: dateKeyToDate(dateKey), reason } });
  revalidatePath("/admin/hours");
}

export async function removeClosedDate(id: string) {
  await requireAdmin();
  await prisma.closedDate.delete({ where: { id } });
  revalidatePath("/admin/hours");
}
