# OopisOS - A Browser-Based OS Simulation

![OopisOS Screenshot](https://storage.googleapis.com/gemini-prod/images/2024/5/28/a9d29241-8e89-4b6f-87d2-748984920b72.png)
*(Note: This is an example screenshot. It's recommended to replace this with a high-quality capture of the application.)*

OopisOS is a unique, single-file HTML application that simulates a desktop operating system environment entirely within a web browser. It features a retro-style terminal, a persistent hierarchical file system, user management, session handling, a built-in text editor, and a suite of command-line utilities, all powered by client-side JavaScript.

## Table of Contents

- [Introduction](#introduction)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [Exploring OopisOS](#exploring-oopisos)
- [Developer Guide](#developer-guide)
- [Scripting Guide](#scripting-guide)
- [Diagnostic Script (`diag.sh`)](#diagnostic-script-diagsh)
- [Technology Stack](#technology-stack)
- [Contributing](#contributing)
- [Future Ideas](#future-ideas)
- [License](#license)

## Introduction

Welcome to OopisOS v0.8.2! This project aims to provide an engaging and educational experience by simulating core operating system functionalities in a completely client-side environment. Whether you're a student learning OS concepts, a retro-computing enthusiast, or a developer looking for a sandboxed command-line environment, OopisOS offers a rich set of tools and features to explore.

The entire system is self-contained within a single HTML file (`OopisOS 0.8.2.html`), making it highly portable and easy to run.

## Key Features

* **100% Client-Side:** Runs entirely in the browser with no server-side dependencies.
* **Terminal Interface:** A retro-styled, interactive command-line interface.
    * Command history (Arrow Up/Down)
    * Tab completion for commands and paths.
* **Hierarchical File System:**
    * Create, manage, and navigate directories and files (`mkdir`, `ls`, `cd`, `touch`, `cat`, `cp`, `mv`, `rm`, `pwd`, `tree`, `find`).
    * Persistent storage using IndexedDB.
* **User Management:**
    * Register and login for multiple users (`register`, `login`, `logout`).
    * Each user has an isolated file system.
* **Session Management:**
    * Automatic session saving.
    * Manual session snapshots (`savestate`, `loadstate`).
    * Full session backup and restore (`backup`, `restore`).
    * System reset capability (`reset`).
* **Built-in Text Editor (`edit`):**
    * Full-screen text editor for files.
    * Supports plain text, Markdown, and HTML (with live preview for MD/HTML).
    * Keyboard shortcuts (`Ctrl+S` to save/exit, `Ctrl+O` to exit without saving, `Ctrl+P` to toggle preview).
* **Scripting Engine (`run`):**
    * Execute sequences of OopisOS commands from script files.
    * Supports comments (`#`) and basic control flow through `delay` and `check_fail`.
* **Common Utilities:** Includes `echo`, `date`, `help`, `clear`, `history`, `export` (download files), `upload` (upload local files).
* **I/O Redirection:** Supports `>` (overwrite) and `>>` (append) for command output.

## Getting Started

1.  **Download:** Obtain the `OopisOS 0.8.2.html` file.
2.  **Open:** Open this HTML file in any modern web browser (e.g., Chrome, Firefox, Edge, Safari).
3.  **Interact:** The OopisOS terminal will load. You can start typing commands immediately.

**First Commands to Try:**

```bash
help
ls
date
echo "Hello OopisOS!"
