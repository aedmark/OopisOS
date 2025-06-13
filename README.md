# OopisOS v2.3 - A Browser-Based OS Simulation

***OopisOS v2.3: A refined, feature-rich operating system simulation for education, development, and interactive entertainment.***

OopisOS is a sophisticated, fully client-side application that simulates a desktop operating system environment entirely within a web browser. It features a retro-style terminal, a persistent hierarchical file system, a multi-user model with password authentication, an advanced text editor, an AI interaction layer, an interactive text adventure engine, and a suite of command-line utilities with support for I/O redirection, piping, background processes, and scripting.

## Key Features (v2.3)

  * **100% Client-Side:** Runs entirely in the browser with no server-side dependencies. All user data is stored locally using IndexedDB and LocalStorage.
  * **Advanced Terminal Interface:** An interactive command-line interface with history, tab completion, command pipelining (`|`), command sequencing (`;`), background processes (`&`), and I/O redirection (`>` and `>>`).
  * **Persistent Hierarchical File System:** A robust VFS managed via IndexedDB. Features a comprehensive suite of file management commands:
      * `ls`: Supports flags `-l`, `-a`, `-R`, `-r`, `-t`, `-S`, `-X`, `-U`, `-d`.
      * `find`: Supports predicates like `-name`, `-type`, `-user`, `-perm`, `-mtime` and actions like `-print`, `-exec`, `-delete`.
      * Standard commands: `mkdir`, `cd`, `touch`, `cat`, `cp`, `mv`, `rm`, `pwd`, `tree`.
  * **Multi-User System with Password Authentication:**
      * Register users (`useradd`) with secure, obscured password prompts.
      * Login/logout (`login`, `logout`) and switch users (`su`), including to a `root` user with full system privileges (default password: `mcgoopis`).
      * User management commands: `whoami`, `listusers`, `removeuser`.
      * Each user has a dedicated, permission-controlled home directory (`/home/<username>`).
  * **Comprehensive Session Management:** Automatic session saving per user, manual `savestate`/`loadstate`, full file system `backup`/`restore` via JSON, and system/home directory `reset`/`clearfs` capabilities.
  * **Enhanced Built-in Text Editor (`edit`):**
      * Full-screen editor for plain text, Markdown, and HTML with live preview.
      * Features include line numbers, toggleable word wrap, status bar, and a formatting toolbar.
      * Keyboard shortcuts: `Ctrl+S` (save/exit), `Ctrl+O` (exit/confirm), `Ctrl+P` (toggle preview), `Ctrl+B`/`I` (format).
  * **AI Integration (`gemini`):** Send a prompt, with or without file content, to a Gemini AI model and display the response directly in the terminal.
  * **Interactive Text Adventure Game (`adventure`):** Launch and play text-based adventure games within a dedicated modal window. Supports loading custom adventures from JSON files.
  * **Scripting Engine (`run`):** Execute sequences of OopisOS commands from script files. Supports comments (`#`) and argument passing (`$1`, `$@`, `$#`).
  * **Common Utilities:** `echo`, `date`, `help`, `clear`, `history`, `export`, `upload`, `chmod`, `chown`, `grep` (with `-i`, `-v`, `-n`, `-c`, `-R`), and `printscreen`.

## Getting Started

1.  **Download:** Obtain `index.html`, all `.js` files, and `terminal.css`.
2.  **Open:** Open `index.html` in any modern web browser.
3.  **Interact:** The OopisOS terminal will load. You are logged in as "Guest". Start by typing `help` to see a list of available commands.

**First Commands to Try:**

```bash
# To get a feel for the system, populate the Guest home directory with a rich set of example files.
run /inflate2_3.sh

# Explore the newly created files and directories
ls -R /home/Guest

# Test the search capabilities
grep -iR "duck" /home/Guest

# Create a new user with a password
useradd myuser
# (Follow password prompts)
logout
login myuser

# Create a project and an executable script
mkdir my_project && cd my_project
edit my_script.sh
# Inside editor: type 'echo "My script works on $@" && adventure', then Ctrl+S
chmod 70 my_script.sh
run ./my_script.sh "OopisOS v2.3"
```

## Core Concepts

### The Terminal Interface

OopisOS provides a standard command-line interface with advanced shell features:

  * **Piping (`|`):** Send the output of one command to the input of another. `history | grep "ls"`
  * **Redirection (`>`, `>>`):** Write command output to a file (overwrite with `>` or append with `>>`). `date >> /data/logs/system.log`
  * **Sequencing (`;`):** Execute multiple commands on a single line. `cd / && ls -a`
  * **Backgrounding (`&`):** Run a command asynchronously. `delay 5000 &`

### The File System

OopisOS implements a persistent, hierarchical file system stored in the browser's IndexedDB.

  * The root is `/`.
  * Each user has a home directory at `/home/<username>`.
  * Supports standard navigation (`cd`, `pwd`) and file manipulation (`mkdir`, `touch`, `cp`, `mv`, `rm`).
  * The `find` command allows for powerful, expression-based file searches.

### User and Permission Model

