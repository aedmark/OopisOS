# OopisOS v2.0 - A Browser-Based OS Simulation

_OopisOS v2.0: Even Oopisier, Now with Adventures and AI!_

OopisOS is a unique, fully client-side HTML application that simulates a desktop operating system environment entirely within a web browser. It features a retro-style terminal, a persistent hierarchical file system, multi-user management with passwords, session handling, an advanced built-in text editor, an AI interaction layer, an interactive text adventure game engine, and a suite of command-line utilities with support for I/O redirection, piping, background processes, and scripting.

## Table of Contents

- [Introduction](#introduction)
- [Key Features (v2.0)](#key-features-v20)
- [Getting Started](#getting-started)
- [Exploring OopisOS v2.0](#exploring-oopisos-v20)
- [User and Permissions Guide](#user-and-permissions-guide)
- [Utility Scripts: `inflate` & `diag`](#utility-scripts-inflate--diag)
- [Developer Guide](#developer-guide)
- [Technology Stack](#technology-stack)
- [Contributing](#contributing)
- [Future Ideas](#future-ideas)
- [License](#license)

## Introduction

Welcome to **OopisOS v2.0**! This project, a collaborative effort by Andrew Edmark and Gemini Pro, aims to provide an engaging and educational experience by simulating core operating system functionalities in a completely client-side environment. Whether you're a student learning OS concepts, a retro-computing enthusiast, or a developer looking for a sandboxed command-line environment, OopisOS offers a rich set of tools and features to explore.

The entire system is self-contained, primarily within an HTML file (`index.html`) and its accompanying JavaScript files: `oopisos2_0.js` (core OS framework), `editor2_0.js` (text editor module), `commexec2_0.js` (command executor and definitions), and `adventure2_0.js` (text adventure game engine).

## Key Features (v2.0)

-   **100% Client-Side:** Runs entirely in the browser with no server-side dependencies.
-   **Advanced Terminal Interface:** A retro-styled, interactive command-line interface with history, tab completion, command pipelining (`|`), command sequencing (`;`), background processes (`&`), and I/O redirection (`>` and `>>`).
-   **Persistent Hierarchical File System:** Create, manage, and navigate directories and files (`mkdir`, `ls`, `cd`, `touch`, `cat`, `cp`, `mv`, `rm`, `pwd`, `tree`, `find`). Persistence is handled via a unified IndexedDB database.
    -   `ls` supports: `-l`, `-a`, `-R`, `-r`, `-t`, `-S`, `-d`.
    -   `find` supports predicates like `-name`, `-type`, `-user`, `-perm`, `-mtime` and actions like `-print`, `-exec`, `-delete`.
-   **Multi-User System with Passwords:**
    -   Register users (`useradd`/`register`) with secure password prompts.
    -   Login/logout (`login`, `logout`) and switch users (`su`), including to a `root` user with full system privileges.
    -   `whoami`, `listusers`, `removeuser` commands for account management.
    -   Each user has a dedicated, permission-controlled home directory (`/home/<username>`).
-   **Session Management:** Automatic session saving per user, manual `savestate`/`loadstate`, full file system `backup`/`restore` via JSON, and system/home directory `reset`/`clearfs` capabilities.
-   **Enhanced Built-in Text Editor (`edit`):**
    -   Full-screen editor for plain text, Markdown, and HTML with live preview.
    -   Features include line numbers, toggleable word wrap, status bar, and a formatting toolbar.
    -   Keyboard shortcuts: `Ctrl+S` (save/exit), `Ctrl+O` (exit/confirm), `Ctrl+P` (toggle preview), `Ctrl+B`/`I` (format).
-   **AI Integration (`gemini`):** Send a prompt, with or without file content, to a Gemini AI model and display the response directly in the terminal.
-   **Interactive Text Adventure Game (`adventure`):** Launch and play text-based adventure games within a dedicated modal window. Supports loading custom adventures from JSON files.
-   **Scripting Engine (`run`):** Execute sequences of OopisOS commands from script files. Supports comments (`#`), shebangs, and argument passing (`$1`, `$@`, `$#`).
-   **Common Utilities:** `echo`, `date`, `help`, `clear`, `history`, `export`, `upload`, `chmod`, `chown`, `grep` (with `-i`, `-v`, `-n`, `-c`, `-R`), and `printscreen`.

## Getting Started

1.  **Download:** Obtain `index.html` and the required JavaScript files (`oopisos2_0.js`, `editor2_0.js`, `commexec2_0.js`, `adventure2_0.js`).
2.  **Open:** Open `index.html` in any modern web browser.
3.  **Interact:** The OopisOS terminal will load. You are logged in as "Guest". Start typing commands.

**First Commands to Try:**

```bash
# Explore the environment
help
ls -l
whoami

# Create a file
echo "Hello OopisOS v2.0!" > /greeting.txt
cat /greeting.txt

# Create a new user with a password
register myuser
# (Follow password prompts)
logout
login myuser

# Create a project and an executable script
mkdir my_projects ; cd my_projects
edit my_script.sh
# Inside editor: type 'echo "My script works on $@" ; adventure', then Ctrl+S
chmod 70 my_script.sh
run ./my_script.sh "OopisOS v2.0"

# Interact with the AI
gemini /greeting.txt "Is this a friendly greeting?"
```

## Exploring OopisOS v2.0

OopisOS v2.0 offers a rich environment. Here are some areas to explore:

-   **File System:** Create directories (`mkdir -p my_folder/sub_folder`), navigate (`cd my_folder`), create files (`touch my_file.txt`), and edit them (`edit my_file.txt`). Try `tree -L 2` to see the structure. Use `find . -name "*.txt"` to locate text files.
-   **User Accounts:** Register a new user (`register your_username`), log out (`logout`), and log back in (`login your_username`). Switch to the superuser with `su root` to perform administrative tasks like `chown your_username /some_file`.
-   **Session Persistence:** Use `savestate` to save your current work, then make changes or `reset`, and use `loadstate` to restore your session. Use `backup` to get a downloadable JSON of the filesystem.
-   **Editor Features:** Open a `.md` file with `edit test.md`. Try toggling word wrap, changing view modes (`Ctrl+P`), using the formatting toolbar, and exporting the preview.
-   **AI Fun:** Create a file with `edit` or `echo`, then use the `gemini` command to ask questions about it. Example: `gemini /path/to/file.txt "Summarize this."`
-   **Adventure Time:** Type `adventure` to play the built-in game.
-   **Piping and Sequencing:** Try `ls -l / > file_list.txt ; cat file_list.txt | grep home`.

## User and Permissions Guide

OopisOS features a multi-user environment with a simplified Unix-like permission system.

-   **Default Users:**
    -   `Guest`: The initial user. Has no password.
    -   `root`: The "superuser." Can bypass all file permission checks. Has no password by default.
    -   `userDiag`: A special user for testing with the password `pantload`.
-   **User Creation:** `useradd <username>` (or `register`) prompts for a password. Providing an empty password creates a password-less account.
-   **Authentication:** `login` and `su` will prompt for a password if the target account has one. The password can also be supplied as a second argument (e.g., `login userDiag pantload`) for use in scripts.
-   **Permissions (`chmod`):** The `chmod` command uses a two-digit octal mode. The first digit is for the owner, the second for others. Each is a sum of Read (4), Write (2), and Execute (1). Example: `chmod 75 script.sh` gives `rwx` to the owner and `r-x` to others.
-   **Ownership (`chown`):** Only the file's owner or the `root` user can change its ownership with `chown <new_owner> <path>`.

## Utility Scripts: `inflate` & `diag`

To help you get started and to ensure system stability, OopisOS includes two powerful utility scripts.

-   `inflate2_0.sh`: Run this script (`run /inflate2_0.sh`) to populate the file system with a diverse set of example files and directories. This is perfect for creating a "showcase" environment to test commands like `find`, `grep`, `tree`, `gemini`, and `adventure` without having to create content manually.
-   `diag2_0.sh`: This is a comprehensive diagnostic test suite (`run /diag2_0.sh`) that verifies the core functionality of most commands, including their flags, error handling, and interaction with the permission system. It's an essential tool for developers to check for regressions after making changes to the codebase.

## Developer Guide

-   **Source Code:** The logic is split into four main files: `oopisos2_0.js` (core), `editor2_0.js` (editor), `commexec2_0.js` (commands), and `adventure2_0.js` (game).
-   **Core Architecture:** OopisOS uses a modular JavaScript design with "Manager" objects (e.g., `CommandExecutor`, `FileSystemManager`, `UserManager`).
-   **FileSystemManager:** Manages a **unified file system** in a single IndexedDB object store. User home directories are created under `/home/`. Permissions are checked against the current user's name (`root` bypasses all checks).

**Adding a New Command:**

1.  Locate the `commands` object within the `CommandExecutor` IIFE in `commexec2_0.js`.
2.  Add a new entry with your command name.
3.  Define an `async handler(args, options)` function.
4.  Provide `description` and `helpText` strings.

## Technology Stack

-   **Frontend & Logic:** HTML5, CSS3 (Tailwind CSS), Vanilla JavaScript (ES6+).
-   **Markdown Parsing:** Marked.js.
-   **AI Interaction:** Google Gemini API.
-   **Persistent Storage:** IndexedDB (for the file system) and LocalStorage (for session states, user list, editor preferences).

## Contributing

Contributions are welcome! Fork the repository, create a new branch, make your changes, and submit a pull request with a clear description. Please test your changes and update documentation as needed.

## Future Ideas

-   Basic networking simulation (`ping`, `fetch`).
-   Advanced scripting (variables, loops, if/else).
-   A simple GUI or windowing system.
-   More granular permissions model (e.g., group permissions).

## License

This code was designed with the help of Google Gemini.

Copyright (c) 2025 Andrew Edmark and Gemini. (MIT Licensed)

[https://github.com/aedmark/OopisOS](https://github.com/aedmark/OopisOS)
