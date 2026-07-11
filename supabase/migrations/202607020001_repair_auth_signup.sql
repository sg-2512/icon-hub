create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade
);

alter table public.profiles
  add column if not exists plan text,
  add column if not exists is_internal boolean,
  add column if not exists created_at timestamptz,
  add column if not exists updated_at timestamptz;

alter table public.profiles
  drop constraint if exists profiles_plan_check;

alter table public.profiles
  alter column plan type text using plan::text;

update public.profiles
set plan = 'free'
where plan is null or plan not in ('free', 'pro');

update public.profiles
set is_internal = false
where is_internal is null;

update public.profiles
set created_at = now()
where created_at is null;

update public.profiles
set updated_at = now()
where updated_at is null;

alter table public.profiles
  alter column plan set default 'free',
  alter column plan set not null,
  alter column is_internal set default false,
  alter column is_internal set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

alter table public.profiles
  add constraint profiles_plan_check check (plan in ('free', 'pro'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_has_email_column boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'email'
  )
  into v_has_email_column;

  begin
    if v_has_email_column then
      execute
        'insert into public.profiles (id, email, plan, is_internal)
         values ($1, $2, $3, $4)
         on conflict (id) do nothing'
      using new.id, new.email, 'free', false;
    else
      insert into public.profiles (id, plan, is_internal)
      values (new.id, 'free', false)
      on conflict (id) do nothing;
    end if;
  exception
    when others then
      raise warning 'Could not create profile for new auth user %: %', new.id, sqlerrm;
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.claim_product_entitlement(
  p_user_id uuid,
  p_product text
)
returns table (
  product_id text,
  entitlement_id uuid,
  entitlement_tier text,
  entitlement_status text,
  entitlement_founder_number integer,
  entitlement_expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.products%rowtype;
  v_entitlement public.entitlements%rowtype;
  v_founder_number integer;
  v_is_internal boolean := false;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || ':' || p_product, 0));

  select * into v_entitlement
  from public.entitlements
  where user_id = p_user_id and product = p_product
  for update;

  if found then
    return query select
      v_entitlement.product,
      v_entitlement.id,
      v_entitlement.tier,
      v_entitlement.status,
      v_entitlement.founder_number,
      v_entitlement.expires_at;
    return;
  end if;

  begin
    insert into public.profiles (id, plan, is_internal)
    values (p_user_id, 'free', false)
    on conflict (id) do nothing;
  exception
    when others then
      raise warning 'Could not ensure profile before entitlement claim for user %: %', p_user_id, sqlerrm;
  end;

  select coalesce((
    select profiles.is_internal
    from public.profiles
    where profiles.id = p_user_id
  ), false)
  into v_is_internal;

  select * into v_product
  from public.products
  where id = p_product
  for update;

  if not found then
    raise exception 'unknown_product';
  end if;

  if not v_is_internal and v_product.founder_claimed < v_product.founder_limit then
    v_founder_number := v_product.founder_claimed + 1;
    update public.products
    set founder_claimed = v_founder_number, updated_at = now()
    where id = p_product;

    insert into public.entitlements (user_id, product, tier, founder_number)
    values (p_user_id, p_product, 'founder', v_founder_number)
    returning * into v_entitlement;
  else
    insert into public.entitlements (user_id, product, tier)
    values (p_user_id, p_product, 'free')
    returning * into v_entitlement;
  end if;

  insert into public.entitlement_events (
    user_id, product, entitlement_id, event_type, metadata
  )
  values (
    p_user_id,
    p_product,
    v_entitlement.id,
    'entitlement_created',
    jsonb_build_object(
      'tier', v_entitlement.tier,
      'founder_number', v_entitlement.founder_number
    )
  );

  return query select
    v_entitlement.product,
    v_entitlement.id,
    v_entitlement.tier,
    v_entitlement.status,
    v_entitlement.founder_number,
    v_entitlement.expires_at;
end;
$$;

revoke all on function public.claim_product_entitlement(uuid, text) from public;
grant execute on function public.claim_product_entitlement(uuid, text) to service_role;

alter table public.profiles enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select, update on public.profiles to authenticated;
grant all privileges on public.profiles to service_role;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
