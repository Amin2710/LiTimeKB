-- Adds the name each agent signs replies with.
--
-- Run once in the Supabase SQL editor. Templates end at "Best regards," and the
-- app appends this name underneath, so an agent who goes by something other
-- than their account name (Mahmoud signing as "Max") sets it once here.
--
-- Nothing else needs migrating: every signed-in agent already has a
-- user_preferences row, because the theme provider upserts one on mount.

alter table user_preferences
  add column if not exists signature_name text;
