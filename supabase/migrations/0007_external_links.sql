-- External links to where the full case study / shot lives elsewhere
-- (Dribbble, Behance, etc).
alter table ui_shots add column if not exists external_url text;
alter table case_studies add column if not exists external_url text;
