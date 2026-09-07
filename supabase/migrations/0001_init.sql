-- =========================================================
-- Portfolio CMS — initial schema
-- =========================================================
create extension if not exists "pgcrypto";

create type content_status as enum ('draft', 'published');

-- ---------------------------------------------------------
-- SITE-WIDE SINGLETONS
-- ---------------------------------------------------------

-- One row only: the "About" content
create table about (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  role text not null default '',
  location text not null default '',
  bio text not null default '',
  profile_image_path text,
  availability_status text not null default 'Open to work',
  email text not null default '',
  updated_at timestamptz not null default now()
);

-- One row only: global site settings / SEO defaults
create table site_settings (
  id uuid primary key default gen_random_uuid(),
  site_title text not null default '',
  site_description text not null default '',
  default_og_image_path text,
  updated_at timestamptz not null default now()
);

-- One row only: contact / social links
create table social_links (
  id uuid primary key default gen_random_uuid(),
  email text not null default '',
  linkedin_url text,
  x_url text,
  other_links jsonb not null default '[]', -- [{ "label": "Dribbble", "url": "..." }]
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- SKILLS (reorderable list, belongs to About)
-- ---------------------------------------------------------
create table skills (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table tools (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- EXPERIENCE (work history, shown on About)
-- ---------------------------------------------------------
create table experience (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role text not null,
  start_date date,
  end_date date, -- null = current
  description text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- MEDIA LIBRARY
-- Files themselves live in Supabase Storage; this table is
-- the searchable/reusable index over them.
-- ---------------------------------------------------------
create table media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,   -- path inside the "media" bucket
  file_name text not null,
  mime_type text,
  width integer,
  height integer,
  size_bytes bigint,
  alt_text text,
  kind text not null default 'image',  -- 'image' | 'video'
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- PROJECTS
-- ---------------------------------------------------------
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text not null default '',
  long_description text not null default '',
  category text,
  year integer,
  role text,
  tools text[] not null default '{}',
  thumbnail_media_id uuid references media(id) on delete set null,
  hero_media_id uuid references media(id) on delete set null,
  project_url text,
  featured boolean not null default false,
  status content_status not null default 'draft',
  display_order integer not null default 0,
  seo_title text,
  seo_description text,
  seo_og_media_id uuid references media(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table project_gallery_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  media_id uuid not null references media(id) on delete cascade,
  display_order integer not null default 0
);

-- ---------------------------------------------------------
-- CASE STUDIES  (a project can have one or more case studies)
-- ---------------------------------------------------------
create table case_studies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete set null,
  title text not null,
  slug text not null unique,
  summary text not null default '',
  cover_media_id uuid references media(id) on delete set null,
  status content_status not null default 'draft',
  seo_title text,
  seo_description text,
  seo_og_media_id uuid references media(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Flexible content blocks. `data` shape depends on `block_type`;
-- validated at the application layer (see lib/case-study/blocks.ts).
create table case_study_sections (
  id uuid primary key default gen_random_uuid(),
  case_study_id uuid not null references case_studies(id) on delete cascade,
  block_type text not null, -- heading | paragraph | image | image_gallery | video |
                             -- quote | statistics | process | timeline | feature |
                             -- before_after | design_decision | text_image |
                             -- full_width_image | two_column
  data jsonb not null default '{}',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- UI SHOTS
-- ---------------------------------------------------------
create table ui_shots (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  project_id uuid references projects(id) on delete set null,
  media_id uuid references media(id) on delete set null,
  tags text[] not null default '{}',
  featured boolean not null default false,
  status content_status not null default 'draft',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- USE CASES  (independent of projects, may optionally relate)
-- ---------------------------------------------------------
create table use_cases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text not null default '',
  problem text not null default '',
  solution text not null default '',
  related_project_id uuid references projects(id) on delete set null,
  tags text[] not null default '{}',
  status content_status not null default 'draft',
  display_order integer not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table use_case_images (
  id uuid primary key default gen_random_uuid(),
  use_case_id uuid not null references use_cases(id) on delete cascade,
  media_id uuid not null references media(id) on delete cascade,
  display_order integer not null default 0
);

-- ---------------------------------------------------------
-- ACTIVITY LOG  (feeds the "Recent activity" dashboard widget)
-- ---------------------------------------------------------
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  entity_type text,   -- 'project' | 'case_study' | 'ui_shot' | 'use_case' | ...
  entity_id uuid,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_projects_updated_at before update on projects
  for each row execute function set_updated_at();
create trigger trg_case_studies_updated_at before update on case_studies
  for each row execute function set_updated_at();
create trigger trg_case_study_sections_updated_at before update on case_study_sections
  for each row execute function set_updated_at();
create trigger trg_ui_shots_updated_at before update on ui_shots
  for each row execute function set_updated_at();
create trigger trg_use_cases_updated_at before update on use_cases
  for each row execute function set_updated_at();
create trigger trg_about_updated_at before update on about
  for each row execute function set_updated_at();
create trigger trg_site_settings_updated_at before update on site_settings
  for each row execute function set_updated_at();
create trigger trg_social_links_updated_at before update on social_links
  for each row execute function set_updated_at();

-- Seed the singleton rows so the admin app always has one record to edit.
insert into about (name, role) values ('Your Name', 'Product Designer');
insert into site_settings (site_title, site_description) values ('Portfolio', '');
insert into social_links (email) values ('');

-- Helpful indexes
create index idx_projects_status_order on projects (status, display_order);
create index idx_case_studies_project on case_studies (project_id);
create index idx_case_study_sections_cs on case_study_sections (case_study_id, display_order);
create index idx_ui_shots_project on ui_shots (project_id);
create index idx_ui_shots_status_order on ui_shots (status, display_order);
create index idx_use_cases_status_order on use_cases (status, display_order);
create index idx_activity_log_created on activity_log (created_at desc);
