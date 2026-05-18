# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A single-page, client-only HTML/CSS/JS sandbox (Russian-language UI: "Песочница HTML / CSS / JS"). Three static files, no build step, no dependencies, no tests. Users edit three virtual files in the left pane and see a live preview on the right.

## Running

There is no build or test tooling. Open `index.html` directly in a browser, or serve the directory statically (e.g. `python3 -m http.server`) — the latter is preferred because `srcdoc` + `sandbox` behaves more consistently when served over HTTP than from `file://`.

## Architecture

All runtime logic lives in `main.js`. The non-obvious pieces:

- **Virtual filesystem**: `index.html`, `style.css`, `main.js` are *virtual* files held in the in-memory `files` object and mirrored to `localStorage` under `sandbox::<name>` keys. The real files on disk are the host app; the strings inside `files[...]` are what the user is editing.
- **Single textarea, tab-switched**: there is one `<textarea id="editor">`. `switchTab()` writes the current editor value back into `files[activeTab]` before swapping in the new file's contents. Any code that reads "the current file" must remember that `editor.value` is authoritative only for `activeTab`; the other two files live in `files[...]`.
- **Preview assembly (`buildHTML`)**: the iframe is fed a single string via `srcdoc`. `buildHTML` takes the virtual `index.html` and inlines the other two files by **regex-replacing** `<link href="style.css">` with `<style>...</style>` and `<script src="main.js"></script>` with `<script>...</script>`. If those tags are absent it falls back to injecting before `</head>` / `</body>`, and if there is no `<html>` at all it wraps the content in a minimal template. Changes to default file names must be reflected in both the regexes and `STORAGE_KEYS`/`DEFAULT_FILES`.
- **Console bridge**: `buildHTML` also prepends a console-hook `<script>` into the iframe's `<head>` that wraps `console.{log,info,warn,error}` and the `error` / `unhandledrejection` events, forwarding them to the parent via `postMessage({ __sandboxConsole: true, ... })`. The parent listens for that flag in a `message` handler and renders lines into `#console`. Anything that changes the iframe sandbox attributes must keep `allow-scripts` and `allow-same-origin` compatible with `postMessage`.
- **Update cycle**: every `input` event saves all three files to `localStorage` and re-renders by reassigning `preview.srcdoc` (the iframe is never recreated, to avoid flicker and reload loops).
- **Reset**: the "Сбросить" button clears `localStorage` for the three keys and restores `DEFAULT_FILES`.

When modifying behavior, the load-bearing invariants are: (1) `files[activeTab]` is stale until `switchTab` or the `input` handler syncs it, (2) the preview is rebuilt from scratch on every keystroke, and (3) the console relies on the postMessage envelope `__sandboxConsole` — don't rename it on one side without the other.
