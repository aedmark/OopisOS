# OopisOS v1.8 - A Browser-Based OS Simulation

_OopisOS v1.8: Even Oopisier, Now with Adventures and AI!_

OopisOS is a unique HTML application that simulates a desktop operating system environment entirely within a web browser. It features a retro-style terminal, a persistent hierarchical file system, multi-user management, session handling, an advanced built-in text editor, an AI interaction layer, an interactive text adventure game engine, and a suite of command-line utilities with support for I/O redirection, piping, and background processes, all powered by client-side JavaScript.

## Table of Contents

- [Introduction](#introduction "null")
    
- [Key Features (v1.8)](#key-features-v18 "null")
    
- [Getting Started](#getting-started "null")
    
- [Exploring OopisOS v1.8](#exploring-oopisos-v18 "null")
    
- [Developer Guide](#developer-guide "null")
    
- [Scripting Guide](#scripting-guide "null")
    
- [Utility Scripts](#utility-scripts "null")
    
- [Technology Stack](#technology-stack "null")
    
- [Contributing](#contributing "null")
    
- [Future Ideas](#future-ideas "null")
    
- [License](#license "null")
    

## Introduction

Welcome to **OopisOS v1.8**! This project, a collaborative effort by Andrew Edmark and Gemini Pro, aims to provide an engaging and educational experience by simulating core operating system functionalities in a completely client-side environment. Whether you're a student learning OS concepts, a retro-computing enthusiast, or a developer looking for a sandboxed command-line environment, OopisOS offers a rich set of tools and features to explore.

The entire system is self-contained, primarily within an HTML file (e.g., `OopisOSv1_8.html`) and its accompanying JavaScript files: `oopisos1_8.js` (core OS framework), `editor1_8.js` (text editor module), `commexec1_8.js` (command executor and definitions), and `adventure1_8.js` (text adventure game engine).

## Key Features (v1.8)

- **100% Client-Side:** Runs entirely in the browser with no server-side dependencies.
    
- **Advanced Terminal Interface:** A retro-styled, interactive command-line interface.
    
    - Command history (Arrow Up/Down).
        
    - Tab completion for commands and file/directory paths.
        
    - **Command Pipelining (`|`):** Chain commands, sending the output of one to the input of the next.
        
    - **Command Sequencing (`;`):** Run multiple commands on one line.
        
    - **Background Processes (`&`):** Run commands in the background.
        
    - **I/O Redirection:** Supports `>` (overwrite) and `>>` (append) for command output.
        
- **Hierarchical File System (`FileSystemManager` in `oopisos1_8.js`):**
    
    - Create, manage, and navigate directories and files (`mkdir`, `ls`, `cd`, `touch`, `cat`, `cp`, `mv`, `rm`, `pwd`, `tree`, `find`).
        
    - Persistent storage using a single unified IndexedDB database for the entire file system.
        
    - `ls` command supports: `-l` (long format), `-a` (all files), `-R` (recursive), `-r` (reverse sort), `-t` (sort by time), `-S` (sort by size), and `-d` (directory entry).
        
    - `find` command with predicates like `-name PATTERN`, `-type [f|d]`, `-user UNAME`, `-perm MODE`, `-mtime N`, and actions like `-print` (default), `-exec CMD {} \;`, and `-delete`.
        
- **User Management (`UserManager` in `oopisos1_8.js`):**
    
    - Register and login for multiple users (`useradd`/`register`, `login`, `logout`).
        
    - Switch users with `su [username]`, including to a `root` user with full permissions.
        
    - `removeuser` command to delete users and their data (with confirmation).
        
    - `whoami` and `listusers` commands.
        
    - Each user has a dedicated home directory (`/home/<username>`).
        
- **Session Management (`SessionManager` in `oopisos1_8.js`):**
    
    - Automatic session saving per user.
        
    - Manual session snapshots (`savestate`, `loadstate`) including full file system state.
        
    - Full session backup to a downloadable JSON file (`backup`) and restore from file (`restore`).
        
    - System reset capability (`reset`) and home directory clearing (`clearfs`).
        
- **Enhanced Built-in Text Editor (`edit` - `editor1_8.js`):**
    
    - Full-screen text editor with support for plain text, Markdown, and HTML (with live preview).
        
    - Features include line numbers, toggleable word wrap, status bar, and a formatting toolbar.
        
    - Keyboard shortcuts: `Ctrl+S` (save/exit), `Ctrl+O` (exit/confirm discard), `Ctrl+P` (toggle preview), `Ctrl+B` (bold), `Ctrl+I` (italic).
        
- **AI Integration (`gemini` command in `commexec1_8.js`):**
    
    - Send a prompt, with or without file content, to a Gemini AI model and display the response.
        
- **Interactive Text Adventure Game (`adventure` command - `adventure1_8.js`):**
    
    - Launch and play text-based adventure games within a dedicated modal window.
        
    - Includes a sample game, 'Quest for the Lost Semicolon.'
        
    - Supports loading custom adventures from JSON files in the VFS.
        
- **Scripting Engine (`run` command in `commexec1_8.js`):**
    
    - Execute sequences of OopisOS commands from script files.
        
    - Supports comments (`#`), shebangs (`#!`), and argument passing (`$1`, `$@`, `$#`).
        
- **Common Utilities:** `echo`, `date`, `help`, `clear`, `history`, `export`, `upload`, `chmod`, `chown`, `grep` (with `-i`, `-v`, `-n`, `-c`, `-R`), and `printscreen`.
    

## Getting Started

1. **Download:** Obtain `OopisOSv1_8.html` and the required JavaScript files (`oopisos1_8.js`, `editor1_8.js`, `commexec1_8.js`, `adventure1_8.js`).
    
2. **Open:** Open `OopisOSv1_8.html` in any modern web browser.
    
3. **Interact:** The OopisOS terminal will load. You are logged in as "Guest". Start typing commands.
    

**First Commands to Try:**

```
help
ls -l
echo "Hello OopisOS v1.8!" > /greeting.txt
cat /greeting.txt
whoami
register myuser
login myuser
mkdir my_projects ; cd my_projects
edit my_script.sh
# Inside editor: type 'echo "My script works on $@" ; adventure', then Ctrl+S
chmod 70 my_script.sh
run ./my_script.sh "OopisOS v1.8"
gemini /greeting.txt "Is this a friendly greeting?"
```

## Exploring OopisOS v1.8

OopisOS v1.8 offers a rich environment. Here are some areas to explore:

- **File System:** Create directories (`mkdir -p my_folder/sub_folder`), navigate (`cd my_folder`), create files (`touch my_file.txt`), and edit them (`edit my_file.txt`). Try `tree -L 2` to see the structure. Use `find . -name "*.txt"` to locate text files.
    
- **User Accounts:** Register a new user (`register your_username`), log out (`logout`), and log back in (`login your_username`). Switch to the superuser with `su root` to perform administrative tasks like `chown your_username /some_file`.
    
- **Session Persistence:** Use `savestate` to save your current work, then make changes or `reset`, and use `loadstate` to restore your session. Use `backup` to get a downloadable JSON of the filesystem.
    
- **Editor Features:** Open a `.md` file with `edit test.md`. Try toggling word wrap, changing view modes (`Ctrl+P`), using the formatting toolbar, and exporting the preview.
    
- **AI Fun:** Create a file with `edit` or `echo`, then use the `gemini` command to ask questions about it. Example: `gemini /path/to/file.txt "Summarize this."`
    
- **Adventure Time:** Type `adventure` to play the built-in game.
    
- **Piping and Sequencing:** Try `ls -l / > file_list.txt ; cat file_list.txt | grep home`.
    

## Developer Guide

- **Source Code:** The logic is split into four main files: `oopisos1_8.js` (core), `editor1_8.js` (editor), `commexec1_8.js` (commands), and `adventure1_8.js` (game).
    
- **Core Architecture:** OopisOS uses a modular JavaScript design with "Manager" objects (e.g., `CommandExecutor`, `FileSystemManager`, `UserManager`).
    
- **FileSystemManager:** Manages a **unified file system** in a single IndexedDB object store. User home directories are created under `/home/`. Permissions are checked against the current user's name (`root` bypasses all checks).
    

**Adding a New Command:**

1. Locate the `commands` object within the `CommandExecutor` IIFE in `commexec1_8.js`.
    
2. Add a new entry with your command name.
    
3. Define an `async handler(args, options)` function.
    
4. Provide `description` and `helpText` strings.
    

## Scripting Guide

Automate tasks by writing scripts with `edit your_script.sh`.

- **Format:** Plain text files, one command per line. Lines starting with `#` are comments.
    
- **Running:** `chmod 70 your_script.sh` (to make it executable), then `run ./your_script.sh [args...]`.
    
- **Features:** Scripts support arguments (`$1`, `$@`, `$#`), `delay`, and `check_fail` for testing.
    

## Utility Scripts

- `inflatev1_8.sh`: Populates the file system with a diverse set of files and directories for testing.
    
- `diagnostic_tool1_8.sh`: A comprehensive test suite that executes a wide range of commands and checks for expected outcomes and errors.
    

## Technology Stack

- **Frontend & Logic:** HTML5, CSS3 (Tailwind CSS), Vanilla JavaScript (ES6+).
    
- **Markdown Parsing:** Marked.js.
    
- **AI Interaction:** Google Gemini API.
    
- **Persistent Storage:** IndexedDB (for the file system) and LocalStorage (for session states, user list, editor preferences).
    

## Contributing

Contributions are welcome! Fork the repository, create a new branch, make your changes, and submit a pull request with a clear description. Please test your changes and update documentation as needed.

## Future Ideas

- Basic networking simulation (`ping`, `fetch`).
    
- Advanced scripting (variables, loops, if/else).
    
- A simple GUI or windowing system.
    
- More granular permissions model (e.g., group permissions).
    

## License

This code was designed with the help of Google Gemini.

Copyright (c) 2025 Andrew Edmark and Gemini. (MIT Licensed)

[https://github.com/aedmark/OopisOS](https://github.com/aedmark/OopisOS "null")