# OopisOS - A Browser-Based OS Simulation

![OopisOS Screenshot](https://i.imgur.com/0mg7LZs.png) 
*OopisOS: The little browser OS that could... and does!*

OopisOS is a unique, single-file HTML application that simulates a desktop operating system environment entirely within a web browser. It features a retro-style terminal, a persistent hierarchical file system, user management, session handling, an advanced built-in text editor, and a suite of command-line utilities with support for I/O redirection, piping, and background processes, all powered by client-side JavaScript.

## Table of Contents

- [Introduction](#introduction)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [Exploring OopisOS](#exploring-oopisos)
- [User Guide Highlights](#user-guide-highlights)
- [Developer Guide](#developer-guide)
- [Scripting Guide](#scripting-guide)
- [Utility Scripts](#utility-scripts)
- [Technology Stack](#technology-stack)
- [Contributing](#contributing)
- [Future Ideas](#future-ideas)
- [License](#license)

## Introduction

Welcome to **OopisOS v1.5.1**! This project, a collaborative effort by Andrew Edmark and Gemini Pro 2.5, aims to provide an engaging and educational experience by simulating core operating system functionalities in a completely client-side environment. Whether you're a student learning OS concepts, a retro-computing enthusiast, or a developer looking for a sandboxed command-line environment, OopisOS offers a rich set of tools and features to explore.

The entire system is self-contained within a single HTML file (e.g., `OopisOSv1_5_1.html`), making it highly portable and easy to run.

## Key Features

* **100% Client-Side:** Runs entirely in the browser with no server-side dependencies.
* **Advanced Terminal Interface:** A retro-styled, interactive command-line interface.
    * Command history (Arrow Up/Down).
    * Tab completion for commands and file/directory paths.
    * **Command Pipelining (`|`):** Chain commands, sending the output of one to the input of the next.
    * **Background Processes (`&`):** Run commands in the background.
    * **I/O Redirection:** Supports `>` (overwrite) and `>>` (append) for command output.
    * Customizable prompt displaying `user@OopisOs:path>`.
* **Hierarchical File System (`FileSystemManager`):**
    * Create, manage, and navigate directories and files (`mkdir`, `ls`, `cd`, `touch`, `cat`, `cp`, `mv`, `rm`, `pwd`, `tree`, `find`).
    * Persistent storage using IndexedDB for file systems per user.
    * `ls` command supports: `-l` (long format with permissions, owner, size, date), `-a` (all files), `-R` (recursive), `-r` (reverse sort), `-t` (sort by time), `-S` (sort by size), `-X` (sort by extension), and `-U` (no sort).
    * `mkdir` command supports a `-p` (parents) flag to create parent directories as needed.
    * `tree` command supports `-L <level>` (depth limit) and `-d` (directories only) flags.
    * `rm` command supports `-r`/`-R` (recursive), `-f` (force), and `-i` (interactive) flags.
    * `cp` command supports `-r`/`-R` (recursive), `-f` (force), `-p` (preserve metadata), and `-i` (interactive) flags, and correctly handles multiple sources to a directory.
    * `touch` command supports `-c` (no-create), `-d DATETIME_STRING` (set date string), and `-t STAMP` (set specific timestamp using `[[CC]YY]MMDDhhmm[.ss]` format).
    * `find` command with predicates like `-name PATTERN`, `-type [f|d]`, `-user UNAME`, `-perm MODE` (2-digit octal), `-mtime N` (days ago), and actions like `-print` (default), `-exec CMD {} \;`, and `-delete`.
* **User Management (`UserManager` - Passwordless):**
    * Register and login for multiple users (`useradd` or its alias `register`, `login`, `logout`).
    * `removeuser` command to delete users and their data.
    * `whoami` command to display the current user.
    * `listusers` command to show all registered users.
    * Each user has an isolated file system.
    * Usernames have defined length constraints and reserved names.
* **Session Management (`SessionManager`):**
    * Automatic session saving per user (current path, terminal output, history, current input).
    * Manual session snapshots (`savestate`, `loadstate`) including full file system state.
    * Full session backup to a downloadable JSON file (`backup`) and restore from such a file (`restore`).
    * System reset capability (`reset`) to clear all users, data, and settings.
    * `savefs` command to manually trigger a save of the current user's file system.
    * `shutdown` and `reboot` commands for session control.
* **Enhanced Built-in Text Editor (`edit` - via `EditorManager`, `EditorUI`, `EditorUtils`):**
    * Full-screen text editor for files.
    * Supports plain text, Markdown, and HTML (with live preview for MD/HTML, using Marked.js for Markdown).
    * Line numbers in the gutter.
    * Word wrap (toggleable, and setting persists via LocalStorage).
    * Export Preview as HTML functionality.
    * Status bar displaying line count, word count, character count, and cursor position (Ln, Col).
    * Configurable view modes for previewable files (Split, Edit Only, Preview Only).
    * Tab key now inserts a tab character (4 spaces by default).
    * Keyboard shortcuts: `Ctrl+S` to save/exit, `Ctrl+O` to exit without saving (with confirmation for unsaved changes), `Ctrl+P` to toggle preview/view mode.
* **Improved Scripting Engine (`run` command within `CommandExecutor`):**
    * Execute sequences of OopisOS commands from script files.
    * Supports comments (`#`) - robustly handles comments at end of lines or on their own lines, ignoring quoted content.
    * Handles shebang (`#!`) at the beginning of scripts (ignored by `run`).
    * Script arguments: Access passed arguments using `$1`, `$2`, ..., `$@` (all arguments as a single string), and `$#` (number of arguments). Note: `$0` (script name) is not currently set by the `run` command.
    * Basic control flow simulation with `delay <milliseconds>` and `check_fail "<command_string>"`.
* **Common Utilities:** Includes `echo`, `date`, `help`, `clear`, `history` (with `-c` to clear), `export` (download files from OopisOS FS), `upload` (upload local files to OopisOS FS).
    * `upload` command specifies allowed file types (`.txt`, `.md`, `.html`, `.sh`, `.js`, `.css`) and prompts for overwrite if the file exists.
    * `grep` command for searching patterns in files or input, with flags: `-i` (ignore case), `-v` (invert match), `-n` (line number), `-c` (count). (Note: `-R` recursive search is not yet implemented in `grep` itself for v1.5.1, use `find ... -exec grep ...` for recursive searches).

## Getting Started

1.  **Download:** Obtain the `OopisOSv1_5_1.html` file.
2.  **Open:** Open this HTML file in any modern web browser (e.g., Chrome, Firefox, Edge, Safari).
3.  **Interact:** The OopisOS terminal will load. You can start typing commands immediately.
    * Note: User accounts are **passwordless**. The default user is "Guest".

**First Commands to Try:**

```bash
help
ls -l
date
echo "Hello OopisOS v1.5.1!"
whoami
register myuser
login myuser
mkdir my_projects
cd my_projects
edit my_script.sh
```
The help command will provide a list of all available commands and their basic usage. Type help \<command\_name\> for more details on a specific command.

## **Exploring OopisOS**

OopisOS offers a rich environment. Here are some areas to explore:

* File System: Create directories (mkdir \-p my\_folder/sub\_folder), navigate (cd my\_folder), create files (touch my\_file.txt), and edit them (edit my\_file.txt). Try tree \-L 2 to see the structure. Use find . \-name "\*.txt" to locate text files in the current directory and subdirectories.  
* User Accounts: Register a new user (register your\_username), log out (logout), and log back in (login your\_username). Notice how your file system is unique. Try removeuser some\_other\_user after creating one (you will be prompted for confirmation).  
* Session Persistence: Use savestate to save your current work (including FS snapshot), then make changes or reset, and use loadstate to restore your previous session (requires confirmation). Use backup to get a downloadable JSON of your current user's filesystem.  
* Editor Features: Open a .md file with edit test.md. Try toggling word wrap, changing view modes (Ctrl+P), and exporting the preview. Note the status bar information.  
* Piping and Redirection: Try ls \-l / \> file\_list.txt or echo "Error log: " \>\> /system.log ; date \>\> /system.log.  
* Background Processes: Execute a command with & at the end, e.g., delay 3000 &.  
* Scripting: Create a simple script file (e.g., edit test.sh) with:  
* Bash

\#\!/oopis\_shell   
\# My test script  
echo "Script running with $\# arguments: $@"  
echo "First argument: $1"  
ls \-l /  
delay 1000  
echo "Script finished."

*   
* Save it, chmod 70 test.sh (to make it executable for the owner), and then run it with run test.sh arg1 "second arg".

## **Developer Guide**

Interested in understanding or modifying OopisOS?

* Source Code: All the logic is contained within oopisos1\_5\_1.js, which is referenced by OopisOSv1\_5\_1.html.  
* Core Architecture: OopisOS is built with a modular JavaScript design using "Manager" objects (e.g., CommandExecutor, FileSystemManager, UserManager, EditorManager, SessionManager, OutputManager, IndexedDBManager, StorageManager, HistoryManager, ConfirmationManager, TabCompletionManager) and utility modules (Config, Utils, TimestampParser, EditorUtils, EditorUI). These are typically defined as IIFEs.  
* CommandExecutor: Contains the commands object, which maps command names to their handler functions. This is the primary place to add new commands or modify existing ones. It includes a Lexer and Parser for robust command line processing, including pipes, redirection, and background operators.  
* FileSystemManager: Handles all file operations and persistence to IndexedDB. Manages file/directory nodes with attributes like type, children (for dirs), content (for files), owner, mode, and mtime.  
* EditorManager: Manages the enhanced text editor state and functionalities, coordinating with EditorUI and EditorUtils.

Adding a New Command:

* Locate the commands object within the CommandExecutor IIFE in oopisos1\_5\_1.js.  
* Add a new entry with your command name as the key.  
* Define an async handler(args, options) function for its logic. options includes isInteractive, stdinContent, and explicitForce.  
* Provide description (string) and helpText (string, can be multi-line) metadata for the help system.

## **Scripting Guide**

Automate tasks in OopisOS by writing scripts.

* Creating Scripts: Use edit your\_script\_name.sh.  
* Format: Plain text files, one command per line.  
  * Lines starting with \# (unless within quotes) are comments and are ignored by the run command.  
  * Scripts can start with a shebang line (e.g., \#\!/oopis), which is also ignored by run.  
* Running Scripts: run your\_script\_name.sh \[arg1\] \[arg2\] ....  
  * The script file needs read and execute permissions for the current user.

Key Scripting Features & Commands:

* Arguments:  
  * $1, $2, ...: Access positional arguments passed to the script.  
  * $@: Represents all arguments passed to the script as a single string, space-separated.  
  * $\#: Represents the number of arguments passed to the script.  
* echo "message": Display output.  
* delay \<milliseconds\>: Pause execution.  
* Redirection: \> and \>\> (e.g., ls \> file\_list.txt).  
* Piping: | (e.g., cat myfile.txt | grep "pattern").  
* check\_fail "\<command\_string\>": Executes the quoted command. The script continues if the command fails (useful for testing error conditions) and halts if the command succeeds unexpectedly.

## **Utility Scripts**

OopisOS development and testing are aided by utility scripts that can be loaded into the system:

* inflatev4\_1.sh: A powerful script designed to populate the OopisOS file system with a diverse set of dummy files and directories. This is invaluable for testing the robustness of file system commands like ls, find, grep, cp, mv, and rm under various conditions.  
* diagnostic\_tool1\_5.sh: A comprehensive test suite that executes a wide range of commands and checks their expected outcomes, including error conditions (using check\_fail). It's a key tool for regression testing and verifying system integrity after changes.

To use these, you would first upload them into OopisOS or create them using edit, make them executable with chmod, and then run them with run.

## **Technology Stack**

* Frontend & Logic: HTML5, CSS3 (Tailwind CSS \+ Custom CSS for theming), JavaScript (ES6+).  
* Markdown Parsing (in editor): Marked.js (via CDN).  
* Persistent Storage:  
  * IndexedDB: For user file systems (FileSystemManager).  
  * LocalStorage: For user credentials (currently placeholder names), session states (SessionManager), and editor word wrap preference.

## **Contributing**

Contributions to OopisOS are welcome\! If you'd like to contribute, please consider the following:

* Fork the repository (if applicable, or simply modify your local HTML file).  
* Create a new branch for your feature or bug fix (if using Git).  
* Make your changes. Ensure you test them thoroughly, perhaps by writing new test cases for diagnostic\_tool1\_5.sh or a similar script.  
* Update documentation (like this README) if you're adding new commands or significantly changing behavior.  
* Submit a pull request (if using Git) with a clear description of your changes.

Areas for potential contribution:

* Adding new commands or utilities.  
* Enhancing existing command functionalities (e.g., more flags, better POSIX compliance).  
* Improving the UI/UX of the terminal or editor.  
* Expanding scripting capabilities (e.g., variables, more advanced control flow like if/else, loops).  
* Bug fixes and performance optimizations.  
* Improving the Lexer/Parser for more complex shell features (e.g., full escape sequence handling, command substitution).

## **Future Ideas**

* Basic networking simulation (e.g., ping, fetch\-like commands).  
* More advanced scripting features (user-defined variables, simple loops, if/else).  
* A very simple graphical element or windowing system (ambitious\!).  
* Support for more file types in the editor or for execution.  
* Enhanced tab-completion intelligence.  
* More granular permissions model (e.g., group permissions, beyond current owner/other).

## **License**

This code was designed with the help of Google Gemini Pro 2.5.

Copyright (c) 2025 Andrew Edmark and Gemini Pro 2.5. (MIT Licensed)

https://github.com/aedmark/OopisOS

This project is distributed under the MIT License.
