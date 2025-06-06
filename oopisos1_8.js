// oopisos.js - OopisOS Core Logic v1.8

const Config = (() => {
  "use strict";
  return {
    DATABASE: {
      NAME: "OopisOsDB",
      VERSION: 2,
      FS_STORE_NAME: "FileSystemsStore",
      UNIFIED_FS_KEY: "OopisOS_SharedFS"
    },
    OS: {
      NAME: "OopisOs",
      VERSION: "1.8",
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
    FILESYSTEM: {
      ROOT_PATH: "/",
      CURRENT_DIR_SYMBOL: ".",
      PARENT_DIR_SYMBOL: "..",
      DEFAULT_DIRECTORY_TYPE: "directory",
      DEFAULT_FILE_TYPE: "file",
      PATH_SEPARATOR: "/",
      // CHANGED: Permissions are now more restrictive by default.
      // 60 = (rw-------) for owner, no access for other.
      DEFAULT_FILE_MODE: 0o60,
      // 70 = (rwx------) for owner, no access for other.
      DEFAULT_DIR_MODE: 0o77,
	  DEFAULT_SCRIPT_MODE: 0o70,
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
          value.forEach((cls) => { if (typeof cls === "string") { cls.split(" ").forEach((c) => { if (c) element.classList.add(c); });}});
        } else if (key === "className" && typeof value === "string") {
          value.split(" ").forEach((c) => { if (c) element.classList.add(c); });
        } else if (key === "style" && typeof value === "object") {
          for (const styleProp in value) { if (value.hasOwnProperty(styleProp)) { element.style[styleProp] = value[styleProp]; }}
        } else if (key === "eventListeners" && typeof value === "object") {
          for (const eventType in value) { if (value.hasOwnProperty(eventType) && typeof value[eventType] === "function") { element.addEventListener(eventType, value[eventType]); }}
        } else if (value !== null && value !== undefined) {
          if (typeof value === "boolean") { if (value) element.setAttribute(key, ""); else element.removeAttribute(key); }
          else { element.setAttribute(key, value); }
        }
      }
    }
    const childrenToProcess = childrenArgs.length === 1 && Array.isArray(childrenArgs[0]) ? childrenArgs[0] : childrenArgs;
    childrenToProcess.forEach((child) => {
      if (child instanceof Node) element.appendChild(child);
      else if (typeof child === "string") element.appendChild(document.createTextNode(child));
      else if (child !== null && child !== undefined) console.warn("Utils.createElement: Skipping unexpected child type:", child);
    });
    return element;
  }

  function validateArguments(argsArray, config = {}) {
    const argCount = argsArray.length;
    if (typeof config.exact === "number") {
      if (argCount !== config.exact) return { isValid: false, errorDetail: `expected exactly ${config.exact} argument(s) but got ${argCount}`};
    } else {
      if (typeof config.min === "number" && argCount < config.min) return { isValid: false, errorDetail: `expected at least ${config.min} argument(s), but got ${argCount}`};
      if (typeof config.max === "number" && argCount > config.max) return { isValid: false, errorDetail: `expected at most ${config.max} argument(s), but got ${argCount}`};
    }
    return { isValid: true };
  }

  function parseNumericArg(argString, options = {}) {
    const { allowFloat = false, allowNegative = false, min, max } = options;
    const num = allowFloat ? parseFloat(argString) : parseInt(argString, 10);
    if (isNaN(num)) return { value: null, error: "is not a valid number" };
    if (!allowNegative && num < 0) return { value: null, error: "must be a non-negative number" };
    if (min !== undefined && num < min) return { value: null, error: `must be at least ${min}`};
    if (max !== undefined && num > max) return { value: null, error: `must be at most ${max}`};
    return { value: num, error: null };
  }

  function validateUsernameFormat(username) {
    if (!username || typeof username !== "string" || username.trim() === "") return { isValid: false, error: "Username cannot be empty." };
    if (username.includes(" ")) return { isValid: false, error: "Username cannot contain spaces."};
    if (Config.USER.RESERVED_USERNAMES.includes(username.toLowerCase())) return { isValid: false, error: `Cannot use '${username}'. This username is reserved.`};
    if (username.length < Config.USER.MIN_USERNAME_LENGTH) return { isValid: false, error: `Username must be at least ${Config.USER.MIN_USERNAME_LENGTH} characters long.`};
    if (username.length > Config.USER.MAX_USERNAME_LENGTH) return { isValid: false, error: `Username cannot exceed ${Config.USER.MAX_USERNAME_LENGTH} characters.`};
    return { isValid: true, error: null };
  }

  // UPDATED Utils.parseFlags function
  function parseFlags(argsArray, flagDefinitions) {
    const flags = {};
    const remainingArgs = [];

    // Initialize flags based on definitions
    flagDefinitions.forEach((def) => {
        flags[def.name] = def.takesValue ? null : false;
    });

    for (let i = 0; i < argsArray.length; i++) {
        const arg = argsArray[i];
        let consumedAsFlag = false; // Tracks if the current arg was consumed as a flag or part of one

        if (arg.startsWith("--") && arg.length > 2) { // Long flag (e.g., --long)
            for (const def of flagDefinitions) {
                if (arg === def.long) {
                    if (def.takesValue) {
                        if (i + 1 < argsArray.length) {
                            flags[def.name] = argsArray[i + 1];
                            i++; // Consume the flag's value as well
                        } else {
                            // Error: Flag expects a value but none is provided.
                            // Depending on desired strictness, could throw or set to a specific error value.
                            console.warn(`Flag ${arg} expects a value, but none was provided.`);
                            flags[def.name] = null; // Or some error indicator
                        }
                    } else {
                        flags[def.name] = true;
                    }
                    consumedAsFlag = true;
                    break;
                }
            }
        } else if (arg.startsWith("-") && !arg.startsWith("--") && arg.length > 1) { // Short flag or combined short flags
            // Check if it's an exact match for a defined short flag that might be multi-character (e.g. -R, -p for parents)
            let isExactShortFlag = false;
            for (const def of flagDefinitions) {
                if (arg === def.short) {
                    if (def.takesValue) {
                        if (i + 1 < argsArray.length) {
                            flags[def.name] = argsArray[i + 1];
                            i++;
                        } else {
                            console.warn(`Flag ${arg} expects a value, but none was provided.`);
                            flags[def.name] = null;
                        }
                    } else {
                        flags[def.name] = true;
                    }
                    isExactShortFlag = true;
                    consumedAsFlag = true;
                    break;
                }
            }

            if (!isExactShortFlag && arg.length > 1) { // Potentially combined flags like -ltr
                const chars = arg.substring(1); // Get characters after '-' e.g., "tr"
                let allCharsAreFlags = true; // Assume all chars in the group are valid flags initially
                let tempCombinedFlags = {}; // Store flags from this group temporarily

                for (let j = 0; j < chars.length; j++) {
                    const charAsFlag = '-' + chars[j]; // e.g., "-t", then "-r"
                    let charIsDefinedFlag = false;
                    let charFlagTakesValue = false;
                    let charFlagDefName = null;

                    for (const def of flagDefinitions) {
                        if (charAsFlag === def.short) {
                            charIsDefinedFlag = true;
                            charFlagTakesValue = def.takesValue;
                            charFlagDefName = def.name;
                            break;
                        }
                    }

                    if (charIsDefinedFlag) {
                        if (charFlagTakesValue) {
                            // A value-taking flag in a combined group must be the last one,
                            // and the *next* argument in the main argsArray is its value.
                            if (j === chars.length - 1) { // If it's the last char in the combined group
                                if (i + 1 < argsArray.length) {
                                    tempCombinedFlags[charFlagDefName] = argsArray[i + 1];
                                    // Do NOT increment 'i' here; the outer loop will handle the value if this group is valid.
                                    // Instead, mark that the *next* arg is consumed IF this combined group is fully processed.
                                } else {
                                    console.warn(`Flag ${charAsFlag} in group ${arg} expects a value, but none was provided.`);
                                    tempCombinedFlags[charFlagDefName] = null; // Or error
                                }
                                // This flag and its potential value will be processed together with the group
                            } else {
                                // Value-taking flag not at the end of a group is typically an error or ambiguous
                                console.warn(`Value-taking flag ${charAsFlag} in combined group ${arg} must be at the end of the group.`);
                                allCharsAreFlags = false; // Treat the whole arg as a non-flag
                                break; // Stop processing this char group
                            }
                        } else { // Boolean flag
                            tempCombinedFlags[charFlagDefName] = true;
                        }
                    } else {
                        allCharsAreFlags = false; // One char in the group is not a defined flag
                        break; // Stop processing this char group
                    }
                }

                if (allCharsAreFlags) {
                    // If all characters were valid flags, apply them
                    Object.assign(flags, tempCombinedFlags);
                    consumedAsFlag = true;
                    // If the last char flag took a value, the outer loop's 'i' needs to be incremented
                    // to skip that value argument.
                    const lastCharInGroup = '-' + chars[chars.length -1];
                    const lastCharDef = flagDefinitions.find(d => d.short === lastCharInGroup);
                    if (lastCharDef && lastCharDef.takesValue && (i + 1 < argsArray.length)) {
                        i++; // The value for the last flag in the group was consumed
                    }
                }
            }
        }

        if (!consumedAsFlag) {
            remainingArgs.push(arg);
        }
    }
    return { flags, remainingArgs };
  }


  function globToRegex(glob) {
    let regexStr = "^";
    for (let i = 0; i < glob.length; i++) {
      const char = glob[i];
      switch (char) {
        case "*": regexStr += ".*"; break;
        case "?": regexStr += "."; break;
        case "[": {
          let charClass = "["; let k = i + 1;
          if (k < glob.length && (glob[k] === "!" || glob[k] === "^")) { charClass += "^"; k++; }
          if (k < glob.length && glob[k] === "]") { charClass += "\\]"; k++; }
          while (k < glob.length && glob[k] !== "]") {
            if (glob[k] === "-" && charClass.length > 1 && charClass[charClass.length - 1] !== "[" && charClass[charClass.length - 1] !== "^" && k + 1 < glob.length && glob[k + 1] !== "]") { charClass += "-"; }
            else if (/[.^${}()|[\]\\]/.test(glob[k])) { charClass += "\\" + glob[k]; }
            else { charClass += glob[k]; }
            k++;
          }
          if (k < glob.length && glob[k] === "]") { charClass += "]"; i = k; }
          else { regexStr += "\\["; continue; }
          regexStr += charClass; break;
        }
        default: if (/[.^${}()|[\]\\]/.test(char)) { regexStr += "\\"; } regexStr += char;
      }
    }
    regexStr += "$";
    try { return new RegExp(regexStr); }
    catch (e) { console.warn(`Utils.globToRegex: Failed to convert glob "${glob}" to regex: ${e.message}`); return null; }
  }

  return {
    formatConsoleArgs, deepCopyNode, formatBytes, getFileExtension, createElement,
    validateArguments, parseNumericArg, validateUsernameFormat, parseFlags, globToRegex,
  };
})();

