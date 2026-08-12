"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  addMinutes,
  dateKeyToDate,
  generateSlotStarts,
  isTodayOrFuture,
  rangesOverlap,
  weekdayOf,
} from "@/lib/slots";

const phoneRegex = /^\+375\d{9}$/;

async function getWorkingHoursFor(dateKey: string) {
  const weekday = weekdayOf(dateKey);
  const wh = await prisma.workingHours.findFirst({ where: { weekday } });
  return wh ?? { openTime: "08:00", closeTime: "21:00" };
}

async function isClosedDate(dateKey: string) {
  const date = dateKeyToDate(dateKey);
  const closed = await prisma.closedDate.findFirst({ where: { date } });
  return !!closed;
}

// ---------------------------------------------------------------------------
// Tee times
// ---------------------------------------------------------------------------

export async function getTeeTimeServices() {
  return prisma.service.findMany({
    where: { type: "tee_time", active: true },
    orderBy: { startingHole: "asc" },
  });
}

export async function getTeeTimeSlots(dateKey: string, serviceId: string) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || service.type !== "tee_time") return [];
  if (await isClosedDate(dateKey)) return [];

  const wh = await getWorkingHoursFor(dateKey);
  const starts = generateSlotStarts(wh.openTime, wh.closeTime, service.durationMin, service.durationMin);

  const bookings = await prisma.booking.findMany({
    where: {
      serviceId,
      date: dateKeyToDate(dateKey),
      status: "confirmed",
    },
  });

  const maxPlayers = service.maxPlayers ?? 4;

  return starts
    .filter((time) => isTodayOrFuture(dateKey, time))
    .map((time) => {
      const booked = bookings
        .filter((b) => b.startTime === time)
        .reduce((sum, b) => sum + b.players, 0);
      return { time, remaining: Math.max(0, maxPlayers - booked), maxPlayers };
    });
}

const teeTimeBookingSchema = z.object({
  serviceId: z.string().min(1),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  holes: z.union([z.literal(9), z.literal(18)]),
  players: z.number().int().min(1).max(4),
  clientName: z.string().trim().min(2).max(100),
  clientPhone: z.string().regex(phoneRegex, "Формат: +375XXXXXXXXX"),
  comment: z.string().trim().max(500).optional(),
});

export type TeeTimeBookingInput = z.infer<typeof teeTimeBookingSchema>;

export async function createTeeTimeBooking(input: TeeTimeBookingInput) {
  const parsed = teeTimeBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }
  const data = parsed.data;

  const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
  if (!service || service.type !== "tee_time" || !service.active) {
    return { ok: false as const, error: "Услуга недоступна" };
  }

  return prisma.$transaction(async (tx) => {
    const date = dateKeyToDate(data.dateKey);
    const existing = await tx.booking.findMany({
      where: { serviceId: data.serviceId, date, startTime: data.time, status: "confirmed" },
    });
    const booked = existing.reduce((sum, b) => sum + b.players, 0);
    const maxPlayers = service.maxPlayers ?? 4;
    if (booked + data.players > maxPlayers) {
      return { ok: false as const, error: "На это время уже не осталось мест" };
    }

    const booking = await tx.booking.create({
      data: {
        serviceId: data.serviceId,
        date,
        startTime: data.time,
        endTime: addMinutes(data.time, service.durationMin),
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        players: data.players,
        holes: data.holes,
        comment: data.comment,
      },
    });
    return { ok: true as const, bookingId: booking.id };
  });
}

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

export async function getLessonServices() {
  return prisma.service.findMany({ where: { type: "lesson", active: true }, orderBy: { priceByn: "asc" } });
}

export async function getTrainersByRole(role: string) {
  return prisma.trainer.findMany({ where: { role, active: true }, orderBy: { name: "asc" } });
}

export async function getLessonSlots(dateKey: string, trainerId: string, durationMin: number) {
  if (await isClosedDate(dateKey)) return [];
  const wh = await getWorkingHoursFor(dateKey);
  const starts = generateSlotStarts(wh.openTime, wh.closeTime, 30, durationMin);

  const bookings = await prisma.booking.findMany({
    where: { trainerId, date: dateKeyToDate(dateKey), status: "confirmed" },
  });

  return starts.filter((time) => isTodayOrFuture(dateKey, time)).filter((time) => {
    const end = addMinutes(time, durationMin);
    return !bookings.some((b) => rangesOverlap(time, end, b.startTime, b.endTime));
  });
}

const lessonBookingSchema = z.object({
  serviceId: z.string().min(1),
  trainerId: z.string().min(1),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  clientName: z.string().trim().min(2).max(100),
  clientPhone: z.string().regex(phoneRegex, "Формат: +375XXXXXXXXX"),
  comment: z.string().trim().max(500).optional(),
});

export type LessonBookingInput = z.infer<typeof lessonBookingSchema>;

export async function createLessonBooking(input: LessonBookingInput) {
  const parsed = lessonBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Некорректные данные" };
  }
  const data = parsed.data;

  const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
  if (!service || service.type !== "lesson" || !service.active) {
    return { ok: false as const, error: "Услуга недоступна" };
  }
  const trainer = await prisma.trainer.findUnique({ where: { id: data.trainerId } });
  if (!trainer || !trainer.active || trainer.role !== service.trainerRole) {
    return { ok: false as const, error: "Тренер недоступен для этой услуги" };
  }

  return prisma.$transaction(async (tx) => {
    const date = dateKeyToDate(data.dateKey);
    const end = addMinutes(data.time, service.durationMin);
    const conflicting = await tx.booking.findMany({
      where: { trainerId: data.trainerId, date, status: "confirmed" },
    });
    const overlap = conflicting.some((b) => rangesOverlap(data.time, end, b.startTime, b.endTime));
    if (overlap) {
      return { ok: false as const, error: "Это время уже занято, выберите другое" };
    }

    const booking = await tx.booking.create({
      data: {
        serviceId: data.serviceId,
        trainerId: data.trainerId,
        date,
        startTime: data.time,
        endTime: end,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        players: 1,
        comment: data.comment,
      },
    });
    return { ok: true as const, bookingId: booking.id };
  });
}
