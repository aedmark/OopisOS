// oopisos.js - OopisOS Live Markdown Text Editor v1.7

const Config = (() => {
  "use strict";
  return {
    DATABASE: {
      NAME: "OopisOsDB",
      VERSION: 1,
      FS_STORE_NAME: "FileSystemsStore",
    },
    OS: {
      NAME: "OopisOs",
      VERSION: "1.7",
      DEFAULT_HOST_NAME: "OopisOs",
    },
    USER: {
      DEFAULT_NAME: "Guest",
      RESERVED_USERNAMES: ["guest", "root", "admin", "system"],
      MIN_USERNAME_LENGTH: 3,
      MAX_USERNAME_LENGTH: 20,
    },
    TERMINAL: {
      MAX_HISTORY_SIZE: 50,
      PROMPT_CHAR: ">",
      PROMPT_SEPARATOR: ":",
      PROMPT_AT: "@",
    },
    STORAGE_KEYS: {
      USER_CREDENTIALS: "oopisOsUserCredentials",
      USER_TERMINAL_STATE_PREFIX: "oopisOsUserTerminalState_",
      MANUAL_TERMINAL_STATE_PREFIX: "oopisOsManualUserTerminalState_",
      EDITOR_WORD_WRAP_ENABLED: "oopisOsEditorWordWrapEnabled", // Added for editor settings
    },
    CSS_CLASSES: {
      ERROR_MSG: "text-red-500",
      SUCCESS_MSG: "text-lime-400",
      CONSOLE_LOG_MSG: "text-neutral-400",
      WARNING_MSG: "text-amber-400",
      EDITOR_MSG: "text-sky-400",
      DIR_ITEM: "text-sky-400 font-semibold",
      FILE_ITEM: "text-green-500",
      OUTPUT_LINE: "whitespace-pre-wrap break-words overflow-x-hidden min-h-[1.2em] leading-[1.2em]",
      HIDDEN: "hidden",
    },
    FILESYSTEM: {
      ROOT_PATH: "/",
      CURRENT_DIR_SYMBOL: ".",
      PARENT_DIR_SYMBOL: "..",
      DEFAULT_DIRECTORY_TYPE: "directory",
      DEFAULT_FILE_TYPE: "file",
      PATH_SEPARATOR: "/",
      DEFAULT_FILE_MODE: 0o64, // rw-r----- (owner: rw, other: r)
      DEFAULT_DIR_MODE: 0o75, // rwxr-x--- (owner: rwx, other: rx)
      PERMISSION_BIT_READ: 0b100,
      PERMISSION_BIT_WRITE: 0b010,
      PERMISSION_BIT_EXECUTE: 0b001,
    },
    MESSAGES: {
      PERMISSION_DENIED_SUFFIX: ": Permission denied",
      CONFIRMATION_PROMPT: "Type 'YES' (all caps) to confirm, or any other input to cancel.",
      OPERATION_CANCELLED: "Operation cancelled.",
      ALREADY_LOGGED_IN_AS_PREFIX: "Already logged in as '",
      ALREADY_LOGGED_IN_AS_SUFFIX: "'.",
      NO_ACTION_TAKEN: "No action taken.",
      ALREADY_IN_DIRECTORY_PREFIX: "Already in '",
      ALREADY_IN_DIRECTORY_SUFFIX: "'.",
      DIRECTORY_EMPTY: "Directory is empty.",
      TIMESTAMP_UPDATED_PREFIX: "Timestamp of '",
      TIMESTAMP_UPDATED_SUFFIX: "' updated.",
      FILE_CREATED_SUFFIX: "' created.",
      ITEM_REMOVED_SUFFIX: "' removed.",
      FORCIBLY_REMOVED_PREFIX: "Forcibly removed '",
      FORCIBLY_REMOVED_SUFFIX: "'.",
      REMOVAL_CANCELLED_PREFIX: "Removal of '",
      REMOVAL_CANCELLED_SUFFIX: "' cancelled.",
      MOVED_PREFIX: "Moved '",
      MOVED_TO: "' to '",
      MOVED_SUFFIX: "'.",
      COPIED_PREFIX: "Copied '",
      COPIED_TO: "' to '",
      COPIED_SUFFIX: "'.",
      SESSION_SAVED_FOR_PREFIX: "Session manually saved for ",
      SESSION_LOADED_MSG: "Session loaded from manual save.",
      LOAD_STATE_CANCELLED: "Load state cancelled.",
      NO_MANUAL_SAVE_FOUND_PREFIX: "No manually saved state found for ",
      WELCOME_PREFIX: "Guten Tag, ",
      WELCOME_SUFFIX: "! Type 'help' for commands.",
      EXPORTING_PREFIX: "Exporting '",
      EXPORTING_SUFFIX: "'... Check your browser downloads.",
      BACKUP_CREATING_PREFIX: "Creating backup '",
      BACKUP_CREATING_SUFFIX: "'... Check your browser downloads.",
      RESTORE_CANCELLED_NO_FILE: "Restore cancelled: No file selected.",
      RESTORE_SUCCESS_PREFIX: "Session for user '",
      RESTORE_SUCCESS_MIDDLE: "' successfully restored from '",
      RESTORE_SUCCESS_SUFFIX: "'.",
      UPLOAD_NO_FILE: "Upload cancelled: No file selected.",
      UPLOAD_INVALID_TYPE_PREFIX: "Error: Invalid file type '",
      UPLOAD_INVALID_TYPE_SUFFIX: "'. Only .txt, .md, .html, .sh, .js, .css, .json files are allowed.",
      UPLOAD_SUCCESS_PREFIX: "File '",
      UPLOAD_SUCCESS_MIDDLE: "' uploaded successfully to '",
      UPLOAD_SUCCESS_SUFFIX: "'.",
      UPLOAD_READ_ERROR_PREFIX: "Error reading file '",
      UPLOAD_READ_ERROR_SUFFIX: "'.",
      NO_COMMANDS_IN_HISTORY: "No commands in history.",
      EDITOR_DISCARD_CONFIRM: "Care to save your work?", // Confirm discard changes message
      BACKGROUND_PROCESS_STARTED_PREFIX: "[",
      BACKGROUND_PROCESS_STARTED_SUFFIX: "] Backgrounded.",
      BACKGROUND_PROCESS_OUTPUT_SUPPRESSED: "[Output suppressed for background process]",
      PIPELINE_ERROR_PREFIX: "Pipeline error in command: ",
    },
    INTERNAL_ERRORS: {
      DB_NOT_INITIALIZED_FS_SAVE: "DB not initialized for FS save",
      DB_NOT_INITIALIZED_FS_LOAD: "DB not initialized for FS load",
      DB_NOT_INITIALIZED_FS_DELETE: "DB not initialized for FS delete",
      DB_NOT_INITIALIZED_FS_CLEAR: "DB not initialized for clearing all FS",
      CORRUPTED_FS_DATA_PRE_SAVE: "Corrupted FS data before saving.",
      SOURCE_NOT_FOUND_IN_PARENT_PREFIX: "internal error: source '",
      SOURCE_NOT_FOUND_IN_PARENT_MIDDLE: "' not found in parent '",
      SOURCE_NOT_FOUND_IN_PARENT_SUFFIX: "'",
    },
  };
})();

let DOM = {}; // Will be populated in window.onload

