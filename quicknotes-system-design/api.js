const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// DOM Elements
const loadBtn = document.getElementById('load-btn');
const statusEl = document.getElementById('status');
const noteForm = document.getElementById('note-form');
const titleInput = document.getElementById('title-input');
const bodyInput = document.getElementById('body-input');
const submitBtn = document.getElementById('submit-btn');
const notesList = document.getElementById('notes-list');

/**
 * Reusable fetch wrapper
 */
async function request(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    // For DELETE, JSONPlaceholder returns an empty body, so we handle it safely
    if (response.status === 204 || options.method === 'DELETE') {
        return { status: response.status };
    }
    return { data: await response.json(), status: response.status };
}

/**
 * Update status message with distinct classes
 */
function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = type;
}

/**
 * Task 1: Load Notes (GET)
 */
loadBtn.addEventListener('click', async () => {
    loadBtn.disabled = true;
    setStatus("Loading notes...", "loading");
    notesList.innerHTML = ''; // Clear current list

    try {
        const { data } = await request(`${API_URL}?_limit=10`);
        
        if (data.length === 0) {
            setStatus("Loaded 0 notes from the server.", "success");
            notesList.innerHTML = '<li>No notes found. Create one!</li>';
            return;
        }

        setStatus("Loaded 10 notes from the server.", "success");
        
        data.forEach(note => {
            renderNote(note, false); // false means it's a server note
        });
    } catch (error) {
        setStatus(`Friendly Error: Could not load notes. ${error.message}`, "error");
    } finally {
        loadBtn.disabled = false;
    }
});

/**
 * Task 2: Create Notes (POST)
 */
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    // Validation
    if (!title) {
        setStatus("Validation Error: Title is required.", "error");
        return;
    }
    if (title.length > 100) {
        setStatus("Validation Error: Title must be 100 characters.", "error");
        return;
    }

    submitBtn.disabled = true;
    setStatus("Creating note...", "loading");

    try {
        const payload = { title, body, userId: 1 };
        const { data, status } = await request(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // JSONPlaceholder returns id: 101 for POSTs
        setStatus(`Note created (status ${status}, id ${data.id}).`, "success");
        
        // Add to top of list
        renderNote(data, true);
        
        // Clear form
        noteForm.reset();
    } catch (error) {
        setStatus(`Friendly Error: Could not create note. ${error.message}`, "error");
    } finally {
        submitBtn.disabled = false;
    }
});

/**
 * Task 3: Delete Notes (DELETE)
 * Code Comment Requirement: 
 * JSONPlaceholder does not actually store newly created notes in its database. 
 * When we POST a note, it returns a fake ID (e.g., 101) and a status 201. 
 * When we try to DELETE it, the API will return a 200/204 because the endpoint exists, 
 * but it doesn't actually delete anything from its end because it was never saved.
 * To handle this sensibly for the user, we optimistically remove the note from the DOM 
 * upon a successful DELETE response. We also attach a flag to locally created notes.
 */
async function deleteNote(id, element) {
    const deleteBtn = element.querySelector('.delete-btn');
    deleteBtn.disabled = true;
    deleteBtn.textContent = "Deleting...";

    try {
        await request(`${API_URL}/${id}`, { method: 'DELETE' });
        // Remove from DOM
        element.remove();
        setStatus(`Note ${id} deleted successfully.`, "success");
    } catch (error) {
        setStatus(`Friendly Error: Could not delete note ${id}. ${error.message}`, "error");
        deleteBtn.disabled = false;
        deleteBtn.textContent = "Delete";
    }
}

/**
 * Helper function to create DOM elements safely using textContent
 */
function renderNote(note, prepend = false) {
    const li = document.createElement('li');
    li.className = 'note-item';
    li.dataset.id = note.id;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'note-content';

    const h3 = document.createElement('h3');
    h3.textContent = note.title; // XSS Protection

    const p = document.createElement('p');
    p.textContent = note.body; // XSS Protection

    contentDiv.appendChild(h3);
    contentDiv.appendChild(p);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteNote(note.id, li));

    li.appendChild(contentDiv);
    li.appendChild(deleteBtn);

    if (prepend) {
        notesList.prepend(li);
    } else {
        notesList.appendChild(li);
    }
}