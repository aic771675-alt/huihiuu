# Realframe — сайт гайда + админка галереи

## Файлы

- `hero.html` — публичный лендинг
- `admin.html` — админка галереи (защищена паролем)
- `gallery-store.js` — подключение к Supabase
- `supabase-schema.sql` — схема БД (выполнить один раз)

## Пароль админки

**Пароль: `anderson`**

В коде хранится только SHA-256 хеш (открытый текст пароля нигде не лежит).  
После входа флаг сохраняется в `sessionStorage` на время сессии браузера.

## Как запустить

1. Создай проект на [supabase.com](https://supabase.com)
2. Открой SQL Editor → вставь содержимое `supabase-schema.sql` → Run
3. В Project Settings → API скопируй:
   - Project URL
   - `anon` `public` key
4. Впиши их в `gallery-store.js`
5. Залей все файлы на любой хостинг (Netlify, Vercel, GitHub Pages, обычный хостинг)
6. Открой `admin.html` → введи пароль `anderson`

## Структура

- Галерея хранится в таблице `gallery_images`
- Главное фото hero — в таблице `site_settings` (ключ `hero_image_url`)
- Файлы загружаются в Storage bucket `gallery`