const Utils = (() => {
  "use strict";

  function formatConsoleArgs(args) {
    return Array.from(args)
      .map((arg) =>
        typeof arg === "object" && arg !== null ?
        JSON.stringify(arg) :
        String(arg),
      )
      .join(" ");
  }

  function deepCopyNode(node) {
    return node ? JSON.parse(JSON.stringify(node)) : null;
  }

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  function getFileExtension(filePath) {
    if (!filePath || typeof filePath !== "string") return "";
    const name = filePath.substring(
      filePath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1,
    );
    const lastDot = name.lastIndexOf(".");
    if (lastDot === -1 || lastDot === 0 || lastDot === name.length - 1) {
      // No extension, hidden file, or dot is last char
      return "";
    }
    return name.substring(lastDot + 1).toLowerCase();
  }

  function createElement(tag, attributes = {}, ...childrenArgs) {
    const element = document.createElement(tag);
    for (const key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        const value = attributes[key];
        if (key === "textContent") {
          element.textContent = value;
        } else if (key === "innerHTML") {
          element.innerHTML = value;
        } else if (key === "classList" && Array.isArray(value)) {
          value.forEach((cls) => {
            if (typeof cls === "string") {
              cls.split(" ").forEach((c) => {
                if (c) element.classList.add(c);
              });
            }
          });
        } else if (key === "className" && typeof value === "string") {
          // Allow className as an alias for classList for convenience
          value.split(" ").forEach((c) => {
            if (c) element.classList.add(c);
          });
        } else if (key === "style" && typeof value === "object") {
          for (const styleProp in value) {
            if (value.hasOwnProperty(styleProp)) {
              element.style[styleProp] = value[styleProp];
            }
          }
        } else if (key === "eventListeners" && typeof value === "object") {
          for (const eventType in value) {
            if (
              value.hasOwnProperty(eventType) &&
              typeof value[eventType] === "function"
            ) {
              element.addEventListener(eventType, value[eventType]);
            }
          }
        } else if (value !== null && value !== undefined) {
          // Handle boolean attributes correctly
          if (typeof value === "boolean") {
            if (value) element.setAttribute(key, "");
            else element.removeAttribute(key);
          } else {
            element.setAttribute(key, value);
          }
        }
      }
    }
    // Process children
    const childrenToProcess =
      childrenArgs.length === 1 && Array.isArray(childrenArgs[0]) ?
      childrenArgs[0] :
      childrenArgs;
    childrenToProcess.forEach((child) => {
      if (child instanceof Node) {
        element.appendChild(child);
      } else if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else if (child !== null && child !== undefined) {
        // Optionally log or handle other types if necessary
        console.warn(
          "Utils.createElement: Skipping unexpected child type:",
          child,
        );
      }
    });
    return element;
  }

  function validateArguments(argsArray, config = {}) {
    const argCount = argsArray.length;
    if (typeof config.exact === "number") {
      if (argCount !== config.exact) {
        return {
          isValid: false,
          errorDetail: `expected exactly ${config.exact} argument(s) but got ${argCount}`,
        };
      }
    } else {
      if (typeof config.min === "number" && argCount < config.min) {
        return {
          isValid: false,
          errorDetail: `expected at least ${config.min} argument(s), but got ${argCount}`,
        };
      }
      if (typeof config.max === "number" && argCount > config.max) {
        return {
          isValid: false,
          errorDetail: `expected at most ${config.max} argument(s), but got ${argCount}`,
        };
      }
    }
    return {
      isValid: true
    };
  }

  function parseNumericArg(argString, options = {}) {
    const {
      allowFloat = false, allowNegative = false, min, max
    } = options;
    const num = allowFloat ? parseFloat(argString) : parseInt(argString, 10);
    if (isNaN(num)) {
      return {
        value: null,
        error: "is not a valid number"
      };
    }
    if (!allowNegative && num < 0) {
      return {
        value: null,
        error: "must be a non-negative number"
      };
    }
    if (min !== undefined && num < min) {
      return {
        value: null,
        error: `must be at least ${min}`
      };
    }
    if (max !== undefined && num > max) {
      return {
        value: null,
        error: `must be at most ${max}`
      };
    }
    return {
      value: num,
      error: null
    };
  }

  function validateUsernameFormat(username) {
    if (!username || typeof username !== "string" || username.trim() === "") {
      return {
        isValid: false,
        error: "Username cannot be empty."
      };
    }
    if (username.includes(" ")) {
      return {
        isValid: false,
        error: "Username cannot contain spaces."
      };
    }
    if (Config.USER.RESERVED_USERNAMES.includes(username.toLowerCase())) {
      return {
        isValid: false,
        error: `Cannot use '${username}'. This username is reserved.`,
      };
    }
    if (username.length < Config.USER.MIN_USERNAME_LENGTH) {
      return {
        isValid: false,
        error: `Username must be at least ${Config.USER.MIN_USERNAME_LENGTH} characters long.`,
      };
    }
    if (username.length > Config.USER.MAX_USERNAME_LENGTH) {
      return {
        isValid: false,
        error: `Username cannot exceed ${Config.USER.MAX_USERNAME_LENGTH} characters.`,
      };
    }
    // Basic check for alphanumeric, allowing underscores or hyphens if desired (not currently in spec)
    // if (!/^[a-zA-Z0-9]+$/.test(username)) {
    //     return { isValid: false, error: "Username must be alphanumeric." };
    // }
    return {
      isValid: true,
      error: null
    };
  }

  function parseFlags(argsArray, flagDefinitions) {
    const flags = {};
    const remainingArgs = [];

    // Initialize flags based on definitions
    flagDefinitions.forEach((def) => {
      flags[def.name] = def.takesValue ? null : false; // Default for value-taking flags is null
    });
    for (let i = 0; i < argsArray.length; i++) {
      const arg = argsArray[i];
      let isFlag = false;
      for (const def of flagDefinitions) {
        if (arg === def.short || arg === def.long) {
          if (def.takesValue) {
            if (i + 1 < argsArray.length) {
              flags[def.name] = argsArray[i + 1];
              i++; // Consume the flag's value
            } else {
              // Flag expects a value but none is provided.
              // Depending on desired strictness, this could be an error or a warning.
              // For now, set to null and let command handler decide.
              console.warn(
                `Flag ${arg} expects a value, but none was provided.`,
              );
              flags[def.name] = null; // Or throw an error: throw new Error(`Flag ${arg} requires a value.`);
            }
          } else {
            flags[def.name] = true;
          }
          isFlag = true;
          break;
        }
      }
      if (!isFlag) {
        remainingArgs.push(arg);
      }
    }
    return {
      flags,
      remainingArgs
    };
  }

  function globToRegex(glob) {
    let regexStr = "^";
    for (let i = 0; i < glob.length; i++) {
      const char = glob[i];
      switch (char) {
        case "*":
          regexStr += ".*";
          break;
        case "?":
          regexStr += ".";
          break;
        case "[": {
          let charClass = "[";
          let k = i + 1;
          // Handle negation ![...] or ^[...]
          if (k < glob.length && (glob[k] === "!" || glob[k] === "^")) {
            charClass += "^";
            k++;
          }
          // Handle literal ']' as first char in class: []...]
          if (k < glob.length && glob[k] === "]") {
            charClass += "\\]"; // Escape it for regex
            k++;
          }
          while (k < glob.length && glob[k] !== "]") {
            // Handle '-' for range, ensuring it's not at start/end of range
            if (
              glob[k] === "-" &&
              charClass.length > 1 && // Not the first char in charClass (e.g., `[` or `[^`)
              charClass[charClass.length - 1] !== "[" && // Ensure not `[-...]` without initial char
              charClass[charClass.length - 1] !== "^" && // Ensure not `[^-...]` without initial char
              k + 1 < glob.length &&
              glob[k + 1] !== "]" // Ensure not `[...-]`
            ) {
              charClass += "-";
            } else if (/[.^${}()|[\]\\]/.test(glob[k])) {
              // Escape regex special characters
              charClass += "\\" + glob[k];
            } else {
              charClass += glob[k];
            }
            k++;
          }
          if (k < glob.length && glob[k] === "]") {
            charClass += "]";
            i = k; // Move main loop index past the character class
          } else {
            // Unmatched '[', treat as literal
            regexStr += "\\["; // Escape it
            continue; // Let the outer loop handle the char after '['
          }
          regexStr += charClass;
          break;
        }
        default:
          // Escape other regex special characters
          if (/[.^${}()|[\]\\]/.test(char)) {
            regexStr += "\\";
          }
          regexStr += char;
      }
    }
    regexStr += "$";
    try {
      return new RegExp(regexStr);
    } catch (e) {
      // Invalid glob pattern that results in invalid regex
      console.warn(
        `Utils.globToRegex: Failed to convert glob "${glob}" to regex: ${e.message}`,
      );
      return null; // Indicate failure
    }
  }

  return {
    // Expose all utility functions
    formatConsoleArgs,
    deepCopyNode,
    formatBytes,
    getFileExtension,
    createElement,
    validateArguments,
    parseNumericArg,
    validateUsernameFormat,
    parseFlags,
    globToRegex,
  };
})();
const TimestampParser = (() => {
  "use strict";

  // Parses STAMP format [[CC]YY]MMDDhhmm[.ss] to ISO string
  function parseStampToISO(stampStr) {
    let year,
      monthVal,
      day,
      hours,
      minutes,
      seconds = 0;
    const currentDate = new Date();
    let s = stampStr;

    // Check for seconds part
    if (s.includes(".")) {
      const parts = s.split(".");
      if (
        parts.length !== 2 ||
        parts[1].length !== 2 ||
        isNaN(parseInt(parts[1], 10))
      ) {
        return null; // Invalid seconds format
      }
      seconds = parseInt(parts[1], 10);
      if (seconds < 0 || seconds > 59) return null; // Invalid seconds range
      s = parts[0]; // Process the main part without seconds
    }

    // Determine format based on length
    if (s.length === 12) {
      // CCYYMMDDhhmm
      year = parseInt(s.substring(0, 4), 10);
      monthVal = parseInt(s.substring(4, 6), 10);
      day = parseInt(s.substring(6, 8), 10);
      hours = parseInt(s.substring(8, 10), 10);
      minutes = parseInt(s.substring(10, 12), 10);
    } else if (s.length === 10) {
      // YYMMDDhhmm
      const YY = parseInt(s.substring(0, 2), 10);
      if (isNaN(YY)) return null;
      // Determine century (POSIX touch behavior: 69-99 -> 19xx, 00-68 -> 20xx)
      year = YY < 69 ? 2000 + YY : 1900 + YY;
      monthVal = parseInt(s.substring(2, 4), 10);
      day = parseInt(s.substring(4, 6), 10);
      hours = parseInt(s.substring(6, 8), 10);
      minutes = parseInt(s.substring(8, 10), 10);
    } else if (s.length === 8) {
      // MMDDhhmm (current year)
      year = currentDate.getFullYear();
      monthVal = parseInt(s.substring(0, 2), 10);
      day = parseInt(s.substring(2, 4), 10);
      hours = parseInt(s.substring(4, 6), 10);
      minutes = parseInt(s.substring(6, 8), 10);
    } else {
      return null; // Invalid length
    }

    // Validate parsed components
    if (
      isNaN(year) ||
      isNaN(monthVal) ||
      isNaN(day) ||
      isNaN(hours) ||
      isNaN(minutes)
    )
      return null;
    if (
      monthVal < 1 ||
      monthVal > 12 ||
      day < 1 ||
      day > 31 || // Basic day validation, Date object will do more precise
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    )
      return null;

    // Create Date object using UTC to avoid timezone shifts during construction from parts
    const dateObj = new Date(
      Date.UTC(year, monthVal - 1, day, hours, minutes, seconds),
    );

    // Final check: if Date object adjusted values (e.g., Feb 30 became Mar 2)
    if (
      dateObj.getUTCFullYear() !== year ||
      dateObj.getUTCMonth() !== monthVal - 1 ||
      dateObj.getUTCDate() !== day ||
      dateObj.getUTCHours() !== hours ||
      dateObj.getUTCMinutes() !== minutes ||
      dateObj.getUTCSeconds() !== seconds
    ) {
      return null; // Invalid date (e.g., Feb 30)
    }
    return dateObj.toISOString();
  }

  function resolveTimestampFromCommandFlags(flags, commandName) {
    const nowActualISO = new Date().toISOString();

    if (flags.dateString && flags.stamp) {
      return {
        timestampISO: null,
        error: `${commandName}: cannot specify both --date and -t`,
      };
    }

    if (flags.dateString) {
      // Attempt to parse the dateString. JavaScript's Date constructor is quite flexible.
      const d = new Date(flags.dateString);
      if (isNaN(d.getTime())) {
        return {
          timestampISO: null,
          error: `${commandName}: invalid date string '${flags.dateString}'`,
        };
      }
      return {
        timestampISO: d.toISOString(),
        error: null
      };
    }

    if (flags.stamp) {
      const parsedISO = parseStampToISO(flags.stamp);
      if (!parsedISO) {
        return {
          timestampISO: null,
          error: `${commandName}: invalid stamp format '${flags.stamp}' (expected [[CC]YY]MMDDhhmm[.ss])`,
        };
      }
      return {
        timestampISO: parsedISO,
        error: null
      };
    }

    // If no specific timestamp flag is given, use the current time.
    return {
      timestampISO: nowActualISO,
      error: null
    };
  }

  return {
    resolveTimestampFromCommandFlags,
    // parseStampToISO, // Optionally expose if needed externally, otherwise keep private
  };
})();
const OutputManager = (() => {
  "use strict";
  let isEditorActive = false; // Tracks if the editor modal is active
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  function setEditorActive(status) {
    isEditorActive = status;
  }

  // Main function to append text to the terminal output area
  async function appendToOutput(text, options = {}) {
    // If editor is active, only allow editor-specific messages or completion suggestions
    if (
      isEditorActive &&
      options.typeClass !== Config.CSS_CLASSES.EDITOR_MSG &&
      !options.isCompletionSuggestion // Allow completion suggestions even if editor is active (though editor might have its own)
    ) {
      return; // Suppress other terminal output
    }
    if (!DOM.outputDiv) {
      originalConsoleError(
        "OutputManager.appendToOutput: DOM.outputDiv is not defined. Message:",
        text,
      );
      return;
    }

    const {
      typeClass = null, isBackground = false
    } = options;
    // If this is a background message and the input line is currently visible,
    // echo the current input line first to maintain context.
    if (
      isBackground &&
      DOM.inputLineContainerDiv && // Check if inputLineContainerDiv is available
      !DOM.inputLineContainerDiv.classList.contains(Config.CSS_CLASSES.HIDDEN)
    ) {
      const promptText = `${DOM.promptUserSpan.textContent}${Config.TERMINAL.PROMPT_AT}${DOM.promptHostSpan.textContent}${Config.TERMINAL.PROMPT_SEPARATOR}${DOM.promptPathSpan.textContent}${Config.TERMINAL.PROMPT_CHAR} `;
      const currentInputVal = TerminalUI.getCurrentInputValue(); // Assumes TerminalUI is available
      const echoLine = Utils.createElement("div", {
        className: Config.CSS_CLASSES.OUTPUT_LINE,
        textContent: `${promptText}${currentInputVal}`,
      });
      DOM.outputDiv.appendChild(echoLine);
    }

    // Split text into lines and append each as a new div
    const lines = String(text).split("\n");
    const fragment = document.createDocumentFragment(); // Use fragment for efficiency

    for (const line of lines) {
      const lineClasses = Config.CSS_CLASSES.OUTPUT_LINE.split(" "); // Base classes
      const lineAttributes = {
        classList: [...lineClasses],
        textContent: line,
      };

      if (typeClass) {
        typeClass.split(" ").forEach((cls) => {
          if (cls) lineAttributes.classList.push(cls);
        });
      } else if (options.isError) {
        // Fallback for explicitly marked errors if no typeClass given
        Config.CSS_CLASSES.ERROR_MSG.split(" ").forEach((cls) => {
          if (cls) lineAttributes.classList.push(cls);
        });
      }
      const newLineElement = Utils.createElement("div", lineAttributes);
      fragment.appendChild(newLineElement);
    }
    DOM.outputDiv.appendChild(fragment);
    DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight; // Auto-scroll
  }

  function clearOutput() {
    if (!isEditorActive && DOM.outputDiv) {
      DOM.outputDiv.innerHTML = "";
    }
  }

  // Console override functions
  function _consoleLogOverride(...args) {
    if (
      DOM.outputDiv &&
      typeof Utils !== "undefined" &&
      typeof Utils.formatConsoleArgs === "function"
    ) {
      appendToOutput(`LOG: ${Utils.formatConsoleArgs(args)}`, {
        typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
      });
    }
    originalConsoleLog.apply(console, args); // Call original console.log
  }

  function _consoleWarnOverride(...args) {
    if (
      DOM.outputDiv &&
      typeof Utils !== "undefined" &&
      typeof Utils.formatConsoleArgs === "function"
    ) {
      appendToOutput(`WARN: ${Utils.formatConsoleArgs(args)}`, {
        typeClass: Config.CSS_CLASSES.WARNING_MSG,
      });
    }
    originalConsoleWarn.apply(console, args);
  }

  function _consoleErrorOverride(...args) {
    if (
      DOM.outputDiv &&
      typeof Utils !== "undefined" &&
      typeof Utils.formatConsoleArgs === "function"
    ) {
      appendToOutput(`ERROR: ${Utils.formatConsoleArgs(args)}`, {
        typeClass: Config.CSS_CLASSES.ERROR_MSG,
      });
    }
    originalConsoleError.apply(console, args);
  }

  // Initialize console overrides if DOM is ready
  function initializeConsoleOverrides() {
    if (
      typeof Utils === "undefined" ||
      typeof Utils.formatConsoleArgs !== "function"
    ) {
      originalConsoleError(
        "OutputManager: Cannot initialize console overrides, Utils or Utils.formatConsoleArgs is not defined.",
      );
      return;
    }
    console.log = _consoleLogOverride;
    console.warn = _consoleWarnOverride;
    console.error = _consoleErrorOverride;
  }

  return {
    setEditorActive,
    appendToOutput,
    clearOutput,
    initializeConsoleOverrides,
  };
})();

const StorageManager = (() => {
  "use strict";

  function loadItem(key, itemName, defaultValue = null) {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue !== null) {
        // Special handling for boolean values that might be stored as strings
        if (key === Config.STORAGE_KEYS.EDITOR_WORD_WRAP_ENABLED) {
          return storedValue === "true"; // Convert "true" string to boolean true
        }
        // Attempt to parse JSON, fall back to string if not JSON
        try {
          return JSON.parse(storedValue);
        } catch (e) {
          // If parsing fails, it might be a plain string value
          return storedValue;
        }
      }
    } catch (e) {
      // Handle potential errors like QuotaExceededError if localStorage is full,
      // or SecurityError if access is denied.
      const errorMsg = `Warning: Could not load ${itemName} for key '${key}' from localStorage. Error: ${e.message}. Using default value.`;
      if (
        typeof OutputManager !== "undefined" &&
        typeof OutputManager.appendToOutput === "function"
      ) {
        OutputManager.appendToOutput(errorMsg, {
          typeClass: Config.CSS_CLASSES.WARNING_MSG,
        });
      } else {
        // Fallback if OutputManager is not yet available (e.g., during initial load)
        console.warn(errorMsg);
      }
    }
    return defaultValue;
  }

  function saveItem(key, data, itemName) {
    try {
      const valueToStore =
        typeof data === "object" && data !== null ?
        JSON.stringify(data) :
        String(data); // Convert non-objects/nulls to string
      localStorage.setItem(key, valueToStore);
      return true;
    } catch (e) {
      const errorMsg = `Error saving ${itemName} for key '${key}' to localStorage. Data may be lost. Error: ${e.message}`;
      if (
        typeof OutputManager !== "undefined" &&
        typeof OutputManager.appendToOutput === "function"
      ) {
        OutputManager.appendToOutput(errorMsg, {
          typeClass: Config.CSS_CLASSES.ERROR_MSG,
        });
      } else {
        console.error(errorMsg);
      }
      // Additional user feedback might be needed here, e.g., an alert or specific UI message
      // if storage is full or access is denied.
    }
    return false;
  }

  function removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // Handle potential errors, though removeItem is less likely to throw common errors
      // unless perhaps in very specific browser/security contexts.
      console.warn(`StorageManager: Could not remove item for key '${key}'. Error: ${e.message}`);
    }
  }

  function getAllLocalStorageKeys() {
    const keys = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== null) { // Ensure key is not null (though spec says it shouldn't be)
            keys.push(key);
        }
      }
    } catch (e) {
        console.error(`StorageManager: Could not retrieve all localStorage keys. Error: ${e.message}`);
    }
    return keys;
  }
  return {
    loadItem,
    saveItem,
    removeItem,
    getAllLocalStorageKeys
  };
})();

