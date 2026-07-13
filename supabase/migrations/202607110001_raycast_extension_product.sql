alter table public.products
  drop constraint if exists products_id_check;

alter table public.products
  add constraint products_id_check check (id in ('vscode', 'figma', 'chrome', 'framer', 'raycast'));

insert into public.products (id, name, founder_limit)
values ('raycast', 'IconSearch for Raycast', 500)
on conflict (id) do update
set name = excluded.name,
    founder_limit = excluded.founder_limit,
    updated_at = now();
