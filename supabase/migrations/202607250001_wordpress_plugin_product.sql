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
      'tailwind',
      'webflow',
      'adobe',
      'wordpress'
    )
  );

insert into public.products (id, name, founder_limit)
values ('wordpress', 'IconSearch for WordPress', 500)
on conflict (id) do update
set name = excluded.name;
