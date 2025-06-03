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
      VERSION: "1.5.1",
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
      EDITOR_WORD_WRAP_ENABLED: "oopisOsEditorWordWrapEnabled",
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
    EDITOR: {
      DEBOUNCE_DELAY_MS: 250,
      TAB_REPLACEMENT: "    ",
      CTRL_S_ACTION: "save_exit",
      CTRL_O_ACTION: "exit_no_save",
      CTRL_P_ACTION: "toggle_preview",
      DEFAULT_MODE: "text",
      MODES: {
        TEXT: "text",
        MARKDOWN: "markdown",
        HTML: "html",
      },
      EXTENSIONS_MAP: {
        md: "markdown",
        html: "html",
        htm: "html",
        sh: "text",
        js: "text",
        css: "text",
      },
      VIEW_MODES: {
        SPLIT: "split",
        EDIT_ONLY: "edit",
        PREVIEW_ONLY: "preview",
      },
      WORD_WRAP_DEFAULT_ENABLED: true,
    },
    FILESYSTEM: {
      ROOT_PATH: "/",
      CURRENT_DIR_SYMBOL: ".",
      PARENT_DIR_SYMBOL: "..",
      DEFAULT_DIRECTORY_TYPE: "directory",
      DEFAULT_FILE_TYPE: "file",
      PATH_SEPARATOR: "/",
      DEFAULT_FILE_MODE: 0o64,
      DEFAULT_DIR_MODE: 0o75,
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
      WELCOME_PREFIX: "Greetings and Salutations, ",
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
      UPLOAD_INVALID_TYPE_SUFFIX: "'. Only .txt, .md, .html, .sh, .js, .css files are allowed.",
      UPLOAD_SUCCESS_PREFIX: "File '",
      UPLOAD_SUCCESS_MIDDLE: "' uploaded successfully to '",
      UPLOAD_SUCCESS_SUFFIX: "'.",
      UPLOAD_READ_ERROR_PREFIX: "Error reading file '",
      UPLOAD_READ_ERROR_SUFFIX: "'.",
      NO_COMMANDS_IN_HISTORY: "No commands in history.",
      EDITOR_DISCARD_CONFIRM: "You have unsaved changes. Discard them and exit?",
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

let DOM = {};

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
          element.setAttribute(key, value);
        }
      }
    }
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
    return {
      isValid: true,
      error: null
    };
  }

  function parseFlags(argsArray, flagDefinitions) {
    const flags = {};
    const remainingArgs = [];

    flagDefinitions.forEach((def) => {
      flags[def.name] = def.takesValue ? null : false;

    });
    for (let i = 0; i < argsArray.length; i++) {
      const arg = argsArray[i];
      let isFlag = false;
      for (const def of flagDefinitions) {
        if (arg === def.short || arg === def.long) {
          if (def.takesValue) {
            if (i + 1 < argsArray.length) {
              flags[def.name] = argsArray[i + 1];
              i++;
            } else {
              console.warn(
                `Flag ${arg} expects a value, but none was provided.`,
              );
              flags[def.name] = null;
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
          if (k < glob.length && (glob[k] === "!" || glob[k] === "^")) {
            charClass += "^";
            k++;
          }
          if (k < glob.length && glob[k] === "]") {
            charClass += "\\]";
            k++;
          }
          while (k < glob.length && glob[k] !== "]") {
            if (
              glob[k] === "-" &&
              charClass.length > 1 &&
              charClass[charClass.length - 1] !== "[" &&
              charClass[charClass.length - 1] !== "^" &&
              k + 1 < glob.length &&
              glob[k + 1] !== "]"
            ) {
              charClass += "-";
            } else if (/[.^${}()|[\]\\]/.test(glob[k])) {
              charClass += "\\" + glob[k];
            } else {
              charClass += glob[k];
            }
            k++;
          }
          if (k < glob.length && glob[k] === "]") {
            charClass += "]";
            i = k;
          } else {
            regexStr += "\\[";
            continue;
          }
          regexStr += charClass;
          break;
        }
        default:
          if (/[.^${}()|[\]\\]/.test(char)) regexStr += "\\";
          regexStr += char;
      }
    }
    regexStr += "$";
    try {
      return new RegExp(regexStr);
    } catch (e) {
      console.warn(
        `Utils.globToRegex: Failed for glob "${glob}": ${e.message}`,
      );
      return null;
    }
  }

  return {

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

  function parseStampToISO(stampStr) {
    let year,
      monthVal,
      day,
      hours,
      minutes,
      seconds = 0;
    const currentDate = new Date();
    let s = stampStr;

    if (s.includes(".")) {
      const parts = s.split(".");
      if (
        parts.length !== 2 ||
        parts[1].length !== 2 ||
        isNaN(parseInt(parts[1], 10))
      ) {
        return null;
      }
      seconds = parseInt(parts[1], 10);
      if (seconds < 0 || seconds > 59) return null;
      s = parts[0];
    }

    if (s.length === 12) {

      year = parseInt(s.substring(0, 4), 10);
      monthVal = parseInt(s.substring(4, 6), 10);
      day = parseInt(s.substring(6, 8), 10);
      hours = parseInt(s.substring(8, 10), 10);
      minutes = parseInt(s.substring(10, 12), 10);
    } else if (s.length === 10) {

      const YY = parseInt(s.substring(0, 2), 10);
      if (isNaN(YY)) return null;
      year = YY < 69 ? 2000 + YY : 1900 + YY;
      monthVal = parseInt(s.substring(2, 4), 10);
      day = parseInt(s.substring(4, 6), 10);
      hours = parseInt(s.substring(6, 8), 10);
      minutes = parseInt(s.substring(8, 10), 10);
    } else if (s.length === 8) {

      year = currentDate.getFullYear();
      monthVal = parseInt(s.substring(0, 2), 10);
      day = parseInt(s.substring(2, 4), 10);
      hours = parseInt(s.substring(4, 6), 10);
      minutes = parseInt(s.substring(6, 8), 10);
    } else {
      return null;
    }

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
      day > 31 ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    )
      return null;

    const dateObj = new Date(
      Date.UTC(year, monthVal - 1, day, hours, minutes, seconds),
    );

    if (
      dateObj.getUTCFullYear() !== year ||
      dateObj.getUTCMonth() !== monthVal - 1 ||
      dateObj.getUTCDate() !== day ||
      dateObj.getUTCHours() !== hours ||
      dateObj.getUTCMinutes() !== minutes ||
      dateObj.getUTCSeconds() !== seconds
    ) {
      return null;
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
          error: `${commandName}: invalid stamp format '${flags.stamp}'`,
        };
      }
      return {
        timestampISO: parsedISO,
        error: null
      };
    }

    return {
      timestampISO: nowActualISO,
      error: null
    };
  }

  return {
    resolveTimestampFromCommandFlags,

  };
})();
const OutputManager = (() => {
  "use strict";
  let isEditorActive = false;
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  function setEditorActive(status) {
    isEditorActive = status;
  }

  async function appendToOutput(text, options = {}) {
    if (
      isEditorActive &&
      options.typeClass !== Config.CSS_CLASSES.EDITOR_MSG &&
      !options.isCompletionSuggestion
    ) {
      return;
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
    if (
      isBackground &&
      !DOM.inputLineContainerDiv.classList.contains(Config.CSS_CLASSES.HIDDEN)
    ) {
      const promptText = `${DOM.promptUserSpan.textContent}${Config.TERMINAL.PROMPT_AT}${DOM.promptHostSpan.textContent}${Config.TERMINAL.PROMPT_SEPARATOR}${DOM.promptPathSpan.textContent}${Config.TERMINAL.PROMPT_CHAR} `;
      const currentInputVal = TerminalUI.getCurrentInputValue();
      const echoLine = Utils.createElement("div", {
        className: Config.CSS_CLASSES.OUTPUT_LINE,
        textContent: `${promptText}${currentInputVal}`,
      });
      DOM.outputDiv.appendChild(echoLine);
    }

    const lines = String(text).split("\n");
    const fragment = document.createDocumentFragment();

    for (const line of lines) {
      const lineClasses = Config.CSS_CLASSES.OUTPUT_LINE.split(" ");
      const lineAttributes = {
        classList: [...lineClasses],
        textContent: line,
      };

      if (typeClass) {
        typeClass.split(" ").forEach((cls) => {
          if (cls) lineAttributes.classList.push(cls);
        });
      } else if (options.isError) {
        Config.CSS_CLASSES.ERROR_MSG.split(" ").forEach((cls) => {
          if (cls) lineAttributes.classList.push(cls);
        });
      }
      const newLineElement = Utils.createElement("div", lineAttributes);
      fragment.appendChild(newLineElement);
    }
    DOM.outputDiv.appendChild(fragment);
    DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight;
  }

  function clearOutput() {
    if (!isEditorActive && DOM.outputDiv) {
      DOM.outputDiv.innerHTML = "";
    }
  }

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
    originalConsoleLog.apply(console, args);
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
        if (key === Config.STORAGE_KEYS.EDITOR_WORD_WRAP_ENABLED) {
          return storedValue === "true";
        }
        try {
          return JSON.parse(storedValue);
        } catch (e) {
          return storedValue;
        }
      }
    } catch (e) {
      if (
        typeof OutputManager !== "undefined" &&
        typeof OutputManager.appendToOutput === "function"
      ) {
        OutputManager.appendToOutput(
          `Warning: ${itemName} for '${key}' corrupted. Using default.`, {
            typeClass: Config.CSS_CLASSES.WARNING_MSG
          },
        );
      } else {
        console.warn(
          `StorageManager: OutputManager not available. ${itemName} for '${key}' corrupted.`,
        );
      }
    }
    return defaultValue;
  }

  function saveItem(key, data, itemName) {
    try {
      const valueToStore =
        typeof data === "object" && data !== null ?
        JSON.stringify(data) :
        String(data);
      localStorage.setItem(key, valueToStore);
      return true;
    } catch (e) {
      if (
        typeof OutputManager !== "undefined" &&
        typeof OutputManager.appendToOutput === "function"
      ) {
        OutputManager.appendToOutput(
          `Error saving ${itemName} for '${key}'. Data may be lost.`, {
            typeClass: Config.CSS_CLASSES.ERROR_MSG
          },
        );
      } else {
        console.error(
          `StorageManager: OutputManager not available. Error saving ${itemName} for '${key}'.`,
        );
      }
    }
    return false;
  }

  function removeItem(key) {
    localStorage.removeItem(key);
  }

  function getAllLocalStorageKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      keys.push(localStorage.key(i));
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
  let hasLoggedNormalInitialization = false;

  function init() {
    return new Promise((resolve, reject) => {
      if (dbInstance) {
        resolve(dbInstance);
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
      };
      request.onsuccess = (event) => {
        dbInstance = event.target.result;
        if (!hasLoggedNormalInitialization) {
          if (
            typeof OutputManager !== "undefined" &&
            typeof OutputManager.appendToOutput === "function"
          ) {
            OutputManager.appendToOutput("FileSystem DB initialized.", {
              typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
            });
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
          console.error(errorMsg);
        }
        console.error("Database error details: ", event.target.error);
        reject(event.target.error);
      };
    });
  }

  function getDbInstance() {
    if (!dbInstance) {
      const errorMsg =
        "Error: OopisOs file system storage is not available. Please ensure browser storage is enabled and the page is reloaded.";
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
      throw new Error("IndexedDB not initialized.");
    }
    return dbInstance;
  }
  return {
    init,
    getDbInstance
  };
})();

const FileSystemManager = (() => {
  "use strict";
  let fsData = {};
  let currentPath = Config.FILESYSTEM.ROOT_PATH;

  function _getFileSystemKey(user) {
    return `fs_${user}`;
  }

  async function initialize(user) {
    fsData = {
      [Config.FILESYSTEM.ROOT_PATH]: {
        type: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE,
        children: {},
        owner: user,
        mode: Config.FILESYSTEM.DEFAULT_DIR_MODE,
        mtime: new Date().toISOString(),
      },
    };
  }
  async function save(user) {
    const db = IndexedDBManager.getDbInstance();
    if (!db) {
      OutputManager.appendToOutput(
        "Error: File system storage not available for saving. Changes may not be persisted.", {
          typeClass: Config.CSS_CLASSES.ERROR_MSG
        },
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
        const dataToSave = Utils.deepCopyNode(fsData);
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
  async function load(user) {
    const db = IndexedDBManager.getDbInstance();
    if (!db) {
      OutputManager.appendToOutput(
        "Error: File system storage not available for loading. Using temporary session.", {
          typeClass: Config.CSS_CLASSES.ERROR_MSG
        },
      );
      await initialize(user);
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
            result.data[Config.FILESYSTEM.ROOT_PATH]?.type ===
            Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
          ) {
            fsData = result.data;
            _ensurePermissionsAndMtimeRecursive(
              fsData[Config.FILESYSTEM.ROOT_PATH],
              user,
              Config.FILESYSTEM.DEFAULT_DIR_MODE,
            );
          } else {
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
            await save(user);
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
          await save(user);
          reject(event.target.error);
        };
      } catch (e) {
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

  function _ensurePermissionsAndMtimeRecursive(
    node,
    defaultOwner,
    defaultMode,
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

      node.mtime = new Date().toISOString();
    }
    if (
      node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE &&
      node.children
    ) {
      for (const childName in node.children) {
        _ensurePermissionsAndMtimeRecursive(

          node.children[childName],
          defaultOwner,
          defaultMode,
        );
      }
    }
  }

  async function deleteUserFS(user) {
    const db = IndexedDBManager.getDbInstance();
    if (!db)
      return Promise.reject(
        Config.INTERNAL_ERRORS.DB_NOT_INITIALIZED_FS_DELETE,
      );

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
        reject(event.target.error);
      };
    });
  }
  async function clearAllFS() {
    const db = IndexedDBManager.getDbInstance();
    if (!db) {
      OutputManager.appendToOutput(
        "Error: File system storage not available for clearing all data.", {
          typeClass: Config.CSS_CLASSES.ERROR_MSG
        },
      );
      return Promise.reject(Config.INTERNAL_ERRORS.DB_NOT_INITIALIZED_FS_CLEAR);
    }
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [Config.DATABASE.FS_STORE_NAME],
        "readwrite",
      );
      const store = transaction.objectStore(Config.DATABASE.FS_STORE_NAME);
      const request = store.clear();
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
    fsData = newData;
  }

  function getAbsolutePath(targetPath, basePath) {
    if (!targetPath) targetPath = Config.FILESYSTEM.CURRENT_DIR_SYMBOL;
    let effectiveBasePath = basePath;
    if (targetPath.startsWith(Config.FILESYSTEM.PATH_SEPARATOR)) {
      effectiveBasePath = Config.FILESYSTEM.ROOT_PATH;
    }
    const baseSegments =
      effectiveBasePath === Config.FILESYSTEM.ROOT_PATH ?
      [] :
      effectiveBasePath
      .substring(1)
      .split(Config.FILESYSTEM.PATH_SEPARATOR)
      .filter((s) => s && s !== Config.FILESYSTEM.CURRENT_DIR_SYMBOL);
    let resolvedSegments = [...baseSegments];
    const targetSegments = targetPath.split(Config.FILESYSTEM.PATH_SEPARATOR);
    for (const segment of targetSegments) {
      if (segment === "" || segment === Config.FILESYSTEM.CURRENT_DIR_SYMBOL) {
        if (
          targetPath.startsWith(Config.FILESYSTEM.PATH_SEPARATOR) &&
          resolvedSegments.length === 0 &&
          segment === ""
        ) {}
        continue;
      }
      if (segment === Config.FILESYSTEM.PARENT_DIR_SYMBOL) {
        if (resolvedSegments.length > 0) resolvedSegments.pop();
      } else {
        resolvedSegments.push(segment);
      }
    }
    if (resolvedSegments.length === 0) return Config.FILESYSTEM.ROOT_PATH;
    return (
      Config.FILESYSTEM.PATH_SEPARATOR +
      resolvedSegments.join(Config.FILESYSTEM.PATH_SEPARATOR)
    );
  }

  function getNodeByPath(path) {
    const absolutePath = getAbsolutePath(path, currentPath);
    if (absolutePath === Config.FILESYSTEM.ROOT_PATH)
      return fsData[Config.FILESYSTEM.ROOT_PATH];
    const segments = absolutePath
      .substring(1)
      .split(Config.FILESYSTEM.PATH_SEPARATOR)
      .filter((s) => s);
    let currentNode = fsData[Config.FILESYSTEM.ROOT_PATH];
    for (const segment of segments) {
      if (
        currentNode &&
        currentNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE &&
        currentNode.children &&
        currentNode.children[segment]
      ) {
        currentNode = currentNode.children[segment];
      } else {
        return null;
      }
    }
    return currentNode;
  }

  function calculateNodeSize(node) {
    if (!node) return 0;
    if (node.type === Config.FILESYSTEM.DEFAULT_FILE_TYPE)
      return (node.content || "").length;
    if (node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
      let totalSize = 0;
      for (const childName in node.children) {
        totalSize += calculateNodeSize(node.children[childName]);
      }
      return totalSize;
    }
    return 0;
  }

  function _updateNodeAndParentMtime(nodePath, nowISO) {
    if (!nodePath || !nowISO) return;

    const node = getNodeByPath(nodePath);
    if (node) {
      node.mtime = nowISO;
    }

    if (nodePath !== Config.FILESYSTEM.ROOT_PATH) {
      const parentPath =
        nodePath.substring(
          0,
          nodePath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR),
        ) || Config.FILESYSTEM.ROOT_PATH;
      const parentNode = getNodeByPath(parentPath);
      if (
        parentNode &&
        parentNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
      ) {
        parentNode.mtime = nowISO;
      }
    }
  }

  function createParentDirectoriesIfNeeded(fullPath) {
    const currentUserForCPDIF = UserManager.getCurrentUser().name;
    const nowISO = new Date().toISOString();
    if (fullPath === Config.FILESYSTEM.ROOT_PATH) {
      return {
        parentNode: null,
        error: "Cannot create directory structure for root.",
      };
    }
    const lastSlashIndex = fullPath.lastIndexOf(
      Config.FILESYSTEM.PATH_SEPARATOR,
    );
    const parentPathForSegments =
      lastSlashIndex === 0 ?
      Config.FILESYSTEM.ROOT_PATH :
      fullPath.substring(0, lastSlashIndex);
    const finalDirNameInPath = fullPath.substring(lastSlashIndex + 1);

    if (
      !finalDirNameInPath ||
      finalDirNameInPath === Config.FILESYSTEM.CURRENT_DIR_SYMBOL ||
      finalDirNameInPath === Config.FILESYSTEM.PARENT_DIR_SYMBOL
    ) {
      return {
        parentNode: null,
        error: `Invalid name component '${finalDirNameInPath}' in path '${fullPath}'`,
      };
    }

    if (parentPathForSegments === Config.FILESYSTEM.ROOT_PATH) {
      return {
        parentNode: fsData[Config.FILESYSTEM.ROOT_PATH],
        error: null
      };
    }

    const segmentsToCreate = parentPathForSegments
      .substring(1)
      .split(Config.FILESYSTEM.PATH_SEPARATOR)
      .filter((s) => s);
    let currentParentNode = fsData[Config.FILESYSTEM.ROOT_PATH];
    let currentProcessedPath = Config.FILESYSTEM.ROOT_PATH;

    if (
      !currentParentNode ||
      typeof currentParentNode.owner === "undefined" ||
      typeof currentParentNode.mode === "undefined"
    ) {
      return {
        parentNode: null,
        error: "Internal error: Root FS node is malformed.",
      };
    }

    for (const segment of segmentsToCreate) {
      if (
        !currentParentNode.children ||
        typeof currentParentNode.children !== "object"
      ) {
        const errorMsg = `Internal error: currentParentNode.children is not an object at path "${currentProcessedPath}" for segment "${segment}".`;
        return {
          parentNode: null,
          error: errorMsg
        };
      }

      if (!currentParentNode.children[segment]) {
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
        currentParentNode.mtime = nowISO;
      } else if (
        currentParentNode.children[segment].type !==
        Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
      ) {
        const errorMsg = `Path component '${getAbsolutePath(segment, currentProcessedPath)}' is not a directory.`;
        return {
          parentNode: null,
          error: errorMsg
        };
      }

      currentParentNode = currentParentNode.children[segment];
      currentProcessedPath = getAbsolutePath(segment, currentProcessedPath);
      if (
        !currentParentNode ||
        typeof currentParentNode.owner === "undefined" ||
        typeof currentParentNode.mode === "undefined"
      ) {
        return {
          parentNode: null,
          error: `Internal error: Node for "${currentProcessedPath}" is malformed.`,
        };
      }
    }
    return {
      parentNode: currentParentNode,
      error: null
    };
  }

  function validatePath(commandName, pathArg, options = {}) {
    const {
      allowMissing = false,
        expectedType = null,
        disallowRoot = false,
        defaultToCurrentIfEmpty = true,
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
        node: null,
        resolvedPath,
        optionsUsed: options,
      };
    }
    if (!node) {
      if (allowMissing)
        return {
          error: null,
          node: null,
          resolvedPath,
          optionsUsed: options
        };
      return {
        error: `${commandName}: '${pathArg}' (resolved to '${resolvedPath}'): No such file or directory`,
        node: null,
        resolvedPath,
        optionsUsed: options,
      };
    }
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
        "unknown type";
      return {
        error: `${commandName}: '${pathArg}' (resolved to '${resolvedPath}') is not a ${typeName} (it's a ${actualTypeName})`,
        node,
        resolvedPath,
        optionsUsed: options,
      };
    }
    return {
      error: null,
      node,
      resolvedPath,
      optionsUsed: options
    };
  }

  function hasPermission(node, username, permissionType) {
    if (
      !node ||
      typeof node.mode !== "number" ||
      typeof node.owner !== "string"
    ) {
      console.warn(
        "hasPermission: Invalid node or missing permissions info.",
        node,
      );
      return false;
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
        return false;
    }

    const isOwner = node.owner === username;
    let effectiveModeBits;

    if (isOwner) {
      effectiveModeBits = (node.mode >> 3) & 0b111;
    } else {
      effectiveModeBits = node.mode & 0b111;
    }

    return (effectiveModeBits & permissionMask) === permissionMask;
  }

  function formatModeToString(node) {
    if (!node || typeof node.mode !== "number") return "---------";
    const mode = node.mode;
    const typeChar =
      node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE ? "d" : "-";

    const ownerPerms = (mode >> 3) & 0b111;
    const otherPerms = mode & 0b111;

    const r = Config.FILESYSTEM.PERMISSION_BIT_READ;
    const w = Config.FILESYSTEM.PERMISSION_BIT_WRITE;
    const x = Config.FILESYSTEM.PERMISSION_BIT_EXECUTE;

    let str = typeChar;
    str += (ownerPerms & Config.FILESYSTEM.PERMISSION_BIT_READ) ? "r" : "-";
    str += (ownerPerms & Config.FILESYSTEM.PERMISSION_BIT_WRITE) ? "w" : "-";
    str += (ownerPerms & Config.FILESYSTEM.PERMISSION_BIT_EXECUTE) ? "x" : "-";
    str += (otherPerms & Config.FILESYSTEM.PERMISSION_BIT_READ) ? "r" : "-";
    str += (otherPerms & Config.FILESYSTEM.PERMISSION_BIT_WRITE) ? "w" : "-";
    str += (otherPerms & Config.FILESYSTEM.PERMISSION_BIT_EXECUTE) ? "x" : "-";

    return str;
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
    _updateNodeAndParentMtime,
    _ensurePermissionsAndMtimeRecursive,
  };
})();

