-- OPTIONAL. Use Cases has been folded into Case Studies and the admin
-- dashboard / public site no longer reference these tables. This migration
-- permanently deletes them and any content in them.
--
-- Only run this once you're sure you don't need any existing Use Case
-- content. If you're not sure, just leave these tables in place — they're
-- harmless and unused otherwise.

drop table if exists use_case_images;
drop table if exists use_cases;
