alter table public.products
  drop constraint if exists products_id_check;

alter table public.products
  add constraint products_id_check check (id in ('vscode', 'figma', 'chrome', 'framer', 'raycast', 'mcp', 'jetbrains', 'storybook', 'canva'));

insert into public.products (id, name, founder_limit)
values
  ('storybook', 'Storybook addon', 500),
  ('canva', 'Canva app', 500)
on conflict (id) do update
set
  name = excluded.name,
  founder_limit = excluded.founder_limit;