// ... (Rest of oopisos1_8.js: TimestampParser, OutputManager, StorageManager, IndexedDBManager, FileSystemManager, etc. remain unchanged) ...
// ... (Ensure HistoryManager, ConfirmationManager, UserManager, SessionManager, TerminalUI, TabCompletionManager, and window.onload are present from your full file)

const TimestampParser = (() => {
  "use strict";
  function parseStampToISO(stampStr) {
    let year, monthVal, day, hours, minutes, seconds = 0;
    const currentDate = new Date(); let s = stampStr;
    if (s.includes(".")) {
      const parts = s.split(".");
      if (parts.length !== 2 || parts[1].length !== 2 || isNaN(parseInt(parts[1], 10))) return null;
      seconds = parseInt(parts[1], 10); if (seconds < 0 || seconds > 59) return null;
      s = parts[0];
    }
    if (s.length === 12) { year = parseInt(s.substring(0, 4), 10); monthVal = parseInt(s.substring(4, 6), 10); day = parseInt(s.substring(6, 8), 10); hours = parseInt(s.substring(8, 10), 10); minutes = parseInt(s.substring(10, 12), 10); }
    else if (s.length === 10) { const YY = parseInt(s.substring(0, 2), 10); if (isNaN(YY)) return null; year = YY < 69 ? 2000 + YY : 1900 + YY; monthVal = parseInt(s.substring(2, 4), 10); day = parseInt(s.substring(4, 6), 10); hours = parseInt(s.substring(6, 8), 10); minutes = parseInt(s.substring(8, 10), 10); }
    else if (s.length === 8) { year = currentDate.getFullYear(); monthVal = parseInt(s.substring(0, 2), 10); day = parseInt(s.substring(2, 4), 10); hours = parseInt(s.substring(4, 6), 10); minutes = parseInt(s.substring(6, 8), 10); }
    else return null;
    if (isNaN(year) || isNaN(monthVal) || isNaN(day) || isNaN(hours) || isNaN(minutes)) return null;
    if (monthVal < 1 || monthVal > 12 || day < 1 || day > 31 || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    const dateObj = new Date(Date.UTC(year, monthVal - 1, day, hours, minutes, seconds));
    if (dateObj.getUTCFullYear() !== year || dateObj.getUTCMonth() !== monthVal - 1 || dateObj.getUTCDate() !== day || dateObj.getUTCHours() !== hours || dateObj.getUTCMinutes() !== minutes || dateObj.getUTCSeconds() !== seconds) return null;
    return dateObj.toISOString();
  }
  function resolveTimestampFromCommandFlags(flags, commandName) {
    const nowActualISO = new Date().toISOString();
    if (flags.dateString && flags.stamp) return { timestampISO: null, error: `${commandName}: cannot specify both --date and -t` };
    if (flags.dateString) { const d = new Date(flags.dateString); if (isNaN(d.getTime())) return { timestampISO: null, error: `${commandName}: invalid date string '${flags.dateString}'` }; return { timestampISO: d.toISOString(), error: null }; }
    if (flags.stamp) { const parsedISO = parseStampToISO(flags.stamp); if (!parsedISO) return { timestampISO: null, error: `${commandName}: invalid stamp format '${flags.stamp}' (expected [[CC]YY]MMDDhhmm[.ss])` }; return { timestampISO: parsedISO, error: null }; }
    return { timestampISO: nowActualISO, error: null };
  }
  return { resolveTimestampFromCommandFlags };
})();

const OutputManager = (() => {
  "use strict";
  let isEditorActive = false; const originalConsoleLog = console.log; const originalConsoleWarn = console.warn; const originalConsoleError = console.error;
  function setEditorActive(status) { isEditorActive = status; }
  async function appendToOutput(text, options = {}) {
    if (isEditorActive && options.typeClass !== Config.CSS_CLASSES.EDITOR_MSG && !options.isCompletionSuggestion) return;
    if (!DOM.outputDiv) { originalConsoleError("OutputManager.appendToOutput: DOM.outputDiv is not defined. Message:", text); return; }
    const { typeClass = null, isBackground = false } = options;
    if (isBackground && DOM.inputLineContainerDiv && !DOM.inputLineContainerDiv.classList.contains(Config.CSS_CLASSES.HIDDEN)) {
      const promptText = `${DOM.promptUserSpan.textContent}${Config.TERMINAL.PROMPT_AT}${DOM.promptHostSpan.textContent}${Config.TERMINAL.PROMPT_SEPARATOR}${DOM.promptPathSpan.textContent}${Config.TERMINAL.PROMPT_CHAR} `;
      const currentInputVal = TerminalUI.getCurrentInputValue();
      const echoLine = Utils.createElement("div", { className: Config.CSS_CLASSES.OUTPUT_LINE, textContent: `${promptText}${currentInputVal}` });
      DOM.outputDiv.appendChild(echoLine);
    }
    const lines = String(text).split("\n"); const fragment = document.createDocumentFragment();
    for (const line of lines) {
      const lineClasses = Config.CSS_CLASSES.OUTPUT_LINE.split(" "); const lineAttributes = { classList: [...lineClasses], textContent: line };
      if (typeClass) typeClass.split(" ").forEach((cls) => { if (cls) lineAttributes.classList.push(cls); });
      else if (options.isError) Config.CSS_CLASSES.ERROR_MSG.split(" ").forEach((cls) => { if (cls) lineAttributes.classList.push(cls); });
      fragment.appendChild(Utils.createElement("div", lineAttributes));
    }
    DOM.outputDiv.appendChild(fragment); DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight;
  }
  function clearOutput() { if (!isEditorActive && DOM.outputDiv) DOM.outputDiv.innerHTML = ""; }
  function _consoleLogOverride(...args) { if (DOM.outputDiv && typeof Utils !== "undefined" && typeof Utils.formatConsoleArgs === "function") appendToOutput(`LOG: ${Utils.formatConsoleArgs(args)}`, { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG }); originalConsoleLog.apply(console, args); }
  function _consoleWarnOverride(...args) { if (DOM.outputDiv && typeof Utils !== "undefined" && typeof Utils.formatConsoleArgs === "function") appendToOutput(`WARN: ${Utils.formatConsoleArgs(args)}`, { typeClass: Config.CSS_CLASSES.WARNING_MSG }); originalConsoleWarn.apply(console, args); }
  function _consoleErrorOverride(...args) { if (DOM.outputDiv && typeof Utils !== "undefined" && typeof Utils.formatConsoleArgs === "function") appendToOutput(`ERROR: ${Utils.formatConsoleArgs(args)}`, { typeClass: Config.CSS_CLASSES.ERROR_MSG }); originalConsoleError.apply(console, args); }
  function initializeConsoleOverrides() { if (typeof Utils === "undefined" || typeof Utils.formatConsoleArgs !== "function") { originalConsoleError("OutputManager: Cannot initialize console overrides, Utils or Utils.formatConsoleArgs is not defined."); return; } console.log = _consoleLogOverride; console.warn = _consoleWarnOverride; console.error = _consoleErrorOverride; }
  return { setEditorActive, appendToOutput, clearOutput, initializeConsoleOverrides };
})();

const StorageManager = (() => {
  "use strict";
  function loadItem(key, itemName, defaultValue = null) {
    try { const storedValue = localStorage.getItem(key); if (storedValue !== null) { if (key === Config.STORAGE_KEYS.EDITOR_WORD_WRAP_ENABLED) return storedValue === "true"; try { return JSON.parse(storedValue); } catch (e) { return storedValue; } } }
    catch (e) { const errorMsg = `Warning: Could not load ${itemName} for key '${key}' from localStorage. Error: ${e.message}. Using default value.`; if (typeof OutputManager !== "undefined" && typeof OutputManager.appendToOutput === "function") OutputManager.appendToOutput(errorMsg, { typeClass: Config.CSS_CLASSES.WARNING_MSG }); else console.warn(errorMsg); }
    return defaultValue;
  }
  function saveItem(key, data, itemName) {
    try { const valueToStore = typeof data === "object" && data !== null ? JSON.stringify(data) : String(data); localStorage.setItem(key, valueToStore); return true; }
    catch (e) { const errorMsg = `Error saving ${itemName} for key '${key}' to localStorage. Data may be lost. Error: ${e.message}`; if (typeof OutputManager !== "undefined" && typeof OutputManager.appendToOutput === "function") OutputManager.appendToOutput(errorMsg, { typeClass: Config.CSS_CLASSES.ERROR_MSG }); else console.error(errorMsg); }
    return false;
  }
  function removeItem(key) { try { localStorage.removeItem(key); } catch (e) { console.warn(`StorageManager: Could not remove item for key '${key}'. Error: ${e.message}`); } }
  function getAllLocalStorageKeys() { const keys = []; try { for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (key !== null) keys.push(key); } } catch (e) { console.error(`StorageManager: Could not retrieve all localStorage keys. Error: ${e.message}`); } return keys; }
  return { loadItem, saveItem, removeItem, getAllLocalStorageKeys };
})();

