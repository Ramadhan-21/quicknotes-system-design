
---

### 7. `README.md` (5 Points)
*Examiner Note:* Must include title, description, how to run, links, and "What I learned" with 3 points.

```markdown
# QuickNotes System Design

## Description
QuickNotes is a scalable note-taking application. This repository contains the front-end API client (which connects to the JSONPlaceholder API) and the complete system design documentation for the backend team. 

## How to Run the API Client
1. Clone the repository.
2. Open `index.html` in any modern web browser.
3. Click "Load Notes" to fetch data from the API.
4. Use the form to create a new note, or click "Delete" on existing notes.

## Documentation Links
* [API Design](docs/api-design.md)
* [Data Model](docs/data-model.md)
* [Architecture](docs/architecture.md)

## What I Learned
1. **API Integration:** I learned how to build a reusable `fetch` wrapper to handle errors and status codes cleanly, rather than writing redundant `.then()` blocks.
2. **System Design:** I gained a deeper understanding of how to scale an application to 1 million users using caching (Redis), read replicas, and load balancers.
3. **Data Integrity:** I learned why relational databases (SQL) are better suited for structured, highly relational data compared to NoSQL, particularly regarding foreign keys and cascading deletes.