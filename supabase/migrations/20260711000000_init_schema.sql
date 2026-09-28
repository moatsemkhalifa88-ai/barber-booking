-- MOATSEM barber shop — initial schema
-- Customers, barbers, services, appointments, working hours, blocked times,
-- and contact messages, with RLS and a database-level double-booking guard.
--
-- All appointment wall-clock times are interpreted in Asia/Jerusalem.

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists btree_gist; -- equality support inside EXCLUDE ... USING gist

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------

create table customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (btrim(full_name) <> ''),
  phone text not null check (btrim(phone) <> ''),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One customer record per email address. The application always normalizes
-- email to lowercase before reading or writing this column, so a plain
-- unique index both enforces one-row-per-address and matches the exact
-- column PostgREST's upsert(onConflict: "email") targets.
create unique index customers_email_unique_idx on customers (email);

create trigger customers_set_updated_at
  before update on customers
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- barbers
-- ---------------------------------------------------------------------------

create table barbers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  role text not null check (btrim(role) <> ''),
  is_active boolean not null default true,
  image_url text,
  created_at timestamptz not null default now()
);

insert into barbers (name, role, image_url) values
  ('Moatsem', 'Owner & Lead Barber', '/images/barbers/moatsem.jpg'),
  ('Amir', 'Professional Barber', '/images/barbers/amir.jpg'),
  ('Ibrahim', 'Professional Barber', '/images/barbers/ibrahim.jpg');

-- ---------------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------------

