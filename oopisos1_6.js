// oopisos.js - OopisOS Mainframe v1.6

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
      VERSION: "1.6",
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
      EDITOR_DISCARD_CONFIRM: "Care to save your work?",
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
    if (EditorManager.isActive() && !ConfirmationManager.isAwaiting()) return;
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