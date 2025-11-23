// Simple Markdown Notes (localStorage-based)
(function () {
	"use strict";

	const STORAGE_KEY = "codexly_notes_v1";

	/** @type {HTMLUListElement} */
	const listEl = document.getElementById("notes-list");
	/** @type {HTMLInputElement} */
	const titleEl = document.getElementById("note-title");
	/** @type {HTMLTextAreaElement} */
	const bodyEl = document.getElementById("note-body");
	/** @type {HTMLElement} */
	const editorSection = document.querySelector(".editor");
	/** @type {HTMLElement} */
	const previewEl = document.getElementById("markdown-preview");
	/** @type {HTMLButtonElement} */
	const addBtn = document.getElementById("add-note");
	/** @type {HTMLButtonElement} */
	const deleteBtn = document.getElementById("delete-note");
	/** @type {HTMLElement} */
	const saveIndicator = document.getElementById("save-indicator");

	/**
	 * @typedef {{ id:string, title:string, body:string, updatedAt:number }} Note
	 */

	/** @type {Note[]} */
	let notes = [];
	/** @type {string | null} */
	let activeId = null;
	let saveTimeout = null;

	function load() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw);
				if (Array.isArray(parsed)) {
					notes = parsed;
				}
			}
		} catch (_) {}

		// Start empty if there are no saved notes
		if (!activeId && notes[0]) activeId = notes[0].id;
		renderList();
		renderEditor();
	}

	function persist() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
	}

	function createNote(title, body) {
		return {
			id: "n_" + Math.random().toString(36).slice(2, 10),
			title: title || "Untitled",
			body: body || "",
			updatedAt: Date.now()
		};
	}

	function renderList() {
		if (!listEl) return;
		listEl.innerHTML = "";
		// sort by updated desc
		const sorted = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
		for (const note of sorted) {
			const li = document.createElement("li");
			li.dataset.id = note.id;
			if (note.id === activeId) li.classList.add("active");
			const title = document.createElement("span");
			title.className = "note-title";
			title.textContent = note.title || "Untitled";
			const snippet = document.createElement("span");
			snippet.className = "note-snippet";
			const firstLine = (note.body || "").split(/\r?\n/)[0] || "";
			snippet.textContent = firstLine.slice(0, 40);
			li.appendChild(title);
			li.appendChild(snippet);
			li.addEventListener("click", () => {
				activeId = note.id;
				renderList();
				renderEditor();
			});
			listEl.appendChild(li);
		}
	}

	function renderEditor() {
		const active = notes.find(n => n.id === activeId);
		if (!active) {
			// Show empty editor when no active note (allow creating new content)
			if (editorSection) editorSection.style.display = "flex";
			if (titleEl) titleEl.value = "";
			if (bodyEl) bodyEl.value = "";
			if (deleteBtn) deleteBtn.disabled = true;
			renderMarkdown("");
			return;
		}
		// Show editor when a note is active
		if (editorSection) editorSection.style.display = "flex";
		if (deleteBtn) deleteBtn.disabled = false;
		if (titleEl) titleEl.value = active.title || "";
		if (bodyEl) bodyEl.value = active.body || "";
		renderMarkdown(active.body || "");
	}

	/**
	 * Renders markdown text to HTML in the preview pane
	 * @param {string} markdownText - The markdown text to render
	 */
	function renderMarkdown(markdownText) {
		if (!previewEl) return;
		
		// Check if marked.js is loaded
		if (typeof marked === 'undefined') {
			previewEl.innerHTML = '<p style="color: #999; font-style: italic;">Markdown preview loading...</p>';
			return;
		}

		// marked.js options
		marked.setOptions({
			breaks: true,        // Convert line breaks to <br>
			gfm: true,           // GitHub Flavored Markdown
			headerIds: true,     // Add IDs to headers
			mangle: false        // Don't mangle email addresses
		});

		try {
			// Parse markdown to HTML
			const html = marked.parse(markdownText);
			previewEl.innerHTML = html || '<p style="color: #999; font-style: italic;">Start typing to see preview...</p>';
		} catch (error) {
			previewEl.innerHTML = '<p style="color: #d9534f;">Error rendering markdown: ' + error.message + '</p>';
		}
	}

	function debounceSave() {
		if (saveIndicator) saveIndicator.textContent = "Saving…";
		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			persist();
			if (saveIndicator) saveIndicator.textContent = "Saved";
			setTimeout(() => {
				if (saveIndicator) saveIndicator.textContent = "";
			}, 1200);
		}, 300);
	}

	// Events
	if (addBtn) {
		addBtn.addEventListener("click", () => {
			const newNote = createNote("Untitled", "");
			notes.unshift(newNote);
			// If no note is active, make the new note active
			if (!activeId) {
				activeId = newNote.id;
			}
			renderList();
			renderEditor();
			debounceSave();
		});
	}

	if (deleteBtn) {
		deleteBtn.addEventListener("click", () => {
			if (!activeId) return;
			const idx = notes.findIndex(n => n.id === activeId);
			if (idx >= 0) {
				notes.splice(idx, 1);
				activeId = notes[0] ? notes[0].id : null;
				renderList();
				renderEditor();
				debounceSave();
			}
		});
	}

	if (bodyEl) {
		bodyEl.addEventListener("input", (e) => {
			const active = notes.find(n => n.id === activeId);
			if (!active) {
				// If no active note but user is typing, create a new note
				const newNote = createNote(titleEl?.value || "Untitled", e.target.value);
				notes.unshift(newNote);
				activeId = newNote.id;
				renderList();
				renderMarkdown(e.target.value);
				debounceSave();
				return;
			}
			active.body = e.target.value;
			active.updatedAt = Date.now();
			renderList();
			renderMarkdown(e.target.value); // Update preview in real-time
			debounceSave();
		});
	}

	if (titleEl) {
		titleEl.addEventListener("input", (e) => {
			const active = notes.find(n => n.id === activeId);
			if (!active) {
				// If no active note but user is typing title, create a new note
				const newNote = createNote(e.target.value || "Untitled", bodyEl?.value || "");
				notes.unshift(newNote);
				activeId = newNote.id;
				renderList();
				debounceSave();
				return;
			}
			active.title = e.target.value;
			active.updatedAt = Date.now();
			renderList();
			debounceSave();
		});
	}

	// init
	load();
})();

