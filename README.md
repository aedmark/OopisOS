# OopisOS v1.7 - A Browser-Based OS Simulation

_OopisOS v1.7: Even Oopisier, Now with Adventures and AI!_

OopisOS is a unique HTML application that simulates a desktop operating system environment entirely within a web browser. It features a retro-style terminal, a persistent hierarchical file system, user management, session handling, an advanced built-in text editor, an AI interaction layer, an interactive text adventure game engine, and a suite of command-line utilities with support for I/O redirection, piping, and background processes, all powered by client-side JavaScript.

## Table of Contents

- [Introduction](#introduction "null")
    
- [Key Features (v1.7)](#key-features-v17 "null")
    
- [Getting Started](#getting-started "null")
    
- [Exploring OopisOS v1.7](#exploring-oopisos-v17 "null")
    
- [User Guide Highlights](#user-guide-highlights "null")
    
- [Developer Guide](#developer-guide "null")
    
- [Scripting Guide](#scripting-guide "null")
    
- [Utility Scripts](#utility-scripts "null")
    
- [Technology Stack](#technology-stack "null")
    
- [Contributing](#contributing "null")
    
- [Future Ideas](#future-ideas "null")
    
- [License](#license "null")
    

## Introduction

Welcome to **OopisOS v1.7**! This project, a collaborative effort by Andrew Edmark and Gemini Pro, aims to provide an engaging and educational experience by simulating core operating system functionalities in a completely client-side environment. Whether you're a student learning OS concepts, a retro-computing enthusiast, or a developer looking for a sandboxed command-line environment, OopisOS offers a rich set of tools and features to explore.

The entire system is self-contained, primarily within an HTML file (e.g., `OopisOSv1_7.html`) and its accompanying JavaScript files: `oopisos1_7.js` (core OS framework), `editor1_7.js` (text editor module), `commexec1_7.js` (command executor and definitions), and `adventure1_7.js` (text adventure game engine).

## Key Features (v1.7)

- **100% Client-Side:** Runs entirely in the browser with no server-side dependencies.
    
- **Advanced Terminal Interface:** A retro-styled, interactive command-line interface.
    
    - Command history (Arrow Up/Down).
        
    - Tab completion for commands and file/directory paths.
        
    - **Command Pipelining (`|`):** Chain commands, sending the output of one to the input of the next.
        
    - **Background Processes (`&`):** Run commands in the background.
        
    - **I/O Redirection:** Supports `>` (overwrite) and `>>` (append) for command output.
        
    - Customizable prompt displaying `user@OopisOs:path>`.
        
- **Hierarchical File System (`FileSystemManager` in `oopisos1_7.js`):**
    
    - Create, manage, and navigate directories and files (`mkdir`, `ls`, `cd`, `touch`, `cat`, `cp`, `mv`, `rm`, `pwd`, `tree`, `find`).
        
    - Persistent storage using IndexedDB for file systems per user.
        
    - `ls` command supports: `-l` (long format with permissions, owner, size, date), `-a` (all files), `-R` (recursive), `-r` (reverse sort), `-t` (sort by time), `-S` (sort by size), `-X` (sort by extension), and `-U` (no sort).
        
    - `mkdir` command supports a `-p` (parents) flag to create parent directories as needed.
        
    - `tree` command supports `-L <level>` (depth limit) and `-d` (directories only) flags.
        
    - `rm` command supports `-r`/`-R` (recursive), `-f` (force), and `-i` (interactive) flags.
        
    - `cp` command supports `-r`/`-R` (recursive), `-f` (force), `-p` (preserve metadata), and `-i` (interactive) flags, and correctly handles multiple sources to a directory.
        
    - `touch` command supports `-c` (no-create), `-d DATETIME_STRING` (set date string), and `-t STAMP` (set specific timestamp using `[[CC]YY]MMDDhhmm[.ss]` format).
        
    - `find` command with predicates like `-name PATTERN`, `-type [f|d]`, `-user UNAME`, `-perm MODE` (2-digit octal), `-mtime N` (days ago), and actions like `-print` (default), `-exec CMD {} \;`, and `-delete`.
        
- **User** Management (`UserManager` in **`oopisos1_7.js` - Passwordless):**
    
    - Register and login for multiple users (`useradd` or its alias `register`, `login`, `logout`).
        
    - `removeuser` command to delete users and their data (with confirmation).
        
    - `whoami` command to display the current user.
        
    - `listusers` command to show all registered users.
        
    - Each user has an isolated file system.
        
    - Usernames have defined length constraints and reserved names.
        
- **Session Management (`SessionManager` in `oopisos1_7.js`):**
    
    - Automatic session saving per user (current path, terminal output, history, current input).
        
    - Manual session snapshots (`savestate`, `loadstate`) including full file system state (with confirmation).
        
    - Full session backup to a downloadable JSON file (`backup`) and restore from such a file (`restore` - with confirmation).
        
    - System reset capability (`reset` - with confirmation) to clear all users, data, and settings.
        
    - `savefs` command to manually trigger a save of the current user's file system.
        
    - `clearfs` command to wipe the current user's filesystem (with confirmation).
        
    - `shutdown` and `reboot` commands for session control.
        
- **Enhanced Built-in Text Editor (`edit` - via `EditorManager`, `EditorUI`, `EditorUtils` in `editor1_7.js`):**
    
    - Full-screen text editor for files.
        
    - Supports plain text, Markdown, and HTML (with live preview for MD/HTML, using Marked.js for Markdown).
        
    - Line numbers in the gutter (gutter hidden when word wrap is active).
        
    - Word wrap (toggleable, and setting persists via LocalStorage).
        
    - Export Preview as HTML functionality.
        
    - Status bar displaying line count, word count, character count, and cursor position (Ln, Col).
        
    - Configurable view modes for previewable files (Split, Edit Only, Preview Only).
        
    - Tab key inserts a tab character (4 spaces by default).
        
    - Keyboard shortcuts: `Ctrl+S` to save/exit, `Ctrl+O` to exit without saving (with confirmation for unsaved changes via a modal dialog), `Ctrl+P` to toggle preview/view mode, `Ctrl+B` for bold, `Ctrl+I` for italic.
        
    - Markdown/HTML formatting toolbar with buttons for Bold, Italic, Link, Blockquote, Inline Code, Code Block, Unordered List, and Ordered List.
        
    - In-editor modal dialogs for confirmations (e.g., discard changes).
        
- **AI Integration (`gemini` command in `commexec1_7.js`):**
    
    - Send a base prompt and the content of a file from the VFS to a Gemini AI model.
        
    - Displays the AI's response in the terminal.
        
- **Interactive Text Adventure Game (`adventure` command in `commexec1_7.js`, engine in `adventure1_7.js`):**
    
    - Launch and play text-based adventure games.
        
    - Includes a sample game, 'The Lost Key of Oopis.'
        
    - Supports loading custom adventures from JSON files stored in the VFS.
        
    - Game interaction occurs within a dedicated modal window.
        
- **Improved Scripting Engine (`run` command within `CommandExecutor` in `commexec1_7.js`):**
    
    - Execute sequences of OopisOS commands from script files.
        
    - Supports comments (`#`) - robustly handles comments at end of lines or on their own lines, ignoring quoted content.
        
    - Handles shebang (`#!`) at the beginning of scripts (interpreter part ignored, line skipped by `run`).
        
    - Script arguments: Access passed arguments using `$1`, `$2`, ..., `$@` (all arguments as a single string), and `$#` (number of arguments).
        
    - Basic control flow simulation with `delay <milliseconds>` and `check_fail "<command_string>"`.
        
- **Common Utilities:** Includes `echo`, `date`, `help`, `clear`, `history` (with `-c` to clear), `export` (download files from OopisOS FS), `upload` (upload local files to OopisOS FS), `chmod`, `chown`.
    
    - `upload` command specifies allowed file types (`.txt`, `.md`, `.html`, `.sh`, `.js`, `.css`, `.json`) and prompts for overwrite if the file exists (unless `-f` is used).
        
    - `grep` command for searching patterns in files or input, with flags: `-i` (ignore case), `-v` (invert match), `-n` (line number), `-c` (count), and `-R` (recursive directory search).
        
    - `printscreen <filepath>`: Saves the current terminal output to the specified file in the VFS.
        

## Getting Started

1. **Download:** Obtain the `OopisOSv1_7.html` file and its accompanying JavaScript files:
    
    - `oopisos1_7.js` (core OS framework)
        
    - `editor1_7.js` (text editor module)
        
    - `commexec1_7.js` (command executor and definitions)
        
    - `adventure1_7.js` (text adventure game engine) Ensure all `.js` files are in the same directory as `OopisOSv1_7.html`.
        
2. **Open:** Open `OopisOSv1_7.html` in any modern web browser (e.g., Chrome, Firefox, Edge, Safari).
    
3. **Interact:** The OopisOS terminal will load. You can start typing commands immediately.
    
    - Note: User accounts are **passwordless**. The default user is "Guest".
        

**First Commands to Try:**

```
help
ls -l
date
echo "Hello OopisOS v1.7!" > /greeting.txt
cat /greeting.txt
whoami
register myuser
login myuser
mkdir my_projects
cd my_projects
edit my_script.sh
# Inside editor: type 'echo "My script works on $@" ; adventure', then Ctrl+S
chmod 70 my_script.sh
run ./my_script.sh "OopisOS v1.7"
printscreen /my_log.txt
cat /my_log.txt
gemini /greeting.txt "Is this a friendly greeting?"
```

The `help` command will provide a list of all available commands and their basic usage. Type `help <command_name>` for more details on a specific command.

## Exploring OopisOS v1.7

OopisOS v1.7 offers a rich environment. Here are some areas to explore:

- **File System:** Create directories (`mkdir` -p `my_folder/sub_folder`), navigate (`cd my_folder`), create files (`touch my_file.txt`), and edit them (`edit my_file.txt`). Try `tree -L 2` to see the structure. Use `find . -name "*.txt"` to locate text files in the current directory and subdirectories.
    
- **User Accounts:** Register a new user (`register your_username`), log out (`logout`), and log back in (`login your_username`). Notice how your file system is unique. Try `removeuser some_other_user` after creating one (you will be prompted for confirmation).
    
- **Session Persistence:** Use `savestate` to save your current work (including FS snapshot), then make changes or `reset`, and use `loadstate` to restore your previous session (requires confirmation). Use `backup` to get a downloadable JSON of your current user's filesystem.
    
- **Editor Features:** Open a `.md` file with `edit test.md`. Try toggling word wrap, changing view modes (`Ctrl+P`), using the formatting toolbar (bold, italic, lists etc.), and exporting the preview. Note the status bar information.
    
- **AI Fun:** Upload a text file (or create one with `edit` or `echo`), then use the `gemini` command to ask questions about it or get summaries. For example: `gemini` /path/to/your/file.txt "What are the key points `of this document?"`
    
- **Adventure Time:** Type `adventure` to play the built-in game. If you have a custom adventure JSON file, `upload` it (e.g., to `/games/mygame.json`) then run `adventure /games/mygame.json`.
    
- **Piping and Redirection:** Try `ls -l / > file_list.txt` or `echo "Error log: " >> /system.log ; date >> /system.log`.
    
- **Background Processes:** Execute a command with `&` at the end, e.g., `delay 3000 &`.
    
- **Scripting:** Create a simple script file (e.g., `edit test.sh`). Save it, `chmod 70 test.sh` (to make it executable for the owner), and then run it with `run test.sh arg1 "second arg"`.
    

## Developer Guide

Interested in understanding or modifying OopisOS v1.7?

- **Source Code:** The core logic is split into four main JavaScript files:
    
    - `oopisos1_7.js`: Core OS framework (Config, Utils, Managers for Output, Storage, IndexedDB, FileSystem, History, User, Session, TerminalUI, TabCompletion).
        
    - `editor1_7.js`: All text editor related logic (EditorAppConfig, EditorUtils, EditorUI, EditorManager, EditorModal).
        
    - `commexec1_7.js`: Command execution logic (CommandExecutor including Lexer, Parser, command definitions and handlers).
        
    - `adventure1_7.js`: Text adventure game engine and UI modal logic (TextAdventureModal, TextAdventureEngine). All these are referenced by `OopisOSv1_7.html`.
        
- **Core Architecture:** OopisOS is built with a modular JavaScript design using "Manager" objects (e.g., `CommandExecutor`, `FileSystemManager`, `UserManager`, `EditorManager`, `SessionManager`, `OutputManager`, `IndexedDBManager`, `StorageManager`, `HistoryManager`, `ConfirmationManager`, `TabCompletionManager`, `TextAdventureEngine`) and utility modules (`Config`, `Utils`, `TimestampParser`, `EditorUtils`, `EditorUI`, `TextAdventureModal`). These are typically defined as IIFEs.
    
- **CommandExecutor (`commexec1_7.js`):** Contains the `commands` object, which maps command names to their handler functions. This is the primary place to add new commands or modify existing ones. It includes a Lexer and Parser for robust command line processing, including pipes, redirection, and background operators.
    
- **FileSystemManager (`oopisos1_7.js`):** Handles all file operations and persistence to IndexedDB. Manages file/directory nodes with attributes like type, children (for dirs), content (for files), owner, mode, and mtime.
    
- **EditorManager (`editor1_7.js`):** Manages the enhanced text editor state and functionalities, coordinating with `EditorUI` and `EditorUtils`.
    
- **TextAdventureEngine (`adventure1_7.js`):** Manages the logic and state for the text adventure games.
    

**Adding a New Command:**

1. Locate the `commands` object within the `CommandExecutor` IIFE in `commexec1_7.js`.
    
2. Add a new entry with your command name as the key.
    
3. Define an `async handler(args, options)` function for its logic. `options` includes `isInteractive`, `stdinContent`, and `explicitForce`.
    
4. Provide `description` (string) and `helpText` (string, can be multi-line) metadata for the help system.
    

```
// Example structure in commexec1_7.js
"yournewcommand": {
    handler: async (args, options) => {
        // ... your logic ...
        return { success: true, output: "Result" };
    },
    description: "Does something new and cool.",
    helpText: "Usage: yournewcommand [option]\n\nMore details here."
}
```

## Scripting Guide

Automate tasks in OopisOS v1.7 by writing scripts.

- **Creating Scripts:** Use `edit your_script_name.sh`.
    
- **Format:** Plain text files, one command per line.
    
    - Lines starting with `#` (unless within quotes) are comments and are ignored by the `run` command.
        
    - Scripts can start with a shebang line (e.g., `#!/oopis`), which is also ignored by `run` (the line is skipped).
        
- **Running Scripts:** `run your_script_name.sh [arg1] [arg2] ...`.
    
    - The script file needs read and execute permissions for the current user (`chmod 70 your_script.sh`).
        

**Key Scripting Features & Commands:**

- **Arguments:**
    
    - `$1`, `$2`, ...: Access positional arguments passed to the script.
        
    - `$@`: Represents all arguments passed to the script as a single string, space-separated.
        
    - `$#`: Represents the number of arguments passed to the script.
        
- `echo "message"`: Display output.
    
- `delay <milliseconds>`: Pause execution.
    
- **Redirection:** `>` and `>>` (e.g., `ls > file_list.txt`).
    
- **Piping:** `|` (e.g., `cat myfile.txt | grep "pattern"`).
    
- `check_fail "<command_string>"`: Executes the quoted command. The script continues if the command fails (useful for testing error conditions) and halts if the command succeeds unexpectedly.
    

## Utility Scripts

OopisOS development and testing are aided by utility scripts that can be loaded into the system (assuming they are updated for v1.7):

- `inflatev1_7.sh`: A powerful script designed to populate the OopisOS file system with a diverse set of dummy files and directories. This is invaluable for testing the robustness of file system commands.
    
- `diagnostic_tool1_7.sh`: A comprehensive test suite that executes a wide range of commands and checks their expected outcomes, including error conditions (using `check_fail`). It's a key tool for regression testing.
    

To use these, you would first upload them into OopisOS (using the `upload` command) or create them using `edit`, make them executable with `chmod`, and then run them with `run`.

## Technology Stack

- **Frontend & Logic:** HTML5, CSS3 (Tailwind CSS + Custom CSS for theming), JavaScript (ES6+).
    
- **Markdown Parsing (in editor):** Marked.js (assumed to be available, e.g., via CDN or included).
    
- **AI Interaction (`gemini` command):** Google Gemini API (requires API key handling).
    
- **Persistent Storage:**
    
    - **IndexedDB:** For user file systems (`FileSystemManager`).
        
    - **LocalStorage:** For user credentials (currently username-based, no passwords), session states (`SessionManager`), and editor word wrap preference.
        

## Contributing

Contributions to OopisOS are welcome! If you'd like to contribute, please consider the following:

- Fork the repository (if applicable, or simply modify your local HTML file and JS files).
    
- Create a new branch for your feature or bug fix (if using Git).
    
- Make your changes. Ensure you test them thoroughly, perhaps by writing new test cases for `diagnostic_tool1_7.sh` or a similar script.
    
- Update documentation (like this README and the HTML Manual) if you're adding new commands or significantly changing behavior.
    
- Submit a pull request (if using Git) with a clear description of your changes.
    

**Areas for potential contribution:**

- Adding new commands or utilities.
    
- Enhancing existing command functionalities (e.g., more flags, better POSIX compliance).
    
- Improving the UI/UX of the terminal, editor, or adventure game.
    
- Expanding scripting capabilities (e.g., variables, more advanced control flow like if/else, loops).
    
- Bug fixes and performance optimizations.
    
- Improving the Lexer/Parser for more complex shell features (e.g., full escape sequence handling, command substitution).
    
- Creating more sample adventure game JSON files or expanding the `gemini` command's capabilities.
    

## Future Ideas

- Basic networking simulation (e.g., `ping`, `fetch`-like commands within the VFS).
    
- More advanced scripting features (user-defined variables, simple loops, if/else).
    
- A very simple graphical element or windowing system (ambitious!).
    
- Support for more file types in the editor or for execution.
    
- Enhanced tab-completion intelligence.
    
- More granular permissions model (e.g., group permissions, beyond current owner/other).
    

## License

This code was designed with the help of Google Gemini.

Copyright (c) 2025 Andrew Edmark and Gemini. (MIT Licensed)

[https://github.com/aedmark/OopisOS](https://github.com/aedmark/OopisOS "null") (Link updated to reflect the project's assumed location)

This project is distributed under the MIT License. (Refer to the full license text, typically in a `LICENSE.txt` file or within the main HTML/JS documentation).