const IndexedDBManager = (() => {
  "use strict";
  let dbInstance = null;
  let hasLoggedNormalInitialization = false; // Prevent multiple "DB initialized" messages

  function init() {
    return new Promise((resolve, reject) => {
      if (dbInstance) {
        resolve(dbInstance);
        return;
      }
      // Check if IndexedDB is supported
      if (!window.indexedDB) {
        const errorMsg = "Error: IndexedDB is not supported by your browser. File system features will be unavailable.";
        if (typeof OutputManager !== "undefined" && typeof OutputManager.appendToOutput === "function") {
          OutputManager.appendToOutput(errorMsg, { typeClass: Config.CSS_CLASSES.ERROR_MSG });
        } else {
          console.error(errorMsg);
        }
        reject(new Error("IndexedDB not supported."));
        return;
      }

      const request = indexedDB.open(
        Config.DATABASE.NAME,
        Config.DATABASE.VERSION,
      );
      request.onupgradeneeded = (event) => {
        const tempDb = event.target.result;
        if (!tempDb.objectStoreNames.contains(Config.DATABASE.FS_STORE_NAME)) {
          tempDb.createObjectStore(Config.DATABASE.FS_STORE_NAME, {
            keyPath: "id",
          });
        }
        // Add other stores or indexes here if needed in future versions
      };
      request.onsuccess = (event) => {
        dbInstance = event.target.result;
        if (!hasLoggedNormalInitialization) { // Log only once on successful normal init
          if (
            typeof OutputManager !== "undefined" &&
            typeof OutputManager.appendToOutput === "function"
          ) {
            // Delay slightly to ensure DOM is ready for this initial message
            setTimeout(() => OutputManager.appendToOutput("FileSystem DB initialized.", {
                typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
            }), 100);

          } else {
            console.log(
              "FileSystem DB initialized (OutputManager not ready for terminal log).",
            );
          }
          hasLoggedNormalInitialization = true;
        }
        resolve(dbInstance);
      };
      request.onerror = (event) => {
        const errorMsg =
          "Error: OopisOs could not access its file system storage. This might be due to browser settings (e.g., private Browse mode, disabled storage, or full storage). Please check your browser settings and try again. Some features may be unavailable.";
        if (
          typeof OutputManager !== "undefined" &&
          typeof OutputManager.appendToOutput === "function"
        ) {
          OutputManager.appendToOutput(errorMsg, {
            typeClass: Config.CSS_CLASSES.ERROR_MSG,
          });
        } else {
          // Fallback if OutputManager is not available (e.g., during initial load)
          console.error(errorMsg);
        }
        console.error("IndexedDB Database error details: ", event.target.error);
        reject(event.target.error); // Propagate the error
      };
    });
  }

  function getDbInstance() {
    if (!dbInstance) {
      // This case should ideally be handled by ensuring init() is called and resolved first.
      // Throwing an error here might be too disruptive if init failed silently earlier.
      // Consider if a more graceful fallback or re-attempt mechanism is needed.
      const errorMsg =
        "Error: OopisOs file system storage (IndexedDB) is not available. Please ensure browser storage is enabled and the page is reloaded.";
      if (
        typeof OutputManager !== "undefined" &&
        typeof OutputManager.appendToOutput === "function"
      ) {
        OutputManager.appendToOutput(errorMsg, {
          typeClass: Config.CSS_CLASSES.ERROR_MSG,
        });
      } else {
        console.error(errorMsg);
      }
      // This error indicates a programming issue (calling getDbInstance before init)
      // or a failed init that wasn't handled properly by the caller.
      throw new Error(Config.INTERNAL_ERRORS.DB_NOT_INITIALIZED_FS_LOAD);
    }
    return dbInstance;
  }
  return {
    init,
    getDbInstance // Provides access to the DB instance after initialization
  };
})();