const IndexedDBManager = (() => {
  "use strict";
  let dbInstance = null; let hasLoggedNormalInitialization = false;
  function init() {
    return new Promise((resolve, reject) => {
      if (dbInstance) { resolve(dbInstance); return; }
      if (!window.indexedDB) { const errorMsg = "Error: IndexedDB is not supported by your browser. File system features will be unavailable."; if (typeof OutputManager !== "undefined" && typeof OutputManager.appendToOutput === "function") OutputManager.appendToOutput(errorMsg, { typeClass: Config.CSS_CLASSES.ERROR_MSG }); else console.error(errorMsg); reject(new Error("IndexedDB not supported.")); return; }
      const request = indexedDB.open(Config.DATABASE.NAME, Config.DATABASE.VERSION);
      request.onupgradeneeded = (event) => { const tempDb = event.target.result; if (!tempDb.objectStoreNames.contains(Config.DATABASE.FS_STORE_NAME)) tempDb.createObjectStore(Config.DATABASE.FS_STORE_NAME, { keyPath: "id" }); };
      request.onsuccess = (event) => { dbInstance = event.target.result; if (!hasLoggedNormalInitialization) { if (typeof OutputManager !== "undefined" && typeof OutputManager.appendToOutput === "function") setTimeout(() => OutputManager.appendToOutput("FileSystem DB initialized.", { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG }), 100); else console.log("FileSystem DB initialized (OutputManager not ready for terminal log)."); hasLoggedNormalInitialization = true; } resolve(dbInstance); };
      request.onerror = (event) => { const errorMsg = "Error: OopisOs could not access its file system storage. This might be due to browser settings (e.g., private Browse mode, disabled storage, or full storage). Please check your browser settings and try again. Some features may be unavailable."; if (typeof OutputManager !== "undefined" && typeof OutputManager.appendToOutput === "function") OutputManager.appendToOutput(errorMsg, { typeClass: Config.CSS_CLASSES.ERROR_MSG }); else console.error(errorMsg); console.error("IndexedDB Database error details: ", event.target.error); reject(event.target.error); };
    });
  }
  function getDbInstance() { if (!dbInstance) { const errorMsg = "Error: OopisOs file system storage (IndexedDB) is not available. Please ensure browser storage is enabled and the page is reloaded."; if (typeof OutputManager !== "undefined" && typeof OutputManager.appendToOutput === "function") OutputManager.appendToOutput(errorMsg, { typeClass: Config.CSS_CLASSES.ERROR_MSG }); else console.error(errorMsg); throw new Error(Config.INTERNAL_ERRORS.DB_NOT_INITIALIZED_FS_LOAD); } return dbInstance; }
  return { init, getDbInstance };
})();

