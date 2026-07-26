-- Add penpot and all extension products to Supabase products table and drop check constraints

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_id_check;

INSERT INTO public.products (id, name, founder_limit)
VALUES
  ('vscode', 'IconSearch for VS Code', 500),
  ('figma', 'IconSearch for Figma', 500),
  ('chrome', 'IconSearch for Chrome', 500),
  ('framer', 'IconSearch for Framer', 500),
  ('raycast', 'IconSearch for Raycast', 500),
  ('mcp', 'IconSearch for MCP', 500),
  ('jetbrains', 'IconSearch for JetBrains', 500),
  ('storybook', 'IconSearch for Storybook', 500),
  ('canva', 'IconSearch for Canva', 500),
  ('tailwind', 'IconSearch for Tailwind', 500),
  ('webflow', 'IconSearch for Webflow', 500),
  ('adobe', 'IconSearch for Adobe Express', 500),
  ('wordpress', 'IconSearch for WordPress', 500),
  ('penpot', 'IconSearch for Penpot', 500),
  ('sketch', 'IconSearch for Sketch', 500)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    founder_limit = EXCLUDED.founder_limit,
    updated_at = NOW();
