// Simple Markdown Notes (localStorage-based)
(function () {
	"use strict";

    // Server-backed mode: no localStorage persistence

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

    /** @type {string | null} */
    let activeId = null;

    function load() {
        const li = document.querySelector('#notes-list li');
        if (li) activeId = li.dataset.id || null;
        renderEditor();
    }

    // no-op in server mode
    function persist() {}

    function getNoteData(id) {
        const li = document.querySelector(`#notes-list li[data-id="${id}"]`);
        if (!li) return null;
        return {
            id,
            title: li.dataset.title || "Untitled",
            body: li.dataset.body || ""
        };
    }

    function wireListClicks() {
        if (!listEl) return;
        Array.from(listEl.querySelectorAll('li')).forEach((li) => {
            li.addEventListener('click', () => {
                activeId = li.dataset.id || null;
                Array.from(listEl.querySelectorAll('li')).forEach(x => x.classList.remove('active'));
                li.classList.add('active');
                renderEditor();
            });
        });
    }

    function renderEditor() {
        const active = activeId ? getNoteData(activeId) : null;
        if (!active) {
            if (editorSection) editorSection.style.display = "flex";
            if (titleEl) titleEl.value = "";
            if (bodyEl) bodyEl.value = "";
            const idInput = document.getElementById('note-id');
            const delId = document.getElementById('delete-id');
            if (idInput) idInput.value = "0";
            if (delId) delId.value = "0";
            if (deleteBtn) deleteBtn.disabled = true;
            renderMarkdown("");
            return;
        }
        if (editorSection) editorSection.style.display = "flex";
        if (deleteBtn) deleteBtn.disabled = false;
        if (titleEl) titleEl.value = active.title || "";
        if (bodyEl) bodyEl.value = active.body || "";
        const idInput = document.getElementById('note-id');
        const delId = document.getElementById('delete-id');
        if (idInput) idInput.value = active.id;
        if (delId) delId.value = active.id;
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

    function markDirty() {
        if (saveIndicator) saveIndicator.textContent = "Unsaved changes";
    }

	// Events
    // Add handled by server via form submit

    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            const delForm = document.getElementById('deleteForm');
            if (!delForm) return;
            delForm.requestSubmit();
        });
    }

    if (bodyEl) {
        bodyEl.addEventListener("input", (e) => {
            renderMarkdown(e.target.value);
            markDirty();
        });
    }

    if (titleEl) {
        titleEl.addEventListener("input", () => {
            markDirty();
        });
    }

    // Save button submits update form
    const updateForm = document.getElementById('updateForm');
    if (updateForm) {
        updateForm.addEventListener('submit', () => {
            if (saveIndicator) saveIndicator.textContent = "Saving…";
        });
    }

	// init
    wireListClicks();
    load();
})();
