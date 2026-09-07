-- =========================================================
-- Row Level Security
--
-- Model: this portfolio has exactly one admin. Admin identity is a
-- Supabase Auth user created manually (see README) — there is no
-- public sign-up. Anything hitting these tables from the browser as
-- an authenticated user is trusted as "the admin".
--
-- Public (anon) callers may only ever SELECT rows that are published.
-- Only authenticated (the admin) may INSERT / UPDATE / DELETE, or read
-- drafts.
-- =========================================================

alter table about enable row level security;
alter table site_settings enable row level security;
alter table social_links enable row level security;
alter table skills enable row level security;
alter table tools enable row level security;
alter table experience enable row level security;
alter table media enable row level security;
alter table projects enable row level security;
alter table project_gallery_images enable row level security;
alter table case_studies enable row level security;
alter table case_study_sections enable row level security;
alter table ui_shots enable row level security;
alter table use_cases enable row level security;
alter table use_case_images enable row level security;
alter table activity_log enable row level security;

-- ---- singletons: public can read, only admin can write ----
create policy "about_public_read" on about for select using (true);
create policy "about_admin_write" on about for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "site_settings_public_read" on site_settings for select using (true);
create policy "site_settings_admin_write" on site_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "social_links_public_read" on social_links for select using (true);
create policy "social_links_admin_write" on social_links for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "skills_public_read" on skills for select using (true);
create policy "skills_admin_write" on skills for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "tools_public_read" on tools for select using (true);
create policy "tools_admin_write" on tools for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "experience_public_read" on experience for select using (true);
create policy "experience_admin_write" on experience for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- media: admin only (public site never queries this table directly,
-- it just renders public storage URLs referenced by other tables) ----
create policy "media_admin_all" on media for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- projects ----
create policy "projects_public_read_published" on projects
  for select using (status = 'published' or auth.role() = 'authenticated');
create policy "projects_admin_write" on projects
  for insert with check (auth.role() = 'authenticated');
create policy "projects_admin_update" on projects
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "projects_admin_delete" on projects
  for delete using (auth.role() = 'authenticated');

create policy "project_gallery_public_read" on project_gallery_images
  for select using (
    exists (select 1 from projects p where p.id = project_id and (p.status = 'published' or auth.role() = 'authenticated'))
  );
create policy "project_gallery_admin_write" on project_gallery_images
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- case studies ----
create policy "case_studies_public_read_published" on case_studies
  for select using (status = 'published' or auth.role() = 'authenticated');
create policy "case_studies_admin_insert" on case_studies
  for insert with check (auth.role() = 'authenticated');
create policy "case_studies_admin_update" on case_studies
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "case_studies_admin_delete" on case_studies
  for delete using (auth.role() = 'authenticated');

create policy "case_study_sections_public_read" on case_study_sections
  for select using (
    exists (select 1 from case_studies cs where cs.id = case_study_id and (cs.status = 'published' or auth.role() = 'authenticated'))
  );
create policy "case_study_sections_admin_write" on case_study_sections
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- ui shots ----
create policy "ui_shots_public_read_published" on ui_shots
  for select using (status = 'published' or auth.role() = 'authenticated');
create policy "ui_shots_admin_write" on ui_shots
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- use cases ----
create policy "use_cases_public_read_published" on use_cases
  for select using (status = 'published' or auth.role() = 'authenticated');
create policy "use_cases_admin_write" on use_cases
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "use_case_images_public_read" on use_case_images
  for select using (
    exists (select 1 from use_cases uc where uc.id = use_case_id and (uc.status = 'published' or auth.role() = 'authenticated'))
  );
create policy "use_case_images_admin_write" on use_case_images
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ---- activity log: admin only ----
create policy "activity_log_admin_all" on activity_log
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
