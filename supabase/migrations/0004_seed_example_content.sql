-- =========================================================
-- Example content, inserted as real CMS rows so it's editable
-- from /admin from day one. Safe to delete from the dashboard.
-- =========================================================

-- Skills
insert into skills (label, display_order) values
  ('Product Design', 0),
  ('UX Design', 1),
  ('UI Design', 2),
  ('Interaction Design', 3),
  ('Prototyping', 4),
  ('Design Systems', 5);

-- Example project: Nexura
with new_project as (
  insert into projects (
    name, slug, short_description, long_description, category, year, role,
    tools, project_url, featured, status, display_order
  ) values (
    'Nexura',
    'nexura',
    'A campaign builder for Web3 marketing teams.',
    'Nexura needed a way for non-technical marketing teams to launch on-chain reward campaigns without engineering support. I led product design end to end, from research through the shipped dashboard.',
    'Product Design',
    2025,
    'Lead Product Designer',
    array['Figma', 'Design Systems', 'Prototyping'],
    'https://example.com/nexura',
    true,
    'draft',
    0
  )
  returning id
),
new_case_study as (
  insert into case_studies (project_id, title, slug, summary, status)
  select id, 'Nexura — Campaign Builder', 'nexura', 'How we designed a campaign builder Web3 marketing teams could actually use.', 'draft'
  from new_project
  returning id
)
insert into case_study_sections (case_study_id, block_type, data, display_order)
select id, block_type, data::jsonb, display_order from new_case_study, (values
  ('heading', '{"text": "Designing a campaign builder for Web3 marketers", "level": 1}', 0),
  ('paragraph', '{"text": "Nexura''s early users were engineers hand-rolling reward campaigns through internal scripts. The goal of this project was to give marketing teams a self-serve tool with the same flexibility."}', 1),
  ('statistics', '{"items": [{"label": "Time to launch a campaign", "value": "-82%"}, {"label": "Campaigns shipped in beta", "value": "140+"}]}', 2),
  ('process', '{"steps": [{"title": "Research", "description": "Interviewed 12 marketing leads at existing customers."}, {"title": "Define", "description": "Mapped the campaign lifecycle into a single flexible model."}, {"title": "Design", "description": "Prototyped a builder around reusable campaign blocks."}]}', 3),
  ('design_decision', '{"title": "One builder, many campaign types", "description": "Rather than separate flows per campaign type, every campaign is composed from the same underlying blocks — reducing the surface area users had to learn."}', 4),
  ('full_width_image', '{"media_id": null, "caption": "The campaign builder canvas."}', 5),
  ('quote', '{"text": "We went from a two week engineering ask to a ten minute setup.", "attribution": "Head of Growth, Nexura"}', 6)
) as blocks(block_type, data, display_order);

-- Example use cases
insert into use_cases (title, slug, short_description, problem, solution, related_project_id, tags, status, display_order)
select 'Designing retention journeys', 'retention-journeys',
  'Lifecycle flows that bring lapsed users back without feeling like spam.',
  'Nexura''s retention emails were templated and ignored.',
  'Designed modular journey blocks marketers could recombine per segment.',
  id, array['Lifecycle', 'Web3'], 'draft', 0
from projects where slug = 'nexura';

insert into use_cases (title, slug, short_description, problem, solution, tags, status, display_order)
values (
  'Improving marketplace discovery', 'improving-marketplace-discovery',
  'Helping buyers find relevant listings in a fast-growing marketplace.',
  'Search and browse surfaced noise instead of relevant listings.',
  'Redesigned filtering and introduced saved searches with smart defaults.',
  array['Marketplace', 'Discovery'], 'draft', 0
);

-- Example UI shot
insert into ui_shots (title, description, project_id, tags, featured, status, display_order)
select 'Nexura Campaign Builder', 'The core campaign builder canvas.', id,
  array['Dashboard', 'Campaigns', 'Web3'], true, 'draft', 0
from projects where slug = 'nexura';
