-- Выполните в Supabase: SQL Editor → New query → Run.

-- Дизайны чехлов от покупателей
create table if not exists public.case_designs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 60),
  author      text not null check (char_length(author) between 1 and 60),
  email       text,
  image_path  text not null,
  config      jsonb not null default '{}'::jsonb,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now()
);

create index if not exists case_designs_status_idx on public.case_designs (status, created_at desc);

-- Доступ только через сервер (service role). Из браузера напрямую читать/писать нельзя,
-- поэтому email покупателей не утекут.
alter table public.case_designs enable row level security;

-- Публичное хранилище для картинок дизайнов
insert into storage.buckets (id, name, public)
values ('designs', 'designs', true)
on conflict (id) do nothing;

-- Модерация: одобрить дизайн, чтобы он появился в галерее
-- update public.case_designs set status = 'approved' where id = '...';
