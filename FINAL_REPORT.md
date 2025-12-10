# Community Resource Finder — Final Report

- Repo: https://github.com/livy9/community_resource_finder
- Local demo: `npm install && npm run dev` (requires `.env` with Supabase keys)
- Demo video/GIF: [databaseprojectdemo.mp4](./databaseprojectdemo.mp4)
- Class channel post (ready to paste):  
  “Community Resource Finder — React + Supabase app to look up food assistance in Utah by city (pantries, vouchers, hot meals). It shows contact info, hours, eligibility, and map links, and includes an embeddings table ready for AI/semantic search.  
  GitHub: https://github.com/livy9/community_resource_finder  
  Demo: databaseprojectdemo.mp4  
  I wanted something with local impact; I learned Supabase RLS, data modeling, and shaping joined data for a clean UI. Feedback welcome—especially on more data sources to ingest next.”  
- Sharing permission: yes, share

## Summary
- React + Supabase app that lists food assistance options across Utah.
- Search by city to see nearby pantries, vouchers, and hot meals with contact info, hours, and eligibility.

## Architecture & Flow
- Frontend: Vite + React + Tailwind. City search feeds `useResources`, results render in `ResourceCard`.
- Backend: Supabase Postgres with tables for organizations, resources, locations, eligibility, hours, embeddings (`supabase/migrations`).
- Data ingest: seed SQL (`supabase/seeds/food_seed.sql`) writes sample data; app reads via anon key.
- Fallback: local sample data when Supabase isn’t reachable.

```
[User] -> [SearchBar] -> [useResources]
            |-- live --> Supabase (resources + joins)
            |-- fallback --> Local sample data
                          -> [ResourceCard list]
```

## Requirements Checklist
- Reads/writes: seed SQL writes; app reads under RLS policies; schema in migrations.
- Effort: full schema, typed client, filter UI, fallback mode, embeddings table for future AI search.
- Public repo: this repo with `FINAL_REPORT.md`.
- Demo asset: databaseprojectdemo.mp4.
- Class post: see text above.

## What I Learned
1) Modeling a small domain with normalized tables and RLS in Supabase.  
2) Making the UI resilient with demo data and clear live/demo indicators.  
3) Shaping joined data (eligibility, hours) cleanly for the frontend.  
4) Planning semantic search with an embeddings table.

## AI Integration
- `embeddings` table enables future semantic search; ingestion can store vectors (e.g., text-embedding-3-small).  
- AI help used for copy, UX wording, and code refactors.

## Data Model
- `organizations` -> `resources` -> `locations`, `eligibility_rules`, `open_hours`, `embeddings`.
- RLS: public read policies; writes restricted to service roles/ingestion.
- Indexes: text search on names/descriptions, category, is_active, city, coordinates, hours day-of-week.

## Scaling / Reliability
- Reads: indexed city/category lookups, 20-row limit for speed.
- Writes: idempotent seeds (ON CONFLICT) to avoid duplicates.
- Failover: automatic fallback to local data if live API/env vars fail.
- Concurrency/auth: RLS blocks public writes; reads are multi-user safe.

## How to Run
1) `npm install`
2) Add `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3) `npm run dev`
4) `npm run build`
