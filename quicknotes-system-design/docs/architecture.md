
---

### 6. `docs/architecture.md` (20 Points)
*Examiner Note:* Must include requirements, load estimates, text diagram, single-sentence component explanations, request flows, trade-offs, and SPOF discussion.

```markdown
# QuickNotes Architecture

## Requirements
**Functional:**
* Users can create, read, update, and delete notes.
* Users can tag notes and filter notes by tags.
* Users can authenticate and view their own notes.

**Non-Functional:**
* High Availability (99.9% uptime).
* Low latency for reading notes (< 200ms).
* Scalable to handle 1 million users.

## Load Estimates (1 Million Users)
*   **Assumptions:** 10% Daily Active Users (100,000 DAU). Each active user writes 2 notes/day and reads 50 notes/day.
*   **Writes per second (WPS):** 100,000 users * 2 notes = 200,000 writes/day. 200,000 / 86,400 seconds ≈ **2.3 WPS**.
*   **Reads per second (RPS):** 100,000 users * 50 reads = 5,000,000 reads/day. 5,000,000 / 86,400 seconds ≈ **58 RPS**.
*   **Storage per year:** 200,000 notes/day * 365 days = 73 million notes. At ~1KB per note, that is **~73 GB of text data per year**.

## Architecture Diagram

```text
[ Client ] 
    |
    v
[ DNS ] -> [ CDN ] (Static HTML/CSS/JS)
    |
    v
[ Load Balancer ]
    |-----------------------|
    v                       v
[ App Server 1 ]        [ App Server 2 ]
    |                       |
    |-----> [ Cache ] <-----|
    |      (Redis)          |
    |                       |
    |-----------------------|
                |
                v
      [ Primary Database ] ---> [ Read Replica ]
                |
                v
      [ Queue (RabbitMQ) ]
                |
                v
         [ Worker Node ]

         Component Explanations
Client: The user's browser or mobile app that initiates requests.

DNS: Translates the domain name into the Load Balancer's IP address.

CDN: Caches and serves static assets (CSS, JS) from edge locations close to the user to reduce latency.

Load Balancer: Distributes incoming traffic evenly across the app servers to prevent overload.

App Servers 1 & 2: Execute the business logic (API endpoints) and handle the flow of data.

Cache (Redis): Stores frequently accessed notes in memory to drastically reduce database read load.

Primary Database: Handles all write operations (INSERT, UPDATE, DELETE) to maintain data integrity.

Read Replica: A copy of the database that handles heavy read (SELECT) traffic to offload the primary database.

Queue & Worker: Offloads time-consuming tasks (like processing note tags, sending email notifications, or generating backups) from the main request cycle.

Request Flows
GET /notes (Read Flow):

Client requests /notes from the Load Balancer.

Load Balancer routes to an App Server.

App Server checks the Cache. If found (Cache Hit), returns data immediately.

If not found (Cache Miss), App Server queries the Read Replica Database.

App Server saves the result to the Cache and returns the response to the Client.

POST /notes (Write Flow):

Client sends a new note to the Load Balancer.

Load Balancer routes to an App Server.

App Server validates the data and writes to the Primary Database.

App Server pushes a message to the Queue (e.g., to notify followers).

App Server returns a 201 Created status to the Client.

Trade-offs and Single Points of Failure (SPOF)
Trade-offs:

Cache vs. Consistency: We use a cache to handle the high read load, but this introduces a trade-off where the cache might serve stale data for a few seconds after a note is updated. We prioritize speed (eventual consistency) over absolute real-time accuracy.

Load Balancer Complexity vs. Uptime: Routing traffic through a load balancer increases architectural complexity, but it is necessary. If we ran everything on one server, the app would crash under heavy load.

Avoiding Single Points of Failure (SPOF):
To avoid a SPOF, we have redundant App Servers (1 and 2). If App Server 1 crashes, the Load Balancer automatically routes traffic to App Server 2. The Load Balancer itself is a SPOF, but in a real cloud environment (AWS/GCP), it is managed by the provider and highly available. The Primary Database is a SPOF, but we mitigate this by using a Read Replica and setting up automatic failover so the replica can be promoted to Primary if the original fails.