const FileSystemManager = (() => {
  "use strict";
  let fsData = {}; // In-memory representation of the current user's FS
  let currentPath = Config.FILESYSTEM.ROOT_PATH;

  function _getFileSystemKey(user) {
    // Ensures a consistent key format for storing/retrieving user-specific FS data
    return `fs_${user}`;
  }

  // Initializes an empty file system structure for a user
  async function initialize(user) {
    fsData = {
      [Config.FILESYSTEM.ROOT_PATH]: {
        type: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE,
        children: {},
        owner: user, // Root directory owned by the user
        mode: Config.FILESYSTEM.DEFAULT_DIR_MODE,
        mtime: new Date().toISOString(),
      },
    };
    // currentPath is typically reset by UserManager upon login/logout or session load
  }
  // Saves the current in-memory file system (fsData) to IndexedDB for the specified user
  async function save(user) {
    let db;
    try {
        db = IndexedDBManager.getDbInstance();
    } catch (e) {
        OutputManager.appendToOutput(
            "Error: File system storage not available for saving. Changes may not be persisted.", { typeClass: Config.CSS_CLASSES.ERROR_MSG }
        );
        return Promise.reject(Config.INTERNAL_ERRORS.DB_NOT_INITIALIZED_FS_SAVE);
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(
          [Config.DATABASE.FS_STORE_NAME],
          "readwrite",
        );
        const store = transaction.objectStore(Config.DATABASE.FS_STORE_NAME);
        const dataToSave = Utils.deepCopyNode(fsData); // Deep copy to prevent issues

        // Basic validation of fsData before saving
        if (
          !dataToSave ||
          typeof dataToSave !== "object" ||
          !dataToSave[Config.FILESYSTEM.ROOT_PATH] ||
          dataToSave[Config.FILESYSTEM.ROOT_PATH].type !==
          Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
        ) {
          console.error(
            "Attempted to save invalid fsData structure for user:",
            user,
            dataToSave,
          );
          OutputManager.appendToOutput(
            `Error: Corrupted file system data for ${user} before saving. Save aborted.`, {
              typeClass: Config.CSS_CLASSES.ERROR_MSG
            },
          );
          return reject(
            new Error(Config.INTERNAL_ERRORS.CORRUPTED_FS_DATA_PRE_SAVE),
          );
        }
        const request = store.put({
          id: _getFileSystemKey(user),
          data: dataToSave,
        });
        request.onsuccess = () => resolve(true);
        request.onerror = (event) => {
          console.error(`Error saving FS for ${user}:`, event.target.error);
          OutputManager.appendToOutput(
            `Error: OopisOs failed to save your file system data for user '${user}'. This could be due to a storage issue. Please try again later or consider backing up your data if possible.`, {
              typeClass: Config.CSS_CLASSES.ERROR_MSG
            },
          );
          reject(event.target.error);
        };
      } catch (e) {
        // This catches errors in initiating the transaction itself (e.g., DB closed)
        console.error(`Error initiating save transaction for ${user}:`, e);
        OutputManager.appendToOutput(
          `Error: OopisOs failed to save your file system data for user '${user}' (transaction error). Please try again later.`, {
            typeClass: Config.CSS_CLASSES.ERROR_MSG
          },
        );
        reject(e);
      }
    });
  }
  // Loads the file system for the specified user from IndexedDB into fsData
  async function load(user) {
    let db;
    try {
        db = IndexedDBManager.getDbInstance();
    } catch (e) {
        OutputManager.appendToOutput(
            "Error: File system storage not available for loading. Using temporary session.", { typeClass: Config.CSS_CLASSES.ERROR_MSG }
        );
        await initialize(user); // Initialize a temporary FS
        return Promise.reject(Config.INTERNAL_ERRORS.DB_NOT_INITIALIZED_FS_LOAD);
    }

    return new Promise(async (resolve, reject) => {
      try {
        const transaction = db.transaction(
          [Config.DATABASE.FS_STORE_NAME],
          "readonly",
        );
        const store = transaction.objectStore(Config.DATABASE.FS_STORE_NAME);
        const request = store.get(_getFileSystemKey(user));
        request.onsuccess = async (event) => {
          const result = event.target.result;
          if (
            result &&
            result.data &&
            result.data[Config.FILESYSTEM.ROOT_PATH]?.type === // Basic validation
            Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
          ) {
            fsData = result.data;
            // Ensure data integrity (e.g., default permissions if missing) after loading
            _ensurePermissionsAndMtimeRecursive(
              fsData[Config.FILESYSTEM.ROOT_PATH],
              user, // Default owner for items missing it
              Config.FILESYSTEM.DEFAULT_DIR_MODE, // Default mode
            );
          } else {
            // No valid FS found, initialize a new one
            const message = result ?
              `Warning: File system for '${user}' appears invalid or corrupted. Reinitializing.` :
              `No file system found for '${user}'. Initializing new one.`;
            const messageType = result ?
              Config.CSS_CLASSES.WARNING_MSG :
              Config.CSS_CLASSES.CONSOLE_LOG_MSG;
            OutputManager.appendToOutput(message, {
              typeClass: messageType
            });
            await initialize(user);
            await save(user); // Save the newly initialized FS
          }
          resolve();
        };
        request.onerror = async (event) => {
          console.error(`Error loading FS for ${user}:`, event.target.error);
          OutputManager.appendToOutput(
            `Warning: Could not load file system for '${user}'. Initializing a new one. This might be due to a storage issue.`, {
              typeClass: Config.CSS_CLASSES.WARNING_MSG
            },
          );
          await initialize(user);
          await save(user); // Attempt to save a new FS even on load error
          reject(event.target.error); // Propagate the error
        };
      } catch (e) {
        // Catches errors in initiating the transaction
        console.error(`Error initiating load transaction for ${user}:`, e);
        OutputManager.appendToOutput(
          `Warning: Could not load file system for '${user}' (transaction error). Initializing a new one.`, {
            typeClass: Config.CSS_CLASSES.WARNING_MSG
          },
        );
        await initialize(user);
        await save(user);
        reject(e);
      }
    });
  }

  // Recursively ensures nodes have owner, mode, and mtime; sets defaults if missing.
  function _ensurePermissionsAndMtimeRecursive(
    node,
    defaultOwner,
    defaultMode, // Not used directly, derived from type
  ) {
    if (!node) return;

    if (typeof node.owner === "undefined") node.owner = defaultOwner;
    if (typeof node.mode === "undefined") {
      node.mode =
        node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE ?
        Config.FILESYSTEM.DEFAULT_DIR_MODE :
        Config.FILESYSTEM.DEFAULT_FILE_MODE;
    }
    if (typeof node.mtime === "undefined") {
      // Set a sensible default mtime if missing, e.g., now or a fixed past date.
      // Using 'now' might alter semantics if the FS was from an old backup.
      // For simplicity, let's use 'now' if it's truly undefined upon load.
      node.mtime = new Date().toISOString();
    }

    if (
      node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE &&
      node.children
    ) {
      for (const childName in node.children) {
        _ensurePermissionsAndMtimeRecursive(
          // Ensure childNode actually exists
          node.children[childName],
          defaultOwner,
          defaultMode, // Pass defaultMode down, though it's re-evaluated by type
        );
      }
    }
  }

  // Deletes a user's entire file system from IndexedDB
  async function deleteUserFS(user) {
    let db;
    try {
        db = IndexedDBManager.getDbInstance();
    } catch (e) {
        // If DB isn't available, there's nothing to delete from it.
        // Depending on strictness, this could be an error or a silent success.
        console.warn(`deleteUserFS: DB not available for user ${user}. Assuming FS is not persisted.`);
        return Promise.resolve(true); // Or reject if DB must be available.
        // return Promise.reject(Config.INTERNAL_ERRORS.DB_NOT_INITIALIZED_FS_DELETE);
    }


    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [Config.DATABASE.FS_STORE_NAME],
        "readwrite",
      );
      const store = transaction.objectStore(Config.DATABASE.FS_STORE_NAME);
      const request = store.delete(_getFileSystemKey(user));
      request.onsuccess = () => resolve(true);
      request.onerror = (event) => {
        console.error(`Error deleting FS for ${user}:`, event.target.error);
        // Optionally, inform the user via OutputManager
        reject(event.target.error);
      };
    });
  }
  // Clears all file systems from the IndexedDB store
  async function clearAllFS() {
    let db;
    try {
        db = IndexedDBManager.getDbInstance();
    } catch(e) {
        OutputManager.appendToOutput(
            "Error: File system storage not available for clearing all data.",
            { typeClass: Config.CSS_CLASSES.ERROR_MSG }
        );
        return Promise.reject(Config.INTERNAL_ERRORS.DB_NOT_INITIALIZED_FS_CLEAR);
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [Config.DATABASE.FS_STORE_NAME],
        "readwrite",
      );
      const store = transaction.objectStore(Config.DATABASE.FS_STORE_NAME);
      const request = store.clear(); // Clears all data in this object store
      request.onsuccess = () => resolve(true);
      request.onerror = (event) => {
        console.error("Error clearing FileSystemsStore:", event.target.error);
        OutputManager.appendToOutput(
          "Error: OopisOs could not clear all user file systems. Your data might still be present. Please try the operation again.", {
            typeClass: Config.CSS_CLASSES.ERROR_MSG
          },
        );
        reject(event.target.error);
      };
    });
  }

  // Accessors for current path and in-memory FS data
  function getCurrentPath() {
    return currentPath;
  }

  function setCurrentPath(path) {
    currentPath = path;
  }

  function getFsData() {
    return fsData;
  }

  function setFsData(newData) {
    // Used by restore operations, expects a valid FS structure
    fsData = newData;
  }

  // Resolves a potentially relative path to an absolute path
  function getAbsolutePath(targetPath, basePath) {
    if (!targetPath) targetPath = Config.FILESYSTEM.CURRENT_DIR_SYMBOL; // Default to current if empty

    let effectiveBasePath = basePath; // Use provided base path
    // If targetPath starts with '/', it's absolute, so base path becomes root
    if (targetPath.startsWith(Config.FILESYSTEM.PATH_SEPARATOR)) {
      effectiveBasePath = Config.FILESYSTEM.ROOT_PATH;
    }

    // Normalize base path segments
    const baseSegments =
      effectiveBasePath === Config.FILESYSTEM.ROOT_PATH ? [] : // Root has no preceding segments
      effectiveBasePath
      .substring(1) // Remove leading '/'
      .split(Config.FILESYSTEM.PATH_SEPARATOR)
      .filter((s) => s && s !== Config.FILESYSTEM.CURRENT_DIR_SYMBOL); // Remove empty or '.'

    let resolvedSegments = [...baseSegments];
    const targetSegments = targetPath.split(Config.FILESYSTEM.PATH_SEPARATOR);

    for (const segment of targetSegments) {
      if (segment === "" || segment === Config.FILESYSTEM.CURRENT_DIR_SYMBOL) {
        // Ignore empty segments (e.g., from 'path//segment') or current dir symbol within path,
        // unless it's the very first segment of an absolute path (e.g. leading '/' in '/foo')
        // which is handled by `targetPath.startsWith('/')` setting `effectiveBasePath` to root.
        if (
          targetPath.startsWith(Config.FILESYSTEM.PATH_SEPARATOR) && // If original targetPath was absolute
          resolvedSegments.length === 0 && // and we are at the root level in resolvedSegments
          segment === "" // and current segment is from the split of leading '/'
        ) {
          // This handles the case where targetPath = "/" -> targetSegments = ["", ""],
          // and effectiveBasePath was already root. We don't want to process these further.
          // Or targetPath = "/foo" -> targetSegments = ["", "foo"]. First "" is fine.
        }
        continue;
      }
      if (segment === Config.FILESYSTEM.PARENT_DIR_SYMBOL) {
        if (resolvedSegments.length > 0) {
          resolvedSegments.pop(); // Go up one level
        }
        // If already at root (resolvedSegments is empty), '..' at root stays at root.
      } else {
        resolvedSegments.push(segment); // Go down one level
      }
    }

    // Construct the final absolute path string
    if (resolvedSegments.length === 0) return Config.FILESYSTEM.ROOT_PATH;
    return (
      Config.FILESYSTEM.PATH_SEPARATOR +
      resolvedSegments.join(Config.FILESYSTEM.PATH_SEPARATOR)
    );
  }

  // Retrieves a node (file or directory object) from fsData by its path
  function getNodeByPath(path) {
    const absolutePath = getAbsolutePath(path, currentPath); // Ensure path is absolute
    if (absolutePath === Config.FILESYSTEM.ROOT_PATH)
      return fsData[Config.FILESYSTEM.ROOT_PATH]; // Direct access for root

    // Split path into segments, remove leading empty string from absolute path
    const segments = absolutePath
      .substring(1) // Remove leading '/'
      .split(Config.FILESYSTEM.PATH_SEPARATOR)
      .filter((s) => s); // Filter out any empty segments (e.g. from trailing slash)

    let currentNode = fsData[Config.FILESYSTEM.ROOT_PATH];
    for (const segment of segments) {
      if (
        currentNode &&
        currentNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE &&
        currentNode.children &&
        currentNode.children[segment] // Check if child exists
      ) {
        currentNode = currentNode.children[segment];
      } else {
        return null; // Path does not exist or encountered a non-directory
      }
    }
    return currentNode;
  }

  function calculateNodeSize(node) {
    if (!node) return 0;
    if (node.type === Config.FILESYSTEM.DEFAULT_FILE_TYPE)
      return (node.content || "").length; // Size of file is content length
    if (node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
      let totalSize = 0;
      // For directories, sum the sizes of their children (recursive, could be slow for large dirs)
      // This is a simplified size; real FS might store dir size differently.
      // For OopisOS, this recursive sum is fine.
      for (const childName in node.children) {
        totalSize += calculateNodeSize(node.children[childName]);
      }
      return totalSize;
    }
    return 0; // Unknown type
  }

  // Updates mtime of a node and its parent (if applicable)
  function _updateNodeAndParentMtime(nodePath, nowISO) {
    if (!nodePath || !nowISO) return;

    const node = getNodeByPath(nodePath); // Get the node itself
    if (node) {
      node.mtime = nowISO; // Update its mtime
    }

    // Update parent's mtime as its content (the child list/child metadata) has effectively changed
    if (nodePath !== Config.FILESYSTEM.ROOT_PATH) {
      const parentPath =
        nodePath.substring(
          0,
          nodePath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR),
        ) || Config.FILESYSTEM.ROOT_PATH; // Handle paths like /file

      const parentNode = getNodeByPath(parentPath);
      if (
        parentNode &&
        parentNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
      ) {
        parentNode.mtime = nowISO;
      }
    }
  }

  // Creates parent directories if they don't exist (like mkdir -p)
  function createParentDirectoriesIfNeeded(fullPath) {
    const currentUserForCPDIF = UserManager.getCurrentUser().name; // Assuming UserManager is available
    const nowISO = new Date().toISOString();

    // Cannot create parents for root, or if fullPath is invalid for dir creation.
    if (fullPath === Config.FILESYSTEM.ROOT_PATH) {
      return {
        parentNode: null, // Or root node if appropriate for caller
        error: "Cannot create directory structure for root.",
      };
    }

    const lastSlashIndex = fullPath.lastIndexOf(
      Config.FILESYSTEM.PATH_SEPARATOR,
    );
    // The path of the directory that would contain the final component of `fullPath`
    const parentPathForSegments =
      lastSlashIndex === 0 ? // e.g. fullPath is "/dirname"
      Config.FILESYSTEM.ROOT_PATH :
      fullPath.substring(0, lastSlashIndex);

    const finalDirNameInPath = fullPath.substring(lastSlashIndex + 1);

    // Validate the final component name if it's part of what's being implicitly created
    // (though this function mainly creates the *parents* up to fullPath's dir)
    if (
      !finalDirNameInPath || // Empty name
      finalDirNameInPath === Config.FILESYSTEM.CURRENT_DIR_SYMBOL ||
      finalDirNameInPath === Config.FILESYSTEM.PARENT_DIR_SYMBOL
    ) {
      // This error is more about the `fullPath` itself if it's meant to be a dir.
      // If fullPath is for a file, like `/a/b/file.txt`, this `finalDirNameInPath` would be `file.txt`.
      // The function is creating parents for `/a/b/`.
      // Let's assume `fullPath` is the path to the item whose parents need creating.
      // So, we process up to `parentPathForSegments`.
    }

    // If the target's parent is root, root always exists.
    if (parentPathForSegments === Config.FILESYSTEM.ROOT_PATH) {
      return {
        parentNode: fsData[Config.FILESYSTEM.ROOT_PATH], // Parent is root
        error: null
      };
    }

    // Split the parent path into segments to create
    const segmentsToCreate = parentPathForSegments
      .substring(1) // Remove leading '/'
      .split(Config.FILESYSTEM.PATH_SEPARATOR)
      .filter((s) => s); // Remove empty segments

    let currentParentNode = fsData[Config.FILESYSTEM.ROOT_PATH];
    let currentProcessedPath = Config.FILESYSTEM.ROOT_PATH;

    // Validate root node before starting traversal
    if (
      !currentParentNode ||
      typeof currentParentNode.owner === "undefined" ||
      typeof currentParentNode.mode === "undefined"
    ) {
      // This indicates a severely corrupted FS or initialization issue.
      return {
        parentNode: null,
        error: "Internal error: Root FS node is malformed.",
      };
    }

    for (const segment of segmentsToCreate) {
      // Ensure children object exists (it should for directories)
      if (
        !currentParentNode.children ||
        typeof currentParentNode.children !== "object"
      ) {
        const errorMsg = `Internal error: currentParentNode.children is not an object at path "${currentProcessedPath}" for segment "${segment}". FS may be corrupted.`;
        console.error(errorMsg, currentParentNode);
        return {
          parentNode: null,
          error: errorMsg
        };
      }

      if (!currentParentNode.children[segment]) {
        // Directory does not exist, try to create it
        if (!hasPermission(currentParentNode, currentUserForCPDIF, "write")) {
          const errorMsg = `Cannot create directory '${segment}' in '${currentProcessedPath}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`;
          return {
            parentNode: null,
            error: errorMsg
          };
        }
        currentParentNode.children[segment] = {
          type: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE,
          children: {},
          owner: currentUserForCPDIF,
          mode: Config.FILESYSTEM.DEFAULT_DIR_MODE,
          mtime: nowISO,
        };
        currentParentNode.mtime = nowISO; // Update mtime of parent as its content changed
      } else if (
        currentParentNode.children[segment].type !==
        Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
      ) {
        // Path component exists but is not a directory
        const errorMsg = `Path component '${getAbsolutePath(segment, currentProcessedPath)}' is not a directory.`;
        return {
          parentNode: null,
          error: errorMsg
        };
      }
      // Move to the next segment
      currentParentNode = currentParentNode.children[segment];
      currentProcessedPath = getAbsolutePath(segment, currentProcessedPath);

      // Validate the new currentParentNode (it should always be valid if created/existed correctly)
      if (
        !currentParentNode ||
        typeof currentParentNode.owner === "undefined" ||
        typeof currentParentNode.mode === "undefined"
      ) {
        // This would be an unexpected internal state.
        return {
          parentNode: null,
          error: `Internal error: Node for "${currentProcessedPath}" became malformed during parent creation.`,
        };
      }
    }
    // After loop, currentParentNode is the directory corresponding to parentPathForSegments
    return {
      parentNode: currentParentNode,
      error: null
    };
  }


  // Validates a path argument for commands, checking existence, type, etc.
  function validatePath(commandName, pathArg, options = {}) {
    const {
      allowMissing = false, // If true, path not existing isn't an error
        expectedType = null, // e.g., Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
        disallowRoot = false, // If true, using root path is an error
        defaultToCurrentIfEmpty = true, // If pathArg is empty, treat as '.'
    } = options;

    const effectivePathArg =
      pathArg === "" && defaultToCurrentIfEmpty ?
      Config.FILESYSTEM.CURRENT_DIR_SYMBOL :
      pathArg;

    const resolvedPath = getAbsolutePath(effectivePathArg, currentPath);
    const node = getNodeByPath(resolvedPath);

    if (disallowRoot && resolvedPath === Config.FILESYSTEM.ROOT_PATH) {
      return {
        error: `${commandName}: '${pathArg}' (resolved to root) is not a valid target for this operation.`,
        node: null, // or node if you want to return it despite error
        resolvedPath,
        optionsUsed: options, // For debugging or context
      };
    }
    if (!node) {
      if (allowMissing) {
        // Path doesn't exist, but that's allowed by this specific command context
        return {
          error: null,
          node: null,
          resolvedPath,
          optionsUsed: options
        };
      }
      // Path doesn't exist, and it's an error
      return {
        error: `${commandName}: '${pathArg}' (resolved to '${resolvedPath}'): No such file or directory`,
        node: null,
        resolvedPath,
        optionsUsed: options,
      };
    }
    // Node exists, check type if specified
    if (expectedType && node.type !== expectedType) {
      const typeName =
        expectedType === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE ?
        "directory" :
        "file";
      const actualTypeName =
        node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE ?
        "directory" :
        node.type === Config.FILESYSTEM.DEFAULT_FILE_TYPE ?
        "file" :
        "unknown type"; // Should not happen with current FS structure
      return {
        error: `${commandName}: '${pathArg}' (resolved to '${resolvedPath}') is not a ${typeName} (it's a ${actualTypeName})`,
        node, // Return node for context, even if type mismatch
        resolvedPath,
        optionsUsed: options,
      };
    }
    // Path is valid according to options
    return {
      error: null,
      node,
      resolvedPath,
      optionsUsed: options
    };
  }

  // Checks if a user has a specific permission (read, write, execute) on a node
  function hasPermission(node, username, permissionType) {
    if (
      !node ||
      typeof node.mode !== "number" ||
      typeof node.owner !== "string"
    ) {
      // This indicates an invalid node object or missing permission info.
      console.warn(
        "hasPermission: Invalid node or missing permissions info.",
        node,
      );
      return false; // Default to no permission if node is malformed.
    }

    let permissionMask;
    switch (permissionType) {
      case "read":
        permissionMask = Config.FILESYSTEM.PERMISSION_BIT_READ;
        break;
      case "write":
        permissionMask = Config.FILESYSTEM.PERMISSION_BIT_WRITE;
        break;
      case "execute":
        permissionMask = Config.FILESYSTEM.PERMISSION_BIT_EXECUTE;
        break;
      default:
        console.warn(
          "hasPermission: Unknown permission type requested:",
          permissionType,
        );
        return false; // Unknown permission type.
    }

    const isOwner = node.owner === username;
    let effectiveModeBits;

    // Simplified OopisOS permissions:
    // First octal digit (shifted) for owner, second for others.
    // Example: mode 0o75 (binary 111 101)
    // Owner: (0o75 >> 3) & 0b111 = 0o7 & 0b111 = 7 (rwx)
    // Other: 0o75 & 0b111 = 0o5 & 0b111 = 5 (r-x)
    if (isOwner) {
      effectiveModeBits = (node.mode >> 3) & 0b111; // Owner bits
    } else {
      effectiveModeBits = node.mode & 0b111; // Other bits
    }

    return (effectiveModeBits & permissionMask) === permissionMask;
  }

  // Formats a node's mode (permissions) into a string like "drwxr-xr--"
  function formatModeToString(node) {
    if (!node || typeof node.mode !== "number") return "---------"; // Default for invalid node
    const mode = node.mode;
    const typeChar =
      node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE ? "d" : "-";

    // Extract owner and other permission bits
    const ownerPerms = (mode >> 3) & 0b111; // rwx for owner
    const otherPerms = mode & 0b111; // rwx for others

    const r = Config.FILESYSTEM.PERMISSION_BIT_READ;
    const w = Config.FILESYSTEM.PERMISSION_BIT_WRITE;
    const x = Config.FILESYSTEM.PERMISSION_BIT_EXECUTE;

    let str = typeChar;
    // Owner permissions
    str += (ownerPerms & r) ? "r" : "-";
    str += (ownerPerms & w) ? "w" : "-";
    str += (ownerPerms & x) ? "x" : "-";
    // Other permissions
    str += (otherPerms & r) ? "r" : "-";
    str += (otherPerms & w) ? "w" : "-";
    str += (otherPerms & x) ? "x" : "-";
    // Simplified: no group permissions, so last 3 are hyphens or copy 'other'
    // For a 9-char string like Unix, we can repeat 'other' or add a placeholder.
    // Let's keep it simple for OopisOS: type + owner (3) + other (3) = 7 chars.
    // If a 9-char string is desired (like "drwxr-x---"), we'd add group explicitly.
    // For now, let's match standard 1 (type) + 3 (owner) + 3 (group, same as other for now) + 3 (other)
    // To make it look more standard, let's use owner, other, other (simplified)
    // Standard is: type user group other. We have type user other.
    // A common way to simplify is to show user, and then a single "other" category.
    // The current `ls` format expects something like `d rwx r-x ---` (9 chars after type)
    // Let's stick to what `ls` formatter `formatLongListItem` expects for string length.
    // The current `formatLongListItem` seems to build it manually to 7 chars for perms.
    // If it implies `type + owner_perms + other_perms` and then additional fixed spacing.
    // Let's make this function return a standard 7-character perm string (type + 3 owner + 3 other)
    // NO, the `formatLongListItem` in `ls` takes this output and uses it directly.
    // It uses `perms` then `linkCount`, etc. So this function should produce `drwxr-x---` type string (10 chars).
    // For OopisOS, we have Owner and Other. Let's represent "Group" as same as "Other" for display.
    str += (otherPerms & r) ? "r" : "-"; // Group read (same as other)
    str += (otherPerms & w) ? "w" : "-"; // Group write (same as other)
    str += (otherPerms & x) ? "x" : "-"; // Group execute (same as other)

    return str; // Returns string like "drwxr-xr-x"
  }


  return {
    initialize,
    save,
    load,
    deleteUserFS,
    clearAllFS,
    getCurrentPath,
    setCurrentPath,
    getFsData,
    setFsData,
    getAbsolutePath,
    getNodeByPath,
    createParentDirectoriesIfNeeded,
    calculateNodeSize,
    validatePath,
    hasPermission,
    formatModeToString,
    _updateNodeAndParentMtime, // Expose for commands that need fine-grained mtime updates
    _ensurePermissionsAndMtimeRecursive, // Expose for restore or data integrity checks
  };
})();