const FileSystemManager = (() => {
  "use strict";
  let fsData = {};
  let currentPath = Config.FILESYSTEM.ROOT_PATH;
  async function createUserHomeDirectory(username) {
    if (!fsData['/']?.children?.home) {
      console.error("FileSystemManager: Cannot create user home directory, /home does not exist.");
      return;
    }
    const homeDirNode = fsData['/'].children.home;
    if (!homeDirNode.children[username]) {
      homeDirNode.children[username] = {
        type: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE,
        children: {},
        owner: username,
        mode: 0o75,
        mtime: new Date().toISOString()
      };
      homeDirNode.mtime = new Date().toISOString();
    }
  }

  async function initialize(guestUsername) {
    fsData = {
      [Config.FILESYSTEM.ROOT_PATH]: {
        type: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE,
        children: {
          'home': {
            type: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE,
            children: {},
            owner: 'root',
            mode: 0o77,
            mtime: new Date().toISOString()
          }
        },
        owner: 'root',
        mode: 0o75,
        mtime: new Date().toISOString()
      }
    };
    // It creates the home for the username passed to it.
    await createUserHomeDirectory(guestUsername);
	await createUserHomeDirectory('root');
  }
  
  // FIX #2: The 'user' variable has been removed from error messages.
  async function save() {
    let db;
    try {
      db = IndexedDBManager.getDbInstance();
    } catch (e) {
      OutputManager.appendToOutput("Error: File system storage not available for saving.", { typeClass: Config.CSS_CLASSES.ERROR_MSG });
      return Promise.reject(Config.INTERNAL_ERRORS.DB_NOT_INITIALIZED_FS_SAVE);
    }
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([Config.DATABASE.FS_STORE_NAME], "readwrite");
      const store = transaction.objectStore(Config.DATABASE.FS_STORE_NAME);
      const request = store.put({ id: Config.DATABASE.UNIFIED_FS_KEY, data: Utils.deepCopyNode(fsData) });
      request.onsuccess = () => resolve(true);
      request.onerror = (event) => {
        OutputManager.appendToOutput("Error: OopisOs failed to save the file system.", { typeClass: Config.CSS_CLASSES.ERROR_MSG });
        reject(event.target.error);
      };
    });
  }

  // FIX #3: The load() function is now corrected and simplified.
  async function load() {
    let db;
    try {
      db = IndexedDBManager.getDbInstance();
    } catch (e) {
      await initialize(Config.USER.DEFAULT_NAME); // Pass default name if DB fails
      return Promise.reject(Config.INTERNAL_ERRORS.DB_NOT_INITIALIZED_FS_LOAD);
    }
    return new Promise(async (resolve, reject) => {
      const transaction = db.transaction([Config.DATABASE.FS_STORE_NAME], "readonly");
      const store = transaction.objectStore(Config.DATABASE.FS_STORE_NAME);
      const request = store.get(Config.DATABASE.UNIFIED_FS_KEY);

      request.onsuccess = async (event) => {
        const result = event.target.result;
        if (result && result.data) {
          fsData = result.data;
        } else {
          // This happens on the very first boot of the OS.
          OutputManager.appendToOutput("No file system found. Initializing new one.", { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG });
          await initialize(Config.USER.DEFAULT_NAME); // Pass default name
          await save();
        }
        resolve();
      };
      request.onerror = async (event) => {
        await initialize(Config.USER.DEFAULT_NAME); // Pass default name
        reject(event.target.error);
      };
    });
  }

  function _ensurePermissionsAndMtimeRecursive(node, defaultOwner, defaultMode) {
    if (!node) return;
    if (typeof node.owner === "undefined") node.owner = defaultOwner;
    if (typeof node.mode === "undefined") node.mode = node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE ? Config.FILESYSTEM.DEFAULT_DIR_MODE : Config.FILESYSTEM.DEFAULT_FILE_MODE;
    if (typeof node.mtime === "undefined") node.mtime = new Date().toISOString();
    if (node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE && node.children) { for (const childName in node.children) _ensurePermissionsAndMtimeRecursive(node.children[childName], defaultOwner, defaultMode); }
  }
  async function clearAllFS() {
    let db; try { db = IndexedDBManager.getDbInstance(); } catch(e) { OutputManager.appendToOutput("Error: File system storage not available for clearing all data.", { typeClass: Config.CSS_CLASSES.ERROR_MSG }); return Promise.reject(Config.INTERNAL_ERRORS.DB_NOT_INITIALIZED_FS_CLEAR); }
    return new Promise((resolve, reject) => { const transaction = db.transaction([Config.DATABASE.FS_STORE_NAME], "readwrite"); const store = transaction.objectStore(Config.DATABASE.FS_STORE_NAME); const request = store.clear(); request.onsuccess = () => resolve(true); request.onerror = (event) => { console.error("Error clearing FileSystemsStore:", event.target.error); OutputManager.appendToOutput("Error: OopisOs could not clear all user file systems. Your data might still be present. Please try the operation again.", { typeClass: Config.CSS_CLASSES.ERROR_MSG }); reject(event.target.error); }; });
  }
  function getCurrentPath() { return currentPath; }
  function setCurrentPath(path) { currentPath = path; }
  function getFsData() { return fsData; }
  function setFsData(newData) { fsData = newData; }
  function getAbsolutePath(targetPath, basePath) {
    if (!targetPath) targetPath = Config.FILESYSTEM.CURRENT_DIR_SYMBOL;
    let effectiveBasePath = basePath; if (targetPath.startsWith(Config.FILESYSTEM.PATH_SEPARATOR)) effectiveBasePath = Config.FILESYSTEM.ROOT_PATH;
    const baseSegments = effectiveBasePath === Config.FILESYSTEM.ROOT_PATH ? [] : effectiveBasePath.substring(1).split(Config.FILESYSTEM.PATH_SEPARATOR).filter((s) => s && s !== Config.FILESYSTEM.CURRENT_DIR_SYMBOL);
    let resolvedSegments = [...baseSegments]; const targetSegments = targetPath.split(Config.FILESYSTEM.PATH_SEPARATOR);
    for (const segment of targetSegments) { if (segment === "" || segment === Config.FILESYSTEM.CURRENT_DIR_SYMBOL) { if (targetPath.startsWith(Config.FILESYSTEM.PATH_SEPARATOR) && resolvedSegments.length === 0 && segment === "") {} continue; } if (segment === Config.FILESYSTEM.PARENT_DIR_SYMBOL) { if (resolvedSegments.length > 0) resolvedSegments.pop(); } else resolvedSegments.push(segment); }
    if (resolvedSegments.length === 0) return Config.FILESYSTEM.ROOT_PATH;
    return Config.FILESYSTEM.PATH_SEPARATOR + resolvedSegments.join(Config.FILESYSTEM.PATH_SEPARATOR);
  }
  function getNodeByPath(path) {
    const absolutePath = getAbsolutePath(path, currentPath); if (absolutePath === Config.FILESYSTEM.ROOT_PATH) return fsData[Config.FILESYSTEM.ROOT_PATH];
    const segments = absolutePath.substring(1).split(Config.FILESYSTEM.PATH_SEPARATOR).filter((s) => s);
    let currentNode = fsData[Config.FILESYSTEM.ROOT_PATH];
    for (const segment of segments) { if (currentNode && currentNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE && currentNode.children && currentNode.children[segment]) currentNode = currentNode.children[segment]; else return null; }
    return currentNode;
  }
  function calculateNodeSize(node) { if (!node) return 0; if (node.type === Config.FILESYSTEM.DEFAULT_FILE_TYPE) return (node.content || "").length; if (node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) { let totalSize = 0; for (const childName in node.children) totalSize += calculateNodeSize(node.children[childName]); return totalSize; } return 0; }
  function _updateNodeAndParentMtime(nodePath, nowISO) { if (!nodePath || !nowISO) return; const node = getNodeByPath(nodePath); if (node) node.mtime = nowISO; if (nodePath !== Config.FILESYSTEM.ROOT_PATH) { const parentPath = nodePath.substring(0, nodePath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR)) || Config.FILESYSTEM.ROOT_PATH; const parentNode = getNodeByPath(parentPath); if (parentNode && parentNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) parentNode.mtime = nowISO; } }
  function createParentDirectoriesIfNeeded(fullPath) {
    const currentUserForCPDIF = UserManager.getCurrentUser().name; const nowISO = new Date().toISOString();
    if (fullPath === Config.FILESYSTEM.ROOT_PATH) return { parentNode: null, error: "Cannot create directory structure for root." };
    const lastSlashIndex = fullPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR);
    const parentPathForSegments = lastSlashIndex === 0 ? Config.FILESYSTEM.ROOT_PATH : fullPath.substring(0, lastSlashIndex);
    const finalDirNameInPath = fullPath.substring(lastSlashIndex + 1);
    if (!finalDirNameInPath || finalDirNameInPath === Config.FILESYSTEM.CURRENT_DIR_SYMBOL || finalDirNameInPath === Config.FILESYSTEM.PARENT_DIR_SYMBOL) {}
    if (parentPathForSegments === Config.FILESYSTEM.ROOT_PATH) return { parentNode: fsData[Config.FILESYSTEM.ROOT_PATH], error: null };
    const segmentsToCreate = parentPathForSegments.substring(1).split(Config.FILESYSTEM.PATH_SEPARATOR).filter((s) => s);
    let currentParentNode = fsData[Config.FILESYSTEM.ROOT_PATH]; let currentProcessedPath = Config.FILESYSTEM.ROOT_PATH;
    if (!currentParentNode || typeof currentParentNode.owner === "undefined" || typeof currentParentNode.mode === "undefined") return { parentNode: null, error: "Internal error: Root FS node is malformed." };
    for (const segment of segmentsToCreate) {
      if (!currentParentNode.children || typeof currentParentNode.children !== "object") { const errorMsg = `Internal error: currentParentNode.children is not an object at path "${currentProcessedPath}" for segment "${segment}". FS may be corrupted.`; console.error(errorMsg, currentParentNode); return { parentNode: null, error: errorMsg }; }
      if (!currentParentNode.children[segment]) { if (!hasPermission(currentParentNode, currentUserForCPDIF, "write")) { const errorMsg = `Cannot create directory '${segment}' in '${currentProcessedPath}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`; return { parentNode: null, error: errorMsg }; } currentParentNode.children[segment] = { type: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE, children: {}, owner: currentUserForCPDIF, mode: Config.FILESYSTEM.DEFAULT_DIR_MODE, mtime: nowISO }; currentParentNode.mtime = nowISO; }
      else if (currentParentNode.children[segment].type !== Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) { const errorMsg = `Path component '${getAbsolutePath(segment, currentProcessedPath)}' is not a directory.`; return { parentNode: null, error: errorMsg }; }
      currentParentNode = currentParentNode.children[segment]; currentProcessedPath = getAbsolutePath(segment, currentProcessedPath);
      if (!currentParentNode || typeof currentParentNode.owner === "undefined" || typeof currentParentNode.mode === "undefined") return { parentNode: null, error: `Internal error: Node for "${currentProcessedPath}" became malformed during parent creation.` };
    }
    return { parentNode: currentParentNode, error: null };
  }
  function validatePath(commandName, pathArg, options = {}) {
    const { allowMissing = false, expectedType = null, disallowRoot = false, defaultToCurrentIfEmpty = true } = options;
    const effectivePathArg = pathArg === "" && defaultToCurrentIfEmpty ? Config.FILESYSTEM.CURRENT_DIR_SYMBOL : pathArg;
    const resolvedPath = getAbsolutePath(effectivePathArg, currentPath); const node = getNodeByPath(resolvedPath);
    if (disallowRoot && resolvedPath === Config.FILESYSTEM.ROOT_PATH) return { error: `${commandName}: '${pathArg}' (resolved to root) is not a valid target for this operation.`, node: null, resolvedPath, optionsUsed: options };
    if (!node) { if (allowMissing) return { error: null, node: null, resolvedPath, optionsUsed: options }; return { error: `${commandName}: '${pathArg}' (resolved to '${resolvedPath}'): No such file or directory`, node: null, resolvedPath, optionsUsed: options }; }
    if (expectedType && node.type !== expectedType) { const typeName = expectedType === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE ? "directory" : "file"; const actualTypeName = node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE ? "directory" : node.type === Config.FILESYSTEM.DEFAULT_FILE_TYPE ? "file" : "unknown type"; return { error: `${commandName}: '${pathArg}' (resolved to '${resolvedPath}') is not a ${typeName} (it's a ${actualTypeName})`, node, resolvedPath, optionsUsed: options }; }
    return { error: null, node, resolvedPath, optionsUsed: options };
  }
  function hasPermission(node, username, permissionType) {
	  if (username === 'root') return true; // root can do anything

    if (!node || typeof node.mode !== "number" || typeof node.owner !== "string") {
      console.warn("hasPermission: Invalid node or missing permissions info.", node);
      return false;
    }
    let permissionMask;
    switch (permissionType) { case "read": permissionMask = Config.FILESYSTEM.PERMISSION_BIT_READ; break; case "write": permissionMask = Config.FILESYSTEM.PERMISSION_BIT_WRITE; break; case "execute": permissionMask = Config.FILESYSTEM.PERMISSION_BIT_EXECUTE; break; default: console.warn("hasPermission: Unknown permission type requested:", permissionType); return false; }
    const isOwner = node.owner === username; let effectiveModeBits;
    if (isOwner) effectiveModeBits = (node.mode >> 3) & 0b111; else effectiveModeBits = node.mode & 0b111;
    return (effectiveModeBits & permissionMask) === permissionMask;
  }
  function formatModeToString(node) {
    if (!node || typeof node.mode !== "number") return "---------"; const mode = node.mode;
    const typeChar = node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE ? "d" : "-";
    const ownerPerms = (mode >> 3) & 0b111; const otherPerms = mode & 0b111;
    const r = Config.FILESYSTEM.PERMISSION_BIT_READ; const w = Config.FILESYSTEM.PERMISSION_BIT_WRITE; const x = Config.FILESYSTEM.PERMISSION_BIT_EXECUTE;
    let str = typeChar;
    str += (ownerPerms & r) ? "r" : "-"; str += (ownerPerms & w) ? "w" : "-"; str += (ownerPerms & x) ? "x" : "-";
    str += (otherPerms & r) ? "r" : "-"; str += (otherPerms & w) ? "w" : "-"; str += (otherPerms & x) ? "x" : "-"; // Other perms
    str += (otherPerms & r) ? "r" : "-"; str += (otherPerms & w) ? "w" : "-"; str += (otherPerms & x) ? "x" : "-"; // Group perms (same as other)
    return str;
  }
  return { initialize, createUserHomeDirectory, save, load, clearAllFS, getCurrentPath, setCurrentPath, getFsData, setFsData, getAbsolutePath, getNodeByPath, createParentDirectoriesIfNeeded, calculateNodeSize, validatePath, hasPermission, formatModeToString, _updateNodeAndParentMtime, _ensurePermissionsAndMtimeRecursive, getFsData,
    setFsData,
    getCurrentPath,
    setCurrentPath,
    getAbsolutePath,
    getNodeByPath,
    validatePath,
    hasPermission,
    formatModeToString,
    _updateNodeAndParentMtime,
    calculateNodeSize,
    createParentDirectoriesIfNeeded,
    _ensurePermissionsAndMtimeRecursive };
})();

