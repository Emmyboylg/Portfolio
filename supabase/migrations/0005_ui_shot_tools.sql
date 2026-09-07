-- Add a "tools used" field to UI shots, independent of the design tags.
alter table ui_shots add column if not exists tools text[] not null default '{}';