const HistoryManager = (() => {
  "use strict";
  let commandHistory = [];
  let historyIndex = 0; // Points to the position for the *next* new command or current view in history

  function add(command) {
    const trimmedCommand = command.trim();
    if (
      trimmedCommand && // Only add non-empty commands
      (commandHistory.length === 0 ||
        commandHistory[commandHistory.length - 1] !== trimmedCommand) // Avoid consecutive duplicates
    ) {
      commandHistory.push(trimmedCommand);
      if (commandHistory.length > Config.TERMINAL.MAX_HISTORY_SIZE) {
        commandHistory.shift(); // Remove the oldest command
      }
    }
    // After adding, historyIndex should point to the end, ready for a new command or for ArrowUp to go to last actual command
    historyIndex = commandHistory.length;
  }

  function getPrevious() {
    if (commandHistory.length > 0 && historyIndex > 0) {
      historyIndex--;
      return commandHistory[historyIndex];
    }
    return null; // No more history upwards, or history is empty
  }

  function getNext() {
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      return commandHistory[historyIndex];
    } else if (historyIndex >= commandHistory.length - 1) {
      // If at the last command or beyond, ArrowDown should clear the input line
      historyIndex = commandHistory.length; // Move index to "empty" slot past last command
      return ""; // Return empty string to clear input
    }
    return null; // Should not be reached if logic is correct
  }

  // Resets the history navigation index, typically after a command is entered
  function resetIndex() {
    historyIndex = commandHistory.length;
  }

  function getFullHistory() {
    return [...commandHistory]; // Return a copy
  }

  function clearHistory() {
    commandHistory = [];
    historyIndex = 0;
  }

  // For loading session state
  function setHistory(newHistory) {
    commandHistory = Array.isArray(newHistory) ? [...newHistory] : [];
    // Ensure history does not exceed max size if loaded state is too large
    if (commandHistory.length > Config.TERMINAL.MAX_HISTORY_SIZE) {
        commandHistory = commandHistory.slice(commandHistory.length - Config.TERMINAL.MAX_HISTORY_SIZE);
    }
    historyIndex = commandHistory.length; // Reset index to the end
  }
  return {
    add,
    getPrevious,
    getNext,
    resetIndex,
    getFullHistory,
    clearHistory,
    setHistory,
  };
})();

const ConfirmationManager = (() => {
  "use strict";
  let awaitingConfirmation = false;
  let confirmationContext = null; // Stores { promptMessageLines, data, onConfirm, onCancel }

  // Request confirmation from the user
  function request(
    promptMessageLines, // Array of strings or a single string for the prompt
    dataForAction, // Any data needed by the onConfirm/onCancel callbacks
    onConfirmCallback, // Function to call if user confirms
    onCancelCallback = null, // Optional function if user cancels
  ) {
    if (awaitingConfirmation) {
        // Handle nested confirmation requests if necessary, or disallow.
        // For now, let's assume one confirmation at a time.
        OutputManager.appendToOutput("Another confirmation is already pending.", { typeClass: Config.CSS_CLASSES.WARNING_MSG });
        if (onCancelCallback) onCancelCallback(dataForAction); // Auto-cancel the new one
        return;
    }

    awaitingConfirmation = true;
    confirmationContext = {
      promptMessageLines: Array.isArray(promptMessageLines) ?
        promptMessageLines : [promptMessageLines],
      data: dataForAction,
      onConfirm: onConfirmCallback,
      onCancel: onCancelCallback,
    };
    // Display the prompt messages
    confirmationContext.promptMessageLines.forEach((line) =>
      OutputManager.appendToOutput(line, {
        typeClass: Config.CSS_CLASSES.WARNING_MSG, // Or a dedicated confirmation style
      }),
    );
    OutputManager.appendToOutput(Config.MESSAGES.CONFIRMATION_PROMPT, {
      typeClass: Config.CSS_CLASSES.WARNING_MSG,
    });

    // Ensure terminal input is enabled and focused for the confirmation
    TerminalUI.setInputState(true); // Make sure input is editable

    TerminalUI.clearInput(); // Clear current input for confirmation
    if (DOM.inputLineContainerDiv) { // Check if DOM element exists
        DOM.inputLineContainerDiv.classList.remove(Config.CSS_CLASSES.HIDDEN);
    }
    TerminalUI.focusInput();
    if (DOM.outputDiv) { // Check if DOM element exists
        DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight; // Scroll to show prompt
    }
  }
  // Handle user's input for confirmation
  async function handleConfirmation(input) {
    if (!awaitingConfirmation || !confirmationContext) return false; // No confirmation pending

    let processed = false;
    if (
      input.trim() === "YES" && // Strict "YES" for confirmation
      typeof confirmationContext.onConfirm === "function"
    ) {
      // Call await here if onConfirm returns a Promise and we need to wait for it
      await confirmationContext.onConfirm(confirmationContext.data);
      processed = true;
    } else {
      // Any other input is treated as cancellation
      if (typeof confirmationContext.onCancel === "function") {
        await confirmationContext.onCancel(confirmationContext.data); // Also await if it's async
      } else {
        // Default cancel message if no specific callback
        OutputManager.appendToOutput(Config.MESSAGES.OPERATION_CANCELLED, {
          typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
        });
      }
      processed = true;
    }
    // Reset confirmation state
    awaitingConfirmation = false;
    confirmationContext = null;
    return processed; // Indicates if the input was processed as a confirmation response
  }

  function isAwaiting() {
    return awaitingConfirmation;
  }
  return {
    request,
    handleConfirmation,
    isAwaiting
  };
})();

const UserManager = (() => {
  "use strict";
  let currentUser = {
    name: Config.USER.DEFAULT_NAME
  }; // Initialize with Guest user

  function getCurrentUser() {
    return currentUser;
  }

  async function register(username) {
    const formatValidation = Utils.validateUsernameFormat(username);
    if (!formatValidation.isValid) {
      return {
        success: false,
        error: formatValidation.error
      };
    }

    const users = StorageManager.loadItem(
      Config.STORAGE_KEYS.USER_CREDENTIALS,
      "User list", {}, // Default to empty object if not found
    );
    if (users[username]) {
      return {
        success: false,
        error: `User '${username}' already exists.`
      };
    }

    users[username] = {}; // Store some user data if needed, e.g., preferences, hash (not for OopisOS)
    if (
      StorageManager.saveItem(
        Config.STORAGE_KEYS.USER_CREDENTIALS,
        users,
        "User list",
      )
    ) {
      // When a new user is registered, initialize their file system
      // Temporarily switch context to save the new user's FS, then revert if needed.
      const activeUserAtStart = UserManager.getCurrentUser().name; // Could be 'Guest' or another user
      let activeFsDataSnapshot = null;
      let activePathSnapshot = null;
      let restoreNeeded = false;

      // Snapshot current FS if it's not for the user being created and has data
      if (
        FileSystemManager.getFsData() && // Check if FS data object exists
        Object.keys(FileSystemManager.getFsData()).length > 0 // And is not empty
      ) {
        activeFsDataSnapshot = Utils.deepCopyNode(
          FileSystemManager.getFsData(),
        );
        activePathSnapshot = FileSystemManager.getCurrentPath();
        restoreNeeded = true;
      }

      await FileSystemManager.initialize(username); // Initialize FS for the new user
      await FileSystemManager.save(username); // Save this new FS

      // If we snapped another user's FS, restore it to memory
      if (restoreNeeded && activeUserAtStart !== username) {
        FileSystemManager.setFsData(activeFsDataSnapshot);
        FileSystemManager.setCurrentPath(activePathSnapshot);
        // Note: The active FS in memory is now back to `activeUserAtStart`'s FS.
        // The `currentUser` object in UserManager is NOT changed by `register`.
      } else if (activeUserAtStart === username) {
        // If for some reason the current user was already the one being registered (should not happen due to "already exists" check)
        // then we just loaded their new FS. Update prompt.
         TerminalUI.updatePrompt();
      }


      return {
        success: true,
        message: `User '${username}' registered. You can now login.`,
      };
    } else {
      return {
        success: false,
        error: "Failed to save new user credentials."
      };
    }
  }

  async function login(username) {
    if (currentUser.name === username) {
      return {
        success: true,
        message: `${Config.MESSAGES.ALREADY_LOGGED_IN_AS_PREFIX}${username}${Config.MESSAGES.ALREADY_LOGGED_IN_AS_SUFFIX} ${Config.MESSAGES.NO_ACTION_TAKEN}`,
        noAction: true, // Indicate no actual change occurred
      };
    }
    const users = StorageManager.loadItem(
      Config.STORAGE_KEYS.USER_CREDENTIALS,
      "User list", {},
    );
    // Allow login as Guest even if not explicitly in 'users' (Guest is default)
    if (
      !users.hasOwnProperty(username) &&
      username !== Config.USER.DEFAULT_NAME
    ) {
      return {
        success: false,
        error: "Invalid username."
      };
    }
    // Save state for the outgoing user (if not Guest)
    if (
      currentUser.name !== Config.USER.DEFAULT_NAME &&
      currentUser.name !== username // Don't save if re-logging (though caught above)
    ) {
      SessionManager.saveAutomaticState(currentUser.name); // Assumes SessionManager is available
    }
    currentUser = {
      name: username
    }; // Set the new current user
    HistoryManager.clearHistory(); // Clear history for the new session
    await FileSystemManager.load(username); // Load the new user's file system
    SessionManager.loadAutomaticState(username); // Load session state (output, path, etc.)
    TerminalUI.updatePrompt(); // Update prompt to reflect new user and path
    return {
      success: true,
      message: `Logged in as ${username}.`
    };
  }

  async function logout() {
    if (currentUser.name === Config.USER.DEFAULT_NAME) {
      return {
        success: true,
        message: `Already logged in as Guest. ${Config.MESSAGES.NO_ACTION_TAKEN}`,
        noAction: true,
      };
    }
    SessionManager.saveAutomaticState(currentUser.name); // Save current user's state
    const prevUserName = currentUser.name;
    currentUser = {
      name: Config.USER.DEFAULT_NAME
    }; // Revert to Guest user
    HistoryManager.clearHistory();
    await FileSystemManager.load(Config.USER.DEFAULT_NAME); // Load Guest FS
    SessionManager.loadAutomaticState(Config.USER.DEFAULT_NAME); // Load Guest session
    TerminalUI.updatePrompt();
    return {
      success: true,
      message: `User ${prevUserName} logged out. Now logged in as ${Config.USER.DEFAULT_NAME}.`,
    };
  }

  // Used by SessionManager during full reset or initial load
  function setCurrentUserObject(userObject) {
    if (userObject && typeof userObject.name === 'string') {
        currentUser = userObject;
    } else {
        console.warn("UserManager.setCurrentUserObject: Invalid user object provided. Using default.");
        currentUser = { name: Config.USER.DEFAULT_NAME };
    }
  }

  function getDefaultUser() {
      return Config.USER.DEFAULT_NAME;
  }
  return {
    getCurrentUser,
    register,
    login,
    logout,
    setCurrentUserObject, // For session management
    getDefaultUser,
  };
})();