const HistoryManager = (() => {
  "use strict";
  let commandHistory = []; let historyIndex = 0;
  function add(command) { const trimmedCommand = command.trim(); if (trimmedCommand && (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== trimmedCommand)) { commandHistory.push(trimmedCommand); if (commandHistory.length > Config.TERMINAL.MAX_HISTORY_SIZE) commandHistory.shift(); } historyIndex = commandHistory.length; }
  function getPrevious() { if (commandHistory.length > 0 && historyIndex > 0) { historyIndex--; return commandHistory[historyIndex]; } return null; }
  function getNext() { if (historyIndex < commandHistory.length - 1) { historyIndex++; return commandHistory[historyIndex]; } else if (historyIndex >= commandHistory.length - 1) { historyIndex = commandHistory.length; return ""; } return null; }
  function resetIndex() { historyIndex = commandHistory.length; }
  function getFullHistory() { return [...commandHistory]; }
  function clearHistory() { commandHistory = []; historyIndex = 0; }
  function setHistory(newHistory) { commandHistory = Array.isArray(newHistory) ? [...newHistory] : []; if (commandHistory.length > Config.TERMINAL.MAX_HISTORY_SIZE) commandHistory = commandHistory.slice(commandHistory.length - Config.TERMINAL.MAX_HISTORY_SIZE); historyIndex = commandHistory.length; }
  return { add, getPrevious, getNext, resetIndex, getFullHistory, clearHistory, setHistory };
})();

const ConfirmationManager = (() => {
  "use strict";
  let awaitingConfirmation = false; let confirmationContext = null;
  function request(promptMessageLines, dataForAction, onConfirmCallback, onCancelCallback = null) {
    if (awaitingConfirmation) { OutputManager.appendToOutput("Another confirmation is already pending.", { typeClass: Config.CSS_CLASSES.WARNING_MSG }); if (onCancelCallback) onCancelCallback(dataForAction); return; }
    awaitingConfirmation = true; confirmationContext = { promptMessageLines: Array.isArray(promptMessageLines) ? promptMessageLines : [promptMessageLines], data: dataForAction, onConfirm: onConfirmCallback, onCancel: onCancelCallback };
    confirmationContext.promptMessageLines.forEach((line) => OutputManager.appendToOutput(line, { typeClass: Config.CSS_CLASSES.WARNING_MSG }));
    OutputManager.appendToOutput(Config.MESSAGES.CONFIRMATION_PROMPT, { typeClass: Config.CSS_CLASSES.WARNING_MSG });
    TerminalUI.setInputState(true); TerminalUI.clearInput(); if (DOM.inputLineContainerDiv) DOM.inputLineContainerDiv.classList.remove(Config.CSS_CLASSES.HIDDEN); TerminalUI.focusInput(); if (DOM.outputDiv) DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight;
  }
  async function handleConfirmation(input) {
    if (!awaitingConfirmation || !confirmationContext) return false;
    let processed = false;
    if (input.trim() === "YES" && typeof confirmationContext.onConfirm === "function") { await confirmationContext.onConfirm(confirmationContext.data); processed = true; }
    else { if (typeof confirmationContext.onCancel === "function") await confirmationContext.onCancel(confirmationContext.data); else OutputManager.appendToOutput(Config.MESSAGES.OPERATION_CANCELLED, { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG }); processed = true; }
    awaitingConfirmation = false; confirmationContext = null; return processed;
  }
  function isAwaiting() { return awaitingConfirmation; }
  return { request, handleConfirmation, isAwaiting };
})();

const UserManager = (() => {
  "use strict";
  let currentUser = { name: Config.USER.DEFAULT_NAME };

  function getCurrentUser() {
    return currentUser;
  }

  async function register(username) {
    const formatValidation = Utils.validateUsernameFormat(username);
    if (!formatValidation.isValid) return { success: false, error: formatValidation.error };

    const users = StorageManager.loadItem(Config.STORAGE_KEYS.USER_CREDENTIALS, "User list", {});

    if (users[username]) return { success: false, error: `User '${username}' already exists.` };

    users[username] = {}; // Store the user
    
    await FileSystemManager.createUserHomeDirectory(username);
    
    if (StorageManager.saveItem(Config.STORAGE_KEYS.USER_CREDENTIALS, users, "User list") && await FileSystemManager.save()) {
      return { success: true, message: `User '${username}' registered. Home directory created at /home/${username}.` };
    } else {
      return { success: false, error: "Failed to save new user and filesystem." };
    }
  }

  async function login(username) {
    if (currentUser.name === username) return { success: true, message: `...`, noAction: true };
    const users = StorageManager.loadItem(Config.STORAGE_KEYS.USER_CREDENTIALS, "User list", {});
    if (!users.hasOwnProperty(username) && username !== Config.USER.DEFAULT_NAME && username !== 'root') return { success: false, error: "Invalid username." };
    
    if (currentUser.name !== Config.USER.DEFAULT_NAME) {
        SessionManager.saveAutomaticState(currentUser.name);
    }
    
    currentUser = { name: username };
    
    SessionManager.loadAutomaticState(username);

    const homePath = `/home/${username}`;
    if(FileSystemManager.getNodeByPath(homePath)) {
        FileSystemManager.setCurrentPath(homePath);
    } else {
        FileSystemManager.setCurrentPath(Config.FILESYSTEM.ROOT_PATH);
    }

    TerminalUI.updatePrompt();
    return { success: true, message: `Logged in as ${username}.` };
  }

  async function logout() {
    if (currentUser.name === Config.USER.DEFAULT_NAME) return { success: true, message: `...`, noAction: true };
    SessionManager.saveAutomaticState(currentUser.name);
    
    const prevUserName = currentUser.name;
    currentUser = { name: Config.USER.DEFAULT_NAME };
    
    SessionManager.loadAutomaticState(Config.USER.DEFAULT_NAME);
    
    const guestHome = `/home/${Config.USER.DEFAULT_NAME}`;
    if(FileSystemManager.getNodeByPath(guestHome)) {
        FileSystemManager.setCurrentPath(guestHome);
    } else {
        FileSystemManager.setCurrentPath(Config.FILESYSTEM.ROOT_PATH);
    }

    TerminalUI.updatePrompt();
    return { success: true, message: `User ${prevUserName} logged out. Now logged in as ${Config.USER.DEFAULT_NAME}.` };
  }

  // This is the critical addition that exposes the functions
  return {
    getCurrentUser,
    register,
    login,
    logout
  };
})();