const HistoryManager = (() => {
  "use strict";
  let commandHistory = [];
  let historyIndex = 0;

  function add(command) {
    const trimmedCommand = command.trim();
    if (
      trimmedCommand &&
      (commandHistory.length === 0 ||
        commandHistory[commandHistory.length - 1] !== trimmedCommand)
    ) {
      commandHistory.push(trimmedCommand);
      if (commandHistory.length > Config.TERMINAL.MAX_HISTORY_SIZE) {
        commandHistory.shift();
      }
    }
    historyIndex = commandHistory.length;
  }

  function getPrevious() {
    if (commandHistory.length > 0 && historyIndex > 0) {
      historyIndex--;
      return commandHistory[historyIndex];
    }
    return null;
  }

  function getNext() {
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      return commandHistory[historyIndex];
    } else if (historyIndex >= commandHistory.length - 1) {
      historyIndex = commandHistory.length;
      return "";
    }
    return null;
  }

  function resetIndex() {
    historyIndex = commandHistory.length;
  }

  function getFullHistory() {
    return [...commandHistory];
  }

  function clearHistory() {
    commandHistory = [];
    historyIndex = 0;
  }

  function setHistory(newHistory) {
    commandHistory = Array.isArray(newHistory) ? [...newHistory] : [];
    historyIndex = commandHistory.length;
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
  let confirmationContext = null;

  function request(
    promptMessageLines,
    dataForAction,
    onConfirmCallback,
    onCancelCallback = null,
  ) {
    awaitingConfirmation = true;
    confirmationContext = {
      promptMessageLines: Array.isArray(promptMessageLines) ?
        promptMessageLines :
        [promptMessageLines],
      data: dataForAction,
      onConfirm: onConfirmCallback,
      onCancel: onCancelCallback,
    };
    confirmationContext.promptMessageLines.forEach((line) =>
      OutputManager.appendToOutput(line, {
        typeClass: Config.CSS_CLASSES.WARNING_MSG,
      }),
    );
    OutputManager.appendToOutput(Config.MESSAGES.CONFIRMATION_PROMPT, {
      typeClass: Config.CSS_CLASSES.WARNING_MSG,
    });

    TerminalUI.setInputState(true);

    TerminalUI.clearInput();
    DOM.inputLineContainerDiv.classList.remove(Config.CSS_CLASSES.HIDDEN);
    TerminalUI.focusInput();
    DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight;
  }
  async function handleConfirmation(input) {
    if (!awaitingConfirmation || !confirmationContext) return false;
    let processed = false;
    if (
      input.trim() === "YES" &&
      typeof confirmationContext.onConfirm === "function"
    ) {
      await confirmationContext.onConfirm(confirmationContext.data);
      processed = true;
    } else {
      if (typeof confirmationContext.onCancel === "function") {
        confirmationContext.onCancel(confirmationContext.data);
      } else {
        OutputManager.appendToOutput(Config.MESSAGES.OPERATION_CANCELLED, {
          typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
        });
      }
      processed = true;
    }
    awaitingConfirmation = false;
    confirmationContext = null;
    return processed;
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

const EditorUtils = (() => {
  "use strict";

  function determineMode(filePath) {
    const extension = Utils.getFileExtension(filePath);
    return (
      Config.EDITOR.EXTENSIONS_MAP[extension] || Config.EDITOR.DEFAULT_MODE
    );
  }

  function getPreviewStylingCSS(isHtmlMode = false) {
    let baseStyles = `
                    body { font-family: sans-serif; margin: 20px; line-height: 1.6; background-color: #fff; color: #333; }
                    pre { white-space: pre-wrap; word-break: break-word; }
                `;
    if (isHtmlMode) {

      return (
        `html { height: 100%; width: 100%; margin: 0; padding: 0; box-sizing: border-box; background-color: #fff; } ` +
        `body { height: 100%; width: 100%; margin: 0; padding: 15px;  box-sizing: border-box; overflow: auto; ` +
        `font-family: sans-serif; color: #333; line-height: 1.6; word-wrap: break-word; overflow-wrap: break-word; } ` +
        `pre { white-space: pre-wrap !important; word-break: break-all !important; overflow-wrap: break-word !important; }`
      );
    }
    return (
      baseStyles +
      `
                    .markdown-preview h1, .markdown-preview h2, .markdown-preview h3 { color: #0284c7; border-bottom: 1px solid #e5e7eb; margin-top: 1em; margin-bottom: 0.5em; }
                    .markdown-preview p { margin-bottom: 0.5em; line-height: 1.5.1; }
                    .markdown-preview code { background-color: #f3f4f6; padding: 2px 4px; border-radius: 3px; font-family: monospace; color: #1f2937; }
                    .markdown-preview pre { background-color: #f3f4f6; padding: 10px; overflow-x: auto; border-radius: 3px;}
                    .markdown-preview pre > code { display: block; padding: 0; }
                    .markdown-preview ul, .markdown-preview ol { margin-left: 20px; margin-bottom: 0.5em;}
                    .markdown-preview blockquote { border-left: 3px solid #d1d5db; padding-left: 10px; margin-left: 0; color: #6b7280; }
                    .markdown-preview a { color: #0ea5e9; text-decoration: underline; }
                `
    );
  }

  function calculateStatusBarInfo(text, selectionStart) {
    const lines = text.split("\n");
    const lineCount = lines.length;
    const charCount = text.length;
    const wordCount =
      text.trim() === "" ? 0 : text.trim().split(/\s+/).filter(Boolean).length;

    let currentLineNum = 0;
    let currentColNum = 0;
    let charCounter = 0;
    for (let i = 0; i < lines.length; i++) {
      const lineLengthWithNewline = lines[i].length + 1;
      if (
        selectionStart >= charCounter &&
        selectionStart < charCounter + lineLengthWithNewline
      ) {

        currentLineNum = i;
        currentColNum = selectionStart - charCounter;
        break;
      }
      charCounter += lineLengthWithNewline;
    }
    if (selectionStart === text.length && !text.endsWith("\n")) {

      currentLineNum = lines.length - 1;
      currentColNum = lines[lines.length - 1].length;
    } else if (selectionStart === text.length && text.endsWith("\n")) {

      currentLineNum = lines.length - 1;
      currentColNum = 0;
    }

    return {
      lines: lineCount,
      words: wordCount,
      chars: charCount,
      cursor: {
        line: currentLineNum + 1,
        col: currentColNum + 1
      },
    };
  }

  function generateLineNumbersArray(text) {
    const lines = text.split("\n").length;
    return Array.from({
      length: lines
    }, (_, i) => i + 1);
  }

  return {
    determineMode,
    getPreviewStylingCSS,
    calculateStatusBarInfo,
    generateLineNumbersArray,
  };
})();

const EditorUI = (() => {
  "use strict";

  let elements = {};
  let eventCallbacks = {};
  let previewDebounceTimer = null;
  const GUTTER_WRAP_HIDDEN_CLASS = "gutter-hidden-by-wrap";

  function buildLayout(containerElement, callbacks) {
    eventCallbacks = callbacks;

    elements.filenameDisplay = Utils.createElement("span", {
      id: "editor-filename-display",
      className: "text-neutral-400 text-sm",
    });
    elements.viewToggleButton = Utils.createElement("button", {
      id: "editor-view-toggle",
      className: "btn-editor",
      eventListeners: {
        click: eventCallbacks.onViewToggle
      },
    });
    elements.exportPreviewButton = Utils.createElement("button", {
      id: "editor-export-preview",
      className: "btn-editor",
      textContent: "Export HTML",
      eventListeners: {
        click: eventCallbacks.onExportPreview
      },
    });
    elements.wordWrapToggleButton = Utils.createElement("button", {
      id: "editor-word-wrap-toggle",
      className: "btn-editor",
      eventListeners: {
        click: eventCallbacks.onWordWrapToggle
      },
    });

    const controlsRightGroup = Utils.createElement(
      "div", {
        className: "flex"
      },
      elements.wordWrapToggleButton,
      elements.viewToggleButton,
      elements.exportPreviewButton,
    );
    elements.controlsDiv = Utils.createElement(
      "div", {
        id: "editor-controls",
        className: "py-1 text-center flex justify-between items-center border-b border-neutral-700 mb-1",
      },
      elements.filenameDisplay,
      controlsRightGroup,
    );

    elements.lineGutter = Utils.createElement("div", {
      id: "editor-line-gutter",

      style: {
        fontFamily: '"VT323", monospace',
        fontSize: "0.875rem",
        lineHeight: "1.35",
        paddingTop: "4px",
        paddingBottom: "4px",

        boxSizing: "border-box",
      },
    });
    elements.textarea = Utils.createElement("textarea", {
      id: "editor-textarea",

      className: "w-full h-full bg-neutral-950 text-green-400 border-none resize-none outline-none box-border pr-2.5",
      spellcheck: "false",
      style: {

        fontFamily: '"VT323", monospace',
        fontSize: "0.875rem",
        lineHeight: "1.35",
        paddingTop: "4px",
        paddingBottom: "4px",
        boxSizing: "border-box",
      },
      eventListeners: {

        input: eventCallbacks.onInput,
        scroll: eventCallbacks.onScroll,
        click: eventCallbacks.onSelectionChange,
        keyup: eventCallbacks.onSelectionChange,
        keydown: eventCallbacks.onKeydown,
      },
    });
    elements.textareaWrapper = Utils.createElement(
      "div", {
        id: "editor-textarea-wrapper",
        className: "editor-pane flex-1 relative overflow-hidden border-r border-neutral-700 pl-0",
      },
      elements.textarea,
    );

    elements.previewPane = Utils.createElement("div", {
      id: "editor-preview-content",
      className: "p-2.5 flex-1 min-h-0",
    });
    elements.previewWrapper = Utils.createElement(
      "div", {
        id: "editor-preview-wrapper",
        className: "editor-pane flex flex-col min-h-0 flex-1 relative overflow-y-auto bg-neutral-900 text-neutral-300",
      },
      elements.previewPane,
    );

    elements.mainArea = Utils.createElement(
      "div", {
        id: "editor-main-area",
        className: "flex-grow flex w-full overflow-hidden relative",
      },
      elements.lineGutter,
      elements.textareaWrapper,
      elements.previewWrapper,
    );

    elements.statusBarLineCount = Utils.createElement("span", {
      id: "status-lines",
    });
    elements.statusBarWordCount = Utils.createElement("span", {
      id: "status-words",
    });
    elements.statusBarCharCount = Utils.createElement("span", {
      id: "status-chars",
    });
    elements.statusBarCursorPos = Utils.createElement("span", {
      id: "status-cursor",
    });
    const statusBarLeft = Utils.createElement(
      "div", {
        className: "flex space-x-4"
      },
      elements.statusBarCursorPos,
      elements.statusBarLineCount,
    );
    const statusBarRight = Utils.createElement(
      "div", {
        className: "flex space-x-4"
      },
      elements.statusBarWordCount,
      elements.statusBarCharCount,
    );
    elements.statusBar = Utils.createElement(
      "div", {
        id: "editor-status-bar",
        className: "px-2.5 py-1 text-xs text-neutral-500 border-t border-neutral-700 bg-neutral-900 flex-shrink-0 flex justify-between",
      },
      statusBarLeft,
      statusBarRight,
    );

    elements.instructionsFooter = Utils.createElement("div", {
      id: "editor-instructions-footer",
      className: "pt-2 pb-0.5 text-sm text-center text-neutral-400 flex-shrink-0 border-t border-neutral-700 mt-1",
      textContent: `Ctrl+S: Save & Exit | Ctrl+O: Exit (confirm if unsaved) | Ctrl+P: Toggle Preview`,
    });

    elements.editorContainer = Utils.createElement(
      "div", {
        id: "editor-container",
        className: "flex-grow flex flex-col w-full h-full",
      },
      elements.controlsDiv,
      elements.mainArea,
      elements.statusBar,
      elements.instructionsFooter,
    );

    if (containerElement && DOM.inputLineContainerDiv) {
      containerElement.insertBefore(
        elements.editorContainer,
        DOM.inputLineContainerDiv,
      );
    } else {
      console.error(
        "EditorUI.buildLayout: ContainerElement or DOM.inputLineContainerDiv not found in DOM when trying to insert editor.",
      );
    }
  }

  function setGutterVisibility(visible) {
    if (elements.lineGutter) {
      if (visible) {
        elements.lineGutter.classList.remove(GUTTER_WRAP_HIDDEN_CLASS);
      } else {
        elements.lineGutter.classList.add(GUTTER_WRAP_HIDDEN_CLASS);
      }
    }
  }

  function destroyLayout() {
    if (elements.editorContainer && elements.editorContainer.parentNode) {
      elements.editorContainer.parentNode.removeChild(elements.editorContainer);
    }
    if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
    previewDebounceTimer = null;
    elements = {};
    eventCallbacks = {};
  }

  function updateFilenameDisplay(filePath, isDirty) {
    if (elements.filenameDisplay) {
      elements.filenameDisplay.textContent = `File: ${filePath || "Untitled"}${isDirty ? "*" : ""}`;
    }
  }

  function updateStatusBar(text, selectionStart) {
    if (!elements.textarea || !elements.statusBar) return;

    const stats = EditorUtils.calculateStatusBarInfo(text, selectionStart);
    if (elements.statusBarLineCount)
      elements.statusBarLineCount.textContent = `Lines: ${stats.lines}`;
    if (elements.statusBarWordCount)
      elements.statusBarWordCount.textContent = `Words: ${stats.words}`;
    if (elements.statusBarCharCount)
      elements.statusBarCharCount.textContent = `Chars: ${stats.chars}`;
    if (elements.statusBarCursorPos)
      elements.statusBarCursorPos.textContent = `Ln: ${stats.cursor.line}, Col: ${stats.cursor.col}`;
  }

  function updateLineNumbers(text) {
    if (!elements.textarea || !elements.lineGutter) return;

    const numbersArray = EditorUtils.generateLineNumbersArray(text);
    elements.lineGutter.textContent = numbersArray.join("\n");
    elements.lineGutter.scrollTop = elements.textarea.scrollTop;
  }

  function syncLineGutterScroll() {
    if (elements.lineGutter && elements.textarea) {
      elements.lineGutter.scrollTop = elements.textarea.scrollTop;
    }
  }

  function setTextareaContent(text) {
    if (elements.textarea) elements.textarea.value = text;
  }

  function getTextareaContent() {
    return elements.textarea ? elements.textarea.value : "";
  }

  function setEditorFocus() {
    if (
      elements.textarea &&
      elements.textareaWrapper &&
      !elements.textareaWrapper.classList.contains(Config.CSS_CLASSES.HIDDEN)
    ) {

      elements.textarea.focus();
    }
  }

  function getTextareaSelection() {
    if (elements.textarea) {
      return {
        start: elements.textarea.selectionStart,
        end: elements.textarea.selectionEnd,
      };
    }
    return {
      start: 0,
      end: 0
    };
  }

  function setTextareaSelection(start, end) {
    if (elements.textarea) {
      elements.textarea.selectionStart = start;
      elements.textarea.selectionEnd = end;
    }
  }

  function applyTextareaWordWrap(isWordWrapActive) {
    if (!elements.textarea) return;
    if (isWordWrapActive) {

      elements.textarea.setAttribute("wrap", "soft");
      elements.textarea.classList.remove("no-wrap");
    } else {
      elements.textarea.setAttribute("wrap", "off");
      elements.textarea.classList.add("no-wrap");
    }
  }

  function applyPreviewWordWrap(isWordWrapActive, currentFileMode) {
    if (!elements.previewPane) return;
    if (currentFileMode === Config.EDITOR.MODES.MARKDOWN) {

      elements.previewPane.classList.toggle(
        "word-wrap-enabled",
        isWordWrapActive,
      );
    }

  }

  function updateWordWrapButtonText(isWordWrapActive) {
    if (elements.wordWrapToggleButton) {
      elements.wordWrapToggleButton.textContent = isWordWrapActive ?
        "Wrap: On" :
        "Wrap: Off";
    }
  }

  function getPreviewPaneHTML() {
    if (elements.previewPane) {
      const iframe = elements.previewPane.querySelector("iframe");
      if (iframe && iframe.srcdoc) {

        const match = iframe.srcdoc.match(/<body>([\s\S]*)<\/body>/i);
        if (match && match[1]) return match[1];
        return iframe.srcdoc;
      }
      return elements.previewPane.innerHTML;
    }
    return "";
  }

  function renderPreview(content, currentFileMode, isWordWrapActive) {
    if (!elements.previewPane) return;
    if (
      currentFileMode !== Config.EDITOR.MODES.MARKDOWN &&
      currentFileMode !== Config.EDITOR.MODES.HTML
    ) {

      elements.previewPane.innerHTML = "";
      return;
    }

    if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
    previewDebounceTimer = setTimeout(() => {

      if (currentFileMode === Config.EDITOR.MODES.MARKDOWN) {

        if (typeof marked !== "undefined") {

          elements.previewPane.innerHTML = marked.parse(content);
        } else {
          elements.previewPane.textContent =
            "Markdown preview library (marked.js) not loaded.";
        }
        applyPreviewWordWrap(isWordWrapActive, currentFileMode);
      } else if (currentFileMode === Config.EDITOR.MODES.HTML) {

        let iframe = elements.previewPane.querySelector("iframe");
        if (!iframe) {

          iframe = Utils.createElement("iframe", {
            className: "w-full h-full border-none bg-white",
          });
          elements.previewPane.innerHTML = "";
          elements.previewPane.appendChild(iframe);
        }
        let injectedStyles = "";
        if (isWordWrapActive) {

          injectedStyles = `<style> pre { white-space: pre-wrap !important; word-break: break-all !important; overflow-wrap: break-word !important; } body { word-wrap: break-word; overflow-wrap: break-word; } </style>`;
        }
        iframe.srcdoc = `${injectedStyles}<style>${EditorUtils.getPreviewStylingCSS(true)}</style>${content}`;
      }
    }, Config.EDITOR.DEBOUNCE_DELAY_MS);
  }

  function setViewMode(
    viewMode,
    currentFileMode,
    isPreviewable,
    isWordWrapActive,
  ) {
    if (
      !elements.lineGutter ||
      !elements.textareaWrapper ||
      !elements.previewWrapper ||
      !elements.viewToggleButton ||
      !elements.previewPane
    )
      return;

    elements.previewPane.classList.toggle(
      "markdown-preview",
      currentFileMode === Config.EDITOR.MODES.MARKDOWN,
    );
    if (currentFileMode === Config.EDITOR.MODES.MARKDOWN) {

      applyPreviewWordWrap(isWordWrapActive, currentFileMode);
    }

    elements.viewToggleButton.classList.toggle(
      Config.CSS_CLASSES.HIDDEN,
      !isPreviewable,
    );
    elements.exportPreviewButton.classList.toggle(
      Config.CSS_CLASSES.HIDDEN,
      !isPreviewable,
    );

    elements.textareaWrapper.style.borderRight =
      isPreviewable && viewMode === Config.EDITOR.VIEW_MODES.SPLIT ?
      "1px solid #404040" :
      "none";

    if (!isPreviewable) {

      elements.lineGutter.classList.remove(Config.CSS_CLASSES.HIDDEN);
      elements.textareaWrapper.classList.remove(Config.CSS_CLASSES.HIDDEN);
      elements.textareaWrapper.style.flex = "1";
      elements.previewWrapper.classList.add(Config.CSS_CLASSES.HIDDEN);
      elements.previewWrapper.style.flex = "0";
      elements.viewToggleButton.textContent = "Split View";
      return;
    }

    if (viewMode === Config.EDITOR.VIEW_MODES.SPLIT) {

      elements.viewToggleButton.textContent = "Edit Only";
      elements.lineGutter.classList.remove(Config.CSS_CLASSES.HIDDEN);
      elements.textareaWrapper.classList.remove(Config.CSS_CLASSES.HIDDEN);
      elements.textareaWrapper.style.flex = "1";
      elements.previewWrapper.classList.remove(Config.CSS_CLASSES.HIDDEN);
      elements.previewWrapper.style.flex = "1";
    } else if (viewMode === Config.EDITOR.VIEW_MODES.EDIT_ONLY) {

      elements.viewToggleButton.textContent = "Preview Only";
      elements.lineGutter.classList.remove(Config.CSS_CLASSES.HIDDEN);
      elements.textareaWrapper.classList.remove(Config.CSS_CLASSES.HIDDEN);
      elements.textareaWrapper.style.flex = "1";
      elements.previewWrapper.classList.add(Config.CSS_CLASSES.HIDDEN);
      elements.previewWrapper.style.flex = "0";
    } else if (viewMode === Config.EDITOR.VIEW_MODES.PREVIEW_ONLY) {

      elements.viewToggleButton.textContent = "Split View";
      elements.lineGutter.classList.add(Config.CSS_CLASSES.HIDDEN);
      elements.textareaWrapper.classList.add(Config.CSS_CLASSES.HIDDEN);
      elements.textareaWrapper.style.flex = "0";
      elements.previewWrapper.classList.remove(Config.CSS_CLASSES.HIDDEN);
      elements.previewWrapper.style.flex = "1";
    }
  }

  return {
    buildLayout,
    destroyLayout,
    updateFilenameDisplay,
    updateStatusBar,
    updateLineNumbers,
    syncLineGutterScroll,
    setTextareaContent,
    getTextareaContent,
    setEditorFocus,
    getTextareaSelection,
    setTextareaSelection,
    applyTextareaWordWrap,
    applyPreviewWordWrap,
    updateWordWrapButtonText,
    renderPreview,
    setViewMode,
    getPreviewPaneHTML,
    setGutterVisibility,
  };
})();

const EditorManager = (() => {
  "use strict";
  let isActiveState = false;
  let currentFilePath = null;
  let currentFileMode = Config.EDITOR.DEFAULT_MODE;
  let currentViewMode = Config.EDITOR.VIEW_MODES.SPLIT;
  let isWordWrapActive = Config.EDITOR.WORD_WRAP_DEFAULT_ENABLED;
  let originalContent = "";
  let isDirty = false;

  function _loadWordWrapSetting() {
    const savedSetting = StorageManager.loadItem(
      Config.STORAGE_KEYS.EDITOR_WORD_WRAP_ENABLED,
      "Editor word wrap setting",
    );
    isWordWrapActive =
      savedSetting !== null ?
      savedSetting :
      Config.EDITOR.WORD_WRAP_DEFAULT_ENABLED;
  }

  function _saveWordWrapSetting() {
    StorageManager.saveItem(
      Config.STORAGE_KEYS.EDITOR_WORD_WRAP_ENABLED,
      isWordWrapActive,
      "Editor word wrap setting",
    );
  }

  function _toggleWordWrap() {
    if (!isActiveState) return;
    isWordWrapActive = !isWordWrapActive;
    _saveWordWrapSetting();
    EditorUI.applyTextareaWordWrap(isWordWrapActive);
    EditorUI.applyPreviewWordWrap(isWordWrapActive, currentFileMode);
    if (currentFileMode === Config.EDITOR.MODES.HTML) {

      EditorUI.renderPreview(
        EditorUI.getTextareaContent(),
        currentFileMode,
        isWordWrapActive,
      );
    }
    EditorUI.updateWordWrapButtonText(isWordWrapActive);
    EditorUI.setEditorFocus();
    EditorUI.setGutterVisibility(!isWordWrapActive);
  }

  function _updateFullEditorUI() {
    if (!isActiveState) return;
    EditorUI.updateFilenameDisplay(currentFilePath, isDirty);
    const textContent = EditorUI.getTextareaContent();
    EditorUI.updateLineNumbers(textContent);
    const selection = EditorUI.getTextareaSelection();
    EditorUI.updateStatusBar(textContent, selection.start);

    if (
      currentFileMode === Config.EDITOR.MODES.MARKDOWN ||
      currentFileMode === Config.EDITOR.MODES.HTML
    ) {

      EditorUI.renderPreview(textContent, currentFileMode, isWordWrapActive);
    }
  }

  function _handleEditorInput() {
    if (!isActiveState) return;
    const currentContent = EditorUI.getTextareaContent();
    isDirty = currentContent !== originalContent;
    _updateFullEditorUI();
  }

  function _handleEditorScroll() {
    if (!isActiveState) return;
    EditorUI.syncLineGutterScroll();
  }

  function _handleEditorSelectionChange() {
    if (!isActiveState) return;

    const textContent = EditorUI.getTextareaContent();
    const selection = EditorUI.getTextareaSelection();
    EditorUI.updateStatusBar(textContent, selection.start);
  }

  async function exportPreviewAsHtml() {

    if (!isActiveState) return;
    let contentToExport = "";
    let baseFilename = "preview";
    if (currentFilePath) {

      baseFilename = currentFilePath.substring(
        currentFilePath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1,
      );
      const dotIndex = baseFilename.lastIndexOf(".");
      if (dotIndex > 0) baseFilename = baseFilename.substring(0, dotIndex);
    }
    const downloadFilename = `${baseFilename}_preview.html`;

    if (currentFileMode === Config.EDITOR.MODES.MARKDOWN) {

      contentToExport = EditorUI.getPreviewPaneHTML();
    } else if (currentFileMode === Config.EDITOR.MODES.HTML) {

      contentToExport = EditorUI.getTextareaContent();
    } else {

      const textContent = EditorUI.getTextareaContent();
      contentToExport = `<pre>${textContent.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
    }

    const styles = EditorUtils.getPreviewStylingCSS(
      currentFileMode === Config.EDITOR.MODES.HTML,
    );
    let injectedWordWrapStyles = "";
    if (isWordWrapActive && currentFileMode === Config.EDITOR.MODES.HTML) {

      injectedWordWrapStyles = `pre { white-space: pre-wrap !important; word-break: break-all !important; overflow-wrap: break-word !important; } body { word-wrap: break-word; overflow-wrap: break-word; }`;
    }

    const htmlDoc = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>OopisOS Editor Preview - ${currentFilePath || "Untitled"}</title><style>${styles}${injectedWordWrapStyles}</style></head><body><div class="${currentFileMode === Config.EDITOR.MODES.MARKDOWN ? "markdown-preview" : ""}">${contentToExport}</div></body></html>`;
    try {
      const blob = new Blob([htmlDoc], {
        type: "text/html"
      });
      const url = URL.createObjectURL(blob);
      const a = Utils.createElement("a", {
        href: url,
        download: downloadFilename,
      });
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      OutputManager.appendToOutput(
        `Preview exported as '${downloadFilename}'`, {
          typeClass: Config.CSS_CLASSES.EDITOR_MSG
        },
      );
    } catch (error) {
      console.error("Error exporting preview:", error);
      OutputManager.appendToOutput(
        `Error exporting preview: ${error.message}`, {
          typeClass: Config.CSS_CLASSES.ERROR_MSG
        },
      );
    }
  }

  function _toggleViewModeHandler() {
    if (!isActiveState) return;
    const isPreviewable =
      currentFileMode === Config.EDITOR.MODES.MARKDOWN ||
      currentFileMode === Config.EDITOR.MODES.HTML;
    if (!isPreviewable) return;

    if (currentViewMode === Config.EDITOR.VIEW_MODES.SPLIT)
      currentViewMode = Config.EDITOR.VIEW_MODES.EDIT_ONLY;
    else if (currentViewMode === Config.EDITOR.VIEW_MODES.EDIT_ONLY)
      currentViewMode = Config.EDITOR.VIEW_MODES.PREVIEW_ONLY;
    else currentViewMode = Config.EDITOR.VIEW_MODES.SPLIT;

    EditorUI.setViewMode(
      currentViewMode,
      currentFileMode,
      isPreviewable,
      isWordWrapActive,
    );
    EditorUI.setEditorFocus();
  }

  function enter(filePath, content) {
    if (isActiveState) {
      OutputManager.appendToOutput("Editor already active.", {
        typeClass: Config.CSS_CLASSES.EDITOR_MSG,
      });
      return;
    }
    _loadWordWrapSetting();
    isActiveState = true;
    OutputManager.setEditorActive(true);
    if (DOM.outputDiv) {
      DOM.outputDiv.classList.add(Config.CSS_CLASSES.HIDDEN);
      console.log(
        "[EditorManager.enter] DOM.outputDiv classList:",
        DOM.outputDiv.classList.toString(),
      );
    } else {
      console.error("[EditorManager.enter] DOM.outputDiv is null!");
    }
    if (DOM.inputLineContainerDiv) {
      console.log(
        "[EditorManager.enter] DOM.inputLineContainerDiv BEFORE add hidden:",
        DOM.inputLineContainerDiv.classList.toString(),
      );
      DOM.inputLineContainerDiv.classList.add(Config.CSS_CLASSES.HIDDEN);
      console.log(
        "[EditorManager.enter] DOM.inputLineContainerDiv AFTER add hidden:",
        DOM.inputLineContainerDiv.classList.toString(),
      );
    } else {
      console.error("[EditorManager.enter] DOM.inputLineContainerDiv is null!");
    }
    TerminalUI.setInputState(false);
    console.log("[EditorManager.enter] TerminalUI input state set to false.");

    currentFilePath = filePath;
    currentFileMode = EditorUtils.determineMode(filePath);
    originalContent = content;
    isDirty = false;

    const isPreviewable =
      currentFileMode === Config.EDITOR.MODES.MARKDOWN ||
      currentFileMode === Config.EDITOR.MODES.HTML;
    currentViewMode = isPreviewable ?
      Config.EDITOR.VIEW_MODES.SPLIT :
      Config.EDITOR.VIEW_MODES.EDIT_ONLY;

    console.log("[EditorManager.enter] Calling EditorUI.buildLayout.");
    EditorUI.buildLayout(DOM.terminalDiv, {
      onInput: _handleEditorInput.bind(this),
      onScroll: _handleEditorScroll.bind(this),
      onSelectionChange: _handleEditorSelectionChange.bind(this),
      onKeydown: handleKeyDown.bind(this),
      onViewToggle: _toggleViewModeHandler.bind(this),
      onExportPreview: exportPreviewAsHtml.bind(this),
      onWordWrapToggle: _toggleWordWrap.bind(this),
    });
    console.log("[EditorManager.enter] EditorUI.buildLayout finished.");
    EditorUI.setGutterVisibility(!isWordWrapActive);
    EditorUI.setViewMode(
      currentViewMode,
      currentFileMode,
      isPreviewable,
      isWordWrapActive,
    );
    EditorUI.applyTextareaWordWrap(isWordWrapActive);
    EditorUI.updateWordWrapButtonText(isWordWrapActive);
    EditorUI.setTextareaContent(content);
    EditorUI.setTextareaSelection(0, 0);

    _updateFullEditorUI();
    EditorUI.setEditorFocus();
    console.log("[EditorManager.enter] Finished.");
  }

  async function _performExitActions() {
    EditorUI.destroyLayout();
    isActiveState = false;
    OutputManager.setEditorActive(false);
    currentFilePath = null;
    currentFileMode = Config.EDITOR.DEFAULT_MODE;
    isDirty = false;
    originalContent = "";

    if (DOM.outputDiv) {
      DOM.outputDiv.classList.remove(Config.CSS_CLASSES.HIDDEN);
    }
    if (DOM.inputLineContainerDiv) {
      DOM.inputLineContainerDiv.classList.remove(Config.CSS_CLASSES.HIDDEN);
    }

    TerminalUI.setInputState(true);
    if (DOM.outputDiv) {
      DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight;
    }
    TerminalUI.focusInput();
    TerminalUI.updatePrompt();
  }

  async function exit(saveChanges = false) {

    let proceedToExit = true;
    const currentUser = UserManager.getCurrentUser().name;
    const nowISO = new Date().toISOString();

    if (!saveChanges && isDirty) {

      const userConfirmedDiscard = await new Promise((resolveConfirmation) => {

        ConfirmationManager.request(
          [Config.MESSAGES.EDITOR_DISCARD_CONFIRM],
          null,
          () => resolveConfirmation(true),
          () => resolveConfirmation(false),
        );
      });
      if (userConfirmedDiscard) {

        OutputManager.appendToOutput(
          `Exited editor for '${currentFilePath || "Untitled"}' without saving. Discarded changes.`, {
            typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG
          },
        );
      } else {
        OutputManager.appendToOutput("Exit cancelled. Continue editing.", {
          typeClass: Config.CSS_CLASSES.EDITOR_MSG,
        });
        EditorUI.setEditorFocus();
        proceedToExit = false;
      }
    }
    if (!proceedToExit) return false;

    let saveSuccess = true;
    if (saveChanges && currentFilePath) {

      const newContent = EditorUI.getTextareaContent();
      const existingNode = FileSystemManager.getNodeByPath(currentFilePath);

      if (existingNode) {

        if (
          !FileSystemManager.hasPermission(existingNode, currentUser, "write")
        ) {

          OutputManager.appendToOutput(
            `Error saving '${currentFilePath}': Permission denied.`, {
              typeClass: Config.CSS_CLASSES.ERROR_MSG
            },
          );
          saveSuccess = false;
        }
      } else {

        const parentPath =
          currentFilePath.substring(
            0,
            currentFilePath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR),
          ) || Config.FILESYSTEM.ROOT_PATH;
        const parentNode = FileSystemManager.getNodeByPath(parentPath);
        if (
          !parentNode ||
          !FileSystemManager.hasPermission(parentNode, currentUser, "write")
        ) {

          OutputManager.appendToOutput(
            `Error creating '${currentFilePath}': Permission denied in parent directory.`, {
              typeClass: Config.CSS_CLASSES.ERROR_MSG
            },
          );
          saveSuccess = false;
        }
      }

      if (saveSuccess) {

        const parentDirResult =
          FileSystemManager.createParentDirectoriesIfNeeded(currentFilePath);
        if (parentDirResult.error) {

          OutputManager.appendToOutput(`edit: ${parentDirResult.error}`, {
            typeClass: Config.CSS_CLASSES.EDITOR_MSG,
          });
          saveSuccess = false;
        } else {
          const parentNode = parentDirResult.parentNode;
          if (parentNode) {

            const fileName = currentFilePath.substring(
              currentFilePath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1,
            );
            parentNode.children[fileName] = {

              type: Config.FILESYSTEM.DEFAULT_FILE_TYPE,
              content: newContent,
              owner: existingNode ? existingNode.owner : currentUser,
              mode: existingNode ?
                existingNode.mode :
                Config.FILESYSTEM.DEFAULT_FILE_MODE,
              mtime: nowISO,
            };
            FileSystemManager._updateNodeAndParentMtime(
              currentFilePath,
              nowISO,
            );
            if (!(await FileSystemManager.save(currentUser))) {

              OutputManager.appendToOutput(
                `Error saving file '${currentFilePath}'. Changes might be lost.`, {
                  typeClass: Config.CSS_CLASSES.ERROR_MSG
                },
              );
              saveSuccess = false;
            } else {
              OutputManager.appendToOutput(`File '${currentFilePath}' saved.`, {
                typeClass: Config.CSS_CLASSES.SUCCESS_MSG,
              });
              originalContent = newContent;
              isDirty = false;
              EditorUI.updateFilenameDisplay(currentFilePath, isDirty);
            }
          } else {
            OutputManager.appendToOutput(
              `Failed to save '${currentFilePath}'. Could not obtain parent directory.`, {
                typeClass: Config.CSS_CLASSES.ERROR_MSG
              },
            );
            saveSuccess = false;
          }
        }
      }
    } else if (!saveChanges && !isDirty) {

      OutputManager.appendToOutput(
        `Exited editor for '${currentFilePath || "Untitled"}' without saving. No changes made.`, {
          typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG
        },
      );
    }

    if (saveSuccess) await _performExitActions();
    return saveSuccess;
  }

  async function handleKeyDown(event) {

    if (!isActiveState) return;
    if (event.key === "Tab") {

      event.preventDefault();
      const selection = EditorUI.getTextareaSelection();
      const content = EditorUI.getTextareaContent();
      EditorUI.setTextareaContent(
        content.substring(0, selection.start) +
        Config.EDITOR.TAB_REPLACEMENT +
        content.substring(selection.end),
      );
      EditorUI.setTextareaSelection(
        selection.start + Config.EDITOR.TAB_REPLACEMENT.length,
        selection.start + Config.EDITOR.TAB_REPLACEMENT.length,
      );
      _handleEditorInput();
      return;
    }
    if (event.ctrlKey) {

      switch (
        event.key.toLowerCase()
      ) {
        case "s":
          event.preventDefault();
          await exit(true);
          break;
        case "o":
          event.preventDefault();
          await exit(false);
          break;
        case "p":
          event.preventDefault();
          _toggleViewModeHandler();
          break;
      }
    }
    setTimeout(_handleEditorSelectionChange, 0);
  }
  return {
    isActive: () => isActiveState,
    enter,
    exit,
    exportPreviewAsHtml
  };
})();

const UserManager = (() => {
  "use strict";
  let currentUser = {
    name: Config.USER.DEFAULT_NAME
  };

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
      "User list", {},
    );
    if (users[username]) {
      return {
        success: false,
        error: `User '${username}' already exists.`
      };
    }

    users[username] = {};
    if (
      StorageManager.saveItem(
        Config.STORAGE_KEYS.USER_CREDENTIALS,
        users,
        "User list",
      )
    ) {
      const activeUserAtStart = UserManager.getCurrentUser().name;
      let activeFsDataSnapshot = null;
      let activePathSnapshot = null;
      let restoreNeeded = false;

      if (
        FileSystemManager.getFsData() &&
        Object.keys(FileSystemManager.getFsData()).length > 0
      ) {
        activeFsDataSnapshot = Utils.deepCopyNode(
          FileSystemManager.getFsData(),
        );
        activePathSnapshot = FileSystemManager.getCurrentPath();
        restoreNeeded = true;
      }

      await FileSystemManager.initialize(username);
      await FileSystemManager.save(username);

      if (restoreNeeded) {
        FileSystemManager.setFsData(activeFsDataSnapshot);
        FileSystemManager.setCurrentPath(activePathSnapshot);
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
    if (currentUser.name === username)
      return {
        success: true,
        message: `${Config.MESSAGES.ALREADY_LOGGED_IN_AS_PREFIX}${username}${Config.MESSAGES.ALREADY_LOGGED_IN_AS_SUFFIX}`,
        noAction: true,
      };
    const users = StorageManager.loadItem(
      Config.STORAGE_KEYS.USER_CREDENTIALS,
      "User list", {},
    );
    if (
      !users.hasOwnProperty(username) &&
      username !== Config.USER.DEFAULT_NAME
    ) {
      return {
        success: false,
        error: "Invalid username."
      };
    }
    if (
      currentUser.name !== Config.USER.DEFAULT_NAME &&
      currentUser.name !== username
    )
      SessionManager.saveAutomaticState(currentUser.name);
    currentUser = {
      name: username
    };
    HistoryManager.clearHistory();
    await FileSystemManager.load(username);
    SessionManager.loadAutomaticState(username);
    TerminalUI.updatePrompt();
    return {
      success: true,
      message: `Logged in as ${username}.`
    };
  }

  async function logout() {
    if (currentUser.name === Config.USER.DEFAULT_NAME)
      return {
        success: true,
        message: `Already logged in as Guest. ${Config.MESSAGES.NO_ACTION_TAKEN}`,
        noAction: true,
      };
    SessionManager.saveAutomaticState(currentUser.name);
    const prevUserName = currentUser.name;
    currentUser = {
      name: Config.USER.DEFAULT_NAME
    };
    HistoryManager.clearHistory();
    await FileSystemManager.load(Config.USER.DEFAULT_NAME);
    SessionManager.loadAutomaticState(Config.USER.DEFAULT_NAME);
    TerminalUI.updatePrompt();
    return {
      success: true,
      message: `User ${prevUserName} logged out. Now logged in as ${Config.USER.DEFAULT_NAME}.`,
    };
  }

  function setCurrentUserObject(userObject) {
    currentUser = userObject;
  }

  function getDefaultUser() {
    return Config.USER.DEFAULT_NAME;
  }
  return {
    getCurrentUser,
    register,
    login,
    logout,
    setCurrentUserObject,
    getDefaultUser,
  };
})();

const SessionManager = (() => {
  "use strict";

  function _getAutomaticSessionStateKey(user) {
    return `${Config.STORAGE_KEYS.USER_TERMINAL_STATE_PREFIX}${user}`;
  }

  function _getManualUserTerminalStateKey(user) {
    const userName =
      typeof user === "object" && user !== null && user.name ?
      user.name :
      String(user);
    return `${Config.STORAGE_KEYS.MANUAL_TERMINAL_STATE_PREFIX}${userName}`;
  }

  function saveAutomaticState(username) {
    const currentInput = TerminalUI.getCurrentInputValue();
    const autoState = {
      currentPath: FileSystemManager.getCurrentPath(),
      outputHTML: DOM.outputDiv.innerHTML,
      currentInput: currentInput,
      commandHistory: HistoryManager.getFullHistory(),
    };
    StorageManager.saveItem(
      _getAutomaticSessionStateKey(username),
      autoState,
      `Auto session for ${username}`,
    );
  }

  function loadAutomaticState(username) {
    const autoState = StorageManager.loadItem(
      _getAutomaticSessionStateKey(username),
      `Auto session for ${username}`,
    );
    if (autoState) {
      FileSystemManager.setCurrentPath(
        autoState.currentPath || Config.FILESYSTEM.ROOT_PATH,
      );
      if (autoState.hasOwnProperty("outputHTML"))
        DOM.outputDiv.innerHTML = autoState.outputHTML || "";
      else DOM.outputDiv.innerHTML = "";
      TerminalUI.setCurrentInputValue(autoState.currentInput || "");
      HistoryManager.setHistory(autoState.commandHistory || []);
    } else {
      DOM.outputDiv.innerHTML = "";
      TerminalUI.setCurrentInputValue("");
      FileSystemManager.setCurrentPath(Config.FILESYSTEM.ROOT_PATH);
      HistoryManager.clearHistory();
      OutputManager.appendToOutput(
        `${Config.MESSAGES.WELCOME_PREFIX}${username}${Config.MESSAGES.WELCOME_SUFFIX}`,
      );
    }
    TerminalUI.updatePrompt();
    DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight;
    return !!autoState;
  }
  async function saveManualState() {
    const currentUser = UserManager.getCurrentUser();
    const currentInput = TerminalUI.getCurrentInputValue();
    const manualStateData = {
      user: currentUser.name,
      osVersion: Config.OS.VERSION,
      timestamp: new Date().toISOString(),
      currentPath: FileSystemManager.getCurrentPath(),
      outputHTML: DOM.outputDiv.innerHTML,
      currentInput: currentInput,
      fsDataSnapshot: Utils.deepCopyNode(FileSystemManager.getFsData()),
      commandHistory: HistoryManager.getFullHistory(),
    };
    if (
      StorageManager.saveItem(
        _getManualUserTerminalStateKey(currentUser),
        manualStateData,
        `Manual save for ${currentUser.name}`,
      )
    )
      return {
        success: true,
        message: `${Config.MESSAGES.SESSION_SAVED_FOR_PREFIX}${currentUser.name}.`,
      };
    else return {
      success: false,
      error: "Failed to save session manually."
    };
  }
  async function loadManualState() {
    const currentUser = UserManager.getCurrentUser();
    const manualStateData = StorageManager.loadItem(
      _getManualUserTerminalStateKey(currentUser),
      `Manual save for ${currentUser.name}`,
    );
    if (manualStateData) {
      if (manualStateData.user && manualStateData.user !== currentUser.name)
        OutputManager.appendToOutput(
          `Warning: Saved state is for user '${manualStateData.user}', but current user is '${currentUser.name}'. Loading anyway.`, {
            typeClass: Config.CSS_CLASSES.WARNING_MSG
          },
        );
      ConfirmationManager.request(
        [
          `Load manually saved state for '${currentUser.name}'? This overwrites current session & filesystem.`,
        ], {
          pendingData: manualStateData,
          userNameToRestoreTo: currentUser.name
        },
        async (data) => {
            FileSystemManager.setFsData(
              Utils.deepCopyNode(data.pendingData.fsDataSnapshot) || {
                [Config.FILESYSTEM.ROOT_PATH]: {
                  type: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE,
                  children: {},
                },
              },
            );
            FileSystemManager.setCurrentPath(
              data.pendingData.currentPath || Config.FILESYSTEM.ROOT_PATH,
            );
            DOM.outputDiv.innerHTML = data.pendingData.outputHTML || "";
            TerminalUI.setCurrentInputValue(data.pendingData.currentInput || "");
            HistoryManager.setHistory(data.pendingData.commandHistory || []);
            await FileSystemManager.save(data.userNameToRestoreTo);
            OutputManager.appendToOutput(Config.MESSAGES.SESSION_LOADED_MSG, {
              typeClass: Config.CSS_CLASSES.SUCCESS_MSG,
            });
            TerminalUI.updatePrompt();
            DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight;
          },
          () => {
            OutputManager.appendToOutput(Config.MESSAGES.LOAD_STATE_CANCELLED, {
              typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
            });
          },
      );
      return {
        success: true,
        message: "Confirmation requested for loading state.",
      };
    } else
      return {
        success: false,
        message: `${Config.MESSAGES.NO_MANUAL_SAVE_FOUND_PREFIX}${currentUser.name}.`,
      };
  }

  function clearUserSessionStates(username) {
    if (!username || typeof username !== "string") {
      console.warn(
        "SessionManager.clearUserSessionStates: Invalid username provided.",
      );
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

  async function performFullReset() {
    OutputManager.clearOutput();
    TerminalUI.clearInput();
    const keysToRemove = [];
    const allKeys = StorageManager.getAllLocalStorageKeys();
    allKeys.forEach((key) => {
      if (
        key.startsWith(Config.STORAGE_KEYS.USER_TERMINAL_STATE_PREFIX) ||
        key.startsWith(Config.STORAGE_KEYS.MANUAL_TERMINAL_STATE_PREFIX) ||
        key === Config.STORAGE_KEYS.USER_CREDENTIALS ||
        key === Config.STORAGE_KEYS.EDITOR_WORD_WRAP_ENABLED
      )
        keysToRemove.push(key);
    });
    keysToRemove.forEach((key) => StorageManager.removeItem(key));
    await OutputManager.appendToOutput(
      "All session states, credentials, and editor settings cleared from local storage.",
    );
    try {
      await FileSystemManager.clearAllFS();
      await OutputManager.appendToOutput(
        "All user filesystems cleared from DB.",
      );
    } catch (error) {}
    HistoryManager.clearHistory();
    const guestUser = {
      name: Config.USER.DEFAULT_NAME
    };
    UserManager.setCurrentUserObject(guestUser);
    await FileSystemManager.initialize(Config.USER.DEFAULT_NAME);
    await FileSystemManager.save(Config.USER.DEFAULT_NAME);
    loadAutomaticState(Config.USER.DEFAULT_NAME);
    await OutputManager.appendToOutput(
      "Terminal fully reset. All user data and states cleared.", {
        typeClass: Config.CSS_CLASSES.SUCCESS_MSG
      },
    );
    TerminalUI.updatePrompt();
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
  let isNavigatingHistory = false;

  function updatePrompt() {
    const user =
      typeof UserManager !== "undefined" ?
      UserManager.getCurrentUser() :
      {
        name: Config.USER.DEFAULT_NAME
      };
    DOM.promptUserSpan.textContent = user ?
      user.name :
      Config.USER.DEFAULT_NAME;
    DOM.promptUserSpan.className = "prompt-user mr-0.5 text-sky-400";

    DOM.promptHostSpan.textContent = Config.OS.DEFAULT_HOST_NAME;
    const currentPathDisplay =
      typeof FileSystemManager !== "undefined" ?
      FileSystemManager.getCurrentPath() :
      Config.FILESYSTEM.ROOT_PATH;
    DOM.promptPathSpan.textContent =
      currentPathDisplay === Config.FILESYSTEM.ROOT_PATH &&
      currentPathDisplay.length > 1 ?
      Config.FILESYSTEM.ROOT_PATH :
      currentPathDisplay;
  }

  function focusInput() {
    if (DOM.editableInputDiv) {
      DOM.editableInputDiv.focus();
      if (DOM.editableInputDiv.textContent.length === 0)
        setCaretToEnd(DOM.editableInputDiv);
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
      if (setAtEnd) setCaretToEnd(DOM.editableInputDiv);
    }
  }

  function setCaretToEnd(element) {
    if (!element) return;
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    element.focus();
  }

  function setCaretPosition(element, position) {
    if (!element || typeof position !== "number") return;
    const range = document.createRange();
    const sel = window.getSelection();
    let charCount = 0;
    let foundNode = false;

    function findTextNodeAndSet(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCharCount = charCount + node.length;
        if (!foundNode && position >= charCount && position <= nextCharCount) {
          range.setStart(node, position - charCount);
          range.collapse(true);
          foundNode = true;
        }
        charCount = nextCharCount;
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          if (findTextNodeAndSet(node.childNodes[i])) {
            return true;
          }
          if (foundNode) break;
        }
      }
      return foundNode;
    }

    if (element.childNodes.length === 0 && position === 0) {
      range.setStart(element, 0);
      range.collapse(true);
      foundNode = true;
    } else {
      findTextNodeAndSet(element);
    }

    if (foundNode) {
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      range.selectNodeContents(element);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    element.focus();
  }

  function setInputState(isEditable) {
    if (DOM.editableInputDiv) {
      DOM.editableInputDiv.contentEditable = isEditable ? "true" : "false";
      DOM.editableInputDiv.style.opacity = isEditable ? "1" : "0.5";
      if (isEditable) {} else {
        DOM.editableInputDiv.blur();
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
    setCaretPosition,
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
    const tokens = textBeforeCursor.trimStart().split(/\s+/);
    let currentWordPrefix = "";
    let isCompletingCommandName = false;
    let baseCommandForPath = "";
    const lastCharIsSpace =
      /\s$/.test(textBeforeCursor) || textBeforeCursor.length === 0;

    if (
      tokens.length === 0 ||
      (tokens.length === 1 && !lastCharIsSpace && tokens[0] !== "")
    ) {
      isCompletingCommandName = true;
      currentWordPrefix = tokens.length > 0 ? tokens[0] : "";
    } else {
      baseCommandForPath = tokens[0].toLowerCase();
      if (lastCharIsSpace) {
        currentWordPrefix = "";
      } else {
        currentWordPrefix = tokens[tokens.length - 1];
      }
    }

    let suggestions = [];
    if (isCompletingCommandName) {
      const allCommands = CommandExecutor.getCommands();
      if (allCommands) {
        suggestions = Object.keys(allCommands)
          .filter((cmdName) => cmdName.startsWith(currentWordPrefix))
          .sort();
      }
    } else if (PATH_COMMANDS.includes(baseCommandForPath)) {

      if (
        baseCommandForPath === "grep" &&
        tokens.length < (tokens[1]?.startsWith("-") ? 3 : 2) &&
        !lastCharIsSpace
      ) {

      } else {
        let effectiveBasePath = FileSystemManager.getCurrentPath();
        let segmentToMatch = currentWordPrefix;
        const lastSlashIndex = currentWordPrefix.lastIndexOf(
          Config.FILESYSTEM.PATH_SEPARATOR,
        );
        let pathPrefixTyped = "";

        if (lastSlashIndex !== -1) {
          pathPrefixTyped = currentWordPrefix.substring(0, lastSlashIndex + 1);
          segmentToMatch = currentWordPrefix.substring(lastSlashIndex + 1);
          effectiveBasePath = FileSystemManager.getAbsolutePath(
            pathPrefixTyped,
            FileSystemManager.getCurrentPath(),
          );
        }
        const baseNode = FileSystemManager.getNodeByPath(effectiveBasePath);
        const currentUser = UserManager.getCurrentUser().name;
        if (
          baseNode &&
          baseNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE &&
          FileSystemManager.hasPermission(baseNode, currentUser, "read")
        ) {
          suggestions = Object.keys(baseNode.children)
            .filter((name) => name.startsWith(segmentToMatch))
            .map((name) => {
              const childNode = baseNode.children[name];
              let fullSuggestion = pathPrefixTyped + name;
              if (childNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
                return fullSuggestion + Config.FILESYSTEM.PATH_SEPARATOR;
              }
              return fullSuggestion;
            })
            .sort();
        }
      }
    }

    if (suggestions.length === 0) {
      return {
        textToInsert: null,
        newCursorPos: cursorPos
      };
    }

    if (suggestions.length === 1) {
      const completedSegment = suggestions[0];
      let startOfWordIndex = textBeforeCursor.length - currentWordPrefix.length;
      if (startOfWordIndex < 0) startOfWordIndex = 0;
      const newFullInput =
        textBeforeCursor.substring(0, startOfWordIndex) +
        completedSegment +
        fullInput.substring(cursorPos);
      const newCursor = startOfWordIndex + completedSegment.length;
      return {
        textToInsert: newFullInput,
        newCursorPos: newCursor
      };
    } else {
      const lcp = findLongestCommonPrefix(suggestions);
      if (lcp.length > currentWordPrefix.length) {
        let startOfWordIndex =
          textBeforeCursor.length - currentWordPrefix.length;
        if (startOfWordIndex < 0) startOfWordIndex = 0;
        const newFullInput =
          textBeforeCursor.substring(0, startOfWordIndex) +
          lcp +
          fullInput.substring(cursorPos);
        const newCursor = startOfWordIndex + lcp.length;
        return {
          textToInsert: newFullInput,
          newCursorPos: newCursor
        };
      } else {
        const promptText = `${DOM.promptUserSpan.textContent}${Config.TERMINAL.PROMPT_AT}${DOM.promptHostSpan.textContent}${Config.TERMINAL.PROMPT_SEPARATOR}${DOM.promptPathSpan.textContent}${Config.TERMINAL.PROMPT_CHAR} `;
        OutputManager.appendToOutput(suggestions.join("    "), {
          typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
          isCompletionSuggestion: true,
        });
        OutputManager.appendToOutput(`${promptText}${fullInput}`, {
          isCompletionSuggestion: true,
        });
        DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight;
        return {
          textToInsert: null,
          newCursorPos: cursorPos
        };
      }
    }
  }
  return {
    getSuggestions
  };
})();

const CommandExecutor = (() => {
  "use strict";
  let scriptExecutionInProgress = false;
  let backgroundProcessIdCounter = 0;

  const TokenType = {
    WORD: "WORD",
    STRING_DQ: "STRING_DQ",
    STRING_SQ: "STRING_SQ",
    OPERATOR_GT: "OPERATOR_GT",
    OPERATOR_GTGT: "OPERATOR_GTGT",
    OPERATOR_PIPE: "OPERATOR_PIPE",
    OPERATOR_BG: "OPERATOR_BG",
    EOF: "EOF",
  };
  class Token {
    constructor(type, value, position) {
      this.type = type;
      this.value = value;
      this.position = position;
    }
  }
  class Lexer {
    constructor(input) {
      this.input = input;
      this.position = 0;
      this.tokens = [];
    }
    tokenize() {
      while (this.position < this.input.length) {
        const char = this.input[this.position];
        if (/\s/.test(char)) {
          this.position++;
          continue;
        }
        if (char === '"') {
          this.tokens.push(this._tokenizeString('"'));
          continue;
        }
        if (char === "'") {
          this.tokens.push(this._tokenizeString("'"));
          continue;
        }
        if (char === ">") {
          if (this.input[this.position + 1] === ">") {
            this.tokens.push(
              new Token(TokenType.OPERATOR_GTGT, ">>", this.position),
            );
            this.position += 2;
          } else {
            this.tokens.push(
              new Token(TokenType.OPERATOR_GT, ">", this.position),
            );
            this.position++;
          }
          continue;
        }
        if (char === "|") {
          this.tokens.push(
            new Token(TokenType.OPERATOR_PIPE, "|", this.position),
          );
          this.position++;
          continue;
        }
        if (char === "&") {
          this.tokens.push(
            new Token(TokenType.OPERATOR_BG, "&", this.position),
          );
          this.position++;
          continue;
        }
        let value = "";
        const startPos = this.position;
        while (
          this.position < this.input.length &&
          !/\s/.test(this.input[this.position]) &&
          !['"', "'", ">", "|", "&"].includes(this.input[this.position])
        ) {
          value += this.input[this.position];
          this.position++;
        }
        if (value) this.tokens.push(new Token(TokenType.WORD, value, startPos));
        else if (
          this.position < this.input.length &&
          !['"', "'", ">", "|", "&"].includes(this.input[this.position]) &&
          !/\s/.test(this.input[this.position])
        ) {
          throw new Error(
            `Lexer Error: Unhandled character '${this.input[this.position]}' at position ${this.position}.`,
          );
        }
      }
      this.tokens.push(new Token(TokenType.EOF, null, this.position));
      return this.tokens;
    }
    _tokenizeString(quoteChar) {
      const startPos = this.position;
      let value = "";
      this.position++;
      while (
        this.position < this.input.length &&
        this.input[this.position] !== quoteChar
      ) {
        value += this.input[this.position];
        this.position++;
      }
      if (
        this.position >= this.input.length ||
        this.input[this.position] !== quoteChar
      )
        throw new Error(
          `Lexer Error: Unclosed string literal starting at position ${startPos}. Expected closing ${quoteChar}.`,
        );
      this.position++;
      return new Token(
        quoteChar === '"' ? TokenType.STRING_DQ : TokenType.STRING_SQ,
        value,
        startPos,
      );
    }
  }
  class ParsedCommandSegment {
    constructor(command, args) {
      this.command = command;
      this.args = args;
    }
  }
  class ParsedPipeline {
    constructor() {
      this.segments = [];
      this.redirection = null;
      this.isBackground = false;
    }
  }
  class Parser {
    constructor(tokens) {
      this.tokens = tokens;
      this.position = 0;
      this.pipeline = new ParsedPipeline();
    }
    _currentToken() {
      return this.tokens[this.position];
    }
    _nextToken() {
      if (this.position < this.tokens.length - 1) this.position++;
      return this._currentToken();
    }
    _expectAndConsume(tokenType, optional = false) {
      const c = this._currentToken();
      if (c.type === tokenType) {
        this._nextToken();
        return c;
      }
      if (optional) return null;
      throw new Error(
        `Parser Error: Expected token ${tokenType} but got ${c.type} ('${c.value}') at input position ${c.position}.`,
      );
    }
    _parseSingleCommandSegment() {
      if (
        this._currentToken().type === TokenType.EOF ||
        this._currentToken().type === TokenType.OPERATOR_PIPE ||
        this._currentToken().type === TokenType.OPERATOR_BG
      )
        return null;
      const cmdToken = this._expectAndConsume(TokenType.WORD);
      if (!cmdToken)
        throw new Error("Parser Error: Expected command name (WORD).");
      const command = cmdToken.value;
      const args = [];
      while (
        this._currentToken().type !== TokenType.EOF &&
        this._currentToken().type !== TokenType.OPERATOR_PIPE &&
        this._currentToken().type !== TokenType.OPERATOR_GT &&
        this._currentToken().type !== TokenType.OPERATOR_GTGT &&
        this._currentToken().type !== TokenType.OPERATOR_BG
      ) {
        const argToken = this._currentToken();
        if (
          argToken.type === TokenType.WORD ||
          argToken.type === TokenType.STRING_DQ ||
          argToken.type === TokenType.STRING_SQ
        ) {
          args.push(argToken.value);
          this._nextToken();
        } else
          throw new Error(
            `Parser Error: Unexpected token ${argToken.type} ('${argToken.value}') in arguments at position ${argToken.position}.`,
          );
      }
      return new ParsedCommandSegment(command, args);
    }
    parse() {
      let currentSegment = this._parseSingleCommandSegment();
      if (currentSegment) this.pipeline.segments.push(currentSegment);
      else if (
        this._currentToken().type !== TokenType.EOF &&
        this._currentToken().type !== TokenType.OPERATOR_BG
      )
        throw new Error(
          `Parser Error: Expected command at start of input or after pipe.`,
        );
      while (this._currentToken().type === TokenType.OPERATOR_PIPE) {
        this._nextToken();
        currentSegment = this._parseSingleCommandSegment();
        if (!currentSegment)
          throw new Error(
            "Parser Error: Expected command after pipe operator '|'.",
          );
        this.pipeline.segments.push(currentSegment);
      }
      if (
        this._currentToken().type === TokenType.OPERATOR_GT ||
        this._currentToken().type === TokenType.OPERATOR_GTGT
      ) {
        const opToken = this._currentToken();
        this._nextToken();
        const fileToken =
          this._expectAndConsume(TokenType.WORD, true) ||
          this._expectAndConsume(TokenType.STRING_DQ, true) ||
          this._expectAndConsume(TokenType.STRING_SQ, true);
        if (!fileToken)
          throw new Error(
            `Parser Error: Expected filename after redirection operator '${opToken.value}'.`,
          );
        this.pipeline.redirection = {
          type: opToken.type === TokenType.OPERATOR_GTGT ? "append" : "overwrite",
          file: fileToken.value,
        };
      }
      if (this._currentToken().type === TokenType.OPERATOR_BG) {
        if (this.tokens[this.position + 1].type !== TokenType.EOF)
          throw new Error(
            "Parser Error: Background operator '&' must be the last character on the command line (or before EOF).",
          );
        this.pipeline.isBackground = true;
        this._nextToken();
      }
      this._expectAndConsume(TokenType.EOF);
      if (
        this.pipeline.segments.length === 0 &&
        !this.pipeline.isBackground &&
        !this.pipeline.redirection
      )
        return new ParsedPipeline();
      return this.pipeline;
    }
  }
  const commands = {
    help: {
      handler: async (args, options) => {
        let output = "OopisOS Help:\n\n";
        if (args.length === 0) {
          output += "Available commands:\n";
          Object.keys(commands)
            .sort()
            .forEach((cmd) => {
              output += `  ${cmd.padEnd(15)} ${commands[cmd].description || ""}\n`;
            });
          output += "\nType 'help [command]' for more information.";
        } else {
          const cmdName = args[0].toLowerCase();
          if (commands[cmdName]?.helpText) output = commands[cmdName].helpText;
          else if (commands[cmdName])
            output = `No detailed help for '${cmdName}'.\nDesc: ${commands[cmdName].description || "N/A"}`;
          else
            return {
              success: false,
              error: `help: '${args[0]}' not found.`
            };
        }
        return {
          success: true,
          output: output
        };
      },
      description: "Displays help information.",
      helpText: "Usage: help [command]\n\nDisplays a list of commands or help for a specific [command].",
    },
    echo: {
      handler: async (args, options) => {
        return {
          success: true,
          output: args.join(" ")
        };
      },
      description: "Displays a line of text.",
      helpText: "Usage: echo [text...]\n\nPrints the specified [text] to the terminal.",
    },
    clear: {
      handler: async (args, options) => {
        if (options.isInteractive) OutputManager.clearOutput();
        return {
          success: true,
          output: ""
        };
      },
      description: "Clears the terminal screen.",
      helpText: "Usage: clear\n\nClears all previous output from the terminal screen.",
    },
    date: {
      handler: async (args, options) => {
        return {
          success: true,
          output: new Date().toString()
        };
      },
      description: "Displays the current date and time.",
      helpText: "Usage: date\n\nShows the current system date and time.",
    },
    pwd: {
      handler: async (args, options) => {
        return {
          success: true,
          output: FileSystemManager.getCurrentPath()
        };
      },
      description: "Prints the current working directory.",
      helpText: "Usage: pwd\n\nDisplays the full path of the current directory.",
    },
    ls: {
      handler: async (args, options) => {
        const flagDefinitions = [{
            name: "long",
            short: "-l",
            long: "--long"
          },
          {
            name: "all",
            short: "-a",
            long: "--all"
          },
          {
            name: "recursive",
            short: "-R"
          },
          {
            name: "reverseSort",
            short: "-r"
          },
          {
            name: "sortByTime",
            short: "-t"
          },
          {
            name: "sortBySize",
            short: "-S"
          },
          {
            name: "sortByExtension",
            short: "-X"
          },
          {
            name: "noSort",
            short: "-U"
          },
        ];
        const {
          flags,
          remainingArgs
        } = Utils.parseFlags(
          args,
          flagDefinitions,
        );

        const pathsToList =
          remainingArgs.length > 0 ?
          remainingArgs.map((p) =>
            FileSystemManager.getAbsolutePath(
              p,
              FileSystemManager.getCurrentPath(),
            ),
          ) :
          [FileSystemManager.getCurrentPath()];
        const currentUser = UserManager.getCurrentUser().name;
        let outputBlocks = [];
        let overallSuccess = true;

        function getItemDetails(itemName, itemNode, itemPath) {

          if (!itemNode) return null;
          const details = {
            name: itemName,
            path: itemPath,
            node: itemNode,
            type: itemNode.type,
            owner: itemNode.owner || "unknown",
            mode: itemNode.mode,
            mtime: itemNode.mtime ? new Date(itemNode.mtime) : new Date(0),
            size: FileSystemManager.calculateNodeSize(itemNode),
            extension: Utils.getFileExtension(itemName),
            linkCount: 1,
          };
          return details;
        }

        function formatLongListItem(itemDetails) {

          const perms = FileSystemManager.formatModeToString(itemDetails.node);
          const owner = itemDetails.owner.padEnd(10);
          const size = Utils.formatBytes(itemDetails.size).padStart(8);
          let dateStr = "            ";
          if (itemDetails.mtime && itemDetails.mtime.getTime() !== 0) {
            const d = itemDetails.mtime;
            const months = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];
            const month = months[d.getMonth()];
            const day = d.getDate().toString();
            const hours = d.getHours().toString().padStart(2, "0");
            const minutes = d.getMinutes().toString().padStart(2, "0");
            dateStr = `${month.padEnd(3)} ${day.padStart(2, " ")} ${hours}:${minutes}`;
          }
          const nameSuffix =
            itemDetails.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE ?
            Config.FILESYSTEM.PATH_SEPARATOR :
            "";
          return `${perms}  ${String(itemDetails.linkCount).padStart(2)} ${owner} ${size} ${dateStr} ${itemDetails.name}${nameSuffix}`;
        }

        function sortItems(items, currentFlags) {
          let sortedItems = [...items];
          if (currentFlags.noSort) {

          } else if (currentFlags.sortByTime) {
            sortedItems.sort(
              (a, b) => b.mtime - a.mtime || a.name.localeCompare(b.name),
            );
          } else if (currentFlags.sortBySize) {
            sortedItems.sort(
              (a, b) => b.size - a.size || a.name.localeCompare(b.name),
            );
          } else if (currentFlags.sortByExtension) {
            sortedItems.sort((a, b) => {
              const extComp = a.extension.localeCompare(b.extension);
              if (extComp !== 0) return extComp;
              return a.name.localeCompare(b.name);
            });
          } else {
            sortedItems.sort((a, b) => a.name.localeCompare(b.name));
          }
          if (currentFlags.reverseSort) {
            sortedItems.reverse();
          }
          return sortedItems;
        }

        async function listSinglePathContents(targetPathArg, effectiveFlags) {

          const resolvedPath = FileSystemManager.getAbsolutePath(
            targetPathArg,
            FileSystemManager.getCurrentPath(),
          );
          const pathValidation = FileSystemManager.validatePath(
            "ls",
            resolvedPath,
          );

          if (pathValidation.error) {

            return {
              success: false,
              output: pathValidation.error
            };
          }

          const targetNode = pathValidation.node;

          if (
            !FileSystemManager.hasPermission(targetNode, currentUser, "read")
          ) {
            return {
              success: false,
              output: `ls: cannot open directory '${targetPathArg}': Permission denied`,
            };
          }

          let itemDetailsList = [];
          let singleFileResultOutput = null;

          if (targetNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
            const childrenNames = Object.keys(targetNode.children);
            for (const name of childrenNames) {
              if (!effectiveFlags.all && name.startsWith(".")) continue;
              const childNode = targetNode.children[name];

              const childFullPath = FileSystemManager.getAbsolutePath(
                name,
                resolvedPath,
              );
              const details = getItemDetails(name, childNode, childFullPath);
              if (details) itemDetailsList.push(details);
            }
            itemDetailsList = sortItems(itemDetailsList, effectiveFlags);
          } else {

            const fileName = resolvedPath.substring(
              resolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1,
            );
            const details = getItemDetails(fileName, targetNode, resolvedPath);
            if (details) {
              if (effectiveFlags.long)
                singleFileResultOutput = formatLongListItem(details);
              else singleFileResultOutput = details.name;
            } else {

              return {
                success: false,
                output: `ls: cannot stat '${targetPathArg}': Error retrieving details`,
              };
            }
          }

          let currentPathOutputLines = [];
          if (singleFileResultOutput !== null) {
            currentPathOutputLines.push(singleFileResultOutput);
          } else if (
            targetNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
          ) {

            if (effectiveFlags.long) {
              currentPathOutputLines.push(`total ${itemDetailsList.length}`);
            }
            itemDetailsList.forEach((item) => {
              if (effectiveFlags.long) {
                currentPathOutputLines.push(formatLongListItem(item));
              } else {
                const nameSuffix =
                  item.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE ?
                  Config.FILESYSTEM.PATH_SEPARATOR :
                  "";
                currentPathOutputLines.push(`${item.name}${nameSuffix}`);
              }
            });
          }
          return {
            success: true,
            output: currentPathOutputLines.join("\n"),
            items: itemDetailsList,
          };
        }

        async function displayRecursive(currentPath, displayFlags, depth = 0) {
          let blockOutputs = [];
          let encounteredErrorInThisBranch = false;

          if (depth > 0) blockOutputs.push("");
          blockOutputs.push(`${currentPath}:`);

          const listResult = await listSinglePathContents(
            currentPath,
            displayFlags,
          );

          if (!listResult.success) {

            blockOutputs.push(listResult.output);
            encounteredErrorInThisBranch = true;
            return {
              outputs: blockOutputs,
              encounteredError: encounteredErrorInThisBranch,
            };
          }

          if (
            listResult.output ||
            (flags.long && listResult.items && listResult.items.length === 0)
          ) {

            blockOutputs.push(listResult.output);
          }

          if (listResult.items) {

            const subdirectories = listResult.items.filter(
              (item) =>
              item.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE &&
              item.name !== "." &&
              item.name !== "..",
            );

            for (const dirItem of subdirectories) {

              const subDirResult = await displayRecursive(
                dirItem.path,
                displayFlags,
                depth + 1,
              );
              blockOutputs = blockOutputs.concat(subDirResult.outputs);
              if (subDirResult.encounteredError) {
                encounteredErrorInThisBranch = true;
              }
            }
          }
          return {
            outputs: blockOutputs,
            encounteredError: encounteredErrorInThisBranch,
          };
        }

        if (flags.recursive) {
          for (let i = 0; i < pathsToList.length; i++) {
            const path = pathsToList[i];
            const recursiveResult = await displayRecursive(path, flags);
            outputBlocks = outputBlocks.concat(recursiveResult.outputs);
            if (recursiveResult.encounteredError) {
              overallSuccess = false;
            }

            if (pathsToList.length > 1 && i < pathsToList.length - 1) {
              outputBlocks.push("");
            }
          }
        } else {

          for (let i = 0; i < pathsToList.length; i++) {
            const path = pathsToList[i];
            if (pathsToList.length > 1) {

              if (i > 0) outputBlocks.push("");
              outputBlocks.push(`${path}:`);
            }

            const listResult = await listSinglePathContents(path, flags);
            if (!listResult.success) {
              overallSuccess = false;

              outputBlocks.push(listResult.output);
            } else {

              if (
                listResult.output ||
                FileSystemManager.getNodeByPath(path)?.type ===
                Config.FILESYSTEM.DEFAULT_FILE_TYPE
              ) {
                outputBlocks.push(listResult.output);
              }
            }
          }
        }

        const finalOutput = outputBlocks
          .filter((block) => typeof block === "string")
          .join("\n");

        return {
          success: overallSuccess,
          output: finalOutput,
        };
      },
      description: "Lists directory contents or file information.",
      helpText: `Usage: ls [OPTIONS] [PATH...]\n
Lists information about the FILEs (the current directory by default).
Sort entries alphabetically if none of -tSUXU is specified.

Options:
  -a, --all          Do not ignore entries starting with .
  -l, --long         Use a long listing format.
  -R, --recursive    List subdirectories recursively.
  -r, --reverse      Reverse order while sorting.
  -S                 Sort by file size, largest first.
  -t                 Sort by modification time, newest first.
  -X                 Sort alphabetically by entry extension.
  -U                 Do not sort; list entries in directory order.
`,
    },
    cd: {
      handler: async (args, options) => {
        const validationResult = Utils.validateArguments(args, {
          exact: 1
        });
        if (!validationResult.isValid)
          return {
            success: false,
            error: `cd: ${validationResult.errorDetail}`,
          };
        const targetPath = args[0];
        const pathValidation = FileSystemManager.validatePath(
          "cd",
          targetPath, {
            expectedType: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
          },
        );
        if (pathValidation.error)
          return {
            success: false,
            error: pathValidation.error
          };
        const dirNode = pathValidation.node;
        const currentUser = UserManager.getCurrentUser().name;
        if (!FileSystemManager.hasPermission(dirNode, currentUser, "execute"))
          return {
            success: false,
            error: `cd: '${targetPath}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`,
          };
        if (FileSystemManager.getCurrentPath() === pathValidation.resolvedPath)
          return {
            success: true,
            output: `${Config.MESSAGES.ALREADY_IN_DIRECTORY_PREFIX}${pathValidation.resolvedPath}${Config.MESSAGES.ALREADY_IN_DIRECTORY_SUFFIX} ${Config.MESSAGES.NO_ACTION_TAKEN}`,
            messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
          };
        FileSystemManager.setCurrentPath(pathValidation.resolvedPath);
        if (options.isInteractive) TerminalUI.updatePrompt();
        return {
          success: true,
          output: ""
        };
      },
      description: "Changes the current directory.",
      helpText: "Usage: cd <directory_path>\n\nChanges the current working directory to the specified <directory_path>.",
    },
    mkdir: {
      handler: async (args, options) => {
        const {
          flags,
          remainingArgs
        } = Utils.parseFlags(args, [{
          name: "parents",
          short: "-p",
          long: "--parents"
        }, ]);
        const validationResult = Utils.validateArguments(remainingArgs, {
          min: 1,
        });
        if (!validationResult.isValid) {
          return {
            success: false,

            error: validationResult.errorDetail,
            messageType: Config.CSS_CLASSES.ERROR_MSG,
          };
        }

        let allSuccess = true;
        const messages = [];
        let changesMade = false;
        const currentUser = UserManager.getCurrentUser().name;
        const nowISO = new Date().toISOString();

        for (const pathArg of remainingArgs) {
          const resolvedPath = FileSystemManager.getAbsolutePath(
            pathArg,
            FileSystemManager.getCurrentPath(),
          );
          const dirName = resolvedPath.substring(
            resolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1,
          );

          if (
            resolvedPath === Config.FILESYSTEM.ROOT_PATH ||
            dirName === "" ||
            dirName === Config.FILESYSTEM.CURRENT_DIR_SYMBOL ||
            dirName === Config.FILESYSTEM.PARENT_DIR_SYMBOL
          ) {

            messages.push(
              `cannot create directory '${pathArg}': Invalid path or name`,
            );
            allSuccess = false;
            continue;
          }

          let parentNodeToCreateIn;
          if (flags.parents) {
            const parentDirResult =
              FileSystemManager.createParentDirectoriesIfNeeded(resolvedPath);
            if (parentDirResult.error) {

              messages.push(parentDirResult.error);
              allSuccess = false;
              continue;
            }
            parentNodeToCreateIn = parentDirResult.parentNode;
          } else {
            const parentPathForTarget =
              resolvedPath.substring(
                0,
                resolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR),
              ) || Config.FILESYSTEM.ROOT_PATH;
            parentNodeToCreateIn =
              FileSystemManager.getNodeByPath(parentPathForTarget);

            if (!parentNodeToCreateIn) {
              messages.push(
                `cannot create directory '${pathArg}': Parent directory '${parentPathForTarget}' does not exist`,
              );
              allSuccess = false;
              continue;
            }
            if (
              parentNodeToCreateIn.type !==
              Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
            ) {
              messages.push(
                `cannot create directory '${pathArg}': Path component '${parentPathForTarget}' is not a directory`,
              );
              allSuccess = false;
              continue;
            }
            if (
              !FileSystemManager.hasPermission(
                parentNodeToCreateIn,
                currentUser,
                "write",
              )
            ) {
              messages.push(
                `cannot create directory '${pathArg}' in '${parentPathForTarget}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`,
              );
              allSuccess = false;
              continue;
            }
          }

          if (
            parentNodeToCreateIn.children &&
            parentNodeToCreateIn.children[dirName]
          ) {
            const existingItem = parentNodeToCreateIn.children[dirName];
            if (existingItem.type === Config.FILESYSTEM.DEFAULT_FILE_TYPE) {
              messages.push(

                `cannot create directory '${pathArg}' because it conflicts with an existing file of the same name.`,
              );
              allSuccess = false;
            } else if (
              existingItem.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE &&
              !flags.parents
            ) {
              messages.push(

                `cannot create directory '${pathArg}': Directory already exists.`,
              );
              allSuccess = false;
            }
            continue;
          } else {

            parentNodeToCreateIn.children[dirName] = {
              type: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE,
              children: {},
              owner: currentUser,
              mode: Config.FILESYSTEM.DEFAULT_DIR_MODE,
              mtime: nowISO,
            };
            parentNodeToCreateIn.mtime = nowISO;
            messages.push(`created directory '${pathArg}'`);
            changesMade = true;
          }
        }

        if (changesMade && !(await FileSystemManager.save(currentUser))) {

          allSuccess = false;

          messages.unshift("Failed to save file system changes.");
        }

        if (!allSuccess) {

          const errorDetailMessages = messages.filter(
            (m) => !m.startsWith("created directory"),
          );
          return {
            success: false,
            error: errorDetailMessages.join("\n") ||
              "An unspecified error occurred.",
            messageType: Config.CSS_CLASSES.ERROR_MSG,
          };
        }

        return {
          success: true,
          output: messages.join("\n"),
          messageType: Config.CSS_CLASSES.SUCCESS_MSG,
        };
      },
      description: "Creates new directories.",
      helpText: "Usage: mkdir [-p] <directory_name>...\n\nCreates one or more new directories with the specified names.\n  -p, --parents   No error if existing, make parent directories as needed.",
    },
    tree: {
      handler: async (args, options) => {
        const {
          flags,
          remainingArgs
        } = Utils.parseFlags(args, [{
            name: "level",
            short: "-L",
            long: "--level",
            takesValue: true
          },
          {
            name: "dirsOnly",
            short: "-d",
            long: "--dirs-only"
          },
        ]);
        const pathArg =
          remainingArgs.length > 0 ?
          remainingArgs[0] :
          Config.FILESYSTEM.CURRENT_DIR_SYMBOL;
        const maxDepth = flags.level ?
          Utils.parseNumericArg(flags.level, {
            min: 0
          }) :
          {
            value: Infinity
          };
        if (flags.level && (maxDepth.error || maxDepth.value === null))
          return {
            success: false,
            error: `tree: invalid level value for -L: '${flags.level}' ${maxDepth.error || ""}`,
          };
        const pathValidation = FileSystemManager.validatePath("tree", pathArg, {
          expectedType: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE,
        });
        if (pathValidation.error)
          return {
            success: false,
            error: pathValidation.error
          };
        const startNode = pathValidation.node;
        const absStartPath = pathValidation.resolvedPath;
        const currentUser = UserManager.getCurrentUser().name;
        if (!FileSystemManager.hasPermission(startNode, currentUser, "read"))
          return {
            success: false,
            error: `tree: '${pathArg}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`,
          };
        const outputLines = [absStartPath];
        let dirCount = 0;
        let fileCount = 0;

        function buildTreeRecursive(
          currentDirPath,
          currentDepth,
          indentPrefix,
        ) {
          if (currentDepth > maxDepth.value) return;
          const node = FileSystemManager.getNodeByPath(currentDirPath);
          if (!node || node.type !== Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE)
            return;
          if (
            currentDepth > 1 &&
            !FileSystemManager.hasPermission(node, currentUser, "read")
          ) {
            outputLines.push(indentPrefix + "└── [Permission Denied]");
            return;
          }
          const childrenNames = Object.keys(node.children).sort();
          childrenNames.forEach((childName, index) => {
            const childNode = node.children[childName];
            const isLast = index === childrenNames.length - 1;
            const connector = isLast ? "└── " : "├── ";
            const childAbsPath = FileSystemManager.getAbsolutePath(
              childName,
              currentDirPath,
            );
            if (childNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
              dirCount++;
              outputLines.push(
                indentPrefix +
                connector +
                childName +
                Config.FILESYSTEM.PATH_SEPARATOR,
              );
              if (currentDepth < maxDepth.value)
                buildTreeRecursive(
                  childAbsPath,
                  currentDepth + 1,
                  indentPrefix + (isLast ? "    " : "│   "),
                );
            } else if (!flags.dirsOnly) {
              fileCount++;
              outputLines.push(indentPrefix + connector + childName);
            }
          });
        }
        buildTreeRecursive(absStartPath, 1, "");
        outputLines.push("");
        let report = `${dirCount} director${dirCount === 1 ? "y" : "ies"}`;
        if (!flags.dirsOnly)
          report += `, ${fileCount} file${fileCount === 1 ? "" : "s"}`;
        outputLines.push(report);
        return {
          success: true,
          output: outputLines.join("\n")
        };
      },
      description: "Lists contents of directories in a tree-like format.",
      helpText: "Usage: tree [-L level] [-d] [path]\n\n...",
    },
    touch: {
      handler: async (args, options) => {
        const flagDefinitions = [{
            name: "noCreate",
            short: "-c",
            long: "--no-create"
          },
          {
            name: "dateString",
            short: "-d",
            long: "--date",
            takesValue: true
          },
          {
            name: "stamp",
            short: "-t",
            takesValue: true
          },
        ];
        const {
          flags,
          remainingArgs
        } = Utils.parseFlags(
          args,
          flagDefinitions,
        );

        const validationResult = Utils.validateArguments(remainingArgs, {
          min: 1,
        });
        if (!validationResult.isValid) {
          return {
            success: false,
            error: `touch: ${validationResult.errorDetail}`,
          };
        }

        const timestampResult =
          TimestampParser.resolveTimestampFromCommandFlags(flags, "touch");
        if (timestampResult.error) {
          return {
            success: false,
            error: timestampResult.error
          };
        }
        const timestampToUse = timestampResult.timestampISO;
        const nowActualISO = new Date().toISOString();

        let allSuccess = true;
        const messages = [];
        let changesMade = false;
        const currentUser = UserManager.getCurrentUser().name;

        for (const pathArg of remainingArgs) {
          const pathValidation = FileSystemManager.validatePath(
            "touch",
            pathArg, {
              allowMissing: true,
              disallowRoot: true
            },
          );
          const resolvedPath = pathValidation.resolvedPath;

          if (resolvedPath === Config.FILESYSTEM.ROOT_PATH) {
            messages.push(
              `touch: cannot touch '${pathArg}' (resolved to root): Operation not permitted.`,
            );
            allSuccess = false;
            continue;
          }

          if (pathValidation.node) {

            const node = pathValidation.node;
            if (!FileSystemManager.hasPermission(node, currentUser, "write")) {
              messages.push(
                `touch: cannot update timestamp of '${pathArg}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`,
              );
              allSuccess = false;
              continue;
            }
            node.mtime = timestampToUse;

            changesMade = true;
            messages.push(
              `${Config.MESSAGES.TIMESTAMP_UPDATED_PREFIX}'${pathArg}'${node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE ? " (directory)" : ""}${Config.MESSAGES.TIMESTAMP_UPDATED_SUFFIX}`,
            );
          } else if (pathValidation.error) {
            messages.push(pathValidation.error);
            allSuccess = false;
            continue;
          } else {

            if (flags.noCreate) {
              continue;
            }
            if (pathArg.trim().endsWith(Config.FILESYSTEM.PATH_SEPARATOR)) {
              messages.push(
                `touch: cannot touch '${pathArg}': No such file or directory`,
              );
              allSuccess = false;
              continue;
            }

            const parentPath =
              resolvedPath.substring(
                0,
                resolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR),
              ) || Config.FILESYSTEM.ROOT_PATH;
            const parentNode = FileSystemManager.getNodeByPath(parentPath);

            if (
              !parentNode ||
              parentNode.type !== Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
            ) {
              messages.push(
                `touch: cannot create '${pathArg}': Parent directory '${parentPath}' not found or is not a directory.`,
              );
              allSuccess = false;
              continue;
            }
            if (
              !FileSystemManager.hasPermission(parentNode, currentUser, "write")
            ) {
              messages.push(
                `touch: cannot create file in '${parentPath}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`,
              );
              allSuccess = false;
              continue;
            }
            const fileName = resolvedPath.substring(
              resolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1,
            );
            if (fileName === "") {
              messages.push(
                `touch: cannot create file with empty name (path resolved to '${resolvedPath}').`,
              );
              allSuccess = false;
              continue;
            }

            parentNode.children[fileName] = {
              type: Config.FILESYSTEM.DEFAULT_FILE_TYPE,
              content: "",
              owner: currentUser,
              mode: Config.FILESYSTEM.DEFAULT_FILE_MODE,
              mtime: timestampToUse,
            };
            parentNode.mtime = nowActualISO;
            changesMade = true;
            messages.push(`'${pathArg}'${Config.MESSAGES.FILE_CREATED_SUFFIX}`);
          }
        }

        if (changesMade) {
          if (!(await FileSystemManager.save(currentUser))) {
            messages.push(
              "touch: CRITICAL - Failed to save file system changes after operations.",
            );
            allSuccess = false;
          }
        }

        const outputMessage = messages.join("\n");
        if (!allSuccess) {
          const errorToReport =
            outputMessage || "touch: Not all operations were successful.";
          return {
            success: false,
            error: errorToReport,
            output: errorToReport,
            messageType: Config.CSS_CLASSES.ERROR_MSG,
          };
        }
        return {
          success: true,
          output: outputMessage ||
            (changesMade ? "" : Config.MESSAGES.NO_ACTION_TAKEN),
          messageType: Config.CSS_CLASSES.SUCCESS_MSG,
        };
      },
      description: "Changes file/directory timestamps or creates empty files.",
      helpText: `Usage: touch [-c] [-d DATETIME_STRING | -t STAMP] <item_path>...

Updates the modification time of each specified <item_path>.
If <item_path> does not exist, it is created empty (as a file),
unless -c is given. Touch does not create directories.

Options:
  -c, --no-create    Do not create any files.
  -d, --date=STRING  Parse STRING and use it instead of current time.
                     Examples: "YYYY-MM-DDTHH:mm:ss.sssZ", "Jan 1 2023 14:30"
  -t STAMP           Use [[CC]YY]MMDDhhmm[.ss] instead of current time.
                     Requires at least MMDDhhmm.
                     Example: 05201430 (May 20, 14:30, current year)
                              202305201430.55 (May 20, 2023, 14:30:55)
`,
    },
    cat: {
      handler: async (args, options) => {
        if (
          args.length === 0 &&
          (options.stdinContent === null || options.stdinContent === undefined)
        )
          return {
            success: true,
            output: ""
          };
        if (args.length > 0) {
          const valRes = Utils.validateArguments(args, {
            min: 1
          });
          if (!valRes.isValid)
            return {
              success: false,
              error: `cat: ${valRes.errorDetail}`
            };
        }
        let outputContent = "";
        let firstFile = true;
        const currentUser = UserManager.getCurrentUser().name;
        if (
          options.stdinContent !== null &&
          options.stdinContent !== undefined
        ) {
          outputContent += options.stdinContent;
          firstFile = false;
        }
        for (const pathArg of args) {
          const pathValidation = FileSystemManager.validatePath(
            "cat",
            pathArg, {
              expectedType: Config.FILESYSTEM.DEFAULT_FILE_TYPE
            },
          );
          if (pathValidation.error)
            return {
              success: false,
              error: pathValidation.error
            };
          if (
            !FileSystemManager.hasPermission(
              pathValidation.node,
              currentUser,
              "read",
            )
          )
            return {
              success: false,
              error: `cat: '${pathArg}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`,
            };
          if (!firstFile && outputContent && !outputContent.endsWith("\n"))
            outputContent += "\n";
          outputContent += pathValidation.node.content || "";
          firstFile = false;
        }
        return {
          success: true,
          output: outputContent
        };
      },
      description: "Concatenates and displays files.",
      helpText: "Usage: cat [file...]\n\n...",
    },
    rm: {
      handler: async (args, options) => {
        const {
          flags,
          remainingArgs
        } = Utils.parseFlags(args, [{
            name: "recursive",
            short: "-r",
            long: "--recursive"
          },
          {
            name: "recursiveAlias",
            short: "-R"
          },
          {
            name: "force",
            short: "-f",
            long: "--force"
          },
          {
            name: "interactive",
            short: "-i",
            long: "--interactive"
          },
        ]);

        const validationResult = Utils.validateArguments(remainingArgs, {
          min: 1,
        });
        if (!validationResult.isValid)
          return {
            success: false,
            error: `rm: ${validationResult.errorDetail}`,
          };

        const isRecursiveOpt = flags.recursive || flags.recursiveAlias;
        const isForceOpt = flags.force;

        const isInteractiveOpt = flags.interactive && !isForceOpt;

        let allSuccess = true;
        let anyChangeMade = false;
        const messages = [];
        const currentUser = UserManager.getCurrentUser().name;
        const nowISO = new Date().toISOString();

        async function removeItemRecursively(
          itemResolvedPath,
          itemNode,
          originalPathArg,
        ) {
          const parentPath =
            itemResolvedPath.substring(
              0,
              itemResolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR),
            ) || Config.FILESYSTEM.ROOT_PATH;
          const parentNode = FileSystemManager.getNodeByPath(parentPath);

          if (!parentNode) {

            if (!isForceOpt)
              messages.push(
                `rm: Internal error - parent of '${originalPathArg}' not found.`,
              );
            return false;
          }

          if (
            !FileSystemManager.hasPermission(parentNode, currentUser, "write")
          ) {
            if (!isForceOpt)
              messages.push(
                `rm: cannot remove '${originalPathArg}': Permission denied in parent directory '${parentPath}'.`,
              );
            return false;
          }

          if (itemNode.type === Config.FILESYSTEM.DEFAULT_FILE_TYPE) {
            let confirmed = true;
            if (isInteractiveOpt) {
              confirmed = await new Promise((resolve) => {
                ConfirmationManager.request(
                  [`Remove file '${originalPathArg}'?`],
                  null,
                  () => resolve(true),
                  () => resolve(false),
                );
              });
            }

            if (confirmed) {

              const itemName = itemResolvedPath.substring(
                itemResolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) +
                1,
              );
              if (parentNode.children && parentNode.children[itemName]) {
                delete parentNode.children[itemName];
                parentNode.mtime = nowISO;
                if (!isForceOpt)
                  messages.push(
                    `'${originalPathArg}'${Config.MESSAGES.ITEM_REMOVED_SUFFIX}`,
                  );
                anyChangeMade = true;
                return true;
              } else {

                if (!isForceOpt)
                  messages.push(
                    `rm: Failed to remove '${originalPathArg}': Item not found in parent (internal error).`,
                  );
                return false;
              }
            } else {
              messages.push(
                `${Config.MESSAGES.REMOVAL_CANCELLED_PREFIX}'${originalPathArg}'${Config.MESSAGES.REMOVAL_CANCELLED_SUFFIX}`,
              );
              return false;
            }
          } else if (
            itemNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
          ) {
            if (!isRecursiveOpt) {
              if (!isForceOpt)
                messages.push(
                  `rm: cannot remove '${originalPathArg}': Is a directory (specify -r, -R, or --recursive).`,
                );
              return false;
            }

            let confirmedDir = true;
            if (isInteractiveOpt) {

              confirmedDir = await new Promise((resolve) => {
                ConfirmationManager.request(
                  [
                    `Descend into directory '${originalPathArg}' and attempt removal?`,
                  ],
                  null,
                  () => resolve(true),
                  () => resolve(false),
                );
              });
            }

            if (!confirmedDir) {
              messages.push(
                `${Config.MESSAGES.REMOVAL_CANCELLED_PREFIX}'${originalPathArg}' (directory contents not processed)${Config.MESSAGES.REMOVAL_CANCELLED_SUFFIX}`,
              );
              return false;
            }

            const childrenNames = Object.keys(itemNode.children || {});
            for (const childName of childrenNames) {
              if (!itemNode.children[childName]) continue;
              const childNode = itemNode.children[childName];
              const childResolvedPath = FileSystemManager.getAbsolutePath(
                childName,
                itemResolvedPath,
              );

              if (
                !(await removeItemRecursively(
                  childResolvedPath,
                  childNode,
                  childResolvedPath,
                ))
              ) {
                if (!isForceOpt) {

                  return false;
                }

              }
            }

            const dirName = itemResolvedPath.substring(
              itemResolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) +
              1,
            );
            if (parentNode.children && parentNode.children[dirName]) {

              const currentDirNodeCheck =
                FileSystemManager.getNodeByPath(itemResolvedPath);
              if (
                currentDirNodeCheck &&
                Object.keys(currentDirNodeCheck.children).length > 0
              ) {
                if (!isForceOpt) {
                  messages.push(
                    `rm: cannot remove directory '${originalPathArg}': Directory not empty (recursive removal failed or was cancelled for some contents).`,
                  );
                  return false;
                }

                return false;
              }

              delete parentNode.children[dirName];
              parentNode.mtime = nowISO;
              if (!isForceOpt)
                messages.push(
                  `'${originalPathArg}' (directory)${Config.MESSAGES.ITEM_REMOVED_SUFFIX}`,
                );
              anyChangeMade = true;
              return true;
            } else {
              if (!isForceOpt)
                messages.push(
                  `rm: Failed to remove directory '${originalPathArg}': Directory not found in parent (internal error).`,
                );
              return false;
            }
          }

          if (!isForceOpt)
            messages.push(
              `rm: cannot remove '${originalPathArg}': Unknown item type.`,
            );
          return false;
        }

        for (const pathArg of remainingArgs) {
          const pathValidation = FileSystemManager.validatePath("rm", pathArg, {
            disallowRoot: true,
          });

          if (pathValidation.error) {
            const isNoSuchFileError = pathValidation.node === null;
            if (isForceOpt && isNoSuchFileError) {
              continue;
            }
            messages.push(pathValidation.error);
            allSuccess = false;
            continue;
          }

          const node = pathValidation.node;
          const resolvedPath = pathValidation.resolvedPath;

          const lastSegment = resolvedPath.substring(
            resolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1,
          );
          if (
            lastSegment === Config.FILESYSTEM.CURRENT_DIR_SYMBOL ||
            lastSegment === Config.FILESYSTEM.PARENT_DIR_SYMBOL
          ) {
            if (!isForceOpt)
              messages.push(
                `rm: refusing to remove '.' or '..' directory: skipping '${pathArg}'`,
              );
            allSuccess = false;
            continue;
          }

          if (!(await removeItemRecursively(resolvedPath, node, pathArg))) {
            allSuccess = false;
          }
        }

        if (anyChangeMade) {
          if (!(await FileSystemManager.save(currentUser))) {
            messages.push(
              "rm: CRITICAL - Failed to save file system changes after removal operations.",
            );

            return {
              success: false,
              error: "rm: Failed to save file system changes after removal.",
              output: messages.join("\n"),
              messageType: Config.CSS_CLASSES.ERROR_MSG,
            };
          }
        }

        const finalOutput = messages.filter((m) => m).join("\n");

        if (isForceOpt && allSuccess === false && messages.length === 0) {

          allSuccess = true;
        }

        if (!allSuccess) {
          return {
            success: false,
            error: finalOutput || "rm: One or more errors occurred.",
            output: finalOutput ||
              (anyChangeMade ?
                "Some items removed, but errors occurred." :
                "No items removed, errors occurred."),
            messageType: Config.CSS_CLASSES.ERROR_MSG,
          };
        }

        return {
          success: true,
          output: finalOutput ||
            (anyChangeMade ?
              "Operation successful." :
              Config.MESSAGES.NO_ACTION_TAKEN),
          messageType: anyChangeMade ?
            Config.CSS_CLASSES.SUCCESS_MSG :
            Config.CSS_CLASSES.CONSOLE_LOG_MSG,
        };
      },
      description: "Removes files or directories.",
      helpText: `Usage: rm [-rRf] [-i] <item_path>...

Removes specified files or directories.
  -r, -R, --recursive   Remove directories and their contents recursively.
  -f, --force           Ignore nonexistent files and arguments, never prompt,
                        attempt to suppress most error messages.
  -i, --interactive     Prompt before every removal.
`,
    },
    mv: {
      handler: async (args, execOptions) => {

        const flagDefinitions = [{
            name: "force",
            short: "-f",
            long: "--force"
          },
          {
            name: "interactive",
            short: "-i",
            long: "--interactive"
          },
        ];
        const {
          flags,
          remainingArgs
        } = Utils.parseFlags(
          args,
          flagDefinitions,
        );

        const validationResult = Utils.validateArguments(remainingArgs, {
          exact: 2,
        });
        if (!validationResult.isValid)
          return {
            success: false,
            error: `mv: ${validationResult.errorDetail}`,
          };

        const sourcePathArg = remainingArgs[0];
        const destPathArg = remainingArgs[1];
        const currentUser = UserManager.getCurrentUser().name;
        const nowISO = new Date().toISOString();

        const isInteractiveEffective = flags.interactive && !flags.force;

        const sourceValidation = FileSystemManager.validatePath(
          "mv (source)",
          sourcePathArg, {
            disallowRoot: true
          },
        );
        if (sourceValidation.error)
          return {
            success: false,
            error: sourceValidation.error
          };

        const sourceNode = sourceValidation.node;
        const absSourcePath = sourceValidation.resolvedPath;
        const sourceParentPath =
          absSourcePath.substring(
            0,
            absSourcePath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR),
          ) || Config.FILESYSTEM.ROOT_PATH;
        const sourceParentNode =
          FileSystemManager.getNodeByPath(sourceParentPath);

        if (
          !sourceParentNode ||
          !FileSystemManager.hasPermission(
            sourceParentNode,
            currentUser,
            "write",
          )
        ) {
          return {
            success: false,
            error: `mv: cannot move '${sourcePathArg}' from '${sourceParentPath}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`,
          };
        }

        const destValidation = FileSystemManager.validatePath(
          "mv (destination)",
          destPathArg, {
            allowMissing: true
          },
        );

        if (
          destValidation.error &&
          !(destValidation.optionsUsed.allowMissing && !destValidation.node)
        ) {
          return {
            success: false,
            error: destValidation.error
          };
        }

        let absDestPath = destValidation.resolvedPath;
        let destNode = destValidation.node;
        const sourceName = absSourcePath.substring(
          absSourcePath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1,
        );
        let finalDestName = sourceName;
        let targetContainerNode;
        let targetContainerAbsPath;

        if (
          destNode &&
          destNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
        ) {

          targetContainerNode = destNode;
          targetContainerAbsPath = absDestPath;

          absDestPath = FileSystemManager.getAbsolutePath(
            sourceName,
            absDestPath,
          );

          destNode = targetContainerNode.children[sourceName];
        } else {

          targetContainerAbsPath =
            absDestPath.substring(
              0,
              absDestPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR),
            ) || Config.FILESYSTEM.ROOT_PATH;
          targetContainerNode = FileSystemManager.getNodeByPath(
            targetContainerAbsPath,
          );
          finalDestName = absDestPath.substring(
            absDestPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1,
          );

        }

        if (
          !targetContainerNode ||
          targetContainerNode.type !== Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
        ) {
          return {
            success: false,
            error: `mv: target '${targetContainerAbsPath}' is not a directory or does not exist.`,
          };
        }
        if (
          !FileSystemManager.hasPermission(
            targetContainerNode,
            currentUser,
            "write",
          )
        ) {
          return {
            success: false,
            error: `mv: cannot create item in '${targetContainerAbsPath}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`,
          };
        }

        if (absSourcePath === absDestPath) {
          return {
            success: true,
            output: `mv: '${sourcePathArg}' and '${destPathArg}' are the same file. ${Config.MESSAGES.NO_ACTION_TAKEN}`,
            messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
          };
        }

        if (destNode) {

          if (
            sourceNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE &&
            destNode.type !== Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
          ) {
            return {
              success: false,
              error: `mv: cannot overwrite non-directory '${absDestPath}' with directory '${sourcePathArg}'`,
            };
          }
          if (
            sourceNode.type !== Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE &&
            destNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
          ) {
            return {
              success: false,
              error: `mv: cannot overwrite directory '${absDestPath}' with non-directory '${sourcePathArg}'`,
            };
          }

          if (isInteractiveEffective) {

            const confirmed = await new Promise((resolve) => {
              ConfirmationManager.request(
                [`Overwrite '${absDestPath}'?`],
                null,
                () => resolve(true),
                () => resolve(false),
              );
            });
            if (!confirmed)
              return {
                success: true,
                error: Config.MESSAGES.OPERATION_CANCELLED,
                output: `${Config.MESSAGES.OPERATION_CANCELLED} No changes made.`,
                messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
              };
          } else if (!flags.force) {

            return {
              success: false,
              error: `mv: '${absDestPath}' already exists. Use -f to overwrite or -i to prompt.`,
            };
          }

        }

        if (
          sourceNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE &&
          absDestPath.startsWith(
            absSourcePath + Config.FILESYSTEM.PATH_SEPARATOR,
          )
        ) {
          return {
            success: false,
            error: `mv: cannot move '${sourcePathArg}' to a subdirectory of itself, '${absDestPath}'`,
          };
        }

        const movedNode = Utils.deepCopyNode(sourceNode);

        targetContainerNode.children[finalDestName] = movedNode;
        targetContainerNode.mtime = nowISO;

        if (
          sourceParentNode &&
          sourceParentNode.children &&
          sourceParentNode.children[sourceName]
        ) {
          delete sourceParentNode.children[sourceName];
          sourceParentNode.mtime = nowISO;
        } else {

          delete targetContainerNode.children[finalDestName];
          console.error(
            Config.INTERNAL_ERRORS.SOURCE_NOT_FOUND_IN_PARENT_PREFIX +
            sourceName +
            Config.INTERNAL_ERRORS.SOURCE_NOT_FOUND_IN_PARENT_MIDDLE +
            sourceParentPath +
            Config.INTERNAL_ERRORS.SOURCE_NOT_FOUND_IN_PARENT_SUFFIX,
          );
          return {
            success: false,
            error: `mv: Internal error - source item not found for removal after copy part of move.`,
          };
        }

        if (!(await FileSystemManager.save(currentUser))) {

          return {
            success: false,
            error: "mv: Failed to save file system changes.",
          };
        }
        return {
          success: true,
          output: `${Config.MESSAGES.MOVED_PREFIX}${sourcePathArg}${Config.MESSAGES.MOVED_TO}'${absDestPath}'${Config.MESSAGES.MOVED_SUFFIX}`,
          messageType: Config.CSS_CLASSES.SUCCESS_MSG,
        };
      },
      description: "Moves or renames files and directories.",
      helpText: `Usage: mv [-f] [-i] <source_path> <destination_path>
       mv [-f] [-i] <source_path>... <destination_directory>

Moves (renames) <source_path> to <destination_path>, or moves one or more <source_path>(s) to <destination_directory>.
  -f, --force       Do not prompt before overwriting (overrides -i).
  -i, --interactive Prompt before overwriting any existing file.
`,
    },
    cp: {
      handler: async (args, execOptions) => {

        const flagDefinitions = [{
            name: "recursive",
            short: "-r",
            long: "--recursive"
          },
          {
            name: "recursiveAlias",
            short: "-R"
          },
          {
            name: "force",
            short: "-f",
            long: "--force"
          },
          {
            name: "preserve",
            short: "-p",
            long: "--preserve"
          },
          {
            name: "interactive",
            short: "-i",
            long: "--interactive"
          },
        ];
        const {
          flags,
          remainingArgs
        } = Utils.parseFlags(
          args,
          flagDefinitions,
        );

        const validationResult = Utils.validateArguments(remainingArgs, {
          min: 2,
        });
        if (!validationResult.isValid)
          return {
            success: false,
            error: `cp: ${validationResult.errorDetail}`,
          };

        const currentUser = UserManager.getCurrentUser().name;
        const nowISO = new Date().toISOString();
        flags.isRecursive = flags.recursive || flags.recursiveAlias;

        flags.isInteractiveEffective = flags.interactive && !flags.force;

        const rawDestPathArg = remainingArgs.pop();
        const sourcePathArgs = remainingArgs;
        let operationMessages = [];
        let overallSuccess = true;
        let anyChangesMadeGlobal = false;

        async function _executeCopyInternal(
          sourceNode,
          sourcePathForMsg,
          targetContainerAbsPath,
          targetEntryName,
          currentCommandFlags,
          currentDepth = 0,
        ) {

          let currentOpMessages = [];
          let currentOpSuccess = true;
          let madeChangeInThisCall = false;

          const targetContainerNode = FileSystemManager.getNodeByPath(
            targetContainerAbsPath,
          );

          if (
            !targetContainerNode ||
            targetContainerNode.type !==
            Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
          ) {
            currentOpMessages.push(
              `cp: internal error or target container '${targetContainerAbsPath}' is not a directory.`,
            );
            return {
              success: false,
              messages: currentOpMessages,
              changesMade: false,
            };
          }
          if (
            !FileSystemManager.hasPermission(
              targetContainerNode,
              currentUser,
              "write",
            )
          ) {
            currentOpMessages.push(
              `cp: cannot create item in '${targetContainerAbsPath}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`,
            );
            return {
              success: false,
              messages: currentOpMessages,
              changesMade: false,
            };
          }

          const fullFinalDestPath = FileSystemManager.getAbsolutePath(
            targetEntryName,
            targetContainerAbsPath,
          );
          let existingNodeAtDest =
            targetContainerNode.children[targetEntryName];

          if (existingNodeAtDest) {
            if (
              sourceNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE &&
              existingNodeAtDest.type !==
              Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
            ) {
              currentOpMessages.push(
                `cp: cannot overwrite non-directory '${fullFinalDestPath}' with directory '${sourcePathForMsg}'`,
              );
              return {
                success: false,
                messages: currentOpMessages,
                changesMade: false,
              };
            }
            if (
              sourceNode.type !== Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE &&
              existingNodeAtDest.type ===
              Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
            ) {
              currentOpMessages.push(
                `cp: cannot overwrite directory '${fullFinalDestPath}' with non-directory '${sourcePathForMsg}'`,
              );
              return {
                success: false,
                messages: currentOpMessages,
                changesMade: false,
              };
            }

            if (currentCommandFlags.isInteractiveEffective) {

              const confirmed = await new Promise((resolve) => {
                ConfirmationManager.request(
                  [`Overwrite '${fullFinalDestPath}'?`],
                  null,
                  () => resolve(true),
                  () => resolve(false),
                );
              });
              if (!confirmed) {
                currentOpMessages.push(
                  `cp: not overwriting '${fullFinalDestPath}' (skipped)`,
                );
                return {
                  success: true,
                  messages: currentOpMessages,
                  changesMade: false,
                };
              }
            } else if (!currentCommandFlags.force) {

              if (
                existingNodeAtDest.type ===
                Config.FILESYSTEM.DEFAULT_FILE_TYPE ||
                (existingNodeAtDest.type ===
                  Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE &&
                  sourceNode.type !== Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE)
              ) {
                currentOpMessages.push(
                  `cp: '${fullFinalDestPath}' already exists. Use -f to overwrite or -i to prompt.`,
                );
                return {
                  success: false,
                  messages: currentOpMessages,
                  changesMade: false,
                };
              }
            }

          }

          if (sourceNode.type === Config.FILESYSTEM.DEFAULT_FILE_TYPE) {
            const newFileNode = {
              type: Config.FILESYSTEM.DEFAULT_FILE_TYPE,
              content: sourceNode.content,
              owner: currentCommandFlags.preserve ?
                sourceNode.owner :
                currentUser,
              mode: currentCommandFlags.preserve ?
                sourceNode.mode :
                Config.FILESYSTEM.DEFAULT_FILE_MODE,
              mtime: currentCommandFlags.preserve ? sourceNode.mtime : nowISO,
            };
            targetContainerNode.children[targetEntryName] = newFileNode;
            targetContainerNode.mtime = nowISO;
            madeChangeInThisCall = true;
          } else if (
            sourceNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
          ) {
            if (!currentCommandFlags.isRecursive) {
              currentOpMessages.push(
                `cp: omitting directory '${sourcePathForMsg}' (no -r, -R, or --recursive)`,
              );
              return {
                success: true,
                messages: currentOpMessages,
                changesMade: false,
              };
            }

            let destDirNode;
            if (
              existingNodeAtDest &&
              existingNodeAtDest.type ===
              Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
            ) {
              destDirNode = existingNodeAtDest;
            } else {
              destDirNode = {
                type: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE,
                children: {},
                owner: currentCommandFlags.preserve ?
                  sourceNode.owner :
                  currentUser,
                mode: currentCommandFlags.preserve ?
                  sourceNode.mode :
                  Config.FILESYSTEM.DEFAULT_DIR_MODE,
                mtime: currentCommandFlags.preserve ? sourceNode.mtime : nowISO,
              };
              targetContainerNode.children[targetEntryName] = destDirNode;
              targetContainerNode.mtime = nowISO;
              madeChangeInThisCall = true;
            }

            let childrenChangedOrAdded = false;
            for (const childName in sourceNode.children) {
              const childSourceNode = sourceNode.children[childName];
              const childSourcePathForMsg = FileSystemManager.getAbsolutePath(
                childName,
                sourcePathForMsg,
              );

              const childCopyResult = await _executeCopyInternal(
                childSourceNode,
                childSourcePathForMsg,
                fullFinalDestPath,
                childName,
                currentCommandFlags,
                currentDepth + 1,
              );

              currentOpMessages.push(...childCopyResult.messages);
              if (!childCopyResult.success) currentOpSuccess = false;
              if (childCopyResult.changesMade) childrenChangedOrAdded = true;
            }

            if (childrenChangedOrAdded) {
              if (!currentCommandFlags.preserve) {

                destDirNode.mtime = nowISO;
              }
              madeChangeInThisCall = true;
            }
          } else {
            currentOpMessages.push(
              `cp: unknown source type for '${sourcePathForMsg}'`,
            );
            currentOpSuccess = false;
          }
          return {
            success: currentOpSuccess,
            messages: currentOpMessages,
            changesMade: madeChangeInThisCall,
          };
        }

        const destValidation = FileSystemManager.validatePath(
          "cp (destination)",
          rawDestPathArg, {
            allowMissing: true
          },
        );
        if (destValidation.error && !destValidation.optionsUsed.allowMissing) {
          return {
            success: false,
            error: destValidation.error
          };
        }
        const absDestPath = destValidation.resolvedPath;
        const destNode = destValidation.node;
        const destArgIsExistingDir =
          destNode &&
          destNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE;

        if (sourcePathArgs.length > 1 && !destArgIsExistingDir) {
          return {
            success: false,
            error: `cp: target '${rawDestPathArg}' is not a directory (when copying multiple sources)`,
          };
        }

        let sourcesInfo = [];
        for (const srcArg of sourcePathArgs) {
          const srcValidation = FileSystemManager.validatePath(
            "cp (source)",
            srcArg, {
              disallowRoot: false
            },
          );
          if (srcValidation.error) {
            operationMessages.push(srcValidation.error);
            overallSuccess = false;
            continue;
          }
          if (
            !FileSystemManager.hasPermission(
              srcValidation.node,
              currentUser,
              "read",
            )
          ) {
            operationMessages.push(
              `cp: cannot stat '${srcArg}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`,
            );
            overallSuccess = false;
            continue;
          }
          sourcesInfo.push({
            path: srcValidation.resolvedPath,
            node: srcValidation.node,
            originalArg: srcArg,
          });
        }

        if (sourcesInfo.length === 0 && overallSuccess === false) {
          return {
            success: false,
            error: operationMessages.join("\n") || "cp: No valid source arguments.",
          };
        }

        for (const srcInfo of sourcesInfo) {
          let targetContainerAbsPath;
          let targetEntryName;

          if (destArgIsExistingDir) {
            targetContainerAbsPath = absDestPath;
            targetEntryName =
              srcInfo.path.substring(
                srcInfo.path.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1,
              ) || srcInfo.path;
          } else {
            targetContainerAbsPath =
              absDestPath.substring(
                0,
                absDestPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR),
              ) || Config.FILESYSTEM.ROOT_PATH;
            targetEntryName = absDestPath.substring(
              absDestPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1,
            );
            if (
              targetEntryName === "" &&
              absDestPath === Config.FILESYSTEM.ROOT_PATH
            ) {
              targetEntryName =
                srcInfo.path.substring(
                  srcInfo.path.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) +
                  1,
                ) || srcInfo.path;
            } else if (targetEntryName === "") {
              operationMessages.push(
                `cp: invalid destination argument '${rawDestPathArg}'`,
              );
              overallSuccess = false;
              continue;
            }
          }

          const wouldBeFullFinalDestPath = FileSystemManager.getAbsolutePath(
            targetEntryName,
            targetContainerAbsPath,
          );
          if (srcInfo.path === wouldBeFullFinalDestPath) {
            operationMessages.push(
              `cp: '${srcInfo.originalArg}' and '${wouldBeFullFinalDestPath}' are the same file.`,
            );
            continue;
          }

          const copyExecuteResult = await _executeCopyInternal(
            srcInfo.node,
            srcInfo.originalArg,
            targetContainerAbsPath,
            targetEntryName,
            flags,
            0,
          );

          operationMessages.push(...copyExecuteResult.messages);
          if (!copyExecuteResult.success) overallSuccess = false;
          if (copyExecuteResult.changesMade) {
            anyChangesMadeGlobal = true;
            const alreadyHasTopLevelCopyMsg = copyExecuteResult.messages.some(
              (m) =>
              m.startsWith(Config.MESSAGES.COPIED_PREFIX) &&
              m.includes(srcInfo.originalArg),
            );
            if (copyExecuteResult.success && !alreadyHasTopLevelCopyMsg) {
              const successMsgDestPath = FileSystemManager.getAbsolutePath(
                targetEntryName,
                targetContainerAbsPath,
              );
              operationMessages.push(
                `${Config.MESSAGES.COPIED_PREFIX}${srcInfo.originalArg}${Config.MESSAGES.COPIED_TO}'${successMsgDestPath}'${Config.MESSAGES.COPIED_SUFFIX}`,
              );
            }
          }
        }

        if (anyChangesMadeGlobal) {
          if (!(await FileSystemManager.save(currentUser))) {
            operationMessages.push(
              "cp: CRITICAL - Failed to save file system changes after copy operations.",
            );
            overallSuccess = false;
            return {
              success: false,
              error: "cp: Failed to save file system changes.",
              output: operationMessages.join("\n"),
              messageType: Config.CSS_CLASSES.ERROR_MSG,
            };
          }
        }

        const finalOutputMessage = operationMessages
          .filter((m) => m)
          .join("\n");
        if (!overallSuccess) {
          return {
            success: false,
            error: finalOutputMessage || "cp: One or more errors occurred.",
            output: finalOutputMessage,
            messageType: Config.CSS_CLASSES.ERROR_MSG,
          };
        }
        return {
          success: true,
          output: finalOutputMessage ||
            (anyChangesMadeGlobal ?
              "Operation successful." :
              Config.MESSAGES.NO_ACTION_TAKEN),
          messageType: anyChangesMadeGlobal ?
            Config.CSS_CLASSES.SUCCESS_MSG :
            Config.CSS_CLASSES.CONSOLE_LOG_MSG,
        };
      },
      description: "Copies files and directories.",
      helpText: `Usage: cp [-rR] [-f] [-p] [-i] <source_path> <destination_path>
       cp [-rR] [-f] [-p] [-i] <source_path>... <destination_directory>

Copies <source_path> to <destination_path>, or one or more <source_path>(s) to <destination_directory>.
  -r, -R, --recursive   Copy directories recursively.
  -f, --force           Do not prompt before overwriting (overrides -i).
  -p, --preserve        Preserve mode, ownership, and timestamps.
  -i, --interactive     Prompt before overwriting any existing file.
`,
    },
    history: {
      handler: async (args, options) => {
        const {
          flags
        } = Utils.parseFlags(args, [{
          name: "clear",
          short: "-c",
          long: "--clear"
        }, ]);
        if (flags.clear) {
          HistoryManager.clearHistory();
          return {
            success: true,
            output: "Command history cleared.",
            messageType: Config.CSS_CLASSES.SUCCESS_MSG,
          };
        }
        const history = HistoryManager.getFullHistory();
        if (history.length === 0)
          return {
            success: true,
            output: Config.MESSAGES.NO_COMMANDS_IN_HISTORY,
          };
        return {
          success: true,
          output: history
            .map((cmd, i) => `  ${String(i + 1).padStart(3)}  ${cmd}`)
            .join("\n"),
        };
      },
      description: "Displays command history.",
      helpText: "Usage: history [-c]\n\n...",
    },
    edit: {
      handler: async (args, options) => {
        const validationResult = Utils.validateArguments(args, {
          exact: 1
        });
        if (!validationResult.isValid)
          return {
            success: false,
            error: `edit: ${validationResult.errorDetail}`,
          };
        const filePathArg = args[0];
        const pathValidation = FileSystemManager.validatePath(
          "edit",
          filePathArg, {
            allowMissing: true,
            disallowRoot: true
          },
        );
        const currentUser = UserManager.getCurrentUser().name;
        if (
          pathValidation.error &&
          pathValidation.node &&
          pathValidation.node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
        )
          return {
            success: false,
            error: `edit: '${filePathArg}' is a directory. Cannot edit.`,
          };
        if (
          pathValidation.node &&
          !FileSystemManager.hasPermission(
            pathValidation.node,
            currentUser,
            "read",
          )
        )
          return {
            success: false,
            error: `edit: '${filePathArg}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`,
          };
        if (
          pathValidation.error &&
          !pathValidation.node &&
          !pathValidation.optionsUsed.allowMissing
        )
          return {
            success: false,
            error: pathValidation.error
          };
        const resolvedPath = pathValidation.resolvedPath;
        let content = "";
        if (pathValidation.node) content = pathValidation.node.content || "";
        if (options.isInteractive) {
          EditorManager.enter(resolvedPath, content);
          return {
            success: true,
            output: `Opening editor for '${resolvedPath}'...`,
            messageType: Config.CSS_CLASSES.EDITOR_MSG,
          };
        } else
          return {
            success: false,
            error: "edit: Can only be run in interactive mode.",
          };
      },
      description: "Opens a file in the text editor.",
      helpText: "Usage: edit <file_path>\n\n...",
    },
    grep: {
      handler: async (args, options) => {
        const flagDefinitions = [{
            name: "ignoreCase",
            short: "-i",
            long: "--ignore-case"
          },
          {
            name: "invertMatch",
            short: "-v",
            long: "--invert-match"
          },
          {
            name: "lineNumber",
            short: "-n",
            long: "--line-number"
          },
          {
            name: "count",
            short: "-c",
            long: "--count"
          },
          {
            name: "recursive",
            short: "-R"
          },
        ];
        const {
          flags,
          remainingArgs
        } = Utils.parseFlags(
          args,
          flagDefinitions,
        );

        if (remainingArgs.length === 0 && options.stdinContent === null) {

          return {

            success: false,
            error: "grep: missing pattern and file arguments, and no stdin.",
          };
        }
        if (remainingArgs.length === 0 && options.stdinContent !== null) {

          return {
            success: false,
            error: "grep: missing pattern for stdin."
          };
        }

        const patternStr = remainingArgs[0];
        const filePathsArgs = remainingArgs.slice(1);
        const currentUser = UserManager.getCurrentUser().name;
        let outputLines = [];
        let overallSuccess = true;

        let regex;
        try {
          regex = new RegExp(patternStr, flags.ignoreCase ? "i" : "");
        } catch (e) {
          return {

            success: false,
            error: `grep: invalid regular expression '${patternStr}': ${e.message}`,
          };
        }

        const processContent = (content, filePathForDisplay) => {

          const lines = content.split("\n");
          let fileMatchCount = 0;
          let currentFileLines = [];

          lines.forEach((line, index) => {

            const isMatch = regex.test(line);
            const effectiveMatch = flags.invertMatch ? !isMatch : isMatch;

            if (effectiveMatch) {

              fileMatchCount++;
              if (!flags.count) {

                let outputLine = "";

                if (
                  filePathForDisplay &&
                  (flags.recursive || filePathsArgs.length > 1)
                ) {
                  outputLine += `${filePathForDisplay}:`;
                }
                if (flags.lineNumber) {

                  outputLine += `${index + 1}:`;
                }
                outputLine += line;
                currentFileLines.push(outputLine);
              }
            }
          });

          if (flags.count) {

            let countOutput = "";

            if (
              filePathForDisplay &&
              (flags.recursive || filePathsArgs.length > 1)
            ) {
              countOutput += `${filePathForDisplay}:`;
            }
            countOutput += fileMatchCount;
            outputLines.push(countOutput);
          } else {
            outputLines.push(...currentFileLines);
          }

          return (
            fileMatchCount > 0 ||
            (flags.invertMatch && lines.length > 0 && fileMatchCount === 0)
          );
        };

        async function searchRecursively(currentPath, displayPathArg) {
          const pathValidation = FileSystemManager.validatePath(
            "grep",
            currentPath,
          );

          if (pathValidation.error) {
            OutputManager.appendToOutput(pathValidation.error, {
              typeClass: Config.CSS_CLASSES.ERROR_MSG,
            });
            overallSuccess = false;
            return;
          }

          const node = pathValidation.node;
          if (!FileSystemManager.hasPermission(node, currentUser, "read")) {

            OutputManager.appendToOutput(
              `grep: ${displayPathArg}${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`, {
                typeClass: Config.CSS_CLASSES.ERROR_MSG
              },
            );
            overallSuccess = false;
            return;
          }

          if (node.type === Config.FILESYSTEM.DEFAULT_FILE_TYPE) {

            processContent(node.content || "", currentPath);
          } else if (node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {

            if (!flags.recursive) {

              OutputManager.appendToOutput(
                `grep: ${displayPathArg}: Is a directory`, {
                  typeClass: Config.CSS_CLASSES.ERROR_MSG
                },
              );
              overallSuccess = false;
              return;
            }

            const childrenNames = Object.keys(node.children || {});
            for (const childName of childrenNames) {
              const childPath = FileSystemManager.getAbsolutePath(
                childName,
                currentPath,
              );

              await searchRecursively(childPath, childPath);
            }
          }
        }

        if (filePathsArgs.length > 0) {

          for (const pathArg of filePathsArgs) {

            const absolutePath = FileSystemManager.getAbsolutePath(
              pathArg,
              FileSystemManager.getCurrentPath(),
            );
            if (flags.recursive) {

              await searchRecursively(absolutePath, pathArg);
            } else {

              const pathValidation = FileSystemManager.validatePath(
                "grep",
                pathArg, {
                  expectedType: Config.FILESYSTEM.DEFAULT_FILE_TYPE
                },
              );
              if (pathValidation.error) {

                OutputManager.appendToOutput(pathValidation.error, {
                  typeClass: Config.CSS_CLASSES.ERROR_MSG,
                });
                overallSuccess = false;
                continue;
              }
              if (
                !FileSystemManager.hasPermission(
                  pathValidation.node,
                  currentUser,
                  "read",
                )
              ) {

                OutputManager.appendToOutput(
                  `grep: ${pathArg}${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`, {
                    typeClass: Config.CSS_CLASSES.ERROR_MSG
                  },
                );
                overallSuccess = false;
                continue;
              }
              processContent(pathValidation.node.content || "", pathArg);
            }
          }
        } else if (options.stdinContent !== null) {

          processContent(options.stdinContent, null);
        } else {

          return {
            success: false,
            error: "grep: No input files or stdin provided after pattern.",
          };
        }

        return {
          success: overallSuccess,
          output: outputLines.join("\n")
        };
      },
      description: "Searches for patterns in files or input.",
      helpText: "Usage: grep [OPTIONS] PATTERN [FILE...]\n\nSearch for PATTERN in each FILE or standard input.\nExample: grep -i 'hello' myfile.txt\n\nOptions:\n  -i, --ignore-case   Ignore case distinctions.\n  -v, --invert-match  Select non-matching lines.\n  -n, --line-number   Print line number with output lines.\n  -c, --count         Print only a count of matching lines per FILE.\n  -R, --recursive     Read all files under each directory, recursively.",
    },
    useradd: {
      handler: async (args, options) => {
        const validationResult = Utils.validateArguments(args, {
          exact: 1
        });
        if (!validationResult.isValid) {
          return {
            success: false,
            error: `useradd: ${validationResult.errorDetail}`,
            messageType: Config.CSS_CLASSES.ERROR_MSG,
          };
        }
        const username = args[0];
        const result = await UserManager.register(username);

        if (result.success) {
          return {
            success: true,
            output: result.message,
            messageType: Config.CSS_CLASSES.SUCCESS_MSG,
          };
        } else {
          return {
            success: false,
            error: result.error,
            messageType: Config.CSS_CLASSES.ERROR_MSG,
          };
        }
      },
      description: "Creates a new user account.",
      helpText: "Usage: useradd <username>\n\n...",
    },
    login: {
      handler: async (args, options) => {
        const validationResult = Utils.validateArguments(args, {
          exact: 1
        });
        if (!validationResult.isValid)
          return {
            success: false,
            error: `login: ${validationResult.errorDetail}`,
          };
        const username = args[0];
        const result = await UserManager.login(username);
        if (result.success && !result.noAction) {
          OutputManager.clearOutput();
          OutputManager.appendToOutput(
            `${Config.MESSAGES.WELCOME_PREFIX}${username}${Config.MESSAGES.WELCOME_SUFFIX}`,
          );
        }
        return {
          success: result.success,
          output: result.message,
          error: result.success ? undefined : result.error || "Login failed.",
          messageType: result.success ?
            Config.CSS_CLASSES.SUCCESS_MSG :
            Config.CSS_CLASSES.ERROR_MSG,
        };
      },
      description: "Logs in as a specified user.",
      helpText: "Usage: login <username>\n\n...",
    },
    logout: {
      handler: async (args, options) => {
        const result = await UserManager.logout();
        if (result.success && !result.noAction) {
          OutputManager.clearOutput();
          OutputManager.appendToOutput(
            `${Config.MESSAGES.WELCOME_PREFIX}${UserManager.getCurrentUser().name}${Config.MESSAGES.WELCOME_SUFFIX}`,
          );
        }
        return {
          ...result,
          output: result.message,
          messageType: result.success ?
            Config.CSS_CLASSES.SUCCESS_MSG :
            Config.CSS_CLASSES.CONSOLE_LOG_MSG,
        };
      },
      description: "Logs out the current user.",
      helpText: "Usage: logout\n\n...",
    },
    whoami: {
      handler: async (args, options) => {
        return {
          success: true,
          output: UserManager.getCurrentUser().name
        };
      },
      description: "Displays the current username.",
      helpText: "Usage: whoami\n\nPrints the username of the currently logged-in user.",
    },
    shutdown: {
      handler: async (args, options) => {
        if (options.isInteractive) {
          OutputManager.appendToOutput("OopisOS is shutting down...", {
            typeClass: Config.CSS_CLASSES.WARNING_MSG,
          });
          setTimeout(() => {
            OutputManager.clearOutput();
            TerminalUI.setInputState(false);
            DOM.inputLineContainerDiv.classList.add(Config.CSS_CLASSES.HIDDEN);
            OutputManager.appendToOutput("System halted. Refresh to restart.", {
              typeClass: Config.CSS_CLASSES.ERROR_MSG,
            });
          }, 1000);
        }
        return {
          success: true,
          output: ""
        };
      },
      description: "Shuts down the OopisOS session.",
      helpText: "Usage: shutdown\n\n...",
    },
    reboot: {
      handler: async (args, options) => {
        if (options.isInteractive) {
          await OutputManager.appendToOutput("OopisOS is rebooting...", {
            typeClass: Config.CSS_CLASSES.WARNING_MSG,
          });
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
        return {
          success: true,
          output: ""
        };
      },
      description: "Reboots the OopisOS session.",
      helpText: "Usage: reboot\n\n...",
    },
    export: {
      handler: async (args, options) => {
        const validationResult = Utils.validateArguments(args, {
          exact: 1
        });
        if (!validationResult.isValid)
          return {
            success: false,
            error: `export: ${validationResult.errorDetail}`,
          };
        const pathArg = args[0];
        const pathValidation = FileSystemManager.validatePath(
          "export",
          pathArg, {
            expectedType: Config.FILESYSTEM.DEFAULT_FILE_TYPE
          },
        );
        if (pathValidation.error)
          return {
            success: false,
            error: pathValidation.error
          };
        const fileNode = pathValidation.node;
        const currentUser = UserManager.getCurrentUser().name;
        if (!FileSystemManager.hasPermission(fileNode, currentUser, "read"))
          return {
            success: false,
            error: `export: '${pathArg}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`,
          };
        const fileName = pathValidation.resolvedPath.substring(
          pathValidation.resolvedPath.lastIndexOf(
            Config.FILESYSTEM.PATH_SEPARATOR,
          ) + 1,
        );
        try {
          const blob = new Blob([fileNode.content || ""], {
            type: "text/plain;charset=utf-8",
          });
          const url = URL.createObjectURL(blob);
          const a = Utils.createElement("a", {
            href: url,
            download: fileName
          });
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return {
            success: true,
            output: `${Config.MESSAGES.EXPORTING_PREFIX}${fileName}${Config.MESSAGES.EXPORTING_SUFFIX}`,
            messageType: Config.CSS_CLASSES.SUCCESS_MSG,
          };
        } catch (e) {
          return {
            success: false,
            error: `export: Failed to download '${fileName}': ${e.message}`,
          };
        }
      },
      description: "Exports a file from the virtual FS to the user's computer.",
      helpText: "Usage: export <file_path>\n\n...",
    },
    upload: {
      handler: async (args, options) => {
        if (!options.isInteractive)
          return {
            success: false,
            error: "upload: Can only be run in interactive mode.",
          };
        const validationResult = Utils.validateArguments(args, {
          max: 1
        });
        if (!validationResult.isValid)
          return {
            success: false,
            error: `upload: ${validationResult.errorDetail}`,
          };
        let targetDirPath = FileSystemManager.getCurrentPath();
        const currentUser = UserManager.getCurrentUser().name;
        const nowISO = new Date().toISOString();

        if (args.length === 1) {
          const destPathValidation = FileSystemManager.validatePath(
            "upload (destination)",
            args[0], {
              expectedType: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
            },
          );
          if (destPathValidation.error)
            return {
              success: false,
              error: destPathValidation.error
            };
          targetDirPath = destPathValidation.resolvedPath;
        }
        const targetDirNode = FileSystemManager.getNodeByPath(targetDirPath);
        if (
          !targetDirNode ||
          !FileSystemManager.hasPermission(targetDirNode, currentUser, "write")
        )
          return {
            success: false,
            error: `upload: cannot write to directory '${targetDirPath}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`,
          };

        const input = Utils.createElement("input", {
          type: "file"
        });
        input.style.display = "none";
        document.body.appendChild(input);

        const fileSelectionPromise = new Promise((resolve, reject) => {
          let fileSelectedOrDialogClosed = false;
          const handleFocus = () => {
            setTimeout(() => {
              window.removeEventListener("focus", handleFocus);
              if (!fileSelectedOrDialogClosed) {
                fileSelectedOrDialogClosed = true;
                reject(new Error(Config.MESSAGES.UPLOAD_NO_FILE));
              }
            }, 200);
          };
          input.onchange = (e) => {
            fileSelectedOrDialogClosed = true;
            window.removeEventListener("focus", handleFocus);
            const file = e.target.files[0];
            if (file) resolve(file);
            else reject(new Error(Config.MESSAGES.UPLOAD_NO_FILE));
          };
          window.addEventListener("focus", handleFocus);
          input.click();
        });

        try {
          const file = await fileSelectionPromise;
          const allowedExt = [".txt", ".md", ".html", ".sh", ".js", ".css"];
          const fileExt = file.name
            .substring(file.name.lastIndexOf("."))
            .toLowerCase();
          if (!allowedExt.includes(fileExt))
            throw new Error(
              `${Config.MESSAGES.UPLOAD_INVALID_TYPE_PREFIX}${fileExt}${Config.MESSAGES.UPLOAD_INVALID_TYPE_SUFFIX}`,
            );
          const content = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) =>
              reject(
                new Error(
                  `${Config.MESSAGES.UPLOAD_READ_ERROR_PREFIX}${file.name}${Config.MESSAGES.UPLOAD_READ_ERROR_SUFFIX}`,
                ),
              );
            reader.readAsText(file);
          });
          const targetPath = FileSystemManager.getAbsolutePath(
            file.name,
            targetDirPath,
          );
          const parentDirResult =
            FileSystemManager.createParentDirectoriesIfNeeded(targetPath);
          if (parentDirResult.error) throw new Error(parentDirResult.error);
          const parentNode = parentDirResult.parentNode;
          const newFileName = targetPath.substring(
            targetPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1,
          );
          const existingFileNode = parentNode.children[newFileName];
          if (existingFileNode) {
            if (
              !FileSystemManager.hasPermission(
                existingFileNode,
                currentUser,
                "write",
              )
            )
              throw new Error(
                `cannot overwrite existing file '${newFileName}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`,
              );
            if (!options.explicitForce) {
              const confirmed = await new Promise((resolveInner) =>
                ConfirmationManager.request(
                  [
                    `File '${newFileName}' already exists in '${targetDirPath}'. Overwrite?`,
                  ],
                  null,
                  () => resolveInner(true),
                  () => resolveInner(false),
                ),
              );
              if (!confirmed) {
                if (input.parentNode) document.body.removeChild(input);
                return {
                  success: true,
                  output: `Upload of '${file.name}' cancelled. Not overwritten.`,
                  messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
                };
              }
            }
          }
          parentNode.children[newFileName] = {
            type: Config.FILESYSTEM.DEFAULT_FILE_TYPE,
            content: content,
            owner: currentUser,
            mode: Config.FILESYSTEM.DEFAULT_FILE_MODE,
            mtime: nowISO,
          };
          parentNode.mtime = nowISO;

          if (!(await FileSystemManager.save(currentUser)))
            throw new Error("Failed to save uploaded file to FS.");
          return {
            success: true,
            output: `${Config.MESSAGES.UPLOAD_SUCCESS_PREFIX}${file.name}${Config.MESSAGES.UPLOAD_SUCCESS_MIDDLE}${targetDirPath}${Config.MESSAGES.UPLOAD_SUCCESS_SUFFIX}`,
            messageType: Config.CSS_CLASSES.SUCCESS_MSG,
          };
        } catch (e) {
          return {
            success: false,
            error: `upload: ${e.message}`
          };
        } finally {
          if (input.parentNode === document.body) {
            document.body.removeChild(input);
          }
        }
      },
      description: "Uploads a file from the user's computer to the virtual FS.",
      helpText: "Usage: upload [destination_directory]\n\nPrompts to select a file from your computer and uploads it to OopisOS's current directory, or to the optional [destination_directory]. Allowed file types: .txt, .md, .html, .sh, .js, .css. Will prompt to overwrite if file exists.",
    },
    backup: {
      handler: async (args, options) => {
        const currentUser = UserManager.getCurrentUser();
        const backupData = {
          user: currentUser.name,
          osVersion: Config.OS.VERSION,
          timestamp: new Date().toISOString(),
          fsDataSnapshot: Utils.deepCopyNode(FileSystemManager.getFsData()),
        };
        const fileName = `OopisOS_Backup_${currentUser.name}_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
        try {
          const blob = new Blob([JSON.stringify(backupData, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = Utils.createElement("a", {
            href: url,
            download: fileName
          });
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return {
            success: true,
            output: `${Config.MESSAGES.BACKUP_CREATING_PREFIX}${fileName}${Config.MESSAGES.BACKUP_CREATING_SUFFIX}`,
            messageType: Config.CSS_CLASSES.SUCCESS_MSG,
          };
        } catch (e) {
          return {
            success: false,
            error: `backup: Failed to download: ${e.message}`,
          };
        }
      },
      description: "Creates a JSON backup of the current user's file system.",
      helpText: "Usage: backup\n\n...",
    },
    restore: {
      handler: async (args, options) => {
        if (!options.isInteractive)
          return {
            success: false,
            error: "restore: Can only be run interactively.",
          };
        const input = Utils.createElement("input", {
          type: "file",
          accept: ".json",
        });
        input.style.display = "none";
        document.body.appendChild(input);
        try {
          const file = await new Promise((res, rej) => {
            input.onchange = (e) => {
              const f = e.target.files[0];
              if (f) res(f);
              else rej(new Error(Config.MESSAGES.RESTORE_CANCELLED_NO_FILE));
            };
            input.click();
          });
          const backupData = await new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                res(JSON.parse(e.target.result));
              } catch (err) {
                rej(new Error(`Invalid JSON in '${file.name}'.`));
              }
            };
            reader.onerror = () =>
              rej(new Error(`Error reading '${file.name}'.`));
            reader.readAsText(file);
          });
          if (!backupData?.fsDataSnapshot || !backupData.user)
            throw new Error(`'${file.name}' is not a valid OopisOS backup.`);
          const targetUser = backupData.user;
          const currentUser = UserManager.getCurrentUser().name;
          let msg = `Restore FS from '${file.name}' for user '${targetUser}'? This overwrites current FS.`;
          if (targetUser !== currentUser)
            msg += `\nWARNING: Current user is '${currentUser}'. Restored FS will be for '${targetUser}'.`;
          const confirmed = await new Promise((conf) =>
            ConfirmationManager.request(
              [msg],
              null,
              () => conf(true),
              () => conf(false),
            ),
          );
          if (!confirmed)
            return {
              success: true,
              output: Config.MESSAGES.OPERATION_CANCELLED,
              messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
            };
          FileSystemManager.setFsData(
            Utils.deepCopyNode(backupData.fsDataSnapshot),
          );

          FileSystemManager._ensurePermissionsAndMtimeRecursive(

            FileSystemManager.getFsData()[Config.FILESYSTEM.ROOT_PATH],
            targetUser,
            Config.FILESYSTEM.DEFAULT_DIR_MODE,
          );

          if (!(await FileSystemManager.save(targetUser)))
            throw new Error(`Could not save restored FS for '${targetUser}'.`);
          if (currentUser === targetUser) {
            await FileSystemManager.load(currentUser);
            FileSystemManager.setCurrentPath(Config.FILESYSTEM.ROOT_PATH);
            TerminalUI.updatePrompt();
            OutputManager.clearOutput();
          }
          return {
            success: true,
            output: `${Config.MESSAGES.RESTORE_SUCCESS_PREFIX}${targetUser}${Config.MESSAGES.RESTORE_SUCCESS_MIDDLE}${file.name}${Config.MESSAGES.RESTORE_SUCCESS_SUFFIX}`,
            messageType: Config.CSS_CLASSES.SUCCESS_MSG,
          };
        } catch (e) {
          return {
            success: false,
            error: `restore: ${e.message}`
          };
        } finally {
          if (input.parentNode) document.body.removeChild(input);
        }
      },
      description: "Restores the file system from a JSON backup file.",
      helpText: "Usage: restore\n\n...",
    },
    savefs: {
      handler: async (args, options) => {
        const currentUser = UserManager.getCurrentUser();
        if (await FileSystemManager.save(currentUser.name))
          return {
            success: true,
            output: `File system for '${currentUser.name}' saved.`,
            messageType: Config.CSS_CLASSES.SUCCESS_MSG,
          };
        else
          return {
            success: false,
            error: "savefs: Failed to save file system.",
          };
      },
      description: "Manually saves the current user's file system state.",
      helpText: "Usage: savefs\n\n...",
    },
    clearfs: {
      handler: async (args, options) => {
        const validationResult = Utils.validateArguments(args, {
          exact: 0
        });
        if (!validationResult.isValid) {
          return {
            success: false,
            error: `clearfs: ${validationResult.errorDetail}`,
          };
        }

        const currentUser = UserManager.getCurrentUser();
        if (!options.isInteractive) {
          return {
            success: false,
            error: "clearfs: Can only be run in interactive mode."
          };
        }

        const confirmed = await new Promise((resolve) =>
          ConfirmationManager.request(
            [
              `WARNING: This will permanently erase ALL files and directories for the current user '${currentUser.name}'.`,
              "This action cannot be undone.",
              "Are you sure you want to clear your file system?",
            ],
            null,
            () => resolve(true),
            () => resolve(false),
          ),
        );

        if (!confirmed) {
          return {
            success: true,
            output: `File system clear for '${currentUser.name}' cancelled. ${Config.MESSAGES.NO_ACTION_TAKEN}`,
            messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
          };
        }

        let operationSuccess = true;
        let finalMessage = "";

        try {

          await FileSystemManager.deleteUserFS(currentUser.name);

          await FileSystemManager.initialize(currentUser.name);

          if (!(await FileSystemManager.save(currentUser.name))) {
            throw new Error("Failed to save the newly cleared file system to storage.");
          }

          FileSystemManager.setCurrentPath(Config.FILESYSTEM.ROOT_PATH);

          if (options.isInteractive) {
            TerminalUI.updatePrompt();
            OutputManager.clearOutput();
          }
          finalMessage = `File system for user '${currentUser.name}' has been cleared and reset to default.`;
          OutputManager.appendToOutput(finalMessage, {
            typeClass: Config.CSS_CLASSES.SUCCESS_MSG
          });

        } catch (e) {
          operationSuccess = false;
          finalMessage = `Error clearing file system for '${currentUser.name}': ${e.message || "Unknown error"}`;
          console.error("clearfs error:", e);
          OutputManager.appendToOutput(finalMessage, {
            typeClass: Config.CSS_CLASSES.ERROR_MSG
          });
        }

        return {
          success: operationSuccess,

          output: operationSuccess ? "" : finalMessage,
          error: operationSuccess ? null : finalMessage,
        };
      },
      description: "Clears the current user's file system to a default empty state.",
      helpText: `Usage: clearfs

WARNING: This command will permanently erase all files and directories for the
current user. This action requires confirmation and cannot be undone.
It resets only the file system, leaving other session data (like command
history and user login) intact.
`,
    },
    savestate: {
      handler: async (args, options) => {
        const result = await SessionManager.saveManualState();
        if (result.success) {
          return {
            success: true,
            output: result.message,
            messageType: Config.CSS_CLASSES.SUCCESS_MSG,
          };
        } else {
          return {
            success: false,
            error: result.error,
            messageType: Config.CSS_CLASSES.ERROR_MSG,
          };
        }
      },
      description: "Saves the current terminal session (FS, output, history).",
      helpText: "Usage: savestate\n\n...",
    },
    loadstate: {
      handler: async (args, options) => {
        const result = await SessionManager.loadManualState();
        return {
          success: result.success,
          output: result.message,
          error: result.success ?
            undefined :
            result.message || "Failed to load state.",
          messageType: result.success ?
            Config.CSS_CLASSES.CONSOLE_LOG_MSG :
            Config.CSS_CLASSES.ERROR_MSG,
        };
      },
      description: "Loads a previously saved terminal session.",
      helpText: "Usage: loadstate\n\n...",
    },
    reset: {
      handler: async (args, options) => {
        if (!options.isInteractive)
          return {
            success: false,
            error: "reset: Can only be run interactively.",
          };
        const confirmed = await new Promise((resolve) =>
          ConfirmationManager.request(
            [
              "WARNING: This will erase ALL OopisOS data. This cannot be undone. Are you sure?",
            ],
            null,
            () => resolve(true),
            () => resolve(false),
          ),
        );
        if (confirmed) {
          await SessionManager.performFullReset();
          return {
            success: true,
            output: "OopisOS reset to initial state.",
            messageType: Config.CSS_CLASSES.SUCCESS_MSG,
          };
        } else
          return {
            success: true,
            output: `Reset cancelled. ${Config.MESSAGES.NO_ACTION_TAKEN}`,
            messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
          };
      },
      description: "Resets all OopisOS data (users, FS, states) to factory defaults.",
      helpText: "Usage: reset\n\n...",
    },
    run: {
      handler: async (args, options) => {
        const validationResult = Utils.validateArguments(args, {
          min: 1
        });
        if (!validationResult.isValid)
          return {
            success: false,
            error: `run: ${validationResult.errorDetail}`,
          };

        const scriptPathArg = args[0];
        const scriptArgs = args.slice(1);
        const currentUser = UserManager.getCurrentUser().name;

        const pathValidation = FileSystemManager.validatePath(
          "run",
          scriptPathArg, {
            expectedType: Config.FILESYSTEM.DEFAULT_FILE_TYPE
          },
        );
        if (pathValidation.error)
          return {
            success: false,
            error: pathValidation.error
          };

        const scriptNode = pathValidation.node;
        if (
          !FileSystemManager.hasPermission(scriptNode, currentUser, "read") ||
          !FileSystemManager.hasPermission(scriptNode, currentUser, "execute")
        ) {
          return {
            success: false,
            error: `run: '${scriptPathArg}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`,
          };
        }

        if (!scriptNode.content)
          return {
            success: true,
            output: `run: Script '${scriptPathArg}' is empty.`,
          };

        let scriptContent = scriptNode.content;
        if (scriptContent.startsWith("#!")) {
          const firstLine = scriptContent.split("\n", 1)[0];
          scriptContent = scriptContent.substring(firstLine.length + 1);
        }

        const rawScriptLines = scriptContent.split("\n");
        const commandsToRun = [];
        for (const rawLine of rawScriptLines) {
          let processedLine = rawLine;
          let inSingleQuote = false;
          let inDoubleQuote = false;
          let commentStartIndex = -1;

          for (let i = 0; i < processedLine.length; i++) {
            const char = processedLine[i];
            if (char === "'" && (i === 0 || processedLine[i - 1] !== "\\")) {
              inSingleQuote = !inSingleQuote;
            } else if (
              char === '"' &&
              (i === 0 || processedLine[i - 1] !== "\\")
            ) {
              inDoubleQuote = !inDoubleQuote;
            } else if (char === "#" && !inSingleQuote && !inDoubleQuote) {
              commentStartIndex = i;
              break;
            }
          }

          if (commentStartIndex !== -1) {
            processedLine = processedLine.substring(0, commentStartIndex);
          }
          processedLine = processedLine.trim();

          if (processedLine !== "") {
            commandsToRun.push(processedLine);
          }
        }

        if (CommandExecutor.isScriptRunning() && options.isInteractive) {
          return {
            success: false,
            error: "run: Cannot execute a script while another is already running in interactive mode.",
          };
        }

        let overallScriptSuccess = true;
        let lastOutput = null;

        const previousScriptExecutionState = CommandExecutor.isScriptRunning();
        CommandExecutor.setScriptExecutionInProgress(true);
        if (options.isInteractive) TerminalUI.setInputState(false);

        for (const commandLine of commandsToRun) {
          let processedCommandLineWithArgs = commandLine;
          for (let i = 0; i < scriptArgs.length; i++) {
            const regex = new RegExp(`\\$${i + 1}`, "g");
            processedCommandLineWithArgs = processedCommandLineWithArgs.replace(
              regex,
              scriptArgs[i],
            );
          }
          processedCommandLineWithArgs = processedCommandLineWithArgs.replace(
            /\$@/g,
            scriptArgs.join(" "),
          );
          processedCommandLineWithArgs = processedCommandLineWithArgs.replace(
            /\$#/g,
            scriptArgs.length.toString(),
          );

          if (processedCommandLineWithArgs.trim() === "") {
            continue;
          }

          const result = await CommandExecutor.processSingleCommand(
            processedCommandLineWithArgs,
            false,
          );
          if (!result.success) {
            let scriptErrorMsg = `Script '${scriptPathArg}' error on line: ${commandLine}\nError: ${result.error || "Unknown error in command."}`;
            if (
              result.output &&
              typeof result.output === "string" &&
              result.output.trim() !== "" &&
              result.output.trim() !== (result.error || "").trim()
            ) {
              scriptErrorMsg += `\nDetails: ${result.output}`;
            }
            await OutputManager.appendToOutput(scriptErrorMsg, {
              typeClass: Config.CSS_CLASSES.ERROR_MSG,
            });

            overallScriptSuccess = false;
            break;
          }
          lastOutput = result.output;
        }

        CommandExecutor.setScriptExecutionInProgress(
          previousScriptExecutionState,
        );
        if (options.isInteractive && !CommandExecutor.isScriptRunning()) {
          TerminalUI.setInputState(true);
        }

        if (overallScriptSuccess) {
          return {
            success: true,
            output: null
          };
        } else {
          return {
            success: false,
            error: `Script '${scriptPathArg}' failed.`
          };
        }
      },
      description: "Executes a script file containing OopisOS commands.",
      helpText: "Usage: run <script_path> [arg1 arg2 ...]\n\nExecutes the commands listed in the specified <script_path> file.\nLines starting with '#' are comments. Basic argument passing is supported:\n  $1, $2, ... : Positional arguments passed to the script.\n  $@          : All arguments as a single string.\n  $#          : Number of arguments.",
    },
    find: {
      handler: async (args, execOptions) => {

        if (args.length === 0) {
          return {
            success: false,
            error: "find: missing path specification"
          };
        }

        const startPathArg = args[0];
        const expressionArgs = args.slice(1);
        const currentUser = UserManager.getCurrentUser().name;
        let outputLines = [];
        let overallSuccess = true;
        let filesProcessedSuccessfully = true;

        const predicates = {
          "-name": (node, path, pattern) => {
            const name = path.substring(
              path.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1,
            );
            const regex = Utils.globToRegex(pattern);
            if (!regex) {

              overallSuccess = false;
              OutputManager.appendToOutput(
                `find: invalid pattern for -name: ${pattern}`, {
                  typeClass: Config.CSS_CLASSES.ERROR_MSG
                },
              );
              return false;
            }
            return regex.test(name);
          },
          "-type": (node, path, typeChar) => {
            if (typeChar === "f")
              return node.type === Config.FILESYSTEM.DEFAULT_FILE_TYPE;
            if (typeChar === "d")
              return node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE;
            OutputManager.appendToOutput(
              `find: unknown type '${typeChar}' for -type`, {
                typeClass: Config.CSS_CLASSES.ERROR_MSG
              },
            );
            overallSuccess = false;
            return false;
          },
          "-user": (node, path, username) => node.owner === username,
          "-perm": (node, path, modeStr) => {

            if (!/^[0-7]{2}$/.test(modeStr)) {
              OutputManager.appendToOutput(
                `find: invalid mode '${modeStr}' for -perm. Use two octal digits.`, {
                  typeClass: Config.CSS_CLASSES.ERROR_MSG
                },
              );
              overallSuccess = false;
              return false;
            }
            const expectedMode = parseInt(modeStr, 8);
            return node.mode === expectedMode;
          },
          "-mtime": (node, path, mtimeSpec) => {
            if (!node.mtime) return false;
            const fileMTime = new Date(node.mtime).getTime();
            const now = new Date().getTime();
            const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

            let n;
            let comparisonType = "exact";

            if (mtimeSpec.startsWith("+")) {
              n = parseInt(mtimeSpec.substring(1), 10);
              comparisonType = "older";
            } else if (mtimeSpec.startsWith("-")) {
              n = parseInt(mtimeSpec.substring(1), 10);
              comparisonType = "newer";
            } else {
              n = parseInt(mtimeSpec, 10);
            }

            if (isNaN(n) || n < 0) {
              OutputManager.appendToOutput(
                `find: invalid day count for -mtime: ${mtimeSpec}`, {
                  typeClass: Config.CSS_CLASSES.ERROR_MSG
                },
              );
              overallSuccess = false;
              return false;
            }

            const ageInMs = now - fileMTime;

            if (comparisonType === "exact") {

              return (
                ageInMs >= n * twentyFourHoursInMs &&
                ageInMs < (n + 1) * twentyFourHoursInMs
              );
            } else if (comparisonType === "older") {

              return ageInMs > n * twentyFourHoursInMs;
            } else if (comparisonType === "newer") {

              return ageInMs < n * twentyFourHoursInMs;
            }
            return false;
          },
        };

        const actions = {
          "-print": async (node, path) => {
            outputLines.push(path);
            return true;
          },
          "-exec": async (node, path, commandParts) => {
            const commandTemplate = commandParts.join(" ");

            const hydratedCommand = commandTemplate.replace(
              /\{\}/g,
              `'${path.replace(/'/g, "'\\''")}'`,
            );

            const result = await CommandExecutor.processSingleCommand(
              hydratedCommand,
              false,
            );
            if (!result.success) {

              OutputManager.appendToOutput(
                `find: -exec: ${hydratedCommand}: command failed${result.error ? `: ${result.error}` : ""}`, {
                  typeClass: Config.CSS_CLASSES.WARNING_MSG
                },
              );
              filesProcessedSuccessfully = false;
              return false;
            }
            return true;
          },
          "-delete": async (node, path) => {

            let rmArgs = [];
            if (node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
              rmArgs.push("-r");
            }
            rmArgs.push("-f");
            rmArgs.push(path);

            const rmCommand = CommandExecutor.getCommands().rm;
            if (rmCommand) {

              const result = await rmCommand.handler(rmArgs, {
                isInteractive: false,
              });
              if (!result.success) {
                OutputManager.appendToOutput(
                  `find: -delete: ${path}: ${result.error || "failed to delete"}`, {
                    typeClass: Config.CSS_CLASSES.WARNING_MSG
                  },
                );
                filesProcessedSuccessfully = false;
                return false;
              }
              messages.push(`Deleted: ${path}`);
              return true;
            } else {
              OutputManager.appendToOutput(
                `find: -delete: 'rm' command not available`, {
                  typeClass: Config.CSS_CLASSES.ERROR_MSG
                },
              );
              overallSuccess = false;
              filesProcessedSuccessfully = false;
              return false;
            }
          },
        };

        let parsedExpression = [];
        let currentTermGroup = [];
        let nextTermNegated = false;
        let hasExplicitAction = false;

        let i = 0;
        while (i < expressionArgs.length) {
          const token = expressionArgs[i];
          if (token === "-not" || token === "!") {
            nextTermNegated = true;
            i++;
            continue;
          } else if (token === "-or" || token === "-o") {
            if (currentTermGroup.length > 0) {
              parsedExpression.push({
                type: "AND_GROUP",
                terms: currentTermGroup,
              });
              currentTermGroup = [];
            }
            parsedExpression.push({
              type: "OR"
            });
            i++;
            continue;
          } else if (token === "-and" || token === "-a") {

            i++;
            continue;
          }

          let predicateFn = predicates[token];
          let actionFn = actions[token];
          let term = {
            name: token,
            negated: nextTermNegated
          };
          nextTermNegated = false;

          if (predicateFn) {
            term.type = "TEST";
            term.eval = predicateFn;
            if (i + 1 < expressionArgs.length) {
              term.arg = expressionArgs[i + 1];
              i++;
            } else {
              OutputManager.appendToOutput(
                `find: missing argument to \`${token}\``, {
                  typeClass: Config.CSS_CLASSES.ERROR_MSG
                },
              );
              return {
                success: false,
                error: `find: missing argument to \`${token}\``,
              };
            }
          } else if (actionFn) {
            term.type = "ACTION";
            term.perform = actionFn;
            hasExplicitAction = true;
            if (token === "-exec") {
              term.commandParts = [];
              i++;
              while (i < expressionArgs.length && expressionArgs[i] !== "\\;") {
                term.commandParts.push(expressionArgs[i]);
                i++;
              }
              if (i >= expressionArgs.length || expressionArgs[i] !== "\\;") {
                OutputManager.appendToOutput(
                  `find: missing terminating ';' or invalid syntax for -exec`, {
                    typeClass: Config.CSS_CLASSES.ERROR_MSG
                  },
                );
                return {
                  success: false,
                  error: `find: missing terminating ';' for -exec`,
                };
              }
            }
          } else {
            OutputManager.appendToOutput(
              `find: unknown predicate or invalid expression: ${token}`, {
                typeClass: Config.CSS_CLASSES.ERROR_MSG
              },
            );
            return {
              success: false,
              error: `find: unknown predicate '${token}'`,
            };
          }
          currentTermGroup.push(term);
          i++;
        }
        if (currentTermGroup.length > 0) {
          parsedExpression.push({
            type: "AND_GROUP",
            terms: currentTermGroup
          });
        }
        if (parsedExpression.length === 0 && expressionArgs.length > 0) {

          OutputManager.appendToOutput(`find: invalid expression`, {
            typeClass: Config.CSS_CLASSES.ERROR_MSG,
          });
          return {
            success: false,
            error: `find: invalid expression`
          };
        }

        if (!hasExplicitAction) {

          parsedExpression.push({
            type: "ACTION",
            name: "-print",
            perform: actions["-print"],
            negated: false,
          });
        }

        async function evaluateExpressionForNode(node, path) {
          if (!overallSuccess) return false;

          let orGroupValue = false;
          let currentAndGroupValue = true;
          let isFirstAndGroup = true;

          for (const groupOrOperator of parsedExpression) {
            if (groupOrOperator.type === "OR") {
              if (isFirstAndGroup) orGroupValue = currentAndGroupValue;
              else orGroupValue = orGroupValue || currentAndGroupValue;
              currentAndGroupValue = true;
              isFirstAndGroup = false;
            } else if (groupOrOperator.type === "AND_GROUP") {
              let andSubResult = true;
              for (const term of groupOrOperator.terms) {
                if (term.type === "TEST") {
                  let result = await term.eval(node, path, term.arg);
                  if (term.negated) result = !result;
                  andSubResult = andSubResult && result;
                  if (!andSubResult) break;
                }
              }
              currentAndGroupValue = currentAndGroupValue && andSubResult;
            }
          }

          if (isFirstAndGroup)
            orGroupValue = currentAndGroupValue;
          else orGroupValue = orGroupValue || currentAndGroupValue;

          return orGroupValue;
        }

        async function performActions(node, path) {
          let actionSuccess = true;
          for (const groupOrOperator of parsedExpression) {

            if (groupOrOperator.type === "AND_GROUP") {
              for (const term of groupOrOperator.terms) {
                if (term.type === "ACTION") {
                  const success = await term.perform(
                    node,
                    path,
                    term.commandParts,
                  );
                  if (!success) {
                    actionSuccess = false;

                  }
                }
              }
            }
          }
          return actionSuccess;
        }

        const startPathValidation = FileSystemManager.validatePath(
          "find",
          startPathArg,
        );
        if (startPathValidation.error) {
          return {
            success: false,
            error: startPathValidation.error
          };
        }

        const impliesDepth = parsedExpression.some(
          (g) =>
          g.type === "AND_GROUP" && g.terms.some((t) => t.name === "-delete"),
        );

        async function recurseFind(
          currentResolvedPath,
          processSelfFirst = !impliesDepth,
        ) {
          if (!overallSuccess) return;

          const node = FileSystemManager.getNodeByPath(currentResolvedPath);
          if (!node) {

            if (currentResolvedPath !== startPathArg) {

              OutputManager.appendToOutput(
                `find: ‘${currentResolvedPath}’: No such file or directory`, {
                  typeClass: Config.CSS_CLASSES.ERROR_MSG
                },
              );
            }
            filesProcessedSuccessfully = false;
            return;
          }
          if (!FileSystemManager.hasPermission(node, currentUser, "read")) {

            OutputManager.appendToOutput(
              `find: ‘${currentResolvedPath}’: Permission denied`, {
                typeClass: Config.CSS_CLASSES.ERROR_MSG
              },
            );
            filesProcessedSuccessfully = false;
            return;
          }

          let matches = false;
          if (processSelfFirst) {
            matches = await evaluateExpressionForNode(
              node,
              currentResolvedPath,
            );
            if (matches) {
              await performActions(node, currentResolvedPath);
            }
          }

          if (node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
            const childrenNames = Object.keys(node.children || {});
            for (const childName of childrenNames) {
              const childResolvedPath = FileSystemManager.getAbsolutePath(
                childName,
                currentResolvedPath,
              );
              await recurseFind(childResolvedPath, processSelfFirst);
              if (!overallSuccess) return;
            }
          }

          if (!processSelfFirst) {

            matches = await evaluateExpressionForNode(
              node,
              currentResolvedPath,
            );
            if (matches) {
              await performActions(node, currentResolvedPath);
            }
          }
        }

        await recurseFind(startPathValidation.resolvedPath);

        const finalSuccess = overallSuccess && filesProcessedSuccessfully;

        return {
          success: finalSuccess,
          output: outputLines.join("\n")
        };
      },
      description: "Searches for files in a directory hierarchy based on expressions.",
      helpText: `Usage: find [path...] [expression]

Default path is current directory. Default expression is -print.
Expressions are made of options, tests, and actions:
Tests (return true/false):
  -name PATTERN   File name matches shell PATTERN (e.g., '*.txt').
  -type [f|d]     File is of type f (file) or d (directory).
  -user UNAME     File is owned by UNAME.
  -perm MODE      File's permission bits are exactly MODE (e.g., 75). (OopisOS 2-digit octal)
  -mtime N        File's data was last modified:
                  N: between N and N+1 days ago.
                  +N: more than N+1 days ago (older).
                  -N: less than N days ago (newer).
Operators (combine tests):
  -not or !       Inverts the result of the next test.
  -and or -a      Logical AND (default between tests).
  -or or -o       Logical OR. (AND has higher precedence).
Actions (perform an operation, often return true):
  -print          Print file path (default action if none other given).
  -exec CMD {} \\; Execute CMD on file. {} is replaced by file path.
  -delete         Delete file/directory. Implies -depth for directories.
                  (USE WITH CAUTION!)
Example: find . -name "*.js" -not -user Guest -o -type d -print
`,
    },
    delay: {
      handler: async (args, options) => {
        const validationResult = Utils.validateArguments(args, {
          exact: 1
        });
        if (!validationResult.isValid) {
          return {
            success: false,
            error: `delay: ${validationResult.errorDetail}`,
          };
        }
        const parsedArg = Utils.parseNumericArg(args[0], {
          allowFloat: false,
          allowNegative: false,
          min: 1,
        });
        if (parsedArg.error) {
          return {
            success: false,
            error: `delay: Invalid delay time '${args[0]}': ${parsedArg.error}. Must be a positive integer.`,
          };
        }
        const ms = parsedArg.value;
        if (options.isInteractive && !CommandExecutor.isScriptRunning()) {
          OutputManager.appendToOutput(`Delaying for ${ms}ms...`, {
            typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
          });
        }
        return new Promise((resolve) => {
          setTimeout(() => {
            if (options.isInteractive && !CommandExecutor.isScriptRunning()) {
              OutputManager.appendToOutput(`Delay complete.`, {
                typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
              });
            }
            resolve({
              success: true,
              output: ""
            });
          }, ms);
        });
      },
      description: "Pauses execution for a specified time.",
      helpText: "Usage: delay <milliseconds>\n\nPauses command execution for the specified number of milliseconds. Useful in scripts.",
    },
    check_fail: {
      handler: async (args, options) => {
        if (args.length !== 1) {
          return {
            success: false,
            error: "check_fail: expects exactly one argument (a command string)",
          };
        }
        const commandToTest = args[0];
        if (typeof commandToTest !== "string" || commandToTest.trim() === "") {
          return {
            success: false,
            error: "check_fail: command string argument cannot be empty",
          };
        }
        const testResult = await CommandExecutor.processSingleCommand(
          commandToTest,
          false,
        );

        if (testResult.success) {
          const failureMessage = `CHECK_FAIL: FAILURE - Command <${commandToTest}> unexpectedly SUCCEEDED.`;
          return {
            success: false,
            error: failureMessage
          };
        } else {
          const successMessage = `CHECK_FAIL: SUCCESS - Command <${commandToTest}> failed as expected. (Error: ${testResult.error || "N/A"})`;
          return {
            success: true,
            output: successMessage
          };
        }
      },
      description: "Tests if a given command string fails, as expected for negative test cases.",
      helpText: 'Usage: check_fail "<command_string>"\n\nExecutes the <command_string>. If <command_string> fails, check_fail succeeds (and the script continues).\nIf <command_string> succeeds, check_fail fails (and the script halts), reporting the unexpected success.',
    },
    register: {
      handler: async (args, options) => {

        if (commands.useradd?.handler) {

          return commands.useradd.handler(args, options);
        }

        return {
          success: false,
          error: "register: useradd command not found.",
          messageType: Config.CSS_CLASSES.ERROR_MSG,
        };
      },
      description: "Alias for useradd.",
      helpText: "Usage: register <username>\n\n...",
    },
    removeuser: {
      handler: async (args, options) => {
        const validationResult = Utils.validateArguments(args, {
          exact: 1
        });
        if (!validationResult.isValid) {
          return {
            success: false,
            error: `removeuser: ${validationResult.errorDetail}`,
          };
        }

        const usernameToRemove = args[0];
        const currentUser = UserManager.getCurrentUser().name;

        if (usernameToRemove === currentUser) {
          return {
            success: false,
            error: "removeuser: You cannot remove yourself.",
          };
        }

        if (usernameToRemove === Config.USER.DEFAULT_NAME) {
          return {
            success: false,
            error: `removeuser: Cannot remove the default '${Config.USER.DEFAULT_NAME}' user.`,
          };
        }

        const users = StorageManager.loadItem(
          Config.STORAGE_KEYS.USER_CREDENTIALS,
          "User list", {},
        );
        if (!users.hasOwnProperty(usernameToRemove)) {
          return {
            success: true,
            output: `removeuser: User '${usernameToRemove}' does not exist. No action taken.`,
            messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
          };
        }

        const confirmed = await new Promise((resolve) => {
          ConfirmationManager.request(
            [
              `WARNING: This will permanently remove user '${usernameToRemove}' and all their data (files, saved sessions). This cannot be undone. Are you sure?`,
            ],
            null,
            () => resolve(true),
            () => resolve(false),
          );
        });

        if (!confirmed) {
          return {
            success: true,
            output: `Removal of user '${usernameToRemove}' cancelled.`,
            messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
          };
        }

        let allDeletionsSuccessful = true;
        let errorMessages = [];

        try {
          await FileSystemManager.deleteUserFS(usernameToRemove);
        } catch (e) {
          allDeletionsSuccessful = false;
          const fsErrorMsg = `Error deleting filesystem for '${usernameToRemove}': ${e.message || "Unknown error"}`;
          errorMessages.push(fsErrorMsg);
          console.error(`removeuser: ${fsErrorMsg}`, e);
        }

        try {
          SessionManager.clearUserSessionStates(usernameToRemove);
        } catch (e) {
          console.warn(
            `removeuser: Could not fully clear all session states for ${usernameToRemove}: ${e.message}`,
          );
        }

        if (users.hasOwnProperty(usernameToRemove)) {
          delete users[usernameToRemove];
          if (
            !StorageManager.saveItem(
              Config.STORAGE_KEYS.USER_CREDENTIALS,
              users,
              "User list",
            )
          ) {
            allDeletionsSuccessful = false;
            const credErrorMsg =
              "Error updating user credentials list after removal.";
            errorMessages.push(credErrorMsg);
            console.error(`removeuser: ${credErrorMsg}`);
          }
        }

        if (allDeletionsSuccessful) {
          return {
            success: true,
            output: `User '${usernameToRemove}' and all associated data have been removed.`,
            messageType: Config.CSS_CLASSES.SUCCESS_MSG,
          };
        } else {
          return {
            success: false,
            error: `removeuser: Failed to completely remove user '${usernameToRemove}'. Some data may remain. Details: ${errorMessages.join("; ")}`,
            output: `Partial removal of '${usernameToRemove}'. Errors occurred: \n${errorMessages.join("\n")}`,
            messageType: Config.CSS_CLASSES.ERROR_MSG,
          };
        }
      },
      description: "Removes a user account and all their data.",
      helpText: "Usage: removeuser <username>\n\nPermanently removes the specified <username> and all their files and saved sessions. This action requires confirmation and cannot be undone. You cannot remove yourself.",
    },
    chmod: {
      handler: async (args, options) => {
        const validationResult = Utils.validateArguments(args, {
          exact: 2
        });
        if (!validationResult.isValid)
          return {
            success: false,
            error: `chmod: ${validationResult.errorDetail}`,
          };

        const modeArg = args[0];
        const pathArg = args[1];
        const currentUser = UserManager.getCurrentUser().name;
        const nowISO = new Date().toISOString();

        if (!/^[0-7]{2}$/.test(modeArg)) {
          return {
            success: false,
            error: `chmod: invalid mode '${modeArg}'. Use two octal digits (e.g., 75 for rwxr-x, 64 for rw-r--).`,
          };
        }
        const newMode = parseInt(modeArg, 8);

        const pathValidation = FileSystemManager.validatePath("chmod", pathArg);
        if (pathValidation.error)
          return {
            success: false,
            error: pathValidation.error
          };

        const node = pathValidation.node;
        if (node.owner !== currentUser) {
          return {
            success: false,
            error: `chmod: changing permissions of '${pathArg}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX} (not owner)`,
          };
        }

        node.mode = newMode;
        node.mtime = nowISO;
        FileSystemManager._updateNodeAndParentMtime(
          pathValidation.resolvedPath,
          nowISO,
        );

        if (!(await FileSystemManager.save(currentUser))) {
          return {
            success: false,
            error: "chmod: Failed to save file system changes.",
          };
        }
        return {
          success: true,
          output: `Permissions of '${pathArg}' changed to ${modeArg}`,
          messageType: Config.CSS_CLASSES.SUCCESS_MSG,
        };
      },
      description: "Changes file mode bits (permissions).",
      helpText: "Usage: chmod <mode> <path>\n\nChanges the permissions of <path> to <mode>.\n<mode> is a two-digit octal number (e.g., 75 for rwxr-x, 64 for rw-r--).\nThe first digit is for the owner, the second for others.\n  r (read) = 4, w (write) = 2, x (execute) = 1.\nExample: 'chmod 75 myfile' sets owner=rwx, other=r-x.",
    },
    chown: {
      handler: async (args, options) => {
        const validationResult = Utils.validateArguments(args, {
          exact: 2
        });
        if (!validationResult.isValid)
          return {
            success: false,
            error: `chown: ${validationResult.errorDetail}`,
          };

        const newOwnerArg = args[0];
        const pathArg = args[1];
        const currentUser = UserManager.getCurrentUser().name;
        const nowISO = new Date().toISOString();

        const users = StorageManager.loadItem(
          Config.STORAGE_KEYS.USER_CREDENTIALS,
          "User list", {},
        );
        if (!users[newOwnerArg] && newOwnerArg !== Config.USER.DEFAULT_NAME) {
          return {
            success: false,
            error: `chown: user '${newOwnerArg}' does not exist.`,
          };
        }

        const pathValidation = FileSystemManager.validatePath("chown", pathArg);
        if (pathValidation.error)
          return {
            success: false,
            error: pathValidation.error
          };

        const node = pathValidation.node;
        if (node.owner !== currentUser) {
          return {
            success: false,
            error: `chown: changing ownership of '${pathArg}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX} (not owner)`,
          };
        }

        node.owner = newOwnerArg;
        node.mtime = nowISO;
        FileSystemManager._updateNodeAndParentMtime(
          pathValidation.resolvedPath,
          nowISO,
        );

        if (!(await FileSystemManager.save(currentUser))) {
          return {
            success: false,
            error: "chown: Failed to save file system changes.",
          };
        }
        return {
          success: true,
          output: `Owner of '${pathArg}' changed to ${newOwnerArg}`,
          messageType: Config.CSS_CLASSES.SUCCESS_MSG,
        };
      },
      description: "Changes file owner.",
      helpText: "Usage: chown <new_owner> <path>\n\nChanges the owner of <path> to <new_owner>.\nCurrently, only the current owner of the file can change its ownership.",
    },
    listusers: {
      handler: async (args, options) => {
        const users = StorageManager.loadItem(
          Config.STORAGE_KEYS.USER_CREDENTIALS,
          "User list", {},
        );
        const userNames = Object.keys(users);
        if (!userNames.includes(Config.USER.DEFAULT_NAME))
          userNames.push(Config.USER.DEFAULT_NAME);
        userNames.sort();
        if (userNames.length === 0)
          return {
            success: true,
            output: "No users registered.",
            messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
          };
        return {
          success: true,
          output: "Registered users:\n" + userNames.map((u) => `  ${u}`).join("\n"),
        };
      },
      description: "Lists all registered user accounts.",
      helpText: "Usage: listusers\n\n...",
    },
  };
  async function _executeCommandHandler(
    segment,
    execCtxOpts,
    stdinContent = null,
  ) {
    const cmdData = commands[segment.command.toLowerCase()];
    if (cmdData?.handler) {
      try {
        return await cmdData.handler(segment.args, {
          ...execCtxOpts,
          stdinContent,
          explicitForce: segment.args.includes("-f") || segment.args.includes("--force"),
        });
      } catch (e) {
        console.error(`Err in cmd handler for '${segment.command}':`, e);
        return {
          success: false,
          error: `Cmd '${segment.command}' failed: ${e.message || "Unknown"}`,
        };
      }
    } else if (segment.command)
      return {
        success: false,
        error: `${segment.command}: command not found`
      };
    return {
      success: true,
      output: ""
    };
  }
  async function _executePipeline(pipeline, isInteractive) {
    let currentStdin = null,
      lastResult = {
        success: true,
        output: ""
      };
    const user = UserManager.getCurrentUser().name;
    const nowISO = new Date().toISOString();

    for (let i = 0; i < pipeline.segments.length; i++) {
      lastResult = await _executeCommandHandler(
        pipeline.segments[i], {
          isInteractive
        },
        currentStdin,
      );
      if (!lastResult.success) {
        const err = `${Config.MESSAGES.PIPELINE_ERROR_PREFIX}'${pipeline.segments[i].command}': ${lastResult.error || "Unknown"}`;
        if (!pipeline.isBackground) {
          await OutputManager.appendToOutput(err, {
            typeClass: Config.CSS_CLASSES.ERROR_MSG,
          });
        } else {
          console.log(`BG pipe err: ${err}`);
        }
        return {
          success: false,
          error: err,
          output: lastResult.output
        };
      }
      currentStdin = lastResult.output;
    }

    if (pipeline.redirection && lastResult.success) {
      const {
        type: redirType,
        file: redirFile
      } = pipeline.redirection;
      const outputToRedir = lastResult.output || "";

      const redirVal = FileSystemManager.validatePath(
        "redirection",
        redirFile, {
          allowMissing: true,
          disallowRoot: true,
          defaultToCurrentIfEmpty: false,
        },
      );

      if (
        redirVal.error &&
        !(redirVal.optionsUsed.allowMissing && !redirVal.node)
      ) {
        if (!pipeline.isBackground) {
          await OutputManager.appendToOutput(redirVal.error, {

            typeClass: Config.CSS_CLASSES.ERROR_MSG,
          });
        }
        return {
          success: false,
          error: redirVal.error
        };
      }

      const absRedirPath = redirVal.resolvedPath;
      let targetNode = redirVal.node;

      const pDirRes =
        FileSystemManager.createParentDirectoriesIfNeeded(absRedirPath);

      if (pDirRes.error) {
        if (!pipeline.isBackground) {
          await OutputManager.appendToOutput(`Redir err: ${pDirRes.error}`, {
            typeClass: Config.CSS_CLASSES.ERROR_MSG,
          });
        }
        return {
          success: false,
          error: pDirRes.error
        };
      }

      if (targetNode) {

        if (targetNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
          if (!pipeline.isBackground) {
            await OutputManager.appendToOutput(
              `Redir err: '${redirFile}' is dir.`, {
                typeClass: Config.CSS_CLASSES.ERROR_MSG
              },
            );
          }
          return {
            success: false,
            error: `'${redirFile}' is dir.`
          };
        }
        if (!FileSystemManager.hasPermission(targetNode, user, "write")) {
          if (!pipeline.isBackground) {
            await OutputManager.appendToOutput(
              `Redir err: no write to '${redirFile}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`, {
                typeClass: Config.CSS_CLASSES.ERROR_MSG
              },
            );
          }
          return {
            success: false,
            error: `no write to '${redirFile}'`
          };
        }
      } else {

        const parentP =
          absRedirPath.substring(
            0,
            absRedirPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR),
          ) || Config.FILESYSTEM.ROOT_PATH;

        const parentN = FileSystemManager.getNodeByPath(parentP);
        if (parentN === null) {
          console.log(
            "[DEBUG] Redirection: parentN is NULL. getNodeByPath failed to find:",
            parentP,
          );
        }

        if (
          !parentN ||
          !FileSystemManager.hasPermission(parentN, user, "write")
        ) {

          if (!pipeline.isBackground) {
            await OutputManager.appendToOutput(
              `Redir err: no create in '${parentP}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`, {
                typeClass: Config.CSS_CLASSES.ERROR_MSG
              },
            );
          }
          return {
            success: false,
            error: `no create in '${parentP}'`
          };
        }
      }

      const finalParentDirPath =
        absRedirPath.substring(
          0,
          absRedirPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR),
        ) || Config.FILESYSTEM.ROOT_PATH;
      const finalParentNodeForFile =
        FileSystemManager.getNodeByPath(finalParentDirPath);

      if (!finalParentNodeForFile) {

        console.error(
          "[DEBUG] Redirection: CRITICAL - finalParentNodeForFile is null. Path:",
          finalParentDirPath,
        );
        if (!pipeline.isBackground) {
          await OutputManager.appendToOutput(
            `Redir err: critical internal error, parent dir '${finalParentDirPath}' for file write not found.`, {
              typeClass: Config.CSS_CLASSES.ERROR_MSG
            },
          );
        }
        return {
          success: false,
          error: `parent dir '${finalParentDirPath}' for file write not found (internal)`,
        };
      }

      const fName = absRedirPath.substring(
        absRedirPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1,
      );
      let exContent = "";
      if (
        redirType === "append" &&
        finalParentNodeForFile.children[fName]?.type ===
        Config.FILESYSTEM.DEFAULT_FILE_TYPE
      ) {
        exContent = finalParentNodeForFile.children[fName].content || "";
        if (exContent && !exContent.endsWith("\n") && outputToRedir) {

          exContent += "\n";
        }
      }

      const owner = targetNode ? targetNode.owner : user;
      const mode = targetNode ?
        targetNode.mode :
        Config.FILESYSTEM.DEFAULT_FILE_MODE;

      finalParentNodeForFile.children[fName] = {

        type: Config.FILESYSTEM.DEFAULT_FILE_TYPE,
        content: exContent + outputToRedir,
        owner: owner,
        mode: mode,
        mtime: nowISO,
      };

      FileSystemManager._updateNodeAndParentMtime(absRedirPath, nowISO);

      if (!(await FileSystemManager.save(user))) {
        if (!pipeline.isBackground) {
          await OutputManager.appendToOutput(
            `Failed to save redir to '${redirFile}'.`, {
              typeClass: Config.CSS_CLASSES.ERROR_MSG
            },
          );
        }
        return {
          success: false,
          error: `save redir fail`
        };
      }

      lastResult.output = null;
    }

    if (
      !pipeline.redirection &&
      lastResult.success &&
      lastResult.output !== null &&
      lastResult.output !== undefined
    ) {
      if (!pipeline.isBackground) {
        if (lastResult.output) {

          await OutputManager.appendToOutput(lastResult.output, {
            typeClass: lastResult.messageType || null,
          });
        }
      } else if (lastResult.output && pipeline.isBackground) {

        await OutputManager.appendToOutput(
          `${Config.MESSAGES.BACKGROUND_PROCESS_OUTPUT_SUPPRESSED} (Job ${pipeline.jobId})`, {
            typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
            isBackground: true
          },
        );
      }
    }
    return lastResult;
  }

  async function _finalizeInteractiveModeUI(originalCommandText) {
    TerminalUI.clearInput();
    TerminalUI.updatePrompt();

    if (!EditorManager.isActive()) {

      if (DOM.inputLineContainerDiv) {

        DOM.inputLineContainerDiv.classList.remove(Config.CSS_CLASSES.HIDDEN);
      }
      TerminalUI.focusInput();
    }

    if (DOM.outputDiv) {

      DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight;
    }
    if (!TerminalUI.getIsNavigatingHistory() && originalCommandText.trim()) {
      HistoryManager.resetIndex();
    }
    TerminalUI.setIsNavigatingHistory(false);
  }
  async function processSingleCommand(rawCommandText, isInteractive = true) {
    let finalResult = {
      success: true,
      output: null,
      error: null
    };
    if (
      scriptExecutionInProgress &&
      isInteractive &&
      !ConfirmationManager.isAwaiting()
    ) {
      OutputManager.appendToOutput(
        "Script execution in progress. Input suspended.", {
          typeClass: Config.CSS_CLASSES.WARNING_MSG
        },
      );
      return {
        success: false,
        error: "Script execution in progress."
      };
    }
    if (EditorManager.isActive()) return finalResult;
    if (ConfirmationManager.isAwaiting()) {
      await ConfirmationManager.handleConfirmation(rawCommandText);
      if (isInteractive) await _finalizeInteractiveModeUI(rawCommandText);
      return finalResult;
    }
    const cmdToEcho = rawCommandText.trim();
    if (isInteractive) {
      DOM.inputLineContainerDiv.classList.add(Config.CSS_CLASSES.HIDDEN);
      const prompt = `${DOM.promptUserSpan.textContent}${Config.TERMINAL.PROMPT_AT}${DOM.promptHostSpan.textContent}${Config.TERMINAL.PROMPT_SEPARATOR}${DOM.promptPathSpan.textContent}${Config.TERMINAL.PROMPT_CHAR} `;
      await OutputManager.appendToOutput(`${prompt}${cmdToEcho}`);
    }
    if (cmdToEcho === "") {
      if (isInteractive) await _finalizeInteractiveModeUI(rawCommandText);
      return finalResult;
    }
    if (isInteractive) HistoryManager.add(cmdToEcho);
    if (isInteractive && !TerminalUI.getIsNavigatingHistory())
      HistoryManager.resetIndex();
    let parsedPipe;
    try {
      parsedPipe = new Parser(new Lexer(rawCommandText).tokenize()).parse();
      if (
        parsedPipe.segments.length === 0 &&
        !parsedPipe.isBackground &&
        !parsedPipe.redirection
      ) {
        if (isInteractive) await _finalizeInteractiveModeUI(rawCommandText);
        return {
          success: true,
          output: ""
        };
      }
    } catch (e) {
      await OutputManager.appendToOutput(e.message || "Cmd parse err.", {
        typeClass: Config.CSS_CLASSES.ERROR_MSG,
      });
      if (isInteractive) await _finalizeInteractiveModeUI(rawCommandText);
      return {
        success: false,
        error: e.message || "Cmd parse err."
      };
    }
    const execute = async () =>
      await _executePipeline(parsedPipe, isInteractive);
    if (parsedPipe.isBackground) {
      parsedPipe.jobId = ++backgroundProcessIdCounter;
      await OutputManager.appendToOutput(
        `${Config.MESSAGES.BACKGROUND_PROCESS_STARTED_PREFIX}${parsedPipe.jobId}${Config.MESSAGES.BACKGROUND_PROCESS_STARTED_SUFFIX}`, {
          typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG
        },
      );
      setTimeout(async () => {
        const bgRes = await execute();
        const statusMsg = `[Job ${parsedPipe.jobId} ${bgRes.success ? "finished" : "finished with error"}${bgRes.success ? "" : `: ${bgRes.error || ""}`}]`;
        OutputManager.appendToOutput(statusMsg, {
          typeClass: bgRes.success ?
            Config.CSS_CLASSES.CONSOLE_LOG_MSG :
            Config.CSS_CLASSES.WARNING_MSG,
          isBackground: true,
        });
        if (!bgRes.success)
          console.log(
            `Info: BG job ${parsedPipe.jobId} (${parsedPipe.segments.map((s) => s.command).join(" | ")}) err: ${bgRes.error || "Unknown"}`,
          );
      }, 0);
      finalResult = {
        success: true,
        output: null
      };
    } else finalResult = await execute();
    if (isInteractive && !scriptExecutionInProgress)
      await _finalizeInteractiveModeUI(rawCommandText);
    return finalResult;
  }

  function getCommands() {
    return commands;
  }

  function isScriptRunning() {
    return scriptExecutionInProgress;
  }

  function setScriptExecutionInProgress(status) {
    scriptExecutionInProgress = status;
  }
  return {
    processSingleCommand,
    getCommands,
    isScriptRunning,
    setScriptExecutionInProgress,
  };
})();