const SessionManager = (() => {
  "use strict";

  function _getAutomaticSessionStateKey(user) {
    // Key for per-user automatic session state (path, history, output)
    return `${Config.STORAGE_KEYS.USER_TERMINAL_STATE_PREFIX}${user}`;
  }

  function _getManualUserTerminalStateKey(user) {
    // Key for per-user manually saved full state (FS snapshot, path, history, output)
    // Ensure 'user' is the username string, not the object.
    const userName =
      typeof user === "object" && user !== null && user.name ?
      user.name :
      String(user);
    return `${Config.STORAGE_KEYS.MANUAL_TERMINAL_STATE_PREFIX}${userName}`;
  }

  // Saves the "automatic" state (current path, visible output, command history, current input)
  function saveAutomaticState(username) {
    if (!username) {
        console.warn("saveAutomaticState: No username provided. State not saved.");
        return;
    }
    const currentInput = TerminalUI.getCurrentInputValue(); // Assumes TerminalUI is available
    const autoState = {
      currentPath: FileSystemManager.getCurrentPath(), // Assumes FileSystemManager is available
      outputHTML: DOM.outputDiv ? DOM.outputDiv.innerHTML : "", // Check DOM.outputDiv
      currentInput: currentInput,
      commandHistory: HistoryManager.getFullHistory(), // Assumes HistoryManager is available
    };
    StorageManager.saveItem(
      _getAutomaticSessionStateKey(username),
      autoState,
      `Auto session for ${username}`, // Item name for logging/errors
    );
  }

  // Loads the "automatic" state for a user
  function loadAutomaticState(username) {
    if (!username) {
        console.warn("loadAutomaticState: No username provided. Cannot load state.");
        // Initialize to a default clean state
        if (DOM.outputDiv) DOM.outputDiv.innerHTML = "";
        TerminalUI.setCurrentInputValue("");
        FileSystemManager.setCurrentPath(Config.FILESYSTEM.ROOT_PATH);
        HistoryManager.clearHistory();
        OutputManager.appendToOutput(
            `${Config.MESSAGES.WELCOME_PREFIX}${Config.USER.DEFAULT_NAME}${Config.MESSAGES.WELCOME_SUFFIX}`,
        );
        TerminalUI.updatePrompt();
        if (DOM.outputDiv) DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight;
        return false;
    }

    const autoState = StorageManager.loadItem(
      _getAutomaticSessionStateKey(username),
      `Auto session for ${username}`,
    );
    if (autoState) {
      FileSystemManager.setCurrentPath(
        autoState.currentPath || Config.FILESYSTEM.ROOT_PATH,
      );
      if (DOM.outputDiv) { // Check DOM.outputDiv
          // Only set innerHTML if it was actually part of the saved state
          if (autoState.hasOwnProperty("outputHTML")) {
            DOM.outputDiv.innerHTML = autoState.outputHTML || "";
          } else {
            // If outputHTML wasn't saved (e.g. older version or fresh session), clear it.
             DOM.outputDiv.innerHTML = "";
             OutputManager.appendToOutput(
                `${Config.MESSAGES.WELCOME_PREFIX}${username}${Config.MESSAGES.WELCOME_SUFFIX}`,
             );
          }
      }
      TerminalUI.setCurrentInputValue(autoState.currentInput || "");
      HistoryManager.setHistory(autoState.commandHistory || []);
    } else {
      // No saved state found, initialize to a clean state
      if (DOM.outputDiv) DOM.outputDiv.innerHTML = "";
      TerminalUI.setCurrentInputValue("");
      FileSystemManager.setCurrentPath(Config.FILESYSTEM.ROOT_PATH);
      HistoryManager.clearHistory();
      // Welcome message for the user if no state found
      OutputManager.appendToOutput(
        `${Config.MESSAGES.WELCOME_PREFIX}${username}${Config.MESSAGES.WELCOME_SUFFIX}`,
      );
    }
    TerminalUI.updatePrompt();
    if (DOM.outputDiv) DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight;
    return !!autoState; // Return true if state was loaded, false otherwise
  }
  // Manually saves the ENTIRE current session state, including FS snapshot
  async function saveManualState() {
    const currentUser = UserManager.getCurrentUser(); // Assumes UserManager is available
    const currentInput = TerminalUI.getCurrentInputValue();
    const manualStateData = {
      user: currentUser.name, // Store which user this state belongs to
      osVersion: Config.OS.VERSION, // For potential future compatibility checks
      timestamp: new Date().toISOString(),
      currentPath: FileSystemManager.getCurrentPath(),
      outputHTML: DOM.outputDiv ? DOM.outputDiv.innerHTML : "",
      currentInput: currentInput,
      fsDataSnapshot: Utils.deepCopyNode(FileSystemManager.getFsData()), // Full FS copy
      commandHistory: HistoryManager.getFullHistory(),
    };
    if (
      StorageManager.saveItem(
        _getManualUserTerminalStateKey(currentUser), // Key includes username
        manualStateData,
        `Manual save for ${currentUser.name}`,
      )
    ) {
      return {
        success: true,
        message: `${Config.MESSAGES.SESSION_SAVED_FOR_PREFIX}${currentUser.name}.`,
      };
    } else {
      return {
        success: false,
        error: "Failed to save session manually."
      };
    }
  }
  // Attempts to load a manually saved full session state
  async function loadManualState() {
    const currentUser = UserManager.getCurrentUser();
    const manualStateData = StorageManager.loadItem(
      _getManualUserTerminalStateKey(currentUser),
      `Manual save for ${currentUser.name}`,
    );
    if (manualStateData) {
      // Basic validation of the loaded data
      if (manualStateData.user && manualStateData.user !== currentUser.name) {
        // This state is for a different user than currently logged in.
        // This scenario should ideally be handled by logging in as that user first,
        // or the 'restore' command which handles cross-user FS restoration.
        // 'loadstate' is intended for the *current* user's previously saved state.
        OutputManager.appendToOutput(
          `Warning: Saved state is for user '${manualStateData.user}'. Current user is '${currentUser.name}'. Load aborted. Use 'login ${manualStateData.user}' then 'loadstate'.`, {
            typeClass: Config.CSS_CLASSES.WARNING_MSG
          },
        );
        return {
          success: false, // Or true with a message indicating mismatch
          message: `Saved state user mismatch. Current: ${currentUser.name}, Saved: ${manualStateData.user}.`,
        };
      }

      ConfirmationManager.request( // Assumes ConfirmationManager is available
        [
          `Load manually saved state for '${currentUser.name}'? This overwrites current session & filesystem.`,
        ], {
          pendingData: manualStateData,
          userNameToRestoreTo: currentUser.name
        }, // Pass data needed for onConfirm
        async (data) => { // onConfirm callback
            // Restore FS
            FileSystemManager.setFsData(
              Utils.deepCopyNode(data.pendingData.fsDataSnapshot) || {
                [Config.FILESYSTEM.ROOT_PATH]: { // Fallback empty FS
                  type: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE,
                  children: {},
                  owner: data.userNameToRestoreTo,
                  mode: Config.FILESYSTEM.DEFAULT_DIR_MODE,
                  mtime: new Date().toISOString(),
                },
              },
            );
            FileSystemManager.setCurrentPath(
              data.pendingData.currentPath || Config.FILESYSTEM.ROOT_PATH,
            );
            // Restore terminal UI state
            if (DOM.outputDiv) DOM.outputDiv.innerHTML = data.pendingData.outputHTML || "";
            TerminalUI.setCurrentInputValue(data.pendingData.currentInput || "");
            HistoryManager.setHistory(data.pendingData.commandHistory || []);
            // Save the restored FS to make it persistent for this user
            await FileSystemManager.save(data.userNameToRestoreTo);
            OutputManager.appendToOutput(Config.MESSAGES.SESSION_LOADED_MSG, {
              typeClass: Config.CSS_CLASSES.SUCCESS_MSG,
            });
            TerminalUI.updatePrompt();
            if (DOM.outputDiv) DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight;
          },
        () => { // onCancel callback
            OutputManager.appendToOutput(Config.MESSAGES.LOAD_STATE_CANCELLED, {
              typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
            });
          },
      );
      return {
        success: true, // Command itself succeeded in *initiating* the load request
        message: "Confirmation requested for loading state.",
      };
    } else {
      return {
        success: false, // No saved state found
        message: `${Config.MESSAGES.NO_MANUAL_SAVE_FOUND_PREFIX}${currentUser.name}.`,
      };
    }
  }

  function clearUserSessionStates(username) {
    if (!username || typeof username !== "string") {
        console.warn("SessionManager.clearUserSessionStates: Invalid username provided.", username);
        return false;
    }
    try {
        StorageManager.removeItem(_getAutomaticSessionStateKey(username));
        StorageManager.removeItem(_getManualUserTerminalStateKey(username));
        return true;
    } catch (e) {
        console.error(`Error clearing session states for user '${username}':`, e);
        return false;
    }
  }


  // Performs a full reset of the OopisOS environment
  async function performFullReset() {
    // Clear UI elements first to give immediate feedback
    OutputManager.clearOutput(); // Assuming OutputManager is available
    TerminalUI.clearInput(); // Assuming TerminalUI is available

    // 1. Clear all relevant localStorage items
    const keysToRemove = [];
    const allKeys = StorageManager.getAllLocalStorageKeys(); // Assuming StorageManager is available
    allKeys.forEach((key) => {
      if (
        key.startsWith(Config.STORAGE_KEYS.USER_TERMINAL_STATE_PREFIX) ||
        key.startsWith(Config.STORAGE_KEYS.MANUAL_TERMINAL_STATE_PREFIX) ||
        key === Config.STORAGE_KEYS.USER_CREDENTIALS ||
        key === Config.STORAGE_KEYS.EDITOR_WORD_WRAP_ENABLED // Also clear editor settings
      ) {
        keysToRemove.push(key);
      }
    });
    keysToRemove.forEach((key) => StorageManager.removeItem(key));
    await OutputManager.appendToOutput(
      "All session states, credentials, and editor settings cleared from local storage.",
    );

    // 2. Clear all file systems from IndexedDB
    try {
      await FileSystemManager.clearAllFS(); // Assumes FileSystemManager is available
      await OutputManager.appendToOutput(
        "All user filesystems cleared from DB.",
      );
    } catch (error) {
      // Error during clearAllFS already handled by FileSystemManager logging
      await OutputManager.appendToOutput(
        `Warning: Could not fully clear all user filesystems from DB. Error: ${error.message}`, { typeClass: Config.CSS_CLASSES.WARNING_MSG }
      );
    }

    // 3. Reset runtime state to default (Guest user)
    HistoryManager.clearHistory(); // Assumes HistoryManager is available
    const guestUser = {
      name: Config.USER.DEFAULT_NAME
    }; // Define guest user object
    UserManager.setCurrentUserObject(guestUser); // Assumes UserManager is available
    await FileSystemManager.initialize(Config.USER.DEFAULT_NAME); // Initialize FS for Guest
    await FileSystemManager.save(Config.USER.DEFAULT_NAME); // Save Guest's new FS
    // Load the (now empty) automatic state for Guest to reset UI properly
    loadAutomaticState(Config.USER.DEFAULT_NAME); // This also updates prompt and welcome message

    await OutputManager.appendToOutput(
      "Terminal fully reset. All user data and states cleared.", {
        typeClass: Config.CSS_CLASSES.SUCCESS_MSG
      },
    );
    TerminalUI.updatePrompt(); // Ensure prompt reflects Guest user and root path
  }
  return {
    saveAutomaticState,
    loadAutomaticState,
    saveManualState,
    loadManualState,
    clearUserSessionStates,
    performFullReset,
  };
})();

