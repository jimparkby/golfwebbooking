// Date/time helpers for slot generation. Dates are always handled as
// plain "YYYY-MM-DD" + "HH:mm" strings to avoid timezone drift — the
// club operates in a single timezone (Europe/Minsk, no DST).

export function dateKeyToDate(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

export function dateToKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function weekdayOf(dateKey: string): number {
  return dateToDay(dateKey);
}

function dateToDay(dateKey: string): number {
  // getUTCDay on a UTC-midnight date gives the correct weekday
  // regardless of the server's local timezone.
  return dateKeyToDate(dateKey).getUTCDay();
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function addMinutes(time: string, minutes: number): string {
  return minutesToTime(timeToMinutes(time) + minutes);
}

export function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(startB) < timeToMinutes(endA);
}

/** All slot start times at `stepMin` intervals that fit within [openTime, closeTime). */
export function generateSlotStarts(
  openTime: string,
  closeTime: string,
  stepMin: number,
  durationMin: number
): string[] {
  const open = timeToMinutes(openTime);
  const close = timeToMinutes(closeTime);
  const starts: string[] = [];
  for (let t = open; t + durationMin <= close; t += stepMin) {
    starts.push(minutesToTime(t));
  }
  return starts;
}

const CLUB_TIME_ZONE = "Europe/Minsk";

/** Current wall-clock date/time in the club's timezone, independent of the server's own TZ (Vercel runs in UTC). */
function nowInClubTimeZone(): { dateKey: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CLUB_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  const dateKey = `${get("year")}-${get("month")}-${get("day")}`;
  const minutes = Number(get("hour")) * 60 + Number(get("minute"));
  return { dateKey, minutes };
}

export function isTodayOrFuture(dateKey: string, time: string): boolean {
  const now = nowInClubTimeZone();
  if (dateKey > now.dateKey) return true;
  if (dateKey < now.dateKey) return false;
  return timeToMinutes(time) > now.minutes;
}