const SessionManager = (() => {
  "use strict";
  function _getAutomaticSessionStateKey(user) { return `${Config.STORAGE_KEYS.USER_TERMINAL_STATE_PREFIX}${user}`; }
  function _getManualUserTerminalStateKey(user) { const userName = typeof user === "object" && user !== null && user.name ? user.name : String(user); return `${Config.STORAGE_KEYS.MANUAL_TERMINAL_STATE_PREFIX}${userName}`; }
  function saveAutomaticState(username) {
    if (!username) { console.warn("saveAutomaticState: No username provided. State not saved."); return; }
    const currentInput = TerminalUI.getCurrentInputValue();
    const autoState = { currentPath: FileSystemManager.getCurrentPath(), outputHTML: DOM.outputDiv ? DOM.outputDiv.innerHTML : "", currentInput: currentInput, commandHistory: HistoryManager.getFullHistory() };
    StorageManager.saveItem(_getAutomaticSessionStateKey(username), autoState, `Auto session for ${username}`);
  }
  function loadAutomaticState(username) {
    if (!username) {
      console.warn("loadAutomaticState: No username provided. Cannot load state.");
      if (DOM.outputDiv) DOM.outputDiv.innerHTML = "";
      TerminalUI.setCurrentInputValue("");
      FileSystemManager.setCurrentPath(Config.FILESYSTEM.ROOT_PATH);
      HistoryManager.clearHistory();
      OutputManager.appendToOutput(`${Config.MESSAGES.WELCOME_PREFIX}${Config.USER.DEFAULT_NAME}${Config.MESSAGES.WELCOME_SUFFIX}`);
      TerminalUI.updatePrompt();
      if (DOM.outputDiv) DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight;
      return false;
    }
    const autoState = StorageManager.loadItem(_getAutomaticSessionStateKey(username), `Auto session for ${username}`);
    if (autoState) {
      FileSystemManager.setCurrentPath(autoState.currentPath || Config.FILESYSTEM.ROOT_PATH);
      if (DOM.outputDiv) {
        if (autoState.hasOwnProperty("outputHTML")) {
          DOM.outputDiv.innerHTML = autoState.outputHTML || "";
        } else {
          DOM.outputDiv.innerHTML = "";
          OutputManager.appendToOutput(`${Config.MESSAGES.WELCOME_PREFIX}${username}${Config.MESSAGES.WELCOME_SUFFIX}`);
        }
      }
      TerminalUI.setCurrentInputValue(autoState.currentInput || "");
      HistoryManager.setHistory(autoState.commandHistory || []);
    } else {
      // THIS IS THE CORRECTED LOGIC FOR A FRESH START
      if (DOM.outputDiv) DOM.outputDiv.innerHTML = "";
      TerminalUI.setCurrentInputValue("");
      // Default to the user's home directory instead of root
      const homePath = `/home/${username}`;
      if (FileSystemManager.getNodeByPath(homePath)) {
        FileSystemManager.setCurrentPath(homePath);
      } else {
        // Fallback to root only if home doesn't exist for some reason
        FileSystemManager.setCurrentPath(Config.FILESYSTEM.ROOT_PATH);
      }
      HistoryManager.clearHistory();
      OutputManager.appendToOutput(`${Config.MESSAGES.WELCOME_PREFIX}${username}${Config.MESSAGES.WELCOME_SUFFIX}`);
    }
    TerminalUI.updatePrompt();
    if (DOM.outputDiv) DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight;
    return !!autoState;
  }
  async function saveManualState() {
    const currentUser = UserManager.getCurrentUser(); const currentInput = TerminalUI.getCurrentInputValue();
    const manualStateData = { user: currentUser.name, osVersion: Config.OS.VERSION, timestamp: new Date().toISOString(), currentPath: FileSystemManager.getCurrentPath(), outputHTML: DOM.outputDiv ? DOM.outputDiv.innerHTML : "", currentInput: currentInput, fsDataSnapshot: Utils.deepCopyNode(FileSystemManager.getFsData()), commandHistory: HistoryManager.getFullHistory() };
    if (StorageManager.saveItem(_getManualUserTerminalStateKey(currentUser), manualStateData, `Manual save for ${currentUser.name}`)) return { success: true, message: `${Config.MESSAGES.SESSION_SAVED_FOR_PREFIX}${currentUser.name}.` };
    else return { success: false, error: "Failed to save session manually." };
  }
  async function loadManualState() {
    const currentUser = UserManager.getCurrentUser(); const manualStateData = StorageManager.loadItem(_getManualUserTerminalStateKey(currentUser), `Manual save for ${currentUser.name}`);
    if (manualStateData) {
      if (manualStateData.user && manualStateData.user !== currentUser.name) { OutputManager.appendToOutput(`Warning: Saved state is for user '${manualStateData.user}'. Current user is '${currentUser.name}'. Load aborted. Use 'login ${manualStateData.user}' then 'loadstate'.`, { typeClass: Config.CSS_CLASSES.WARNING_MSG }); return { success: false, message: `Saved state user mismatch. Current: ${currentUser.name}, Saved: ${manualStateData.user}.` }; }
      ConfirmationManager.request([`Load manually saved state for '${currentUser.name}'? This overwrites current session & filesystem.`], { pendingData: manualStateData, userNameToRestoreTo: currentUser.name },
        async (data) => { FileSystemManager.setFsData(Utils.deepCopyNode(data.pendingData.fsDataSnapshot) || { [Config.FILESYSTEM.ROOT_PATH]: { type: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE, children: {}, owner: data.userNameToRestoreTo, mode: Config.FILESYSTEM.DEFAULT_DIR_MODE, mtime: new Date().toISOString() } }); FileSystemManager.setCurrentPath(data.pendingData.currentPath || Config.FILESYSTEM.ROOT_PATH); if (DOM.outputDiv) DOM.outputDiv.innerHTML = data.pendingData.outputHTML || ""; TerminalUI.setCurrentInputValue(data.pendingData.currentInput || ""); HistoryManager.setHistory(data.pendingData.commandHistory || []); await FileSystemManager.save(data.userNameToRestoreTo); OutputManager.appendToOutput(Config.MESSAGES.SESSION_LOADED_MSG, { typeClass: Config.CSS_CLASSES.SUCCESS_MSG }); TerminalUI.updatePrompt(); if (DOM.outputDiv) DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight; },
        () => { OutputManager.appendToOutput(Config.MESSAGES.LOAD_STATE_CANCELLED, { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG }); }
      );
      return { success: true, message: "Confirmation requested for loading state." };
    } else return { success: false, message: `${Config.MESSAGES.NO_MANUAL_SAVE_FOUND_PREFIX}${currentUser.name}.` };
  }
  function clearUserSessionStates(username) { if (!username || typeof username !== "string") { console.warn("SessionManager.clearUserSessionStates: Invalid username provided.", username); return false; } try { StorageManager.removeItem(_getAutomaticSessionStateKey(username)); StorageManager.removeItem(_getManualUserTerminalStateKey(username)); return true; } catch (e) { console.error(`Error clearing session states for user '${username}':`, e); return false; } }
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
      ) {
        keysToRemove.push(key);
      }
    });
    keysToRemove.forEach((key) => StorageManager.removeItem(key));
    await OutputManager.appendToOutput("All session states, credentials, and editor settings cleared from local storage.");
    try {
      await FileSystemManager.clearAllFS();
      await OutputManager.appendToOutput("All user filesystems cleared from DB.");
    } catch (error) {
      await OutputManager.appendToOutput(`Warning: Could not fully clear all user filesystems from DB. Error: ${error.message}`, {
        typeClass: Config.CSS_CLASSES.WARNING_MSG
      });
    }

    // --- CORRECTED LOGIC ---
    await OutputManager.appendToOutput("Reset complete. Rebooting OopisOS...", {
      typeClass: Config.CSS_CLASSES.SUCCESS_MSG
    });

    // IMMEDIATELY disable the input to prevent further commands.
    TerminalUI.setInputState(false);
    if (DOM.inputLineContainerDiv) {
        DOM.inputLineContainerDiv.classList.add(Config.CSS_CLASSES.HIDDEN);
    }

    // Schedule the reload to ensure a clean start.
    setTimeout(() => {
      window.location.reload();
    }, 1500); // Wait 1.5 seconds for the user to read the message.
  }
  return { saveAutomaticState, loadAutomaticState, saveManualState, loadManualState, clearUserSessionStates, performFullReset };
})();

const TerminalUI = (() => {
  "use strict";
  let isNavigatingHistory = false;
  function updatePrompt() {
    const user = typeof UserManager !== "undefined" ? UserManager.getCurrentUser() : { name: Config.USER.DEFAULT_NAME };
    if (DOM.promptUserSpan) { DOM.promptUserSpan.textContent = user ? user.name : Config.USER.DEFAULT_NAME; DOM.promptUserSpan.className = "prompt-user mr-0.5 text-sky-400"; }
    if (DOM.promptHostSpan) DOM.promptHostSpan.textContent = Config.OS.DEFAULT_HOST_NAME;
    const currentPathDisplay = typeof FileSystemManager !== "undefined" ? FileSystemManager.getCurrentPath() : Config.FILESYSTEM.ROOT_PATH;
    if (DOM.promptPathSpan) DOM.promptPathSpan.textContent = currentPathDisplay === Config.FILESYSTEM.ROOT_PATH && currentPathDisplay.length > 1 ? Config.FILESYSTEM.ROOT_PATH : currentPathDisplay;
  }
  function focusInput() { if (DOM.editableInputDiv && DOM.editableInputDiv.contentEditable === "true") { DOM.editableInputDiv.focus(); if (DOM.editableInputDiv.textContent.length === 0) setCaretToEnd(DOM.editableInputDiv); } }
  function clearInput() { if (DOM.editableInputDiv) DOM.editableInputDiv.textContent = ""; }
  function getCurrentInputValue() { return DOM.editableInputDiv ? DOM.editableInputDiv.textContent : ""; }
  function setCurrentInputValue(value, setAtEnd = true) { if (DOM.editableInputDiv) { DOM.editableInputDiv.textContent = value; if (setAtEnd) setCaretToEnd(DOM.editableInputDiv); } }
  function setCaretToEnd(element) { if (!element || typeof window.getSelection === "undefined" || typeof document.createRange === "undefined") return; const range = document.createRange(); const sel = window.getSelection(); range.selectNodeContents(element); range.collapse(false); if (sel) { sel.removeAllRanges(); sel.addRange(range); } element.focus(); }
  function setCaretPosition(element, position) {
    if (!element || typeof position !== "number" || typeof window.getSelection === "undefined" || typeof document.createRange === "undefined") return;
    const sel = window.getSelection(); if (!sel) return; const range = document.createRange(); let charCount = 0; let foundNode = false;
    function findTextNodeAndSet(node) { if (node.nodeType === Node.TEXT_NODE) { const nextCharCount = charCount + node.length; if (!foundNode && position >= charCount && position <= nextCharCount) { range.setStart(node, position - charCount); range.collapse(true); foundNode = true; } charCount = nextCharCount; } else { for (let i = 0; i < node.childNodes.length; i++) { if (findTextNodeAndSet(node.childNodes[i])) return true; if (foundNode) break; } } return foundNode; }
    if (element.childNodes.length === 0 && position === 0) { range.setStart(element, 0); range.collapse(true); foundNode = true; } else findTextNodeAndSet(element);
    if (foundNode) { sel.removeAllRanges(); sel.addRange(range); } else setCaretToEnd(element); element.focus();
  }
  function setInputState(isEditable) { if (DOM.editableInputDiv) { DOM.editableInputDiv.contentEditable = isEditable ? "true" : "false"; DOM.editableInputDiv.style.opacity = isEditable ? "1" : "0.5"; if (!isEditable) DOM.editableInputDiv.blur(); } }
  function setIsNavigatingHistory(status) { isNavigatingHistory = status; }
  function getIsNavigatingHistory() { return isNavigatingHistory; }
  return { updatePrompt, focusInput, clearInput, setCurrentInputValue, getCurrentInputValue, setCaretToEnd, setIsNavigatingHistory, getIsNavigatingHistory, setCaretPosition, setInputState };
})();