const TerminalUI = (() => {
  "use strict";
  let isNavigatingHistory = false; // Tracks if user is using up/down arrows for history

  function updatePrompt() {
    // Ensure dependencies are available and DOM elements exist
    const user =
      typeof UserManager !== "undefined" ?
      UserManager.getCurrentUser() : {
        name: Config.USER.DEFAULT_NAME
      }; // Fallback user
    if (DOM.promptUserSpan) {
        DOM.promptUserSpan.textContent = user ?
          user.name :
          Config.USER.DEFAULT_NAME; // Default to Guest if user somehow undefined
        DOM.promptUserSpan.className = "prompt-user mr-0.5 text-sky-400"; // Ensure class is set
    }
    if (DOM.promptHostSpan) {
        DOM.promptHostSpan.textContent = Config.OS.DEFAULT_HOST_NAME;
    }

    const currentPathDisplay =
      typeof FileSystemManager !== "undefined" ?
      FileSystemManager.getCurrentPath() :
      Config.FILESYSTEM.ROOT_PATH; // Fallback path

    if (DOM.promptPathSpan) {
        DOM.promptPathSpan.textContent =
          currentPathDisplay === Config.FILESYSTEM.ROOT_PATH &&
          currentPathDisplay.length > 1 // Avoid "empty" display for root if it was just "/"
          ?
          Config.FILESYSTEM.ROOT_PATH :
          currentPathDisplay;
    }
  }

  function focusInput() {
    if (DOM.editableInputDiv && DOM.editableInputDiv.contentEditable === "true") {
      DOM.editableInputDiv.focus();
      // Set caret to end only if input is empty, otherwise respect existing caret position
      if (DOM.editableInputDiv.textContent.length === 0) {
        setCaretToEnd(DOM.editableInputDiv);
      }
    }
  }

  function clearInput() {
    if (DOM.editableInputDiv) DOM.editableInputDiv.textContent = "";
  }

  function getCurrentInputValue() {
    return DOM.editableInputDiv ? DOM.editableInputDiv.textContent : "";
  }

  function setCurrentInputValue(value, setAtEnd = true) {
    if (DOM.editableInputDiv) {
      DOM.editableInputDiv.textContent = value;
      if (setAtEnd) {
        setCaretToEnd(DOM.editableInputDiv);
      }
    }
  }

  // Utility to set the caret to the end of a contenteditable element
  function setCaretToEnd(element) {
    if (!element || typeof window.getSelection === "undefined" || typeof document.createRange === "undefined") return;
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(element); // Select all content
    range.collapse(false); // Collapse to the end
    if (sel) { // Check if selection object is available
        sel.removeAllRanges(); // Clear any existing selections
        sel.addRange(range); // Add the new range
    }
    element.focus(); // Ensure the element has focus
  }

  // Sets the caret position within a contenteditable element
  function setCaretPosition(element, position) {
    if (!element || typeof position !== "number" || typeof window.getSelection === "undefined" || typeof document.createRange === "undefined") return;

    const sel = window.getSelection();
    if (!sel) return;

    const range = document.createRange();
    let charCount = 0;
    let foundNode = false;

    // Recursive function to find the text node and offset for the caret
    function findTextNodeAndSet(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCharCount = charCount + node.length;
        if (!foundNode && position >= charCount && position <= nextCharCount) {
          // Position is within this text node
          range.setStart(node, position - charCount); // Set start of range
          range.collapse(true); // Collapse range to the start point
          foundNode = true;
        }
        charCount = nextCharCount; // Update character count
      } else {
        // If not a text node, iterate through child nodes
        for (let i = 0; i < node.childNodes.length; i++) {
          if (findTextNodeAndSet(node.childNodes[i])) {
            return true; // Found and set, stop searching
          }
          if (foundNode) break; // Stop if found in a sibling
        }
      }
      return foundNode; // Return whether node was found in this branch
    }

    if (element.childNodes.length === 0 && position === 0) {
        // Handle empty element case, set caret at the beginning
        range.setStart(element, 0);
        range.collapse(true);
        foundNode = true;
    } else {
        findTextNodeAndSet(element); // Start search from the parent element
    }


    if (foundNode) {
      sel.removeAllRanges(); // Clear existing selection
      sel.addRange(range); // Apply the new caret position
    } else {
      // Fallback: if position is out of bounds or node not found, set to end
      setCaretToEnd(element);
    }
    element.focus(); // Ensure element is focused
  }


  function setInputState(isEditable) {
    if (DOM.editableInputDiv) {
      DOM.editableInputDiv.contentEditable = isEditable ? "true" : "false";
      DOM.editableInputDiv.style.opacity = isEditable ? "1" : "0.5"; // Visual cue
      if (isEditable) {
        // focusInput(); // Optionally refocus when made editable
      } else {
        DOM.editableInputDiv.blur(); // Remove focus when not editable
      }
    }
  }

  function setIsNavigatingHistory(status) {
    isNavigatingHistory = status;
  }

  function getIsNavigatingHistory() {
    return isNavigatingHistory;
  }

  return {
    updatePrompt,
    focusInput,
    clearInput,
    setCurrentInputValue,
    getCurrentInputValue,
    setCaretToEnd,
    setIsNavigatingHistory,
    getIsNavigatingHistory,
    setCaretPosition, // Expose this utility
    setInputState,
  };
})();

const TabCompletionManager = (() => {
  "use strict";
  const PATH_COMMANDS = [
    "ls",
    "cd",
    "cat",
    "edit",
    "run",
    "mv",
    "cp",
    "rm",
    "mkdir",
    "touch",
    "export",
    "find",
    "tree",
    "chmod",
    "chown",
    "grep",
    "adventure",
    "printscreen",
    "gemini",
  ];

  function findLongestCommonPrefix(strs) {
    if (!strs || strs.length === 0) return "";
    if (strs.length === 1) return strs[0];
    let prefix = strs[0];
    for (let i = 1; i < strs.length; i++) {
      while (strs[i].indexOf(prefix) !== 0) {
        prefix = prefix.substring(0, prefix.length - 1);
        if (prefix === "") return "";
      }
    }
    return prefix;
  }

  function getSuggestions(fullInput, cursorPos) {
    const textBeforeCursor = fullInput.substring(0, cursorPos);
    const tokensInitial = textBeforeCursor.trimStart().split(/\s+/);
    let currentWordPrefix = "";
    let isCompletingCommandName = false;
    let baseCommandForPath = "";
    const lastCharIsSpace = /\s$/.test(textBeforeCursor) || textBeforeCursor.length === 0;

    let startOfWordIndex = 0;
    let effectiveArgStart = 0;

    if (tokensInitial.length === 0 || (tokensInitial.length === 1 && !lastCharIsSpace && tokensInitial[0] !== "")) {
        isCompletingCommandName = true;
        currentWordPrefix = tokensInitial.length > 0 ? tokensInitial[0] : "";
        if (textBeforeCursor.length > 0 && !/\s$/.test(textBeforeCursor.charAt(0))) {
           startOfWordIndex = textBeforeCursor.indexOf(currentWordPrefix);
           if (startOfWordIndex === -1 && currentWordPrefix === "") startOfWordIndex = cursorPos;
           else if (startOfWordIndex === -1) startOfWordIndex = 0;
        } else {
           startOfWordIndex = textBeforeCursor.lastIndexOf(currentWordPrefix);
           if (startOfWordIndex === -1 && currentWordPrefix === "") startOfWordIndex = cursorPos;
           else if (startOfWordIndex === -1) startOfWordIndex = 0;
        }
    } else {
        isCompletingCommandName = false;
        baseCommandForPath = tokensInitial[0].toLowerCase();

        if (lastCharIsSpace) {
            currentWordPrefix = "";
            effectiveArgStart = cursorPos;
        } else {
            const commandEndPos = textBeforeCursor.indexOf(tokensInitial[0]) + tokensInitial[0].length;
            let currentFragmentStart = commandEndPos;
            if (textBeforeCursor.length > commandEndPos && textBeforeCursor[commandEndPos] === ' ') {
                currentFragmentStart = commandEndPos + 1;
            }

            let tempInSingleQuote = false;
            let tempInDoubleQuote = false;
            for (let i = currentFragmentStart; i < cursorPos; i++) {
                const char = textBeforeCursor[i];
                if (char === "'" && (i === 0 || textBeforeCursor[i-1] !== '\\')) {
                    if (!tempInDoubleQuote) tempInSingleQuote = !tempInSingleQuote;
                } else if (char === '"' && (i === 0 || textBeforeCursor[i-1] !== '\\')) {
                    if (!tempInSingleQuote) tempInDoubleQuote = !tempInDoubleQuote;
                } else if (char === ' ' && !tempInSingleQuote && !tempInDoubleQuote) {
                    currentFragmentStart = i + 1;
                }
            }
            effectiveArgStart = currentFragmentStart;
            currentWordPrefix = textBeforeCursor.substring(effectiveArgStart, cursorPos);
        }
        startOfWordIndex = effectiveArgStart;
    }
    if (startOfWordIndex < 0) startOfWordIndex = 0;

    let suggestions = [];

    if (isCompletingCommandName) {
      const allCommands = CommandExecutor.getCommands();
      if (allCommands) {
        suggestions = Object.keys(allCommands)
          .filter((cmdName) => cmdName.startsWith(currentWordPrefix))
          .sort();
      }
      if (suggestions.length === 0) return { textToInsert: null, newCursorPos: cursorPos };

      if (suggestions.length === 1) {
        const completedSegment = suggestions[0] + " ";
        const textToInsert = textBeforeCursor.substring(0, startOfWordIndex) + completedSegment + fullInput.substring(cursorPos);
        const newCursorPos = startOfWordIndex + completedSegment.length;
        return { textToInsert, newCursorPos };
      } else {
        const lcp = findLongestCommonPrefix(suggestions);
        if (lcp.length > currentWordPrefix.length) {
          const textToInsert = textBeforeCursor.substring(0, startOfWordIndex) + lcp + fullInput.substring(cursorPos);
          const newCursorPos = startOfWordIndex + lcp.length;
          OutputManager.appendToOutput(suggestions.join("    "), { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG, isCompletionSuggestion: true });
          const promptText = `${DOM.promptUserSpan.textContent}${Config.TERMINAL.PROMPT_AT}${DOM.promptHostSpan.textContent}${Config.TERMINAL.PROMPT_SEPARATOR}${DOM.promptPathSpan.textContent}${Config.TERMINAL.PROMPT_CHAR} `;
          OutputManager.appendToOutput(`${promptText}${textBeforeCursor.substring(0, startOfWordIndex) + lcp}${fullInput.substring(cursorPos)}`, { isCompletionSuggestion: true });
          if (DOM.outputDiv) DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight;
          return { textToInsert, newCursorPos };
        } else {
          OutputManager.appendToOutput(suggestions.join("    "), { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG, isCompletionSuggestion: true });
          const promptText = `${DOM.promptUserSpan.textContent}${Config.TERMINAL.PROMPT_AT}${DOM.promptHostSpan.textContent}${Config.TERMINAL.PROMPT_SEPARATOR}${DOM.promptPathSpan.textContent}${Config.TERMINAL.PROMPT_CHAR} `;
          OutputManager.appendToOutput(`${promptText}${fullInput}`,{ isCompletionSuggestion: true });
          if (DOM.outputDiv) DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight;
          return { textToInsert: null, newCursorPos: cursorPos };
        }
      }
    } else if (PATH_COMMANDS.includes(baseCommandForPath)) {
        if (baseCommandForPath === "grep" && tokensInitial.length < ((tokensInitial[1] && tokensInitial[1].startsWith("-")) ? 3 : 2) && !lastCharIsSpace && (startOfWordIndex <= (textBeforeCursor.indexOf(tokensInitial[1] || "") + (tokensInitial[1] || "").length))) {
             return { textToInsert: null, newCursorPos: cursorPos };
        }
        if (baseCommandForPath === "gemini") {
            // `gemini <filepath> "prompt"`
            // Path completion should only apply to the first argument (tokensInitial[1]).
            
            // Check if the first argument (filepath) is already fully typed and followed by a space.
            // tokensInitial: ["gemini", "filepatharg"]
            if (lastCharIsSpace && tokensInitial.length === 2) {
                // User typed: `gemini /some/file.txt ` (cursor is after the space)
                // The next word is the prompt, so no path completion.
                return { textToInsert: null, newCursorPos: cursorPos };
            }

            // Check if we are beyond the first argument.
            // tokensInitial: ["gemini", "filepatharg", "\"promptpart"]
            if (tokensInitial.length > 2) {
                // User typed: `gemini /some/file.txt "partial prompt`
                // The currentWordPrefix would be part of the prompt.
                // We need to ensure `startOfWordIndex` correctly points to the start of this prompt part.
                // If `startOfWordIndex` is after the end of where the first argument `tokensInitial[1]` ended,
                // then we are indeed on the second argument or later.
                const endOfFirstArgInText = textBeforeCursor.indexOf(tokensInitial[1]) + tokensInitial[1].length;
                if (startOfWordIndex > endOfFirstArgInText) {
                    return { textToInsert: null, newCursorPos: cursorPos };
                }
            }
            // If none of the above conditions are met, we are likely completing the filepath (first argument).
        }

        let isActivelyQuoted = false;
        let originalQuoteChar = '';
        let contentInsideQuotes = "";

        if (currentWordPrefix.startsWith("'") && currentWordPrefix.endsWith("'") && currentWordPrefix.length >=2) {
            isActivelyQuoted = false;
            originalQuoteChar = "'";
            contentInsideQuotes = currentWordPrefix.substring(1, currentWordPrefix.length - 1);
        } else if (currentWordPrefix.startsWith('"') && currentWordPrefix.endsWith('"') && currentWordPrefix.length >=2) {
            isActivelyQuoted = false;
            originalQuoteChar = '"';
            contentInsideQuotes = currentWordPrefix.substring(1, currentWordPrefix.length - 1);
        } else if (currentWordPrefix.startsWith("'")) {
            isActivelyQuoted = true;
            originalQuoteChar = "'";
            contentInsideQuotes = currentWordPrefix.substring(1);
        } else if (currentWordPrefix.startsWith('"')) {
            isActivelyQuoted = true;
            originalQuoteChar = '"';
            contentInsideQuotes = currentWordPrefix.substring(1);
        } else {
            isActivelyQuoted = false;
            originalQuoteChar = '';
            contentInsideQuotes = currentWordPrefix;
        }

        let pathPrefixForFS = "";
        let segmentToMatchForFS = "";

        const lastSlashIndexInContent = contentInsideQuotes.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR);
        if (lastSlashIndexInContent !== -1) {
          pathPrefixForFS = contentInsideQuotes.substring(0, lastSlashIndexInContent + 1);
          segmentToMatchForFS = contentInsideQuotes.substring(lastSlashIndexInContent + 1);
        } else {
          pathPrefixForFS = "";
          segmentToMatchForFS = contentInsideQuotes;
        }

        const effectiveBasePathForFS = FileSystemManager.getAbsolutePath(pathPrefixForFS, FileSystemManager.getCurrentPath());
        const baseNode = FileSystemManager.getNodeByPath(effectiveBasePathForFS);
        const currentUser = UserManager.getCurrentUser().name;

        if (baseNode && baseNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE && FileSystemManager.hasPermission(baseNode, currentUser, "read")) {
          suggestions = Object.keys(baseNode.children)
            .filter((name) => name.startsWith(segmentToMatchForFS))
            .map((name) => {
              const childNode = baseNode.children[name];
              return childNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE ? name + Config.FILESYSTEM.PATH_SEPARATOR : name;
            })
            .sort();
        }

        if (suggestions.length === 0) return { textToInsert: null, newCursorPos: cursorPos };

        const textBeforeArg = textBeforeCursor.substring(0, startOfWordIndex);
        const textAfterCursor = fullInput.substring(cursorPos);

        if (suggestions.length === 1) {
            const completedNamePart = suggestions[0];
            const isDirSuggestion = completedNamePart.endsWith(Config.FILESYSTEM.PATH_SEPARATOR);

            let finalCompletedFullArg;

            if (originalQuoteChar) {
                finalCompletedFullArg = originalQuoteChar + pathPrefixForFS + completedNamePart;
                if (!isDirSuggestion) {
                    finalCompletedFullArg += originalQuoteChar;
                }
            } else {
                const fullSuggestedPathSegment = pathPrefixForFS + completedNamePart;
                if ( fullSuggestedPathSegment.includes(" ") ) {
                    finalCompletedFullArg = "'" + fullSuggestedPathSegment;
                    if (!isDirSuggestion) {
                        finalCompletedFullArg += "'";
                    }
                } else {
                    finalCompletedFullArg = fullSuggestedPathSegment;
                }
            }

            const spaceAfter = !isDirSuggestion;
            const textToInsert = textBeforeArg + finalCompletedFullArg + (spaceAfter ? " " : "") + textAfterCursor;
            const newCursorPos = textBeforeArg.length + finalCompletedFullArg.length + (spaceAfter ? 1 : 0);
            return { textToInsert, newCursorPos };

        } else {
            const lcpOfSuggestions = findLongestCommonPrefix(suggestions);

            if (lcpOfSuggestions.length > segmentToMatchForFS.length) {
                let completedArgPart;
                if (originalQuoteChar) {
                    completedArgPart = originalQuoteChar + pathPrefixForFS + lcpOfSuggestions;
                } else {
                    completedArgPart = pathPrefixForFS + lcpOfSuggestions;
                }

                const textToInsert = textBeforeArg + completedArgPart + textAfterCursor;
                const newCursorPos = textBeforeArg.length + completedArgPart.length;

                OutputManager.appendToOutput(suggestions.join("    "), { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG, isCompletionSuggestion: true });
                const promptText = `${DOM.promptUserSpan.textContent}${Config.TERMINAL.PROMPT_AT}${DOM.promptHostSpan.textContent}${Config.TERMINAL.PROMPT_SEPARATOR}${DOM.promptPathSpan.textContent}${Config.TERMINAL.PROMPT_CHAR} `;
                OutputManager.appendToOutput(`${promptText}${textBeforeArg + completedArgPart}${textAfterCursor}`,{ isCompletionSuggestion: true });
                if (DOM.outputDiv) DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight;
                return { textToInsert, newCursorPos };
            } else {
                OutputManager.appendToOutput(suggestions.join("    "), { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG, isCompletionSuggestion: true });
                const promptText = `${DOM.promptUserSpan.textContent}${Config.TERMINAL.PROMPT_AT}${DOM.promptHostSpan.textContent}${Config.TERMINAL.PROMPT_SEPARATOR}${DOM.promptPathSpan.textContent}${Config.TERMINAL.PROMPT_CHAR} `;
                OutputManager.appendToOutput(`${promptText}${fullInput}`,{ isCompletionSuggestion: true });
                if (DOM.outputDiv) DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight;
                return { textToInsert: null, newCursorPos: cursorPos };
            }
        }
    } // This was the missing closing brace in the previous attempt, now corrected.

    // Default return if no other path taken (e.g., not completing command, and not a PATH_COMMAND or specific return hit)
    return { textToInsert: null, newCursorPos: cursorPos };
  } // End of getSuggestions function

  return { getSuggestions };
})();


