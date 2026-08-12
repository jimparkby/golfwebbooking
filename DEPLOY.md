# Деплой

Текущий статус: **настроено и задеплоено.**

- **База данных:** Neon (проект `golf-club-minsk-booking`, регион Frankfurt),
  ветка `production` для прода, ветка `dev` для локальной разработки
- **Хостинг:** Vercel, проект `golfwebbooking` (аккаунт `jimparkby`)
- **Репозиторий:** https://github.com/jimparkby/golfwebbooking
- **Переменные окружения на Vercel:** `DATABASE_URL` (пуловое подключение к
  ветке `production` в Neon), `AUTH_SECRET` (сгенерирован отдельно от
  локального)

## Как обновить прод

Любой пуш в `main` на GitHub автоматически триггерит новый деплой на Vercel.

```bash
git add -A
git commit -m "..."
git push
```

## Изменение схемы БД

1. Поменяйте `prisma/schema.prisma`.
2. Создайте и примените миграцию на dev-ветке (она же — ваша обычная
   локальная работа):
   ```bash
   npx prisma migrate dev --name <описание>
   ```
3. Примените ту же миграцию на продакшн-ветке Neon перед (или сразу после)
   пуша:
   ```bash
   DATABASE_URL="<connection string ветки production из Neon Console>" \
     npx prisma migrate deploy
   ```
   Строку подключения возьмите в Neon Console → Connect → ветка
   `production` → **отключите** Connection pooling (для миграций нужен
   прямой коннект, не через pgbouncer).

## Доступ к сервисам

- **Neon:** https://console.neon.tech — залогинен как `v.belous1024@gmail.com`
- **Vercel:** https://vercel.com/jimparkbys-projects — залогинен через GitHub
  (`jimparkby`)
- **Админка приложения:** `/admin`, логин `admin@golfminsk.by`,
  пароль тот же, что задан при первом севе (`changeme123` по умолчанию —
  **смените его** через `/admin` или напрямую в БД перед тем как передавать
  доступ сотрудникам клуба)

## Восстановление доступа локально (для нового окружения)

Если понадобится настроить проект с нуля на другой машине:

```bash
npm install
```

И заполнить `.env`:

```
DATABASE_URL="<connection string ветки dev из Neon Console>"
AUTH_SECRET="<любая случайная строка, напр. `openssl rand -base64 32`>"
```
