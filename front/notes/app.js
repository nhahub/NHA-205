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
			// Hide editor when no active note
			if (editorSection) editorSection.style.display = "none";
			titleEl.value = "";
			bodyEl.value = "";
			deleteBtn.disabled = true;
			return;
		}
		// Show editor when a note is active
		if (editorSection) editorSection.style.display = "flex";
		deleteBtn.disabled = false;
		titleEl.value = active.title || "";
		bodyEl.value = active.body || "";
	}

	function debounceSave() {
		saveIndicator.textContent = "Saving…";
		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			persist();
			saveIndicator.textContent = "Saved";
			setTimeout(() => (saveIndicator.textContent = ""), 1200);
		}, 300);
	}

	// Events
	addBtn.addEventListener("click", () => {
		const newNote = createNote("Untitled", "");
		notes.unshift(newNote);
		// Do not auto-open new note; keep editor hidden until selection
		// activeId remains unchanged
		renderList();
		renderEditor();
		debounceSave();
	});

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

	titleEl.addEventListener("input", (e) => {
		const active = notes.find(n => n.id === activeId);
		if (!active) return;
		active.title = e.target.value;
		active.updatedAt = Date.now();
		renderList();
		debounceSave();
	});

	bodyEl.addEventListener("input", (e) => {
		const active = notes.find(n => n.id === activeId);
		if (!active) return;
		active.body = e.target.value;
		active.updatedAt = Date.now();
		renderList();
		debounceSave();
	});

	// init
	load();
})();


