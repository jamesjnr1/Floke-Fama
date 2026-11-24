-- Flokefama database on Supabase (Postgres). Run once on a new project (the Supabase dashboard's SQL editor, or
-- `npm run supabase:setup`). Safe to run again: everything is "if not exists" / "or replace".
--
-- Every table has the same shape: the row's id, when it was created and last changed, an order number, and the row's
-- fields as JSON (`doc`), the same fields the site stored in Appwrite. The site reads and writes only through the
-- flk_* functions below, with the server's secret key: row level security is on and there are no policies, so the
-- public keys can read or write nothing.

do $$
declare
  t text;
begin
  foreach t in array array['accounts', 'hospital_logos', 'orders', 'service_assets', 'service_tickets', 'service_notifications', 'push_subscriptions', 'sms_log', 'support_requests', 'sms_optout', 'facilities', 'rate_limits', 'site_errors', 'visits', 'visit_days'] loop
    execute format('create table if not exists public.%I (
      id text primary key,
      seq bigint generated always as identity,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      doc jsonb not null default ''{}''::jsonb
    )', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create index if not exists %I on public.%I (updated_at)', t || '_updated_at', t);
    execute format('create index if not exists %I on public.%I (created_at)', t || '_created_at', t);
  end loop;
end $$;

-- The lookups the site makes often
create unique index if not exists accounts_email on public.accounts ((lower(doc->>'email')));
create index if not exists orders_account on public.orders ((doc->>'account'));
create index if not exists push_role_facility on public.push_subscriptions ((doc->>'role'), (doc->>'facility'));
create index if not exists site_errors_last_at on public.site_errors ((doc->>'lastAt'));
create index if not exists visits_day on public.visits ((doc->>'day'));
create index if not exists visits_last_at on public.visits ((doc->>'lastAt'));
create index if not exists visit_days_day on public.visit_days ((doc->>'day'));

-- The tables the functions may touch (nothing else in the database)
create or replace function public.flk_table(p_table text) returns text language plpgsql immutable as $$
begin
  if p_table = any (array['accounts', 'hospital_logos', 'orders', 'service_assets', 'service_tickets', 'service_notifications', 'push_subscriptions', 'sms_log', 'support_requests', 'sms_optout', 'facilities', 'rate_limits', 'site_errors', 'visits', 'visit_days']) then
    return p_table;
  end if;
  raise exception 'unknown table %', p_table using errcode = '42P01';
end $$;

