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
    {
      name: "Денис Чирков",
      role: "golf_pro",
      photoUrl: "/images/trainers/chirkov-denis.webp",
      bio: [
        "В гольфе с 2003 года.",
        "Тренерский стаж — с 2006 года (более 20 лет).",
        "В статусе профессионального игрока Казахстана — с 2011 года.",
        "Сертификация по программе PGA of Europe под руководством Джона Хеггарти в 2012 году.",
        "Диплом БГУФК по специальности «тренер-преподаватель».",
        "Участник и призёр международных соревнований в статусе профессионала: European Challenge Tour, Kazakhstan Open, Russian Open, Korean Cup, Uzbekistan Open и многих других.",
      ].join("\n"),
    },
    {
      name: "Илья Бурлаков",
      role: "golf_pro",
      photoUrl: "/images/trainers/burlakov-ilya.webp",
      bio: [
        "Тренерский стаж: 12 лет.",
        "Профессиональный статус: в статусе профессионала с 2012 года.",
        "В гольфе с 1999 года. Победитель и призёр всероссийских соревнований, член сборной команды России. Участник профессиональных турниров в Европе.",
        "Образование: выпускник кафедры гольфа Российского государственного университета физической культуры, спорта, молодёжи и туризма. Проходил обучение в European Tour Performance Institute (Дубай).",
      ].join("\n"),
    },
    {
      name: "Николай Марцинкевич",
      role: "golf_pro",
      photoUrl: "/images/trainers/martsinkevich-nikolay.webp",
      bio: [
        "В гольфе с 2018 года.",
        "Тренерский стаж — более 5 лет.",
        "Играющий профессионал категории «В» (ТВ), член ПГА России.",
        "Главный тренер детско-юношеской школы гольфа гольф-клуба «Минск».",
        "Победитель международных турниров.",
      ].join("\n"),
    },
    {
      name: "Владимир Головач",
      role: "trainer",
      photoUrl: "/images/trainers/golovach-vladimir.webp",
      bio: [
        "В гольфе с 2010 года.",
        "Сертифицированный тренер по детской программе SNAG-гольф.",
        "Диплом БГУФК по специальности «тренер-преподаватель».",
        "Тренер детско-юношеской школы гольфа.",
        "Тренерский стаж — более 10 лет.",
      ].join("\n"),
    },
    {
      name: "Андрей Ярук",
      role: "trainer",
      photoUrl: "/images/trainers/yaruk-andrey.webp",
      bio: [
        "В гольфе с 2013 года.",
        "Играющий профессионал категории «В» (ТВ), член ПГА России.",
        "Тренер детско-юношеской школы гольф-клуба «Минск».",
        "Победитель международных и республиканских турниров.",
      ].join("\n"),
    },
    {
      name: "Александр Максимчик",
      role: "trainer",
      photoUrl: "/images/trainers/maksimchik-aleksandr.webp",
      bio: [
        "В гольфе с 2014 года. Победитель и призёр международных и республиканских турниров.",
        "Тренерский стаж: 12 лет.",
        "Образование: Американская ассоциация профессиональных тренеров по гольфу (PGTAA), квалификация — Master Teaching Professional.",
      ].join("\n"),
    },
  ];

  for (const t of trainers) {
    const existing = await prisma.trainer.findFirst({ where: { name: t.name } });
    if (existing) {
      await prisma.trainer.update({
        where: { id: existing.id },
        data: { photoUrl: t.photoUrl, bio: t.bio },
      });
    } else {
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
