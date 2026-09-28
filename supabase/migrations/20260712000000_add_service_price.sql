-- Add pricing to services.
--
-- Added as a separate migration rather than editing the already-applied
-- 20260711000000_init_schema.sql. Column is added nullable first, backfilled
-- for the three seeded services by name, then locked to NOT NULL — safe
-- whether this runs against a fresh database or one that already has the
-- initial schema and seed rows applied.
--
-- Prices are looked up live from this table wherever they're displayed
-- (service selection, booking review/confirmation, Manage Booking, emails).
-- There is no per-appointment price snapshot — if a price changes later, it
-- changes for everyone consistently, which is the right behavior for a
-- small shop with a simple, rarely-changing price list.

alter table services add column price_ils numeric(10, 2);

update services set price_ils = 50 where name = 'Men''s Haircut';
update services set price_ils = 30 where name = 'Kids'' Haircut';
update services set price_ils = 100 where name = 'Facial Treatment';

alter table services alter column price_ils set not null;

alter table services
  add constraint services_price_ils_non_negative check (price_ils >= 0);