OopisOS features a multi-user environment with a simplified Unix-like permission system.

  * **Default Users:**
      * `Guest`: The initial user. Has no password.
      * `root`: The "superuser." Can bypass all file permission checks. Default password is `mcgoopis`.
      * `userDiag`: A special user for testing with the password `pantload`.
  * **Authentication:** `login` and `su` will prompt for a password if the target account has one.
  * **Permissions (`chmod`):** The `chmod` command uses a two-digit octal mode. The first digit is for the owner, the second for others. Each is a sum of Read (4), Write (2), and Execute (1). Example: `chmod 75 script.sh` gives `rwx` to the owner and `r-x` to others.
  * **Ownership (`chown`):** Only the `root` user can change a file's ownership.

### The Text Editor (`edit`)

A powerful, full-screen text editor with features for both developers and writers.

  * **Modes:** Auto-detects plain text, Markdown, and HTML files for special features.
  * **Live Preview:** Renders Markdown and HTML in a toggleable preview pane (`Ctrl+P`).
  * **Formatting Toolbar:** Provides quick access to common formatting actions for Markdown and HTML.
  * **Key Shortcuts:** `Ctrl+S` (Save & Exit), `Ctrl+O` (Exit/Confirm Discard), `Ctrl+P` (Toggle Preview), `Ctrl+B`/`I` (Format).

### AI Integration (`gemini`)

Interact with a Gemini AI model directly from the command line.

  * **Syntax:** `gemini [-n] [filepath] "<prompt>"`
  * **Functionality:** Send a text prompt to the AI, optionally with the content of a file. Use `-n` to start a new conversation. Receive a response in the terminal.

### Scripting Engine (`run`)

Automate tasks by writing shell scripts.

  * Create a text file containing a sequence of OopisOS commands (conventionally with a `.sh` extension).
  * **Features:** Supports comments (`#`) and argument passing (`$1`, `$@`, `$#`).
  * **Execution:** `chmod 70 your_script.sh` then `run ./your_script.sh arg1 arg2`.

### Interactive Gaming (`adventure`)

A built-in text adventure game engine.

  * **Launch:** Type `adventure` to play the default game.
  * **Custom Games:** Load your own adventures from JSON files in the VFS: `adventure /path/to/game.json`.

## Utility Scripts: `inflate` & `diag`

  * **`inflate2_3.sh`:** Run this script (`run /inflate2_3.sh`) to populate the `/home/Guest` directory with a diverse set of example files and directories. This is perfect for creating a "showcase" environment to explore.
  * **`diag2_3.sh`:** This is a comprehensive, non-interactive diagnostic test suite (`run /diag2_3.sh`) that verifies the core functionality of most commands, their flags, error handling, and interaction with the permission system.

## Developer Guide

### Project Structure

  * `oopisos2_3.js`: Core OS framework, managers (File System, User, Session), and utilities.
  * `lexpar2_3.js`: Lexer and Parser for command-line input.
  * `commexec2_3.js`: Command Executor and definitions for all built-in commands.
  * `editor2_3.js`: All logic for the text editor.
  * `adventure2_3.js`: All logic for the text adventure game engine.

### Adding a New Command (The v2.3 Way)

1.  Open `commexec2_3.js`.
2.  Define your command's logic and validation rules using the declarative `createCommandHandler` pattern.
3.  Add the new command definition to the `commands` object.

<!-- end list -->

```javascript
// In commexec2_3.js:

const myNewCmdDefinition = {
  commandName: "mycmd",
  // 1. Define validation rules
  argValidation: { min: 1, error: "mycmd needs at least one argument!" },
  pathValidation: [{ argIndex: 0, options: { expectedType: 'file' } }],
  permissionChecks: [{ pathArgIndex: 0, permissions: ['read'] }],
  
  // 2. Write the core logic, knowing the inputs are already vetted!
  coreLogic: async (context) => {
    const { args, options, currentUser, validatedPaths } = context;
    const pathInfo = validatedPaths[0]; // Guaranteed to be a valid, readable file.
    
    return { success: true, output: `Successfully processed ${pathInfo.resolvedPath}` };
  }
};

// 3. Add it to the main commands object
commands.mycmd = {
    handler: createCommandHandler(myNewCmdDefinition),
    description: "A one-line summary for the 'help' command.",
    helpText: "Usage: mycmd [file]\n\nExplain your command in detail here."
};
```

## Technology Stack

  * **Frontend & Logic:** HTML5, CSS3 (Tailwind CSS), Vanilla JavaScript (ES6+).
  * **Markdown Parsing:** Marked.js.
  * **AI Interaction:** Google Gemini API.
  * **Persistent Storage:** IndexedDB (for the file system) and LocalStorage (for session states, user list, editor preferences).

## Contributing

Contributions are welcome\! Fork the repository, create a new branch, make your changes, and submit a pull request with a clear description of your work. Please ensure your changes pass the diagnostic script (`diag2_3.sh`) and update documentation as needed.

## License

This code was designed with the help of Google Gemini.

Copyright (c) 2025 Andrew Edmark and Gemini. (MIT Licensed)