const TabCompletionManager = (() => {
  "use strict";
  const PATH_COMMANDS = ["ls", "cd", "cat", "edit", "run", "mv", "cp", "rm", "mkdir", "touch", "export", "find", "tree", "chmod", "chown", "grep", "adventure", "printscreen", "gemini"];
  function findLongestCommonPrefix(strs) { if (!strs || strs.length === 0) return ""; if (strs.length === 1) return strs[0]; let prefix = strs[0]; for (let i = 1; i < strs.length; i++) { while (strs[i].indexOf(prefix) !== 0) { prefix = prefix.substring(0, prefix.length - 1); if (prefix === "") return ""; } } return prefix; }
  function getSuggestions(fullInput, cursorPos) {
    const textBeforeCursor = fullInput.substring(0, cursorPos); const tokensInitial = textBeforeCursor.trimStart().split(/\s+/);
    let currentWordPrefix = ""; let isCompletingCommandName = false; let baseCommandForPath = "";
    const lastCharIsSpace = /\s$/.test(textBeforeCursor) || textBeforeCursor.length === 0;
    let startOfWordIndex = 0; let effectiveArgStart = 0;
    if (tokensInitial.length === 0 || (tokensInitial.length === 1 && !lastCharIsSpace && tokensInitial[0] !== "")) { isCompletingCommandName = true; currentWordPrefix = tokensInitial.length > 0 ? tokensInitial[0] : ""; if (textBeforeCursor.length > 0 && !/\s$/.test(textBeforeCursor.charAt(0))) { startOfWordIndex = textBeforeCursor.indexOf(currentWordPrefix); if (startOfWordIndex === -1 && currentWordPrefix === "") startOfWordIndex = cursorPos; else if (startOfWordIndex === -1) startOfWordIndex = 0; } else { startOfWordIndex = textBeforeCursor.lastIndexOf(currentWordPrefix); if (startOfWordIndex === -1 && currentWordPrefix === "") startOfWordIndex = cursorPos; else if (startOfWordIndex === -1) startOfWordIndex = 0; }
    } else {
      isCompletingCommandName = false; baseCommandForPath = tokensInitial[0].toLowerCase();
      if (lastCharIsSpace) { currentWordPrefix = ""; effectiveArgStart = cursorPos; }
      else { const commandEndPos = textBeforeCursor.indexOf(tokensInitial[0]) + tokensInitial[0].length; let currentFragmentStart = commandEndPos; if (textBeforeCursor.length > commandEndPos && textBeforeCursor[commandEndPos] === ' ') currentFragmentStart = commandEndPos + 1; let tempInSingleQuote = false; let tempInDoubleQuote = false; for (let i = currentFragmentStart; i < cursorPos; i++) { const char = textBeforeCursor[i]; if (char === "'" && (i === 0 || textBeforeCursor[i-1] !== '\\')) { if (!tempInDoubleQuote) tempInSingleQuote = !tempInSingleQuote; } else if (char === '"' && (i === 0 || textBeforeCursor[i-1] !== '\\')) { if (!tempInSingleQuote) tempInDoubleQuote = !tempInDoubleQuote; } else if (char === ' ' && !tempInSingleQuote && !tempInDoubleQuote) currentFragmentStart = i + 1; } effectiveArgStart = currentFragmentStart; currentWordPrefix = textBeforeCursor.substring(effectiveArgStart, cursorPos); }
      startOfWordIndex = effectiveArgStart;
    }
    if (startOfWordIndex < 0) startOfWordIndex = 0;
    let suggestions = [];
    if (isCompletingCommandName) { const allCommands = CommandExecutor.getCommands(); if (allCommands) suggestions = Object.keys(allCommands).filter((cmdName) => cmdName.startsWith(currentWordPrefix)).sort(); if (suggestions.length === 0) return { textToInsert: null, newCursorPos: cursorPos }; if (suggestions.length === 1) { const completedSegment = suggestions[0] + " "; const textToInsert = textBeforeCursor.substring(0, startOfWordIndex) + completedSegment + fullInput.substring(cursorPos); const newCursorPos = startOfWordIndex + completedSegment.length; return { textToInsert, newCursorPos }; } else { const lcp = findLongestCommonPrefix(suggestions); if (lcp.length > currentWordPrefix.length) { const textToInsert = textBeforeCursor.substring(0, startOfWordIndex) + lcp + fullInput.substring(cursorPos); const newCursorPos = startOfWordIndex + lcp.length; OutputManager.appendToOutput(suggestions.join("    "), { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG, isCompletionSuggestion: true }); const promptText = `${DOM.promptUserSpan.textContent}${Config.TERMINAL.PROMPT_AT}${DOM.promptHostSpan.textContent}${Config.TERMINAL.PROMPT_SEPARATOR}${DOM.promptPathSpan.textContent}${Config.TERMINAL.PROMPT_CHAR} `; OutputManager.appendToOutput(`${promptText}${textBeforeCursor.substring(0, startOfWordIndex) + lcp}${fullInput.substring(cursorPos)}`, { isCompletionSuggestion: true }); if (DOM.outputDiv) DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight; return { textToInsert, newCursorPos }; } else { OutputManager.appendToOutput(suggestions.join("    "), { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG, isCompletionSuggestion: true }); const promptText = `${DOM.promptUserSpan.textContent}${Config.TERMINAL.PROMPT_AT}${DOM.promptHostSpan.textContent}${Config.TERMINAL.PROMPT_SEPARATOR}${DOM.promptPathSpan.textContent}${Config.TERMINAL.PROMPT_CHAR} `; OutputManager.appendToOutput(`${promptText}${fullInput}`,{ isCompletionSuggestion: true }); if (DOM.outputDiv) DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight; return { textToInsert: null, newCursorPos: cursorPos }; } }
    } else if (PATH_COMMANDS.includes(baseCommandForPath)) {
        if (baseCommandForPath === "grep" && tokensInitial.length < ((tokensInitial[1] && tokensInitial[1].startsWith("-")) ? 3 : 2) && !lastCharIsSpace && (startOfWordIndex <= (textBeforeCursor.indexOf(tokensInitial[1] || "") + (tokensInitial[1] || "").length))) return { textToInsert: null, newCursorPos: cursorPos };
        if (baseCommandForPath === "gemini") { if (lastCharIsSpace && tokensInitial.length === 2) return { textToInsert: null, newCursorPos: cursorPos }; if (tokensInitial.length > 2) { const endOfFirstArgInText = textBeforeCursor.indexOf(tokensInitial[1]) + tokensInitial[1].length; if (startOfWordIndex > endOfFirstArgInText) return { textToInsert: null, newCursorPos: cursorPos }; } }
        let isActivelyQuoted = false; let originalQuoteChar = ''; let contentInsideQuotes = "";
        if (currentWordPrefix.startsWith("'") && currentWordPrefix.endsWith("'") && currentWordPrefix.length >=2) { isActivelyQuoted = false; originalQuoteChar = "'"; contentInsideQuotes = currentWordPrefix.substring(1, currentWordPrefix.length - 1); }
        else if (currentWordPrefix.startsWith('"') && currentWordPrefix.endsWith('"') && currentWordPrefix.length >=2) { isActivelyQuoted = false; originalQuoteChar = '"'; contentInsideQuotes = currentWordPrefix.substring(1, currentWordPrefix.length - 1); }
        else if (currentWordPrefix.startsWith("'")) { isActivelyQuoted = true; originalQuoteChar = "'"; contentInsideQuotes = currentWordPrefix.substring(1); }
        else if (currentWordPrefix.startsWith('"')) { isActivelyQuoted = true; originalQuoteChar = '"'; contentInsideQuotes = currentWordPrefix.substring(1); }
        else { isActivelyQuoted = false; originalQuoteChar = ''; contentInsideQuotes = currentWordPrefix; }
        let pathPrefixForFS = ""; let segmentToMatchForFS = "";
        const lastSlashIndexInContent = contentInsideQuotes.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR);
        if (lastSlashIndexInContent !== -1) { pathPrefixForFS = contentInsideQuotes.substring(0, lastSlashIndexInContent + 1); segmentToMatchForFS = contentInsideQuotes.substring(lastSlashIndexInContent + 1); }
        else { pathPrefixForFS = ""; segmentToMatchForFS = contentInsideQuotes; }
        const effectiveBasePathForFS = FileSystemManager.getAbsolutePath(pathPrefixForFS, FileSystemManager.getCurrentPath());
        const baseNode = FileSystemManager.getNodeByPath(effectiveBasePathForFS); const currentUser = UserManager.getCurrentUser().name;
        if (baseNode && baseNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE && FileSystemManager.hasPermission(baseNode, currentUser, "read")) { suggestions = Object.keys(baseNode.children).filter((name) => name.startsWith(segmentToMatchForFS)).map((name) => { const childNode = baseNode.children[name]; return childNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE ? name + Config.FILESYSTEM.PATH_SEPARATOR : name; }).sort(); }
        if (suggestions.length === 0) return { textToInsert: null, newCursorPos: cursorPos };
        const textBeforeArg = textBeforeCursor.substring(0, startOfWordIndex); const textAfterCursor = fullInput.substring(cursorPos);
        if (suggestions.length === 1) { const completedNamePart = suggestions[0]; const isDirSuggestion = completedNamePart.endsWith(Config.FILESYSTEM.PATH_SEPARATOR); let finalCompletedFullArg; if (originalQuoteChar) { finalCompletedFullArg = originalQuoteChar + pathPrefixForFS + completedNamePart; if (!isDirSuggestion) finalCompletedFullArg += originalQuoteChar; } else { const fullSuggestedPathSegment = pathPrefixForFS + completedNamePart; if (fullSuggestedPathSegment.includes(" ")) { finalCompletedFullArg = "'" + fullSuggestedPathSegment; if (!isDirSuggestion) finalCompletedFullArg += "'"; } else finalCompletedFullArg = fullSuggestedPathSegment; } const spaceAfter = !isDirSuggestion; const textToInsert = textBeforeArg + finalCompletedFullArg + (spaceAfter ? " " : "") + textAfterCursor; const newCursorPos = textBeforeArg.length + finalCompletedFullArg.length + (spaceAfter ? 1 : 0); return { textToInsert, newCursorPos };
        } else { const lcpOfSuggestions = findLongestCommonPrefix(suggestions); if (lcpOfSuggestions.length > segmentToMatchForFS.length) { let completedArgPart; if (originalQuoteChar) completedArgPart = originalQuoteChar + pathPrefixForFS + lcpOfSuggestions; else completedArgPart = pathPrefixForFS + lcpOfSuggestions; const textToInsert = textBeforeArg + completedArgPart + textAfterCursor; const newCursorPos = textBeforeArg.length + completedArgPart.length; OutputManager.appendToOutput(suggestions.join("    "), { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG, isCompletionSuggestion: true }); const promptText = `${DOM.promptUserSpan.textContent}${Config.TERMINAL.PROMPT_AT}${DOM.promptHostSpan.textContent}${Config.TERMINAL.PROMPT_SEPARATOR}${DOM.promptPathSpan.textContent}${Config.TERMINAL.PROMPT_CHAR} `; OutputManager.appendToOutput(`${promptText}${textBeforeArg + completedArgPart}${textAfterCursor}`,{ isCompletionSuggestion: true }); if (DOM.outputDiv) DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight; return { textToInsert, newCursorPos }; } else { OutputManager.appendToOutput(suggestions.join("    "), { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG, isCompletionSuggestion: true }); const promptText = `${DOM.promptUserSpan.textContent}${Config.TERMINAL.PROMPT_AT}${DOM.promptHostSpan.textContent}${Config.TERMINAL.PROMPT_SEPARATOR}${DOM.promptPathSpan.textContent}${Config.TERMINAL.PROMPT_CHAR} `; OutputManager.appendToOutput(`${promptText}${fullInput}`,{ isCompletionSuggestion: true }); if (DOM.outputDiv) DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight; return { textToInsert: null, newCursorPos: cursorPos }; } }
    }
    return { textToInsert: null, newCursorPos: cursorPos };
  }
  return { getSuggestions };
})();

