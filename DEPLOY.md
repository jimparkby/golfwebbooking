# Деплой на Vercel + Postgres

Локально проект использует SQLite (файл `prisma/dev.db`) — так проще всего
разрабатывать без внешних сервисов. В проде используется управляемый Postgres.
Схема Prisma (`prisma/schema.prisma`) намеренно не использует
специфичных для SQLite возможностей, так что переключение — это две строчки.

## 1. Создайте базу Postgres

Подойдёт любой управляемый Postgres с бесплатным тарифом, например:

- **Neon** — https://neon.tech (рекомендуется, есть бесплатный план,
  хорошо работает с Vercel)
- **Supabase** — https://supabase.com

Создайте проект/базу и скопируйте строку подключения (`DATABASE_URL`) вида:

```
postgresql://user:password@host/dbname?sslmode=require
```

Это шаг, который нужно сделать вам самим — Claude не может создавать
аккаунты в сторонних сервисах от вашего имени.

## 2. Переключите Prisma на Postgres

В `prisma/schema.prisma` замените:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

на:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Локально (или в CI перед первым деплоем) примените миграции к новой базе:

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npm run seed
```

## 3. Разверните на Vercel

1. Запушьте репозиторий на GitHub/GitLab.
2. На https://vercel.com → **New Project** → выберите репозиторий.
3. Framework Preset определится автоматически как Next.js.
4. В **Environment Variables** добавьте:
   - `DATABASE_URL` — строка подключения из шага 1
   - `AUTH_SECRET` — сгенерируйте новый секрет командой:
     ```bash
     openssl rand -base64 32
     ```
     (не используйте значение из локального `.env` в проде)
   - `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` — только если планируете
     повторно запускать `npm run seed` в проде; иначе можно не задавать
5. Нажмите **Deploy**.

## 4. После первого деплоя

- Смените пароль администратора (см. README) — либо через новый сев с
  другим `SEED_ADMIN_PASSWORD`, либо вручную в базе.
- Проверьте `/admin/hours` — задайте реальные часы работы клуба и,
  если нужно, отметьте ближайшие закрытые даты.
- Проверьте `/admin/services` — при необходимости скорректируйте цены.

## Обновления схемы БД

При изменении `prisma/schema.prisma` создавайте миграцию локально:

```bash
npx prisma migrate dev --name <описание>
```

и применяйте её на проде при следующем деплое:

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

(Можно подключить это как `build` шаг в Vercel через
`"build": "prisma migrate deploy && next build"` в `package.json`, если
хотите автоматизировать.)
