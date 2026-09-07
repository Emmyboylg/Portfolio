-- A UI shot can now have multiple images (e.g. several screens of the
-- same design), not just one.
create table ui_shot_images (
  id uuid primary key default gen_random_uuid(),
  ui_shot_id uuid not null references ui_shots(id) on delete cascade,
  media_id uuid not null references media(id) on delete cascade,
  display_order integer not null default 0
);

alter table ui_shot_images enable row level security;

create policy "ui_shot_images_public_read" on ui_shot_images
  for select using (
    exists (select 1 from ui_shots s where s.id = ui_shot_id and (s.status = 'published' or auth.role() = 'authenticated'))
  );
create policy "ui_shot_images_admin_write" on ui_shot_images
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create index idx_ui_shot_images_shot on ui_shot_images (ui_shot_id, display_order);

-- Preserve any images already set via the old single `media_id` field.
insert into ui_shot_images (ui_shot_id, media_id, display_order)
select id, media_id, 0 from ui_shots where media_id is not null;