function initializeTerminalEventListeners() {
  DOM.terminalDiv.addEventListener("click", (e) => {
    if (EditorManager.isActive()) return;
    if (
      !e.target.closest("button, a") &&
      (!DOM.editableInputDiv || !DOM.editableInputDiv.contains(e.target))
    ) {
      if (DOM.editableInputDiv.contentEditable === "true")
        TerminalUI.focusInput();
    }
  });
  const getCurrentInputTarget = () => DOM.editableInputDiv;
  document.addEventListener("keydown", async (e) => {
    if (
      CommandExecutor.isScriptRunning() &&
      !ConfirmationManager.isAwaiting()
    ) {
      if (e.key === "Enter" || e.key === "Tab" || e.key.startsWith("Arrow"))
        e.preventDefault();
      return;
    }
    if (EditorManager.isActive()) return;
    const activeInput = getCurrentInputTarget();
    if (
      !activeInput ||
      (document.activeElement !== activeInput &&
        !activeInput.contains(document.activeElement)) ||
      activeInput.contentEditable !== "true"
    )
      return;
    TerminalUI.setIsNavigatingHistory(false);
    if (e.key === "Enter") {
      e.preventDefault();
      await CommandExecutor.processSingleCommand(
        TerminalUI.getCurrentInputValue(),
        true,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevCmd = HistoryManager.getPrevious();
      if (prevCmd !== null) {
        TerminalUI.setIsNavigatingHistory(true);
        TerminalUI.setCurrentInputValue(prevCmd, true);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextCmd = HistoryManager.getNext();
      if (nextCmd !== null) {
        TerminalUI.setIsNavigatingHistory(true);
        TerminalUI.setCurrentInputValue(nextCmd, true);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const currentInput = TerminalUI.getCurrentInputValue();
      const sel = window.getSelection();
      let cursorPos = 0;
      if (sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (DOM.editableInputDiv.contains(range.commonAncestorContainer)) {
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(DOM.editableInputDiv);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          cursorPos = preCaretRange.toString().length;
        } else cursorPos = currentInput.length;
      } else cursorPos = currentInput.length;
      const result = TabCompletionManager.getSuggestions(
        currentInput,
        cursorPos,
      );
      if (result?.textToInsert !== null) {
        TerminalUI.setCurrentInputValue(result.textToInsert, false);
        TerminalUI.setCaretPosition(DOM.editableInputDiv, result.newCursorPos);
      }
    }
  });
  if (DOM.editableInputDiv) {
    DOM.editableInputDiv.addEventListener("paste", (e) => {
      e.preventDefault();
      if (DOM.editableInputDiv.contentEditable !== "true") return;
      const text = (e.clipboardData || window.clipboardData).getData(
        "text/plain",
      );
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
      .querySelector(".input-line-container"),
    promptContainerDiv: document
      .getElementById("terminal")
      .querySelector(".prompt-container"),
    editableInputContainerDiv: document.getElementById(
      "editable-input-container",
    ),
    editableInputDiv: document.getElementById("editable-input"),
    promptUserSpan: document.getElementById("prompt-user"),
    promptPathSpan: document.getElementById("prompt-path"),
    promptHostSpan: document.getElementById("prompt-host"),
  };
  console.log(DOM.inputLineContainerDiv);
  if (
    typeof Utils === "undefined" ||
    typeof OutputManager?.initializeConsoleOverrides !== "function"
  ) {
    console.error(
      "FATAL: Core modules (Utils/OutputManager) not defined! Cannot proceed.",
    );
    alert("FATAL ERROR: Core modules failed to load. Check console.");
    return;
  }
  OutputManager.initializeConsoleOverrides();
  try {
    if (typeof IndexedDBManager?.init !== "function") {
      await OutputManager.appendToOutput("FATAL: IndexedDBManager not ready.", {
        typeClass: Config.CSS_CLASSES.ERROR_MSG,
      });
      console.error("FATAL: IndexedDBManager or init not defined!");
      alert("FATAL ERROR: IndexedDBManager module failed. Check console.");
      return;
    }
    await IndexedDBManager.init();
    if (typeof UserManager?.getDefaultUser !== "function") {
      await OutputManager.appendToOutput("FATAL: UserManager not ready.", {
        typeClass: Config.CSS_CLASSES.ERROR_MSG,
      });
      console.error("FATAL: UserManager or getDefaultUser not defined!");
      alert("FATAL ERROR: UserManager module failed. Check console.");
      return;
    }
    UserManager.setCurrentUserObject({
      name: UserManager.getDefaultUser()
    });
    if (
      typeof FileSystemManager === "undefined" ||
      typeof SessionManager === "undefined" ||
      typeof TabCompletionManager === "undefined"
    ) {
      await OutputManager.appendToOutput(
        "FATAL: Core logic module (FS, Session, Tab) not ready.", {
          typeClass: Config.CSS_CLASSES.ERROR_MSG
        },
      );
      console.error(
        "FATAL: FSManager, SessionManager, or TabCompletionManager not defined!",
      );
      alert("FATAL ERROR: Core logic module failed. Check console.");
      return;
    }
    await FileSystemManager.load(UserManager.getDefaultUser());
    SessionManager.loadAutomaticState(UserManager.getDefaultUser());
    initializeTerminalEventListeners();
    TerminalUI.focusInput();
    console.log(
      `${Config.OS.NAME} v.${Config.OS.VERSION} loaded. ...You're Welcome :-)`,
    );
  } catch (error) {
    console.error(
      "Failed to initialize OopisOs on load (main try-catch):",
      error,
      error.stack,
    );
    if (DOM?.outputDiv && OutputManager?.appendToOutput) {
      OutputManager.appendToOutput(
        `FATAL ERROR (onload): ${error.message}. Check console.`, {
          typeClass: Config.CSS_CLASSES.ERROR_MSG
        },
      );
    } else
      alert(
        `FATAL ERROR (onload): ${error.message}. DOM/OutputManager not ready. Check console.`,
      );
  }
};