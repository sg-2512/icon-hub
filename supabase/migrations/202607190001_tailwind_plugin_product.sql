alter table public.products
  drop constraint if exists products_id_check;

alter table public.products
  add constraint products_id_check check (
    id in (
      'vscode',
      'figma',
      'chrome',
      'framer',
      'raycast',
      'mcp',
      'jetbrains',
      'storybook',
      'canva',
      'tailwind'
    )
  );

insert into public.products (id, name, founder_limit)
values ('tailwind', 'IconSearch for Tailwind CSS', 500)
on conflict (id) do update
set name = excluded.name;
