# Portfolio CMS

A Next.js portfolio with a private, database-backed admin dashboard. The
public site and the admin dashboard read and write the same Supabase
database — nothing on the public site is hardcoded content.

## Stack

- **Next.js 16** (App Router, Server Actions)
- **Supabase**: Postgres database, Auth, Storage
- **Tailwind CSS v4**
- **dnd-kit** for drag-and-drop reordering

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), create a new project.
2. In **Project Settings → API**, copy:
   - Project URL
   - `anon` `public` key
   - `service_role` key (keep this secret — server-only)

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in the three values from step 1. `SUPABASE_SERVICE_ROLE_KEY` must
never be prefixed with `NEXT_PUBLIC_` and is only read in server-side
code (`lib/supabase/server.ts`, `createServiceRoleClient`).

## 3. Run the database migrations

In the Supabase dashboard, open **SQL Editor** and run the files in
`supabase/migrations/` **in order**:

1. `0001_init.sql` — all tables, triggers, indexes
2. `0002_rls.sql` — Row Level Security policies (public read of published
   content only; the authenticated admin can read/write everything)
3. `0003_storage.sql` — the `media` storage bucket + its access policies
4. `0004_seed_example_content.sql` — an example "Nexura" project + case
   study, populated as real CMS rows so you have something to look at
   and edit immediately (safe to delete from `/admin`)

Alternatively, if you have the Supabase CLI linked to your project:

```bash
npx supabase db push
```

## 4. Create your admin account

There is no public sign-up — by design. Create the one admin user
directly in Supabase:

1. Dashboard → **Authentication → Users → Add user**
2. Enter your email + a password, and confirm the user (or use "Auto
   confirm user" if offered).

That's the only account that will ever be able to sign in at `/admin`.

## 5. Install and run

```bash
npm install
npm run dev
```

- Public site: `http://localhost:3000`
- Admin dashboard: `http://localhost:3000/admin` (sign in with the user
  from step 4)

## How the pieces fit together

- **Every admin write goes through a Server Action** that uses the
  request's own Supabase session — there is no separate "public" API
  that bypasses auth. Row Level Security is enforced by Postgres itself,
  not just by the app, so even a direct API call without a valid admin
  session can only ever read published content.
- **Draft vs. published** is enforced at the database level (RLS), not
  just hidden in the UI: an anonymous visitor's queries for `case_studies`,
  `projects`, `ui_shots`, and `use_cases` are automatically filtered to
  `status = 'published'`; the authenticated admin sees everything.
- **Preview reuses the public pages.** `/work/[slug]` and
  `/use-cases/[slug]` are the same routes real visitors see. When you're
  signed in as the admin and open a draft project's URL, RLS lets you see
  it (with a small "preview" banner); signed out, the same URL 404s. No
  separate preview renderer to keep in sync.
- **Case studies are block-based.** `case_study_sections` stores an
  ordered list of typed JSON blocks. `lib/case-study/blocks.ts` is the
  single source of truth for the 15 block types — the admin editor
  (`components/admin/blocks/BlockDataEditor.tsx`) and the public renderer
  (`components/case-study/BlockRenderer.tsx`) both read from it, so adding
  a new block type only means touching those two files plus the registry.
- **Media library** is a thin index (`media` table) over files in a
  public Supabase Storage bucket. Every image field in the admin
  (thumbnails, hero images, gallery images, block images) reuses the same
  `MediaPicker` component, so any uploaded file can be reused anywhere.

## Known limitations / next steps

- **Type safety on joined queries.** `types/database.ts` is hand-written
  (not generated), and the Supabase client is used untyped for queries
  with embedded joins (e.g. `select("*, thumbnail:thumbnail_media_id(...)")`)
  since accurate join typing requires real relationship metadata. Once
  you're connected to a live project, running
  `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts`
  and re-adding `<Database>` to `createClient()` in
  `lib/supabase/client.ts` / `lib/supabase/server.ts` will restore full
  end-to-end type inference including joins.
- **`middleware.ts`** uses Next's still-supported (but now
  "deprecated-in-favor-of") middleware convention. It works fine as-is;
  Next has signaled a future rename to `proxy.ts` if you want to stay
  ahead of that.
- **Rich text** in paragraph/description fields is plain text, not a
  WYSIWYG editor. That was a deliberate scope call to keep the block
  editor lightweight — swapping in a rich text field for specific blocks
  is a contained change inside `BlockDataEditor.tsx` /
  `BlockRenderer.tsx`.

## Deployment

Any Next.js host works (Vercel is the path of least resistance). Set the
same three environment variables from `.env.local` in your host's
dashboard, then deploy.
