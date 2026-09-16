-- Выполнить в Supabase: SQL Editor -> New query -> вставить и Run

create table if not exists gallery_images (
  id bigint generated always as identity primary key,
  url text not null,
  caption text,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table gallery_images enable row level security;

-- Читать может кто угодно (публичный лендинг)
create policy "Public read gallery_images"
on gallery_images for select
using (true);

-- Писать/менять/удалять может только anon-роль с валидным ключом
-- (для реальной защиты админки лучше подключить Supabase Auth и сузить это правило до auth.uid() is not null)
create policy "Public write gallery_images"
on gallery_images for insert
with check (true);

create policy "Public update gallery_images"
on gallery_images for update
using (true);

create policy "Public delete gallery_images"
on gallery_images for delete
using (true);

-- Storage bucket для файлов галереи
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "Public read gallery bucket"
on storage.objects for select
using (bucket_id = 'gallery');

create policy "Public upload gallery bucket"
on storage.objects for insert
with check (bucket_id = 'gallery');

create policy "Public delete gallery bucket"
on storage.objects for delete
using (bucket_id = 'gallery');

-- Настройки главного экрана (фото в hero-карточке справа)
create table if not exists site_settings (
  key text primary key,
  value text
);

alter table site_settings enable row level security;

create policy "Public read site_settings"
on site_settings for select
using (true);

create policy "Public upsert site_settings"
on site_settings for insert
with check (true);

create policy "Public update site_settings"
on site_settings for update
using (true);

insert into site_settings (key, value) values ('hero_image_url', '')
on conflict (key) do nothing;