function initializeTerminalEventListeners() {
  if (!DOM.terminalDiv || !DOM.editableInputDiv) {
    console.error("Terminal event listeners cannot be initialized: Core DOM elements not found.");
    return;
  }

  DOM.terminalDiv.addEventListener("click", (e) => {
    if (EditorManager.isActive()) return; // Don't interfere if editor is active
    // Focus input if click is not on a button/link and not already on the input div
    if (
      !e.target.closest("button, a") && // Allow clicks on interactive elements
      (!DOM.editableInputDiv || !DOM.editableInputDiv.contains(e.target)) // Check if input div exists
    ) {
      if (DOM.editableInputDiv.contentEditable === "true") { // Only focus if editable
        TerminalUI.focusInput();
      }
    }
  });
  const getCurrentInputTarget = () => DOM.editableInputDiv; // Centralize getting the active input
  document.addEventListener("keydown", async (e) => {
    // If a script is running and it's not a confirmation prompt, prevent most key actions
    if (
      CommandExecutor.isScriptRunning() && // Assumes CommandExecutor is available
      !ConfirmationManager.isAwaiting() // Assumes ConfirmationManager is available
    ) {
      if (e.key === "Enter" || e.key === "Tab" || e.key.startsWith("Arrow")) {
        e.preventDefault(); // Prevent default actions for these keys
      }
      return; // Don't process other keys
    }
    if (EditorManager.isActive() && !ConfirmationManager.isAwaiting()) return; // Editor handles its own keys

    const activeInput = getCurrentInputTarget();
    if (
      !activeInput || // No active input element
      (document.activeElement !== activeInput && // Or focus is not on the input element itself
        !activeInput.contains(document.activeElement)) || // Or focus is not within the input element
      activeInput.contentEditable !== "true" // And input is not editable
    ) {
      return; // Do nothing if terminal input is not the focus or not editable
    }
    TerminalUI.setIsNavigatingHistory(false); // Reset history navigation flag on any key press
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent default newline in contenteditable
      await CommandExecutor.processSingleCommand(
        TerminalUI.getCurrentInputValue(),
        true, // Interactive command
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevCmd = HistoryManager.getPrevious(); // Assumes HistoryManager is available
      if (prevCmd !== null) {
        TerminalUI.setIsNavigatingHistory(true);
        TerminalUI.setCurrentInputValue(prevCmd, true); // Set input and move caret to end
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextCmd = HistoryManager.getNext();
      if (nextCmd !== null) {
        TerminalUI.setIsNavigatingHistory(true);
        TerminalUI.setCurrentInputValue(nextCmd, true);
      }
    } else if (e.key === "Tab") {
      e.preventDefault(); // Prevent default tab behavior (focus change)
      const currentInput = TerminalUI.getCurrentInputValue();
      const sel = window.getSelection();
      let cursorPos = 0;
      // Determine cursor position accurately within contenteditable
      if (sel && sel.rangeCount > 0) { // Check if sel and rangeCount are valid
        const range = sel.getRangeAt(0);
        // Ensure the range is within our editable input
        if (DOM.editableInputDiv && DOM.editableInputDiv.contains(range.commonAncestorContainer)) {
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(DOM.editableInputDiv);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            cursorPos = preCaretRange.toString().length;
        } else {
             cursorPos = currentInput.length; // Fallback if range is not in input
        }
      } else {
        cursorPos = currentInput.length; // Fallback if no selection
      }

      const result = TabCompletionManager.getSuggestions( // Assumes TabCompletionManager is available
        currentInput,
        cursorPos,
      );
      if (result?.textToInsert !== null && result.textToInsert !== undefined) { // Check if there's text to insert
        TerminalUI.setCurrentInputValue(result.textToInsert, false); // Set new input, don't move caret to end yet
        TerminalUI.setCaretPosition(DOM.editableInputDiv, result.newCursorPos); // Set caret to new position
      }
    }
  });
  if (DOM.editableInputDiv) {
    DOM.editableInputDiv.addEventListener("paste", (e) => {
      e.preventDefault(); // Prevent default paste behavior
      if (DOM.editableInputDiv.contentEditable !== "true") return; // Only paste if editable
      const text = (e.clipboardData || window.clipboardData).getData(
        "text/plain",
      );
      // Insert plain text, stripping newlines to keep it single-line for command input
      document.execCommand("insertText", false, text.replace(/\r?\n|\r/g, " "));
    });
  }
}

window.onload = async () => {
  DOM = {
    terminalDiv: document.getElementById("terminal"),
    outputDiv: document.getElementById("output"),
    inputLineContainerDiv: document
      .getElementById("terminal")
      .querySelector(".input-line-container"), // More specific query
    promptContainerDiv: document
      .getElementById("terminal")
      .querySelector(".prompt-container"), // More specific query
    editableInputContainerDiv: document.getElementById(
      "editable-input-container",
    ),
    editableInputDiv: document.getElementById("editable-input"),
    promptUserSpan: document.getElementById("prompt-user"),
    promptPathSpan: document.getElementById("prompt-path"),
    promptHostSpan: document.getElementById("prompt-host"),
    // Editor DOM elements (ensure these IDs match your HTML for the editor)
    editorModal: document.getElementById("editor-modal"),
    editorTextarea: document.getElementById("editor-textarea"),
    editorPreview: document.getElementById("editor-preview"),
    editorFileName: document.getElementById("editor-filename"),
    editorCloseButton: document.getElementById("editor-close-btn"),
    editorSaveButton: document.getElementById("editor-save-btn"),
    editorWordWrapToggle: document.getElementById("editor-word-wrap-toggle"),
    // Adventure Modal DOM elements
    adventureModal: document.getElementById("adventure-modal"),
    adventureContainer: document.getElementById("adventure-container"),
    adventureHeader: document.getElementById("adventure-header"),
    adventureTitle: document.getElementById("adventure-title"),
    adventureCloseBtn: document.getElementById("adventure-close-btn"),
    adventureOutput: document.getElementById("adventure-output"),
    adventureInputContainer: document.getElementById("adventure-input-container"),
    adventureInput: document.getElementById("adventure-input"),
  };

  // Critical check for Utils and OutputManager before proceeding
  if (
    typeof Utils === "undefined" ||
    typeof OutputManager?.initializeConsoleOverrides !== "function"
  ) {
    console.error(
      "FATAL: Core modules (Utils/OutputManager) not defined! Cannot proceed.",
    );
    alert("FATAL ERROR: Core modules failed to load. Check console.");
    return; // Stop execution if fundamental modules are missing
  }
  OutputManager.initializeConsoleOverrides(); // Override console.log etc. early

  try {
    // Check for other critical modules needed for basic operation
    if (typeof IndexedDBManager?.init !== "function") {
      // Use await OutputManager only if it's confirmed to be working
      OutputManager.appendToOutput("FATAL: IndexedDBManager not ready.", {
        typeClass: Config.CSS_CLASSES.ERROR_MSG,
      });
      console.error("FATAL: IndexedDBManager or init not defined!");
      alert("FATAL ERROR: IndexedDBManager module failed. Check console.");
      return;
    }
    await IndexedDBManager.init(); // Initialize database connection

    if (typeof UserManager?.getDefaultUser !== "function") {
      OutputManager.appendToOutput("FATAL: UserManager not ready.", {
        typeClass: Config.CSS_CLASSES.ERROR_MSG,
      });
      console.error("FATAL: UserManager or getDefaultUser not defined!");
      alert("FATAL ERROR: UserManager module failed. Check console.");
      return;
    }
    // Set initial user context
    UserManager.setCurrentUserObject({
      name: UserManager.getDefaultUser()
    });

    // Check for remaining core modules
    if (
      typeof FileSystemManager === "undefined" ||
      typeof SessionManager === "undefined" ||
      typeof TabCompletionManager === "undefined" ||
      typeof EditorManager === "undefined" || // Check for EditorManager
      typeof CommandExecutor === "undefined" // Check for CommandExecutor
    ) {
      OutputManager.appendToOutput(
        "FATAL: One or more core logic modules (FS, Session, Tab, Editor, CommandExecutor) not ready.", {
          typeClass: Config.CSS_CLASSES.ERROR_MSG
        },
      );
      console.error(
        "FATAL: FSManager, SessionManager, TabCompletionManager, EditorManager, or CommandExecutor not defined!",
      );
      alert("FATAL ERROR: Core logic module failed. Check console.");
      return;
    }
    // Initialize editor (after DOM elements are confirmed)
    // EditorManager.initialize(DOM.editorModal, DOM.editorTextarea, DOM.editorPreview, DOM.editorFileName, DOM.editorCloseButton, DOM.editorSaveButton, DOM.editorWordWrapToggle);
    // The editor.js should self-initialize or provide an init function called here.
    // For now, assuming editor.js handles its own initialization based on existence of its DOM elements.

    await FileSystemManager.load(UserManager.getDefaultUser()); // Load Guest FS
    SessionManager.loadAutomaticState(UserManager.getDefaultUser()); // Load Guest session
    initializeTerminalEventListeners(); // Set up keyboard and click listeners for terminal
    TerminalUI.focusInput(); // Focus on the input line

    console.log(
      `${Config.OS.NAME} v.${Config.OS.VERSION} loaded. ...You're Welcome :-)`,
    );
  } catch (error) {
    // Catch-all for errors during the async initialization process
    console.error(
      "Failed to initialize OopisOs on window.onload (main try-catch block):",
      error,
      error.stack, // Include stack trace for better debugging
    );
    // Try to display error in terminal if OutputManager is available
    if (DOM?.outputDiv && OutputManager?.appendToOutput) {
      OutputManager.appendToOutput(
        `FATAL ERROR during OopisOS initialization (onload): ${error.message}. Check console for details. Some features might be broken.`, {
          typeClass: Config.CSS_CLASSES.ERROR_MSG
        },
      );
    } else {
      // Fallback if DOM or OutputManager failed very early
      alert(
        `FATAL ERROR during OopisOS initialization (onload): ${error.message}. DOM/OutputManager not ready. Check console.`,
      );
    }
  }
};