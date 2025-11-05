# Community Resource Finder (AI-Powered, Automatic Data Updates)

### Author
**Olivia Leavitt**  
---

## Project Purpose
Many people don’t know where to find help — from food banks and shelters to legal aid or mental health resources.  
This project builds an **AI-powered Community Resource Finder** that automatically collects and organizes community resource data from public sources.  

Users can search in plain English (like “free diapers near Provo”), and the system will return nearby options with clear, summarized information.

## Goals
- Help users **find real, up-to-date community resources** easily.  
- **Pull data automatically** from public APIs or open data portals.  
- Use **AI (semantic search + summarization)** to interpret natural language questions.  
- Learn about **databases, background tasks, and caching.**

---

## How the Data Gets In
The app  **automatically pulls community resource data from public websites and APIs** — for example, government open data portals or nonprofit directories.

Every day (or week), the system runs a small background job that:
1. Downloads or requests the latest resource data.
2. Compares it to what’s already in the database.
3. Adds new entries or updates old ones if something changed.
4. Deletes or marks things that no longer exist.

---

## Project Overview Diagram
![System Overview](images\system-overview.png)

Description:
1. **Users** search or browse resources.  
2. **AI Layer** interprets natural language and expands queries.  
3. **API** looks up results from a **Postgres database** (with location and AI embeddings).  
4. **Data Ingestion Script** runs on a schedule to pull new data from public APIs.  
5. **Redis Cache** stores frequent queries for speed.  
6. **LLM Summarizer** writes short, easy-to-understand summaries with links to the source.

---

## ERD – Entity Relationship Diagram

![ERD](images\erd.png)

### Main Entities
- **Organization** – the group offering help (from data source)
- **Resource** – individual service or program (e.g., “Provo Food Pantry”)
- **Location** – address and map coordinates
- **EligibilityRule** – who qualifies or restrictions
- **OpenHour** – when the service is available
- **Embedding** – AI-generated vector for smarter search
---
## System Design Diagram

![System Design](images\system-design.png)

Components:
- **Frontend:** Next.js (React) web app  
- **Backend:** Node.js (for the API)  
- **Database:** PostgreSQL with PostGIS (maps) + pgvector (AI search)  
- **Cache:** Redis for quick responses  
- **Background Worker:** Pulls new data on a schedule and updates the database  
- **AI Layer:** Summarizes info and improves search relevance  

**Example flow**
1. User types “free therapy near Provo.”  
2. Query goes to backend → AI expands it (therapy, counseling, mental health).  
3. Database search (geo + vector) finds the best matches.  
4. LLM creates a short summary and sends it back to the user.
---

## UX

### What the app might look like
- A big search bar (“Find free help near you…”)
- Result cards with:
  - Service name
  - Distance
  - Hours
  - Short summary
  - Buttons: “Call,” “Directions”
- Simple map view showing resource locations
---

## 📅 Daily Goals / Milestones

| Day | Date | Goals |
|-----|------|-------|
| **1** | Nov 5 | Create GitHub repo, Docker setup, database schema |
| **2** | Nov 6 | Add sample data + basic search API (text + location) |
| **3** | Nov 7 | Add AI embeddings + smarter ranking |
| **4** | Nov 8 | Create basic web search interface |
| **5** | Nov 9 | Add automatic data pull (scheduled ingestion) from one public dataset |
| **6** | Nov 10 | Add “update detection” (replace changed or deleted resources) |
| **7** | Nov 11 | Add Redis caching for fast repeated searches |
| **8** | Nov 12 | Improve layout and accessibility |
| **9** | Nov 13 | Tune AI search and summaries |
| **10** | Nov 14 | Deploy demo, record video, finalize report |

## Technical Highlights

- **Reads/Writes:** System reads for searches, writes during data updates.  
- **Security:** No user uploads or personal data; read-only for users.  
- **Performance:** Indexing for text, vector, and location.  
- **Caching:** Redis “cache-aside” for popular queries.  
- **Scalability:** Easily add more data sources later.  

---

## Data Sources (Planned Examples)

- Local or state open data portals (CSV, JSON, or API)
- Nonprofit directories (where allowed)
- National 211 data (if available as open data)

> Each source is downloaded, cleaned, and saved into the database automatically.
---
## Why It’s Interesting
This project:
- Automatically **collects and updates real-world data** (no manual entry)
- Uses **AI + geospatial search** to return relevant results
- Shows how to build a **real stateful system** with reads and writes
- Has real social impact by helping people find assistance near them

---