function initializeTerminalEventListeners() {
  if (!DOM.terminalDiv || !DOM.editableInputDiv) { console.error("Terminal event listeners cannot be initialized: Core DOM elements not found."); return; }
  DOM.terminalDiv.addEventListener("click", (e) => { if (EditorManager.isActive())  return;
  const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }
  if (!e.target.closest("button, a") && (!DOM.editableInputDiv || !DOM.editableInputDiv.contains(e.target))) { if (DOM.editableInputDiv.contentEditable === "true") TerminalUI.focusInput(); } });
  const getCurrentInputTarget = () => DOM.editableInputDiv;
  document.addEventListener("keydown", async (e) => {
    if (CommandExecutor.isScriptRunning() && !ConfirmationManager.isAwaiting()) { if (e.key === "Enter" || e.key === "Tab" || e.key.startsWith("Arrow")) e.preventDefault(); return; }
    if (EditorManager.isActive() && !ConfirmationManager.isAwaiting()) return;
    const activeInput = getCurrentInputTarget();
    if (!activeInput || (document.activeElement !== activeInput && !activeInput.contains(document.activeElement)) || activeInput.contentEditable !== "true") return;
    TerminalUI.setIsNavigatingHistory(false);
    if (e.key === "Enter") { e.preventDefault(); await CommandExecutor.processSingleCommand(TerminalUI.getCurrentInputValue(), true); }
    else if (e.key === "ArrowUp") { e.preventDefault(); const prevCmd = HistoryManager.getPrevious(); if (prevCmd !== null) { TerminalUI.setIsNavigatingHistory(true); TerminalUI.setCurrentInputValue(prevCmd, true); } }
    else if (e.key === "ArrowDown") { e.preventDefault(); const nextCmd = HistoryManager.getNext(); if (nextCmd !== null) { TerminalUI.setIsNavigatingHistory(true); TerminalUI.setCurrentInputValue(nextCmd, true); } }
    else if (e.key === "Tab") {
      e.preventDefault(); const currentInput = TerminalUI.getCurrentInputValue(); const sel = window.getSelection(); let cursorPos = 0;
      if (sel && sel.rangeCount > 0) { const range = sel.getRangeAt(0); if (DOM.editableInputDiv && DOM.editableInputDiv.contains(range.commonAncestorContainer)) { const preCaretRange = range.cloneRange(); preCaretRange.selectNodeContents(DOM.editableInputDiv); preCaretRange.setEnd(range.endContainer, range.endOffset); cursorPos = preCaretRange.toString().length; } else cursorPos = currentInput.length; } else cursorPos = currentInput.length;
      const result = TabCompletionManager.getSuggestions(currentInput, cursorPos);
      if (result?.textToInsert !== null && result.textToInsert !== undefined) { TerminalUI.setCurrentInputValue(result.textToInsert, false); TerminalUI.setCaretPosition(DOM.editableInputDiv, result.newCursorPos); }
    }
  });
  if (DOM.editableInputDiv) { DOM.editableInputDiv.addEventListener("paste", (e) => { e.preventDefault(); if (DOM.editableInputDiv.contentEditable !== "true") return; const text = (e.clipboardData || window.clipboardData).getData("text/plain"); document.execCommand("insertText", false, text.replace(/\r?\n|\r/g, " ")); }); }
}

window.onload = async () => {
  // --- FIX 1: Populate the DOM object immediately ---
  DOM = {
    terminalBezel: document.getElementById("terminal-bezel"),
    terminalDiv: document.getElementById("terminal"),
    outputDiv: document.getElementById("output"),
    inputLineContainerDiv: document.querySelector(".input-line-container"),
    promptUserSpan: document.getElementById("prompt-user"),
    promptHostSpan: document.getElementById("prompt-host"),
    promptPathSpan: document.getElementById("prompt-path"),
    editableInputContainer: document.getElementById("editable-input-container"),
    editableInputDiv: document.getElementById("editable-input"),
    adventureModal: document.getElementById('adventure-modal'),
    adventureInput: document.getElementById('adventure-input'),
  };

  // Initialize console overrides now that the DOM is ready for output.
  OutputManager.initializeConsoleOverrides();

  try {
    // --- FIX 2: Corrected Initialization Flow ---

    // 1. Initialize the database. It will log to the console if it needs to.
    await IndexedDBManager.init();

    // 2. Load the unified filesystem. This handles creating a new one on first run.
    await FileSystemManager.load();

    // 3. Load the session for the default "Guest" user.
    // The UserManager is already initialized with Guest as the current user.
    SessionManager.loadAutomaticState(Config.USER.DEFAULT_NAME);

    // 4. Set the initial path correctly after loading state.
    const guestHome = `/home/${Config.USER.DEFAULT_NAME}`;
    // If the saved path from the session is invalid, default to home or root.
    if (!FileSystemManager.getNodeByPath(FileSystemManager.getCurrentPath())) {
        if (FileSystemManager.getNodeByPath(guestHome)) {
            FileSystemManager.setCurrentPath(guestHome);
        } else {
            FileSystemManager.setCurrentPath(Config.FILESYSTEM.ROOT_PATH);
        }
    }

    // 5. Initialize the terminal UI and event listeners.
    initializeTerminalEventListeners();
    TerminalUI.updatePrompt(); // Update prompt with correct user and path.
    TerminalUI.focusInput();

    console.log(`${Config.OS.NAME} v.${Config.OS.VERSION} loaded successfully!`);

  } catch (error) {
    console.error("Failed to initialize OopisOs on window.onload:", error, error.stack);
    // A last-ditch effort to display the error in the terminal UI itself.
    if (DOM.outputDiv) {
        DOM.outputDiv.innerHTML += `<div class="text-red-500">FATAL ERROR: ${error.message}. Check console for details.</div>`;
    }
  }
};