-- A row as the site expects it: $id, $createdAt, $updatedAt and its fields
create or replace function public.flk_row(p_id text, p_created timestamptz, p_updated timestamptz, p_doc jsonb) returns jsonb language sql immutable as $$
  select p_doc || jsonb_build_object(
    '$id', p_id,
    '$createdAt', to_char(p_created at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"+00:00"'),
    '$updatedAt', to_char(p_updated at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"+00:00"'))
$$;

-- The SQL for a field: the row's own columns, or one of its fields (as text)
create or replace function public.flk_col(p_attr text) returns text language sql immutable as $$
  select case p_attr when '$id' then 'id' when '$createdAt' then 'created_at' when '$updatedAt' then 'updated_at' when '$sequence' then 'seq' else format('(doc->>%L)', p_attr) end
$$;
create or replace function public.flk_val(p_attr text, p_value jsonb) returns text language sql immutable as $$
  select case when p_attr in ('$createdAt', '$updatedAt') then format('%L::timestamptz', p_value #>> '{}') when p_attr = '$sequence' then format('%L::bigint', p_value #>> '{}') else format('%L', p_value #>> '{}') end
$$;

-- A page of rows: filters [{method, attribute, values}], an order, a limit and the row to start after
create or replace function public.flk_list(p_table text, p_filters jsonb default '[]', p_order text default null, p_desc boolean default false, p_limit int default 25, p_after text default null)
returns jsonb language plpgsql stable as $$
declare
  t text := public.flk_table(p_table);
  f jsonb;
  w text := 'true';
  vals text;
  ord text := case when p_order is null or p_order = '' then 'seq' else public.flk_col(p_order) end;
  cmp text;
  cur_k text;
  cur_seq bigint;
  rows jsonb;
  total bigint;
begin
  for f in select * from jsonb_array_elements(coalesce(p_filters, '[]')) loop
    if f->>'method' = 'equal' then
      select string_agg(public.flk_val(f->>'attribute', v), ', ') into vals from jsonb_array_elements(f->'values') v;
      w := w || format(' and %s in (%s)', public.flk_col(f->>'attribute'), coalesce(vals, 'null'));
    elsif f->>'method' in ('greaterThan', 'greaterThanEqual', 'lessThan', 'lessThanEqual') then
      cmp := case f->>'method' when 'greaterThan' then '>' when 'greaterThanEqual' then '>=' when 'lessThan' then '<' else '<=' end;
      w := w || format(' and %s %s %s', public.flk_col(f->>'attribute'), cmp, public.flk_val(f->>'attribute', f->'values'->0));
    else
      raise exception 'unsupported filter %', f->>'method';
    end if;
  end loop;
  execute format('select count(*) from public.%I where %s', t, w) into total;
  -- After a given row: rows past it in this order (ties broken by the order number)
  if p_after is not null then
    execute format('select (%s)::text, seq from public.%I where id = %L', ord, t, p_after) into cur_k, cur_seq;
    -- (EXECUTE doesn't set FOUND: check the row itself)
    if cur_seq is not null then
      w := w || format(' and (%s, seq) %s (%L, %s)', ord, case when p_desc then '<' else '>' end, cur_k, cur_seq);
    end if;
  end if;
  execute format('select coalesce(jsonb_agg(public.flk_row(id, created_at, updated_at, doc) order by %s %s, seq %s), ''[]'') from (select * from public.%I where %s order by %s %s, seq %s limit %s) x',
    ord, case when p_desc then 'desc' else 'asc' end, case when p_desc then 'desc' else 'asc' end, t, w, ord, case when p_desc then 'desc' else 'asc' end, case when p_desc then 'desc' else 'asc' end, greatest(1, least(coalesce(p_limit, 25), 5000)))
    into rows;
  return jsonb_build_object('total', total, 'rows', rows);
end $$;

create or replace function public.flk_get(p_table text, p_id text) returns jsonb language plpgsql stable as $$
declare r jsonb;
begin
  execute format('select public.flk_row(id, created_at, updated_at, doc) from public.%I where id = %L', public.flk_table(p_table), p_id) into r;
  if r is null then raise exception 'Row with the requested ID could not be found.' using errcode = 'P0002'; end if;
  return r;
end $$;

create or replace function public.flk_create(p_table text, p_id text, p_doc jsonb) returns jsonb language plpgsql as $$
declare r jsonb;
begin
  execute format('insert into public.%I (id, doc) values (%L, %L) returning public.flk_row(id, created_at, updated_at, doc)', public.flk_table(p_table), p_id, coalesce(p_doc, '{}')) into r;
  return r;
end $$;

-- Changes the given fields (the others stay as they are)
create or replace function public.flk_update(p_table text, p_id text, p_doc jsonb) returns jsonb language plpgsql as $$
declare r jsonb;
begin
  execute format('update public.%I set doc = doc || %L, updated_at = now() where id = %L returning public.flk_row(id, created_at, updated_at, doc)', public.flk_table(p_table), coalesce(p_doc, '{}'), p_id) into r;
  if r is null then raise exception 'Row with the requested ID could not be found.' using errcode = 'P0002'; end if;
  return r;
end $$;

create or replace function public.flk_upsert(p_table text, p_id text, p_doc jsonb) returns jsonb language plpgsql as $$
declare r jsonb;
begin
  execute format('insert into public.%I as t (id, doc) values (%L, %L) on conflict (id) do update set doc = t.doc || excluded.doc, updated_at = now() returning public.flk_row(t.id, t.created_at, t.updated_at, t.doc)', public.flk_table(p_table), p_id, coalesce(p_doc, '{}')) into r;
  return r;
end $$;

create or replace function public.flk_delete(p_table text, p_id text) returns jsonb language plpgsql as $$
declare n int;
begin
  execute format('delete from public.%I where id = %L', public.flk_table(p_table), p_id);
  get diagnostics n = row_count;
  if n = 0 then raise exception 'Row with the requested ID could not be found.' using errcode = 'P0002'; end if;
  return '{}'::jsonb;
end $$;

-- Copying the data in (scripts/supabase-copy.mjs): keeps the rows' original times
create or replace function public.flk_import(p_table text, p_rows jsonb) returns int language plpgsql as $$
declare
  t text := public.flk_table(p_table);
  n int;
begin
  execute format('insert into public.%I (id, created_at, updated_at, doc)
    select r->>''$id'', coalesce((r->>''$createdAt'')::timestamptz, now()), coalesce((r->>''$updatedAt'')::timestamptz, now()), r - ''$id'' - ''$createdAt'' - ''$updatedAt'' - ''$sequence'' - ''$tableId'' - ''$databaseId'' - ''$permissions''
    from jsonb_array_elements(%L) r
    on conflict (id) do update set doc = excluded.doc, created_at = excluded.created_at, updated_at = excluded.updated_at', t, p_rows);
  get diagnostics n = row_count;
  return n;
end $$;

-- Only the server's secret key may call them
do $$
declare fn text;
begin
  foreach fn in array array['flk_table(text)', 'flk_row(text, timestamptz, timestamptz, jsonb)', 'flk_col(text)', 'flk_val(text, jsonb)', 'flk_list(text, jsonb, text, boolean, int, text)', 'flk_get(text, text)', 'flk_create(text, text, jsonb)', 'flk_update(text, text, jsonb)', 'flk_upsert(text, text, jsonb)', 'flk_delete(text, text)', 'flk_import(text, jsonb)'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', fn);
    execute format('grant execute on function public.%s to service_role', fn);
  end loop;
end $$;

-- Hospital logos and staff photos: a public bucket (anyone can view a picture by its address; only the server uploads)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('hospital-logos', 'hospital-logos', true, 5242880, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'])
on conflict (id) do nothing;