create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  duration_minutes integer not null check (duration_minutes > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into services (name, duration_minutes) values
  ('Men''s Haircut', 45),
  ('Kids'' Haircut', 30),
  ('Facial Treatment', 30);

-- ---------------------------------------------------------------------------
-- working_hours
--
-- barber_id NULL = shop-wide default schedule. A non-null barber_id overrides
-- the default for that specific barber (not seeded yet, supported for later).
-- ---------------------------------------------------------------------------

create table working_hours (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid references barbers(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0 = Sunday
  is_open boolean not null default true,
  open_time time,
  close_time time,
  created_at timestamptz not null default now(),
  constraint working_hours_open_times_present check (
    (is_open = false) or (open_time is not null and close_time is not null and close_time > open_time)
  )
);

create unique index working_hours_global_unique_idx
  on working_hours (day_of_week)
  where barber_id is null;

create unique index working_hours_barber_unique_idx
  on working_hours (barber_id, day_of_week)
  where barber_id is not null;

-- Sunday(0) through Thursday(4): 12:00–22:00. Friday(5)/Saturday(6): closed.
insert into working_hours (day_of_week, is_open, open_time, close_time) values
  (0, true, '12:00', '22:00'),
  (1, true, '12:00', '22:00'),
  (2, true, '12:00', '22:00'),
  (3, true, '12:00', '22:00'),
  (4, true, '12:00', '22:00'),
  (5, false, null, null),
  (6, false, null, null);

-- ---------------------------------------------------------------------------
-- blocked_times — vacations, breaks, holidays, manual blocks.
-- barber_id NULL = blocks the whole shop (e.g. a holiday).
-- ---------------------------------------------------------------------------

create table blocked_times (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid references barbers(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  constraint blocked_times_range_valid check (ends_at > starts_at)
);

create index blocked_times_barber_range_idx on blocked_times (barber_id, starts_at, ends_at);

-- ---------------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------------

create table appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete restrict,
  barber_id uuid not null references barbers(id) on delete restrict,
  service_id uuid not null references services(id) on delete restrict,

  appointment_date date not null,
  start_time time not null,
  end_time time not null,

  -- Wall-clock (appointment_date, start_time/end_time) converted to an
  -- absolute instant in the shop's timezone. Maintained by trigger below
  -- because PostgreSQL generated columns cannot call timezone-name-aware,
  -- DST-sensitive functions (they are not IMMUTABLE).
  starts_at timestamptz not null,
  ends_at timestamptz not null,

  status text not null default 'confirmed'
    check (status in ('confirmed', 'cancelled', 'completed', 'no_show')),

  booking_reference text not null,
  cancellation_token uuid not null default gen_random_uuid(),

  customer_notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,

  constraint appointments_time_range_valid check (end_time > start_time),
  constraint appointments_cancelled_at_matches_status check (
    (status = 'cancelled' and cancelled_at is not null) or
    (status <> 'cancelled' and cancelled_at is null)
  )
);

create unique index appointments_booking_reference_unique_idx on appointments (booking_reference);

create index appointments_customer_idx on appointments (customer_id);
create index appointments_barber_date_idx on appointments (barber_id, appointment_date);
create index appointments_lookup_idx on appointments (booking_reference, status);

-- Authoritative double-booking guard: PostgreSQL rejects, atomically and
-- under concurrency, any INSERT/UPDATE that would create two *confirmed*
-- appointments for the same barber with overlapping [starts_at, ends_at)
-- ranges. This holds regardless of what the application layer checked.
alter table appointments
  add constraint appointments_no_overlap_per_barber
  exclude using gist (
    barber_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status = 'confirmed');

create or replace function set_appointment_timestamps()
returns trigger
language plpgsql
as $$
begin
  new.starts_at = (new.appointment_date::text || ' ' || new.start_time::text)::timestamp at time zone 'Asia/Jerusalem';
  new.ends_at = (new.appointment_date::text || ' ' || new.end_time::text)::timestamp at time zone 'Asia/Jerusalem';
  return new;
end;
$$;

create trigger appointments_set_timestamps
  before insert or update of appointment_date, start_time, end_time on appointments
  for each row
  execute function set_appointment_timestamps();

create trigger appointments_set_updated_at
  before update on appointments
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- contact_messages
-- ---------------------------------------------------------------------------

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (btrim(full_name) <> ''),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text,
  subject text,
  message text not null check (btrim(message) <> ''),
  created_at timestamptz not null default now()
);

create index contact_messages_created_at_idx on contact_messages (created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Every table has RLS enabled. Public-menu tables (barbers, services,
-- working_hours) expose a read-only policy for active rows, since that data
-- is not sensitive and may be useful to a future client-side reader.
--
-- customers, appointments, blocked_times, and contact_messages have NO
-- policies for anon/authenticated roles at all: RLS stays on and denies
-- everything by default. Only the server-side Supabase client, configured
-- with the service_role key (which bypasses RLS by design in Postgres/
-- Supabase), can read or write them — and it only does so from Server
-- Actions that validate input and re-check availability themselves.
-- ---------------------------------------------------------------------------

alter table customers enable row level security;
alter table barbers enable row level security;
alter table services enable row level security;
alter table working_hours enable row level security;
alter table blocked_times enable row level security;
alter table appointments enable row level security;
alter table contact_messages enable row level security;

create policy barbers_public_read on barbers
  for select
  to anon, authenticated
  using (is_active = true);

create policy services_public_read on services
  for select
  to anon, authenticated
  using (is_active = true);

create policy working_hours_public_read on working_hours
  for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- get_barber_availability
--
-- The single source of truth for "is this barber free at this date/time for
-- this service". Used both to render availability in the booking UI and,
-- immediately before insert, to re-check the chosen slot server-side. It is
-- SECURITY DEFINER so it can read blocked_times/appointments (which have no
-- public RLS policy) while only ever returning a status label — never raw
-- appointment or customer data — so it is safe to expose broadly.
--
-- The actual, race-condition-proof guarantee is still the
-- appointments_no_overlap_per_barber EXCLUDE constraint above; this function
-- is what lets the application show correct availability *before* attempting
-- an insert.
-- ---------------------------------------------------------------------------

create or replace function get_barber_availability(
  p_date date,
  p_time_slot time,
  p_service_id uuid
)
returns table (barber_id uuid, status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_duration int;
  v_slot_end time;
  v_day_of_week int;
  v_slot_start_at timestamptz;
  v_slot_end_at timestamptz;
  v_global_open boolean;
  v_global_open_time time;
  v_global_close_time time;
  v_now_date date := (now() at time zone 'Asia/Jerusalem')::date;
  v_now_time time := (now() at time zone 'Asia/Jerusalem')::time;
begin
  select duration_minutes into v_duration from services where id = p_service_id and is_active;
  if v_duration is null then
    return; -- unknown or inactive service: no rows, caller treats as unavailable
  end if;

  v_slot_end := p_time_slot + make_interval(mins => v_duration);
  v_day_of_week := extract(dow from p_date)::int;

  v_slot_start_at := (p_date::text || ' ' || p_time_slot::text)::timestamp at time zone 'Asia/Jerusalem';
  v_slot_end_at := (p_date::text || ' ' || v_slot_end::text)::timestamp at time zone 'Asia/Jerusalem';

  select wh.is_open, wh.open_time, wh.close_time
    into v_global_open, v_global_open_time, v_global_close_time
  from working_hours wh
  where wh.barber_id is null and wh.day_of_week = v_day_of_week;

  return query
  select
    b.id,
    case
      when p_date < v_now_date then 'unavailable'
      when p_date = v_now_date and p_time_slot <= v_now_time then 'unavailable'
      when coalesce(v_global_open, false) = false then 'unavailable'
      when p_time_slot < v_global_open_time or v_slot_end > v_global_close_time then 'unavailable'
      when bwh.id is not null and (
        bwh.is_open = false or p_time_slot < bwh.open_time or v_slot_end > bwh.close_time
      ) then 'unavailable'
      when exists (
        select 1 from blocked_times bt
        where (bt.barber_id = b.id or bt.barber_id is null)
          and bt.starts_at < v_slot_end_at
          and bt.ends_at > v_slot_start_at
      ) then 'unavailable'
      when exists (
        select 1 from appointments ap
        where ap.barber_id = b.id
          and ap.status = 'confirmed'
          and ap.starts_at < v_slot_end_at
          and ap.ends_at > v_slot_start_at
      ) then 'booked'
      else 'available'
    end as status
  from barbers b
  left join working_hours bwh on bwh.barber_id = b.id and bwh.day_of_week = v_day_of_week
  where b.is_active = true
  order by b.created_at asc;
end;
$$;

grant execute on function get_barber_availability(date, time, uuid) to anon, authenticated;
