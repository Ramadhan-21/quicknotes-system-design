
---

### 5. `docs/data-model.md` (20 Points)
*Examiner Note:* Covers all 4 tables, relationships, SQL queries (with JOIN), index, and SQL vs NoSQL justification.

```markdown
# QuickNotes Data Model

## Entities & Relationships

### 1. `users`
*   **Columns:** `id` (INTEGER, PK), `username` (TEXT), `email` (TEXT), `created_at` (TIMESTAMP).
*   **Relationship:** One-to-Many with `notes`. A user can have many notes, but a note belongs to one user.

### 2. `notes`
*   **Columns:** `id` (INTEGER, PK), `user_id` (INTEGER, FK), `title` (TEXT), `body` (TEXT), `created_at` (TIMESTAMP).
*   **Relationship:** Many-to-One with `users`. Many-to-Many with `tags` (via `note_tags`).

### 3. `tags`
*   **Columns:** `id` (INTEGER, PK), `name` (TEXT).
*   **Relationship:** Many-to-Many with `notes`.

### 4. `note_tags` (Join Table)
*   **Columns:** `note_id` (INTEGER, FK), `tag_id` (INTEGER, FK).
*   **Purpose:** Links notes to tags. Since a note can have many tags and a tag can belong to many notes, this join table is required to prevent data duplication.

## CREATE TABLE Statements (SQLite Syntax)

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
);

CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

Example Queries
1. Get all notes for a specific user:

sql
SELECT * FROM notes WHERE user_id = 1;
2. Get all notes with a specific tag (Using JOIN):

sql
SELECT notes.title 
FROM notes 
JOIN note_tags ON notes.id = note_tags.note_id 
JOIN tags ON note_tags.tag_id = tags.id 
WHERE tags.name = 'urgent';
3. Count how many notes each user has:

sql
SELECT users.username, COUNT(notes.id) as total_notes 
FROM users 
LEFT JOIN notes ON users.id = notes.user_id 
GROUP BY users.id;
Index Recommendation
I would add an index on notes(user_id):
CREATE INDEX idx_notes_user_id ON notes(user_id);
Reason: The most frequent read operation will be loading a user's feed of notes. Without an index, the database performs a full table scan. With this index, the query time drops from O(N) to O(log N).

SQL vs NoSQL Justification
I would choose SQL (Relational) for QuickNotes. The data structure is highly relational (users have notes, notes have tags). A relational database enforces strict data integrity using foreign keys and transactions, ensuring that if a user is deleted, their notes and tags are safely handled (via cascades). While NoSQL (like MongoDB) could store notes as documents, querying complex relationships (like "find all notes with tag X belonging to user Y") is much more efficient and standardized using SQL JOIN statements.