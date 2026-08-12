import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Admin account -------------------------------------------------
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@golfminsk.by";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      name: "Администратор клуба",
    },
  });

  // --- Trainers --------------------------------------------------------
  const trainers = [
    { name: "Денис Чирков", role: "golf_pro" },
    { name: "Илья Бурлаков", role: "golf_pro" },
    { name: "Николай Марцинкевич", role: "golf_pro" },
    { name: "Владимир Головач", role: "trainer" },
    { name: "Андрей Ярук", role: "trainer" },
    { name: "Александр Максимчик", role: "trainer" },
  ];

  for (const t of trainers) {
    const existing = await prisma.trainer.findFirst({ where: { name: t.name } });
    if (!existing) {
      await prisma.trainer.create({ data: t });
    }
  }

  // --- Lesson services ---------------------------------------------------
  const lessonServices = [
    {
      type: "lesson",
      title: "Урок с тренером",
      durationMin: 50,
      priceByn: 145,
      trainerRole: "trainer",
    },
    {
      type: "lesson",
      title: "Урок с golf pro",
      durationMin: 50,
      priceByn: 175,
      trainerRole: "golf_pro",
    },
    {
      type: "lesson",
      title: "Выход на поле с тренером",
      durationMin: 120,
      priceByn: 260,
      trainerRole: "trainer",
    },
    {
      type: "lesson",
      title: "Выход на поле с golf pro",
      durationMin: 120,
      priceByn: 310,
      trainerRole: "golf_pro",
    },
  ];

  for (const s of lessonServices) {
    const existing = await prisma.service.findFirst({
      where: { title: s.title, type: "lesson" },
    });
    if (!existing) {
      await prisma.service.create({ data: s });
    }
  }

  // --- Tee time products -------------------------------------------------
  const teeTimeServices = [
    {
      type: "tee_time",
      title: "Ти-тайм ЛУНКА 1",
      durationMin: 15,
      startingHole: 1,
      maxPlayers: 4,
    },
    {
      type: "tee_time",
      title: "Ти-тайм ЛУНКА 10",
      durationMin: 15,
      startingHole: 10,
      maxPlayers: 4,
    },
  ];

  for (const s of teeTimeServices) {
    const existing = await prisma.service.findFirst({
      where: { title: s.title, type: "tee_time" },
    });
    if (!existing) {
      await prisma.service.create({ data: s });
    }
  }

  // --- Working hours: every day 08:00–21:00 -------------------------------
  const workingHoursCount = await prisma.workingHours.count();
  if (workingHoursCount === 0) {
    for (let weekday = 0; weekday <= 6; weekday++) {
      await prisma.workingHours.create({
        data: { weekday, openTime: "08:00", closeTime: "21:00" },
      });
    }
  }

  console.log("Seed complete.");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
