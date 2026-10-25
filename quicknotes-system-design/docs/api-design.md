# QuickNotes API Design

## Endpoints

| Method | Path | Description | Success Status |
| :--- | :--- | :--- | :--- |
| GET | `/api/notes` | List all notes for a user | 200 OK |
| GET | `/api/notes/{id}` | Get a single note by ID | 200 OK |
| POST | `/api/notes` | Create a new note | 201 Created |
| PUT | `/api/notes/{id}` | Update an existing note | 200 OK |
| DELETE | `/api/notes/{id}` | Delete a note | 204 No Content |
| GET | `/api/tags` | List all available tags | 200 OK |

### Request Example: Create a Note (POST)
```json
{
  "title": "Meeting Notes",
  "body": "Discuss Q3 goals.",
  "userId": 1,
  "tags": ["work", "urgent"]
}

// Response Example: List Notes (GET)
[
  {
    "id": 101,
    "title": "Meeting Notes",
    "body": "Discuss Q3 goals.",
    "userId": 1,
    "createdAt": "2023-10-27T10:00:00Z"
  }
]

Error Status Codes
400 Bad Request: Returned when the request body is malformed or missing required fields (e.g., missing title).

401 Unauthorized: Returned when the user is not logged in or lacks a valid authentication token.

403 Forbidden: Returned when a user tries to access or delete a note they do not own.

404 Not Found: Returned when requesting a note ID that does not exist.

500 Internal Server Error: Returned when the server encounters an unexpected condition.

Example Error Body (400 Bad Request)
json
{
  "error": "Bad Request",
  "message": "The 'title' field is required and cannot be empty.",
  "status": 400
}