# OopisOS - A Browser-Based OS Simulation

![OopisOS Screenshot](https://i.imgur.com/0mg7LZs.png) OopisOS is a unique, single-file HTML application that simulates a desktop operating system environment entirely within a web browser. It features a retro-style terminal, a persistent hierarchical file system, user management, session handling, an advanced built-in text editor, and a suite of command-line utilities with support for I/O redirection, piping, and background processes, all powered by client-side JavaScript.

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

Welcome to **OopisOS v1.0.5.3**! This project aims to provide an engaging and educational experience by simulating core operating system functionalities in a completely client-side environment. Whether you're a student learning OS concepts, a retro-computing enthusiast, or a developer looking for a sandboxed command-line environment, OopisOS offers a rich set of tools and features to explore.

The entire system is self-contained within a single HTML file (e.g., `OopisOS 1.0.5.3.html`), making it highly portable and easy to run.

## Key Features

* **100% Client-Side:** Runs entirely in the browser with no server-side dependencies.
* **Advanced Terminal Interface:** A retro-styled, interactive command-line interface.
    * Command history (Arrow Up/Down).
    * Tab completion for commands and file/directory paths.
    * **Command Pipelining (`|`):** Chain commands, sending the output of one to the input of the next.
    * **Background Processes (`&`):** Run commands in the background.
    * **I/O Redirection:** Supports `>` (overwrite) and `>>` (append) for command output.
    * Refined prompt displaying `user@OopisOs:path>`.
* **Hierarchical File System:**
    * Create, manage, and navigate directories and files (`mkdir`, `ls`, `cd`, `touch`, `cat`, `cp`, `mv`, `rm`, `pwd`, `tree`, `find`).
    * Persistent storage using IndexedDB for file systems.
    * `ls` command now supports `-l` (long format with permissions, owner, size, date) and `-a` (all files).
    * `mkdir` command supports a `-p` (parents) flag to create parent directories as needed.
    * `tree` command supports `-L <level>` (depth limit) and `-d` (directories only) flags.
    * `rm` command supports `-R` (recursive alias) and `-i` (interactive) flags, in addition to `-r` and `-f`.
    * `cp` command supports `-r` (recursive) and `-f` (force) flags, and correctly handles multiple sources to a directory.
* **User Management (Passwordless):**
    * Register and login for multiple users (`useradd` or `register` alias, `login`, `logout`).
    * **New `removeuser` command** to delete users and their data.
    * **New `whoami` command** to display the current user.
    * **New `su` command** as an alias for `login`.
    * Each user has an isolated file system.
    * Usernames have defined length constraints and reserved names.
* **Session Management:**
    * Automatic session saving per user.
    * Manual session snapshots (`savestate`, `loadstate`).
    * Full session backup (`backup`) and restore (`restore`) using JSON files.
    * System reset capability (`reset`) to clear all users, data, and settings.
    * **New `savefs` command** to manually trigger a save of the current user's file system.
    * **New `shutdown` and `reboot` commands** for session control.
* **Enhanced Built-in Text Editor (`edit`):**
    * Full-screen text editor for files.
    * Supports plain text, Markdown, and HTML (with live preview for MD/HTML).
    * **Line numbers** in the gutter.
    * **Word wrap** (toggleable and setting persists via LocalStorage).
    * **Export Preview as HTML** functionality.
    * **Status bar** displaying line count, word count, character count, and cursor position (Ln, Col).
    * Configurable view modes for previewable files (Split, Edit Only, Preview Only).
    * Tab key now inserts a tab character.
    * Keyboard shortcuts: `Ctrl+S` to save/exit, `Ctrl+O` to exit without saving (with confirmation for unsaved changes), `Ctrl+P` to toggle preview/view mode.
* **Improved Scripting Engine (`run`):**
    * Execute sequences of OopisOS commands from script files.
    * Supports comments (`#`) - robustly handles comments at end of lines or on their own lines, ignoring quoted content.
    * Handles shebang (`#!`) at the beginning of scripts.
    * **Script arguments:** Access passed arguments using `$1`, `$2`, ..., `$@` (all arguments), and `$#` (number of arguments).
    * Basic control flow with `delay` and `check_fail`.
* **Common Utilities:** Includes `echo`, `date`, `help`, `clear`, `history` (with `-c` to clear), `export` (download files), `upload` (upload local files to current or specified directory).
    * `upload` command specifies allowed file types (.txt, .md, .html, .sh) and prompts for overwrite.
    * `find` command for searching files/directories with `-name` pattern and `-type <f|d>` filters.

## Getting Started

1.  **Download:** Obtain the `OopisOS 1.0.5.3.html` file.
2.  **Open:** Open this HTML file in any modern web browser (e.g., Chrome, Firefox, Edge, Safari).
3.  **Interact:** The OopisOS terminal will load. You can start typing commands immediately.
    * Note: User accounts are now **passwordless**.

**First Commands to Try:**

```bash
help
ls -l
date
echo "Hello OopisOS v1.0.5.3!"
whoami
useradd myuser
login myuser
mkdir my_projects
cd my_projects
edit my_script.sh
```

The `help` command will provide a list of all available commands and their basic usage. Type `help <command_name>` for more details on a specific command.

## Exploring OopisOS

OopisOS offers a rich environment. Here are some areas to explore:

* **File System:** Create directories (`mkdir -p my_folder/sub_folder`), navigate (`cd my_folder`), create files (`touch my_file.txt`), and edit them (`edit my_file.txt`). Try `tree -L 2` to see the structure.
* **User Accounts:** Register a new user (`useradd your_username`), log out (`logout`), and log back in (`login your_username`). Notice how your file system is unique. Try `removeuser some_other_user` after creating one.
* **Session Persistence:** Use `savestate` to save your current work, then make changes or `reset`, and use `loadstate` to restore your previous session. Use `backup` to get a downloadable JSON of your filesystem.
* **Editor Features:** Open a `.md` file with `edit test.md`. Try toggling word wrap, changing view modes (Ctrl+P), and exporting the preview. Note the status bar.
* **Piping and Redirection:** Try `ls -l | cat > file_list.txt` or `echo "Hello" >> some_file.txt`.
* **Background Processes:** Execute a long-running script or command with `&` at the end, e.g., `run my_long_script.sh &`.
* **Scripting:** Create a simple script file (e.g., `edit test.sh`) with:
    ```sh
    #!/bin/oopisos_shell
    # My test script
    echo "Script running with $# arguments: $@"
    echo "First argument: $1"
    ls -l /
    delay 1000
    echo "Script finished."
    ```
    Save it, and then run it with `run test.sh arg1 "second arg"`.

## Developer Guide

Interested in understanding or modifying OopisOS?

* **Source Code:** All the logic is contained within the `<script>` tags in the `OopisOS 1.0.5.3.html` file.
* **Core Architecture:** OopisOS is built with a modular JavaScript design using "Manager" objects (e.g., `CommandExecutor`, `FileSystemManager`, `UserManager`, `EditorManager`).
* **CommandExecutor:** Contains the `commands` object, which maps command names to their handler functions. This is the primary place to add new commands or modify existing ones. It now includes a Lexer and Parser for more robust command line processing, including pipes and background operators.
* **FileSystemManager:** Handles all file operations and persistence to IndexedDB.
* **EditorManager:** Manages the enhanced text editor state and functionalities.

**Adding a New Command:**
* Locate the `commands` object within `CommandExecutor`.
* Add a new entry with your command name as the key.
* Define a handler: `async (args, cmdOptions) => { ... }` function for its logic. `cmdOptions` includes `isInteractive`, `explicitForce`, and `stdinContent`.
* Provide `description` and `helpText` metadata for the help system.

## Scripting Guide

Automate tasks in OopisOS by writing scripts.

* **Creating Scripts:** Use `edit your_script_name.sh`.
* **Format:** Plain text files, one command per line.
    * Lines starting with `#` (unless within quotes) are comments.
    * Scripts can start with a shebang line (e.g., `#!/bin/oopisos_shell`), which will be ignored.
* **Running Scripts:** `run your_script_name.sh [arg1] [arg2] ...`

**Key Scripting Features & Commands:**
* **Arguments:**
    * `$1`, `$2`, ...: Access positional arguments passed to the script.
    * `$@`: Represents all arguments passed to the script as a single string, space-separated.
    * `$#`: Represents the number of arguments passed to the script.
* **`echo "message"`:** Display output.
* **`delay <milliseconds>`:** Pause execution.
* **Redirection:** `>` and `>>` (e.g., `ls > file_list.txt`).
* **Piping:** `|` (e.g., `cat myfile.txt | find -name "pattern"`).
* **`check_fail "<command_string>"`:** Executes the quoted command. The script continues if the command fails (useful for testing error conditions) and halts if the command succeeds unexpectedly.

## Diagnostic Script (`diag.sh`)

OopisOS comes with a comprehensive diagnostic script, `diag.sh` (available in the original source files). This script is designed to:
* Rigorously test core filesystem operations.
* Verify command parsing and execution, including redirection and potentially piping.
* Test error handling using the `check_fail` command.
* Provide a detailed log of its operations.
* To run it (assuming you have created `diag.sh` within OopisOS, e.g., at `/etc/diag.sh`):

```bash
run /etc/diag.sh
```

This script is an excellent example of advanced scripting within OopisOS and serves as a benchmark for system stability.

## Technology Stack

* **Frontend & Logic:** HTML5, CSS3 (Tailwind CSS + Custom CSS for theming), JavaScript (ES6+)
* **Markdown Parsing (in editor):** Marked.js
* **Persistent Storage:**
    * **IndexedDB:** For user file systems.
    * **LocalStorage:** For user credentials (though now passwordless), session states, and editor word wrap preference.

## Contributing

Contributions to OopisOS are welcome! If you'd like to contribute, please consider the following:
* Fork the repository (if applicable, or simply modify your local HTML file).
* Create a new branch for your feature or bug fix (if using Git).
* Make your changes. Ensure you test them thoroughly, perhaps by writing new test cases for `diag.sh` or a similar script.
* Update documentation (like this README) if you're adding new commands or significantly changing behavior.
* Submit a pull request (if using Git) with a clear description of your changes.

**Areas for potential contribution:**
* Adding new commands or utilities.
* Enhancing existing command functionalities.
* Improving the UI/UX of the terminal or editor.
* Expanding scripting capabilities (e.g., variables, more advanced control flow like if/else, loops).
* Bug fixes and performance optimizations.

## Future Ideas

* Basic networking simulation (e.g., `ping`, `fetch`-like commands).
* More advanced scripting features (variables, simple loops, if/else).
* A very simple graphical element or windowing system (ambitious!).
* Support for more file types in the editor or for execution.
* Enhanced tab-completion intelligence.
* Permissions model for files/directories.

## License
This code was designed with the help of Google Gemini 2.5 Pro.

This project is distributed under the MIT License. See `LICENSE` file for more information (if a separate LICENSE file exists, otherwise assume MIT License from context).
