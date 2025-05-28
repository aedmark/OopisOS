# OopisOS - A Browser-Based OS Simulation

![OopisOS Screenshot](https://i.imgur.com/Seol95t.png)

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
```

The help command will provide a list of all available commands and their basic usage. Type help <command_name> for more details on a specific command.

## Exploring OopisOS
OopisOS offers a rich environment. Here are some areas to explore:

**File System:** Create directories (mkdir my_folder), navigate into them (cd my_folder), create files (touch my_file.txt), and edit them (edit my_file.txt).
**User Accounts:** Try registering a new user (register your_username), logging out (logout), and logging back in (login your_username). Notice how your file system is unique to your user.
**Session Persistence:** Use savestate to save your current work, then make some changes or reset, and use loadstate to restore your previous session.
**Scripting:** Create a simple script file using edit (e.g., edit test.sh), add some commands like echo "Script running!" and ls /, save it, and then run it with run test.sh.

## Developer Guide
Interested in understanding or modifying OopisOS?

**Source Code:** All the logic is contained within the <script> tags in the OopisOS 0.8.2.html file.
**Core Architecture:** OopisOS is built with a modular JavaScript design using "Manager" objects (e.g., CommandExecutor, FileSystemManager, UserManager).
**CommandExecutor:** Contains the commands object, which maps command names to their handler functions. This is the primary place to add new commands or modify existing ones.
**FileSystemManager:** Handles all file operations and persistence to IndexedDB.

## Adding a New Command:
-Locate the commands object within CommandExecutor.
-Add a new entry with your command name as the key.
-Define a handler: async (args, cmdOptions) => { ... } function for its logic.
-Provide summary, usage, details, and examples metadata for the help system.

##Scripting Guide
Automate tasks in OopisOS by writing scripts.

**Creating Scripts:** Use edit your_script_name.sh.
**Format:** Plain text files, one command per line. Lines starting with # are comments.
**Running Scripts:** run your_script_name.sh.

## Key Scripting Commands:
**echo "message":** Display output.
**delay <milliseconds>:** Pause execution.
**Redirection:** > and >> (e.g., ls > file_list.txt).
**check_fail "<command_string>":** Executes the quoted command. The script continues if the command fails (useful for testing error conditions) and halts if the command succeeds unexpectedly.

## Diagnostic Script (diag.sh)
OopisOS comes with a comprehensive diagnostic script, diag.sh (available in the original source files). This script is designed to:
-Rigorously test core filesystem operations.
-Verify command parsing and execution, including redirection.
-Test error handling using the check_fail command.
-Provide a detailed log of its operations.
-To run it (assuming you have created diag.sh within OopisOS, e.g., at /etc/diag.sh):

```Bash
run /etc/diag.sh
```

This script is an excellent example of advanced scripting within OopisOS and serves as a benchmark for system stability.

## Technology Stack
**Frontend & Logic:** HTML5, CSS3 (Tailwind CSS + Custom CSS for theming), JavaScript (ES6+)
**Data Visualization (in guide/reports):** Chart.js
**Markdown Parsing (in editor):** Marked.js
**Persistent Storage**
**IndexedDB:** For user file systems.
**LocalStorage:** For user credentials and session states.

## Contributing
Contributions to OopisOS are welcome! If you'd like to contribute, please consider the following:
-Fork the repository.
-Create a new branch for your feature or bug fix (git checkout -b feature/your-new-feature).
-Make your changes. Ensure you test them thoroughly, perhaps by writing new test cases for diag.sh or a similar script.
-Update documentation if you're adding new commands or significantly changing behavior.
-Submit a pull request with a clear description of your changes.

### Areas for potential contribution:
-Adding new commands or utilities.
-Enhancing existing command functionalities.
-Improving the UI/UX of the terminal or editor.
-Expanding scripting capabilities (e.g., variables, basic control flow).
-Bug fixes and performance optimizations.

## Future Ideas
-Basic networking simulation (e.g., ping, fetch-like commands).
-More advanced scripting features (variables, simple loops, if/else).
-A very simple graphical element or windowing system (ambitious!).
-Support for more file types in the editor or for execution.
-Enhanced tab-completion intelligence.

## License
This project is distributed under the MIT License. See LICENSE for more information.
