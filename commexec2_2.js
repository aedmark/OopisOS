// commexec.js - OopisOS Command Executor v2.2 (Fully Refactored)

const CommandExecutor = (() => {
  "use strict";
  let scriptExecutionInProgress = false;
  let backgroundProcessIdCounter = 0;
  let geminiConversationHistory = [];

  // REFACTORED: System prompt is now cleaner and more direct.
  const GEMINI_SYSTEM_PROMPT = `You are a helpful and witty digital librarian embedded in the OopisOS terminal environment. Your goal is to assist the user by answering their questions.

You have access to a set of tools (OopisOS shell commands) that you can use to explore the user's virtual file system to gather information for your answers.

When the user asks a question, you must first determine if running one or more shell commands would be helpful.
- If the file system contains relevant information, plan and execute the necessary commands. Then, synthesize an answer based on the command output.
- If the request is a general knowledge question not related to the user's files, answer it directly without using any tools.
- Do not make up file paths or content. Only use information returned from the tools.
- Be friendly and conversational in your final response.`;


  async function _handleUserSwitch(commandName, targetUser, providedPassword) {
    return new Promise(async (resolve) => {
        const initialLoginAttempt = await UserManager.login(targetUser, providedPassword);

        if (initialLoginAttempt.requiresPasswordPrompt) {
            // --- BUG FIX STARTS HERE ---
            // Replaced the non-existent 'PasswordPromptManager' with the correct 'ModalInputManager'.
            // Added the 'isObscured = true' argument to hide password input.
            ModalInputManager.requestInput(
                Config.MESSAGES.PASSWORD_PROMPT,
                async (password) => {
                    const finalLoginResult = await UserManager.login(targetUser, password);
                    if (finalLoginResult.success && !finalLoginResult.noAction) {
                        OutputManager.clearOutput();
                        const welcomeMsg = commandName === 'login' ? `${Config.MESSAGES.WELCOME_PREFIX} ${targetUser}${Config.MESSAGES.WELCOME_SUFFIX}` : `Switched to user: ${targetUser}`;
                        OutputManager.appendToOutput(welcomeMsg);
                    }
                    resolve({
                        success: finalLoginResult.success,
                        output: finalLoginResult.message,
                        error: finalLoginResult.success ? undefined : finalLoginResult.error || "Login failed.",
                        messageType: finalLoginResult.success ? Config.CSS_CLASSES.SUCCESS_MSG : Config.CSS_CLASSES.ERROR_MSG,
                    });
                },
                () => { // onCancel callback
                    resolve({
                        success: true,
                        output: Config.MESSAGES.OPERATION_CANCELLED,
                        messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
                    });
                },
                true // <<< isObscured: true
            );
            // --- BUG FIX ENDS HERE ---
        } else {
            if (initialLoginAttempt.success && !initialLoginAttempt.noAction) {
                OutputManager.clearOutput();
                const welcomeMsg = commandName === 'login' ? `${Config.MESSAGES.WELCOME_PREFIX} ${targetUser}${Config.MESSAGES.WELCOME_SUFFIX}` : `Switched to user: ${targetUser}`;
                OutputManager.appendToOutput(welcomeMsg);
            }
            resolve({
                success: initialLoginAttempt.success,
                output: initialLoginAttempt.message,
                error: initialLoginAttempt.success ? undefined : initialLoginAttempt.error || "Login failed.",
                messageType: initialLoginAttempt.success ? Config.CSS_CLASSES.SUCCESS_MSG : Config.CSS_CLASSES.ERROR_MSG,
            });
        }
    });
  }
  
  function createCommandHandler(definition) {
    // This returned function is the new command handler
    return async (args, options) => {
      const { flags, remainingArgs } = Utils.parseFlags(args, definition.flagDefinitions || []);
      const currentUser = UserManager.getCurrentUser().name;
      
      // 1. Argument Count Validation (uses remainingArgs after flags)
      if (definition.argValidation) {
        const validationResult = Utils.validateArguments(remainingArgs, definition.argValidation);
        if (!validationResult.isValid) {
           const customError = definition.argValidation.error;
           const finalError = customError ? `${definition.commandName || ''}: ${customError}`.trim() : `${definition.commandName || ''}: ${validationResult.errorDetail}`.trim();
           return { success: false, error: finalError };
        }
      }

      const validatedPaths = {};

      // 2. Path Validation
      if (definition.pathValidation) {
        for (const pv of definition.pathValidation) {
            const pathArg = remainingArgs[pv.argIndex];
            // Handle optional path arguments that are not provided
            if (pathArg === undefined) {
                if (pv.optional) {
                    continue; // Skip validation for this optional, missing path
                }
                 return { success: false, error: `${definition.commandName}: Missing expected path argument at index ${pv.argIndex}.` };
            }

            const pathValidationResult = FileSystemManager.validatePath(definition.commandName || "command", pathArg, pv.options);

            if (pathValidationResult.error) {
                // Special case: if allowMissing is true and the node just doesn't exist, it's not an error yet.
                if (!(pv.options.allowMissing && !pathValidationResult.node)) {
                     return { success: false, error: pathValidationResult.error };
                }
            }
            validatedPaths[pv.argIndex] = pathValidationResult;
        }
      }

      // 3. Permission Validation
      if (definition.permissionChecks) {
          for (const pc of definition.permissionChecks) {
              const validatedPath = validatedPaths[pc.pathArgIndex];
              // If the path was optional and not provided, validatedPath will be undefined. Skip permission check.
              if (!validatedPath) {
                  continue;
              }
              // If allowMissing was true for the path, the node might not exist.
              // If we require permissions, the node must exist.
              if (!validatedPath.node) {
                  return { success: false, error: `${definition.commandName || ''}: '${remainingArgs[pc.pathArgIndex]}': No such file or directory to check permissions.`};
              }

              for (const perm of pc.permissions) {
                  if (!FileSystemManager.hasPermission(validatedPath.node, currentUser, perm)) {
                      return { success: false, error: `${definition.commandName || ''}: '${remainingArgs[pc.pathArgIndex]}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}` };
                  }
              }
          }
      }

      // 4. Execute Core Logic
      const context = {
        args: remainingArgs, // Pass flag-less args to core logic
        options,
        flags, // Pass parsed flags
        currentUser,
        validatedPaths
      };

      return definition.coreLogic(context);
    };
  }

const geminiCommandDefinition = {
    commandName: "gemini",
    flagDefinitions: [
      { name: "new", short: "-n", long: "--new" },
    ],
    argValidation: {
      min: 1,
      error: "Insufficient arguments. Usage: gemini [-n|--new] \"<prompt>\""
    },
    coreLogic: async (context) => {
      const { args, options, flags } = context;

      const _getApiKey = () => {
        return new Promise((resolve, reject) => {
          let apiKey = StorageManager.loadItem(Config.STORAGE_KEYS.GEMINI_API_KEY, "Gemini API Key");
          if (apiKey) {
            resolve(apiKey);
            return;
          }
          if (options.isInteractive) {
            ModalInputManager.requestInput(
              "Please enter your Gemini API key. It will be saved locally for future use.",
              (providedKey) => {
                if (!providedKey) {
                  reject(new Error("API key cannot be empty."));
                  return;
                }
                StorageManager.saveItem(Config.STORAGE_KEYS.GEMINI_API_KEY, providedKey, "Gemini API Key");
                OutputManager.appendToOutput("API Key saved to local storage.", { typeClass: Config.CSS_CLASSES.SUCCESS_MSG });
                resolve(providedKey);
              },
              () => { reject(new Error("API key entry cancelled.")); },
              false
            );
          } else {
             reject(new Error("gemini: API key not set. Please run interactively to set it."));
          }
        });
      };
      
      const _callGeminiApi = async (apiKey, conversationHistory) => {
        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`;
        const OopisOS_TOOLS = [{
            function_declarations: [
                { name: "ls", description: "Lists directory contents or file information.", parameters: { type: "OBJECT", properties: { path: { type: "STRING", description: "The path of the directory or file to list. Defaults to the current directory." } } } },
                { name: "cat", description: "Concatenates and displays file content.", parameters: { type: "OBJECT", properties: { path: { type: "STRING", description: "The path to the file whose content should be displayed." } } } },
                { name: "pwd", description: "Prints the current working directory path.", parameters: { type: "OBJECT", properties: {} } },
                { name: "find", description: "Searches for files in a directory hierarchy.", parameters: { type: "OBJECT", properties: { path: { type: "STRING", description: "The starting path for the search." }, expression: { type: "STRING", description: "The search expression (e.g., '-name \"*.txt\"')." } } } },
                { name: "grep", description: "Searches for patterns within files.", parameters: { type: "OBJECT", properties: { pattern: { type: "STRING", description: "The pattern to search for." }, path: { type: "STRING", description: "The path of the file or directory to search in." } } } },
                { name: "tree", description: "Lists directory contents in a tree-like format.", parameters: { type: "OBJECT", properties: { path: { type: "STRING", description: "The path of the directory to display as a tree. Defaults to the current directory." } } } }
            ]
        }];
        const payload = {
            contents: conversationHistory,
            tools: OopisOS_TOOLS,
            system_instruction: { parts: [{ text: GEMINI_SYSTEM_PROMPT }] }
        };
        
        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
                body: JSON.stringify(payload)
            });

            const responseBody = await response.json().catch(() => null);

            if (!response.ok) {
                if (response.status === 400 && responseBody?.error?.message.includes("API key not valid")) {
                    throw new Error("INVALID_API_KEY");
                }
                throw new Error(`API request failed with status ${response.status}. ${responseBody?.error?.message || response.statusText}`);
            }
            return responseBody;

        } catch (e) {
            if (e.message === "INVALID_API_KEY") throw e;
            console.error("Gemini API: Network or fetch error.", e);
            throw new Error(`Network request failed: ${e.message}`);
        }
      };
      
      let apiKey;
      try {
        apiKey = await _getApiKey();
      } catch (e) {
        return { success: false, error: `gemini: ${e.message}` };
      }
      
      const userPrompt = args.join(" ");
      if (userPrompt.trim() === "") {
        return { success: false, error: "gemini: Prompt cannot be empty." };
      }

      if (flags.new) {
        geminiConversationHistory = [];
        if (options.isInteractive) {
            OutputManager.appendToOutput("Starting a new conversation with Gemini.", { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG });
        }
      }

      geminiConversationHistory.push({ role: "user", parts: [{ text: userPrompt }] });

      try {
        if (options.isInteractive && geminiConversationHistory.length <= 1) {
          OutputManager.appendToOutput("Gemini is thinking...", { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG });
        }
        
        while (true) {
            const result = await _callGeminiApi(apiKey, geminiConversationHistory);
            
            if (!result || result.error) {
                throw new Error(result?.error?.message || "Failed to get a valid response from API.");
            }

            const candidate = result.candidates?.[0];

            if (!candidate || !candidate.content || !candidate.content.parts) {
                const blockReason = result.promptFeedback?.blockReason;
                if (blockReason) {
                    geminiConversationHistory.pop(); 
                    return { success: false, error: `gemini: Prompt was blocked. Reason: ${blockReason}.` };
                }
                return { success: false, error: "gemini: Received an invalid or empty response from the API." };
            }
            
            let textResponse = "";
            let functionCall = null;

            for (const part of candidate.content.parts) {
                if (part.text) {
                    textResponse += part.text;
                } else if (part.functionCall) {
                    functionCall = part.functionCall;
                    break; 
                }
            }

            const modelResponseTurn = { role: "model", parts: candidate.content.parts };

            if (functionCall) {
                geminiConversationHistory.push(modelResponseTurn);
                if (textResponse && options.isInteractive) {
                    OutputManager.appendToOutput(textResponse);
                }

                if (options.isInteractive) {
                    const funcName = functionCall.name;
                    const funcArgs = JSON.stringify(functionCall.args || {});
                    OutputManager.appendToOutput(`Gemini is exploring with: ${funcName}(${funcArgs})`, { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG });
                }
                
                const commandName = functionCall.name;
                const commandArgs = Object.values(functionCall.args || {}).map(arg => typeof arg === 'string' ? `"${arg}"` : arg).join(" ");
                const fullCommandStr = `${commandName} ${commandArgs}`.trim();
                const execResult = await CommandExecutor.processSingleCommand(fullCommandStr, false);

                geminiConversationHistory.push({
                    role: "function",
                    parts: [{
                        functionResponse: {
                            name: commandName,
                            response: {
                                content: execResult.success 
                                    ? (execResult.output || "(No output from command)") 
                                    : `Error: ${execResult.error || "Command failed"}`
                            }
                        }
                    }]
                });

            } else if (textResponse) {
                geminiConversationHistory.push(modelResponseTurn);
                return { success: true, output: textResponse };
            } else {
                geminiConversationHistory.pop();
                return { success: false, error: "gemini: Received an empty or unsupported response." };
            }
        }
      } catch (e) {
        geminiConversationHistory.pop();

        if (e.message === "INVALID_API_KEY") {
            StorageManager.removeItem(Config.STORAGE_KEYS.GEMINI_API_KEY);
            return { 
                success: false, 
                error: "gemini: Your API key is invalid. It has been removed. Please run the command again to enter a new key." 
            };
        }

        console.error("Gemini Command Error:", e);
        return { success: false, error: `gemini: An error occurred. ${e.message}` };
      }
    }
  };

  const helpCommandDefinition = {
  commandName: "help",
  argValidation: {
    max: 1,
  },
  coreLogic: async (context) => {
    const { args } = context;
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
      if (commands[cmdName]?.helpText) {
        output = commands[cmdName].helpText;
      } else if (commands[cmdName]) {
        output = `No detailed help for '${cmdName}'.\nDesc: ${commands[cmdName].description || "N/A"}`;
      } else {
        return {
          success: false,
          error: `help: '${args[0]}' not found.`
        };
      }
    }
    return {
      success: true,
      output: output
    };
  }
  };

  const echoCommandDefinition = {
  commandName: "echo",
  coreLogic: async (context) => {
    return {
      success: true,
      output: context.args.join(" ")
    };
  }
  };

  const rebootCommandDefinition = {
    commandName: "reboot",
    argValidation: {
      exact: 0
    },
    coreLogic: async (context) => {
      await OutputManager.appendToOutput("Rebooting OopisOS (reloading browser page and clearing cache)...", {
        typeClass: Config.CSS_CLASSES.SUCCESS_MSG,
      });

      setTimeout(() => {
        window.location.reload(true);
      }, 500); 

      return {
        success: true,
        output: null
      };
    }
  };

  const dateCommandDefinition = {
  commandName: "date",
  argValidation: {
    exact: 0
  },
  coreLogic: async (context) => {
    return {
      success: true,
      output: new Date().toString()
    };
  }
  };

  const pwdCommandDefinition = {
  commandName: "pwd",
  argValidation: {
    exact: 0
  },
  coreLogic: async (context) => {
    return {
      success: true,
      output: FileSystemManager.getCurrentPath()
    };
  }
  };

  const cdCommandDefinition = {
  commandName: "cd",
  argValidation: {
    exact: 1,
    error: "incorrect number of arguments"
  },
  pathValidation: [{
    argIndex: 0,
    options: {
      expectedType: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
    }
  }],
  permissionChecks: [{
    pathArgIndex: 0,
    permissions: ['execute']
  }],
  coreLogic: async (context) => {
    const { options } = context;
    const pathInfo = context.validatedPaths[0];

    if (FileSystemManager.getCurrentPath() === pathInfo.resolvedPath) {
      return {
        success: true,
        output: `${Config.MESSAGES.ALREADY_IN_DIRECTORY_PREFIX}${pathInfo.resolvedPath}${Config.MESSAGES.ALREADY_IN_DIRECTORY_SUFFIX} ${Config.MESSAGES.NO_ACTION_TAKEN}`,
        messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
      };
    }

    FileSystemManager.setCurrentPath(pathInfo.resolvedPath);
    if (options.isInteractive) {
      TerminalUI.updatePrompt();
    }

    return {
      success: true,
      output: ""
    };
  }
  };

  const mvCommandDefinition = {
  commandName: "mv",
  flagDefinitions: [
      { name: "force", short: "-f", long: "--force" },
      { name: "interactive", short: "-i", long: "--interactive" },
  ],
  argValidation: {
      exact: 2,
  },
  coreLogic: async (context) => {
    const { args, currentUser, flags } = context;

    const sourcePathArg = args[0];
    const destPathArg = args[1];
    const nowISO = new Date().toISOString();
    const isInteractiveEffective = flags.interactive && !flags.force;

    const sourceValidation = FileSystemManager.validatePath("mv (source)", sourcePathArg, { disallowRoot: true });
    if (sourceValidation.error) return { success: false, error: sourceValidation.error };
    const sourceNode = sourceValidation.node;
    const absSourcePath = sourceValidation.resolvedPath;

    const sourceParentPath = absSourcePath.substring(0, absSourcePath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR)) || Config.FILESYSTEM.ROOT_PATH;
    const sourceParentNode = FileSystemManager.getNodeByPath(sourceParentPath);

    if (!sourceParentNode || !FileSystemManager.hasPermission(sourceParentNode, currentUser, "write")) {
      return { success: false, error: `mv: cannot move '${sourcePathArg}' from '${sourceParentPath}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}` };
    }

    const destValidation = FileSystemManager.validatePath("mv (destination)", destPathArg, { allowMissing: true });
    if (destValidation.error && !(destValidation.optionsUsed.allowMissing && !destValidation.node)) {
      return { success: false, error: destValidation.error };
    }

    let absDestPath = destValidation.resolvedPath;
    let destNode = destValidation.node;
    const sourceName = absSourcePath.substring(absSourcePath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1);
    let finalDestName = sourceName;
    let targetContainerNode;
    let targetContainerAbsPath;

    if (destNode && destNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
      targetContainerNode = destNode;
      targetContainerAbsPath = absDestPath;
      absDestPath = FileSystemManager.getAbsolutePath(sourceName, absDestPath);
      destNode = targetContainerNode.children[sourceName];
    } else {
      targetContainerAbsPath = absDestPath.substring(0, absDestPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR)) || Config.FILESYSTEM.ROOT_PATH;
      targetContainerNode = FileSystemManager.getNodeByPath(targetContainerAbsPath);
      finalDestName = absDestPath.substring(absDestPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1);
    }

    if (!targetContainerNode || targetContainerNode.type !== Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
      return { success: false, error: `mv: target '${targetContainerAbsPath}' is not a directory or does not exist.` };
    }
    if (!FileSystemManager.hasPermission(targetContainerNode, currentUser, "write")) {
      return { success: false, error: `mv: cannot create item in '${targetContainerAbsPath}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}` };
    }
    if (absSourcePath === absDestPath) {
      return { success: true, output: `mv: '${sourcePathArg}' and '${destPathArg}' are the same file. ${Config.MESSAGES.NO_ACTION_TAKEN}`, messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG };
    }

    if (destNode) {
      if (sourceNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE && destNode.type !== Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
        return { success: false, error: `mv: cannot overwrite non-directory '${absDestPath}' with directory '${sourcePathArg}'` };
      }
      if (sourceNode.type !== Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE && destNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
        return { success: false, error: `mv: cannot overwrite directory '${absDestPath}' with non-directory '${sourcePathArg}'` };
      }
      if (isInteractiveEffective) {
        const confirmed = await new Promise((resolve) => {
          ModalManager.request({ context: 'terminal', messageLines: [`Overwrite '${absDestPath}'?`], onConfirm: () => resolve(true), onCancel: () => resolve(false) });
        });
        if (!confirmed) return { success: true, output: `${Config.MESSAGES.OPERATION_CANCELLED} No changes made.`, messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG };
      } else if (!flags.force) {
        return { success: false, error: `mv: '${absDestPath}' already exists. Use -f to overwrite or -i to prompt.` };
      }
    }

    if (sourceNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE && absDestPath.startsWith(absSourcePath + Config.FILESYSTEM.PATH_SEPARATOR)) {
      return { success: false, error: `mv: cannot move '${sourcePathArg}' to a subdirectory of itself, '${absDestPath}'` };
    }

    const movedNode = Utils.deepCopyNode(sourceNode);
    movedNode.mtime = nowISO;
    targetContainerNode.children[finalDestName] = movedNode;
    targetContainerNode.mtime = nowISO;
    
    if (sourceParentNode && sourceParentNode.children && sourceParentNode.children[sourceName]) {
      delete sourceParentNode.children[sourceName];
      sourceParentNode.mtime = nowISO;
    } else {
      delete targetContainerNode.children[finalDestName];
      console.error(Config.INTERNAL_ERRORS.SOURCE_NOT_FOUND_IN_PARENT_PREFIX + sourceName + Config.INTERNAL_ERRORS.SOURCE_NOT_FOUND_IN_PARENT_MIDDLE + sourceParentPath + Config.INTERNAL_ERRORS.SOURCE_NOT_FOUND_IN_PARENT_SUFFIX);
      return { success: false, error: `mv: Internal error - source item not found for removal after copy part of move.` };
    }

    if (!(await FileSystemManager.save(currentUser))) {
      return { success: false, error: "mv: Failed to save file system changes." };
    }
    return { success: true, output: `${Config.MESSAGES.MOVED_PREFIX}${sourcePathArg}${Config.MESSAGES.MOVED_TO}'${absDestPath}'${Config.MESSAGES.MOVED_SUFFIX}`, messageType: Config.CSS_CLASSES.SUCCESS_MSG };
  }
  };

  const editCommandDefinition = {
  commandName: "edit",
  argValidation: {
    exact: 1,
    error: "expects exactly one filename."
  },
  pathValidation: [{
    argIndex: 0,
    options: {
      allowMissing: true,
      disallowRoot: true,
      expectedType: 'file'
    }
  }],
  permissionChecks: [{
    pathArgIndex: 0,
    permissions: ['read']
  }],
  coreLogic: async (context) => {
    const { options, validatedPaths } = context;
    if (!options.isInteractive) {
      return { success: false, error: "edit: Can only be run in interactive mode." };
    }

    const pathInfo = validatedPaths[0];
    const resolvedPath = pathInfo.resolvedPath;
    const content = pathInfo.node ? pathInfo.node.content || "" : "";

    EditorManager.enter(resolvedPath, content);

    return {
      success: true,
      output: `Opening editor for '${resolvedPath}'...`,
      messageType: Config.CSS_CLASSES.EDITOR_MSG,
    };
  }
  };

  const useraddCommandDefinition = {
    commandName: "useradd",
    argValidation: { exact: 1, error: "expects exactly one argument (username)" },
    coreLogic: async (context) => {
      const { args } = context;
      const username = args[0];

      const userCheck = StorageManager.loadItem(Config.STORAGE_KEYS.USER_CREDENTIALS, "User list", {});
      if (userCheck[username]) {
        return { success: false, error: `User '${username}' already exists.` };
      }

      try {
        const firstPassword = await new Promise((resolve, reject) => {
          ModalInputManager.requestInput(
            Config.MESSAGES.PASSWORD_PROMPT,
            (pwd) => resolve(pwd),
            () => reject(new Error(Config.MESSAGES.OPERATION_CANCELLED)),
            true // <<< isObscured: true
          );
        });

        if (firstPassword.trim() === '') {
          OutputManager.appendToOutput("Registering user with no password.", { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG });
        } else {
            const confirmedPassword = await new Promise((resolve, reject) => {
                ModalInputManager.requestInput(
                Config.MESSAGES.PASSWORD_CONFIRM_PROMPT,
                (pwd) => resolve(pwd),
                () => reject(new Error(Config.MESSAGES.OPERATION_CANCELLED)),
                true // <<< isObscured: true
                );
            });

            if (firstPassword !== confirmedPassword) {
                return { success: false, error: Config.MESSAGES.PASSWORD_MISMATCH };
            }
        }
        
        const registerResult = await UserManager.register(username, firstPassword || null);
        
        // Add the missing confirmation message on success
        if(registerResult.success) {
            OutputManager.appendToOutput(registerResult.message, { typeClass: Config.CSS_CLASSES.SUCCESS_MSG });
            return { success: true, output: "" }; // Return empty output as message is already printed
        } else {
            return { success: false, error: registerResult.error };
        }

      } catch (e) {
        if (e.message === Config.MESSAGES.OPERATION_CANCELLED) {
          return { success: true, output: Config.MESSAGES.OPERATION_CANCELLED, messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG };
        }
        return { success: false, error: `useradd: ${e.message}` };
      }
    }
  };

  const loginCommandDefinition = {
  commandName: "login",
  argValidation: {
    min: 1,
    max: 2,
    error: "Usage: login <username> [password]"
  },
  coreLogic: async (context) => {
    const { args } = context;
    const username = args[0];
    const providedPassword = args.length === 2 ? args[1] : null;
    return _handleUserSwitch('login', username, providedPassword);
  }
  };

  const logoutCommandDefinition = {
  commandName: "logout",
  argValidation: {
    exact: 0
  },
  coreLogic: async (context) => {
    const result = await UserManager.logout();
    if (result.success && !result.noAction) {
      OutputManager.clearOutput();
      OutputManager.appendToOutput(
        `${Config.MESSAGES.WELCOME_PREFIX} ${UserManager.getCurrentUser().name}${Config.MESSAGES.WELCOME_SUFFIX}`,
      );
    }
    return {
      ...result,
      output: result.message,
      messageType: result.success ?
        Config.CSS_CLASSES.SUCCESS_MSG : Config.CSS_CLASSES.CONSOLE_LOG_MSG,
    };
  }
  };

  const whoamiCommandDefinition = {
  commandName: "whoami",
  argValidation: {
    exact: 0
  },
  coreLogic: async (context) => {
    return {
      success: true,
      output: UserManager.getCurrentUser().name
    };
  }
  };

  const exportCommandDefinition = {
  commandName: "export",
  argValidation: {
    exact: 1,
    error: "expects exactly one file path."
  },
  pathValidation: [{
    argIndex: 0,
    options: {
      expectedType: Config.FILESYSTEM.DEFAULT_FILE_TYPE
    }
  }],
  permissionChecks: [{
    pathArgIndex: 0,
    permissions: ['read']
  }],
  coreLogic: async (context) => {
    const pathInfo = context.validatedPaths[0];
    const fileNode = pathInfo.node;
    const fileName = pathInfo.resolvedPath.substring(pathInfo.resolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1);

    try {
      const blob = new Blob([fileNode.content || ""], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = Utils.createElement("a", { href: url, download: fileName });
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
      return { success: false, error: `export: Failed to download '${fileName}': ${e.message}` };
    }
  }
  };

  const backupCommandDefinition = {
    commandName: "backup",
    argValidation: {
      exact: 0
    },
    coreLogic: async (context) => {
      const currentUser = UserManager.getCurrentUser();
      const allKeys = StorageManager.getAllLocalStorageKeys();
      const automaticSessionStates = {};
      const manualSaveStates = {};

      // Gather all session state keys from localStorage
      allKeys.forEach(key => {
          if (key.startsWith(Config.STORAGE_KEYS.USER_TERMINAL_STATE_PREFIX)) {
              automaticSessionStates[key] = StorageManager.loadItem(key);
          } else if (key.startsWith(Config.STORAGE_KEYS.MANUAL_TERMINAL_STATE_PREFIX)) {
              manualSaveStates[key] = StorageManager.loadItem(key);
          }
      });

      // Construct the comprehensive backup object
      const backupData = {
        dataType: "OopisOS_System_State_Backup_v2.2", // Added a data type for validation
        osVersion: Config.OS.VERSION,
        timestamp: new Date().toISOString(),
        fsDataSnapshot: Utils.deepCopyNode(FileSystemManager.getFsData()),
        userCredentials: StorageManager.loadItem(Config.STORAGE_KEYS.USER_CREDENTIALS, "User Credentials", {}),
        editorWordWrapEnabled: StorageManager.loadItem(Config.STORAGE_KEYS.EDITOR_WORD_WRAP_ENABLED, "Editor Word Wrap", false),
        automaticSessionStates: automaticSessionStates,
        manualSaveStates: manualSaveStates,
      };

      const fileName = `OopisOS_System_Backup_${currentUser.name}_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;

      try {
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = Utils.createElement("a", { href: url, download: fileName });
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
        return { success: false, error: `backup: Failed to create or download backup file: ${e.message}` };
      }
    }
  };

  const savefsCommandDefinition = {
  commandName: "savefs",
  argValidation: {
    exact: 0
  },
  coreLogic: async (context) => {
    const { currentUser } = context; 
    if (await FileSystemManager.save()) {
      return { success: true, output: `File system for '${currentUser}' saved.`, messageType: Config.CSS_CLASSES.SUCCESS_MSG };
    } else {
      return { success: false, error: "savefs: Failed to save file system." };
    }
  }
  };

  const suCommandDefinition = {
  commandName: "su",
  argValidation: {
    max: 1
  },
  coreLogic: async (context) => {
    const { args, currentUser } = context;
    const targetUser = args.length > 0 ? args[0] : 'root';

    if (currentUser === targetUser) {
      return { success: true, output: `Already user '${currentUser}'.`, messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG };
    }
    return _handleUserSwitch('su', targetUser, null);
  }
  };

  const clearfsCommandDefinition = {
  commandName: "clearfs",
  argValidation: {
    exact: 0
  },
  coreLogic: async (context) => {
    const { options, currentUser } = context;

    if (!options.isInteractive) {
      return { success: false, error: "clearfs: Can only be run in interactive mode." };
    }

    const username = currentUser;
    const userHomePath = `/home/${username}`;

    const confirmed = await new Promise((resolve) =>
      ModalManager.request({
        context: 'terminal',
        messageLines: [
          `WARNING: This will permanently erase ALL files and directories in your home directory (${userHomePath}).`,
          "This action cannot be undone.",
          "Are you sure you want to clear your home directory?",
        ],
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      }),
    );

    if (!confirmed) {
      return { success: true, output: `Home directory clear for '${username}' cancelled. No action taken.`, messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG };
    }

    const homeDirNode = FileSystemManager.getNodeByPath(userHomePath);
    if (!homeDirNode || homeDirNode.type !== Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
      return { success: false, error: `clearfs: Critical error - Could not find home directory for '${username}' at '${userHomePath}'.` };
    }

    homeDirNode.children = {};
    homeDirNode.mtime = new Date().toISOString();

    if (!(await FileSystemManager.save())) {
      return { success: false, error: "clearfs: CRITICAL - Failed to save file system changes after clearing home directory." };
    }

    const currentPath = FileSystemManager.getCurrentPath();
    if (currentPath.startsWith(userHomePath)) {
      FileSystemManager.setCurrentPath(userHomePath);
    }

    TerminalUI.updatePrompt();
    OutputManager.clearOutput();

    const successMessage = `Home directory for user '${username}' has been cleared.`;
    OutputManager.appendToOutput(successMessage, { typeClass: Config.CSS_CLASSES.SUCCESS_MSG });

    return { success: true, output: "" };
  }
  };

  const savestateCommandDefinition = {
  commandName: "savestate",
  argValidation: {
    exact: 0
  },
  coreLogic: async (context) => {
    const result = await SessionManager.saveManualState();
    if (result.success) {
      return { success: true, output: result.message, messageType: Config.CSS_CLASSES.SUCCESS_MSG };
    } else {
      return { success: false, error: result.error, messageType: Config.CSS_CLASSES.ERROR_MSG };
    }
  }
  };

  const loadstateCommandDefinition = {
  commandName: "loadstate",
  argValidation: {
    exact: 0
  },
  coreLogic: async (context) => {
    const result = await SessionManager.loadManualState();
    return {
      success: result.success,
      output: result.message,
      error: result.success ? undefined : result.message || "Failed to load state.",
      messageType: result.success ? Config.CSS_CLASSES.CONSOLE_LOG_MSG : Config.CSS_CLASSES.ERROR_MSG,
    };
  }
  };

  const resetCommandDefinition = {
  commandName: "reset",
  argValidation: {
    exact: 0
  },
  coreLogic: async (context) => {
    const { options } = context;

    if (!options.isInteractive) {
      return { success: false, error: "reset: Can only be run interactively." };
    }
    
    const confirmed = await new Promise((resolve) =>
      ModalManager.request({
        context: 'terminal',
        messageLines: ["WARNING: This will erase ALL OopisOS data, including all users, file systems, and saved states. This action cannot be undone. Are you sure?"],
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      }),
    );

    if (confirmed) {
      await SessionManager.performFullReset();
      return { success: true, output: "OopisOS reset to initial state. Please refresh the page if UI issues persist.", messageType: Config.CSS_CLASSES.SUCCESS_MSG };
    } else {
      return { success: true, output: `Reset cancelled. ${Config.MESSAGES.NO_ACTION_TAKEN}`, messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG };
    }
  }
  };

  const runCommandDefinition = {
  commandName: "run",
  argValidation: {
    min: 1
  },
  pathValidation: [{
    argIndex: 0,
    options: {
      expectedType: Config.FILESYSTEM.DEFAULT_FILE_TYPE
    }
  }],
  permissionChecks: [{
    pathArgIndex: 0,
    permissions: ['read', 'execute']
  }],
  coreLogic: async (context) => {
    const { args, options } = context;
    const scriptPathArg = args[0];
    const scriptArgs = args.slice(1);
    const scriptNode = context.validatedPaths[0].node;

    const fileExtension = Utils.getFileExtension(scriptPathArg);
    if (fileExtension !== "sh") {
      return { success: false, error: `run: '${scriptPathArg}' is not a shell script (.sh) file.` };
    }

    if (!scriptNode.content) {
      return { success: true, output: `run: Script '${scriptPathArg}' is empty.` };
    }

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
        } else if (char === '"' && (i === 0 || processedLine[i - 1] !== "\\")) {
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
      if (processedLine !== "") commandsToRun.push(processedLine);
    }

    if (CommandExecutor.isScriptRunning() && options.isInteractive) {
      return { success: false, error: "run: Cannot execute a script while another is already running in interactive mode." };
    }

    let overallScriptSuccess = true;
    const previousScriptExecutionState = CommandExecutor.isScriptRunning();
    CommandExecutor.setScriptExecutionInProgress(true);
    if (options.isInteractive) TerminalUI.setInputState(false);

    for (const commandLine of commandsToRun) {
      let processedCommandLineWithArgs = commandLine;
      for (let i = 0; i < scriptArgs.length; i++) {
        const regex = new RegExp(`\\$${i + 1}`, "g");
        processedCommandLineWithArgs = processedCommandLineWithArgs.replace(regex, scriptArgs[i]);
      }
      processedCommandLineWithArgs = processedCommandLineWithArgs.replace(/\$@/g, scriptArgs.join(" "));
      processedCommandLineWithArgs = processedCommandLineWithArgs.replace(/\$#/g, scriptArgs.length.toString());

      if (processedCommandLineWithArgs.trim() === "") continue;

      const result = await CommandExecutor.processSingleCommand(processedCommandLineWithArgs, false);

      if (!result) {
        const undefErrorMsg = `Script '${scriptPathArg}' execution halted: A command returned an undefined result. Last command: ${commandLine}`;
        await OutputManager.appendToOutput(undefErrorMsg, { typeClass: Config.CSS_CLASSES.ERROR_MSG });
        console.error("Critical Error: processSingleCommand returned undefined for command:", commandLine);
        overallScriptSuccess = false;
        break;
      }

      if (!result.success) {
        let scriptErrorMsg = `Script '${scriptPathArg}' error on line: ${commandLine}\nError: ${result.error || "Unknown error in command."}`;
        if (result.output && typeof result.output === "string" && result.output.trim() !== (result.error || "").trim()) {
          scriptErrorMsg += `\nDetails: ${result.output}`;
        }
        await OutputManager.appendToOutput(scriptErrorMsg, { typeClass: Config.CSS_CLASSES.ERROR_MSG });
        overallScriptSuccess = false;
        break;
      }
    }

    CommandExecutor.setScriptExecutionInProgress(previousScriptExecutionState);
    if (options.isInteractive && !CommandExecutor.isScriptRunning()) {
      TerminalUI.setInputState(true);
    }

    if (overallScriptSuccess) {
      return { success: true, output: null };
    } else {
      return { success: false, error: `Script '${scriptPathArg}' failed.` };
    }
  }
  };

  const delayCommandDefinition = {
  commandName: "delay",
  argValidation: {
    exact: 1
  },
  coreLogic: async (context) => {
    const { args, options } = context;

    const parsedArg = Utils.parseNumericArg(args[0], { allowFloat: false, allowNegative: false, min: 1 });
    if (parsedArg.error) {
      return { success: false, error: `delay: Invalid delay time '${args[0]}': ${parsedArg.error}. Must be a positive integer.` };
    }
    const ms = parsedArg.value;

    if (options.isInteractive && !CommandExecutor.isScriptRunning()) {
      OutputManager.appendToOutput(`Delaying for ${ms}ms...`, { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG });
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        if (options.isInteractive && !CommandExecutor.isScriptRunning()) {
          OutputManager.appendToOutput(`Delay complete.`, { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG });
        }
        resolve({ success: true, output: "" });
      }, ms);
    });
  }
  };

  const check_failCommandDefinition = {
  commandName: "check_fail",
  argValidation: {
    exact: 1,
    error: "expects exactly one argument (a command string)"
  },
  coreLogic: async (context) => {
    const { args } = context;
    const commandToTest = args[0];

    if (typeof commandToTest !== "string" || commandToTest.trim() === "") {
      return { success: false, error: "check_fail: command string argument cannot be empty" };
    }

    const testResult = await CommandExecutor.processSingleCommand(commandToTest, false);

    if (testResult.success) {
      const failureMessage = `CHECK_FAIL: FAILURE - Command <${commandToTest}> unexpectedly SUCCEEDED.`;
      return { success: false, error: failureMessage };
    } else {
      const successMessage = `CHECK_FAIL: SUCCESS - Command <${commandToTest}> failed as expected. (Error: ${testResult.error || "N/A"})`;
      return { success: true, output: successMessage };
    }
  }
  };

  const removeuserCommandDefinition = {
  commandName: "removeuser",
  argValidation: {
    exact: 1,
    error: "Usage: removeuser <username>"
  },
  coreLogic: async (context) => {
    const { args, currentUser } = context;
    const usernameToRemove = args[0];

    if (usernameToRemove === currentUser) {
      return { success: false, error: "removeuser: You cannot remove yourself." };
    }
    if (usernameToRemove === Config.USER.DEFAULT_NAME) {
      return { success: false, error: `removeuser: Cannot remove the default '${Config.USER.DEFAULT_NAME}' user.` };
    }

    const users = StorageManager.loadItem(Config.STORAGE_KEYS.USER_CREDENTIALS, "User list", {});
    if (!users.hasOwnProperty(usernameToRemove)) {
      return { success: true, output: `removeuser: User '${usernameToRemove}' does not exist. No action taken.`, messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG };
    }

    const confirmed = await new Promise((resolve) => {
      ModalManager.request({
        context: 'terminal',
        messageLines: [`WARNING: This will permanently remove user '${usernameToRemove}' and all their data (home directory, saved sessions). This cannot be undone. Are you sure?`],
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });

    if (!confirmed) {
      return { success: true, output: `Removal of user '${usernameToRemove}' cancelled.`, messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG };
    }

    let allDeletionsSuccessful = true;
    let errorMessages = [];
    let changesMade = false;

    const userHomePath = `/home/${usernameToRemove}`;
    if (FileSystemManager.getNodeByPath(userHomePath)) {
      const rmResult = await FileSystemManager.deleteNodeRecursive(userHomePath, { force: true, currentUser: currentUser });
      if (!rmResult.success) {
        allDeletionsSuccessful = false;
        errorMessages.push(...rmResult.messages);
      }
      if (rmResult.anyChangeMade) {
        changesMade = true;
      }
    }

    if (!SessionManager.clearUserSessionStates(usernameToRemove)) {
      allDeletionsSuccessful = false;
      errorMessages.push("Failed to clear user session states and credentials.");
    }

    if (changesMade) {
        await FileSystemManager.save();
    }

    if (allDeletionsSuccessful) {
      return { success: true, output: `User '${usernameToRemove}' and all associated data have been removed.`, messageType: Config.CSS_CLASSES.SUCCESS_MSG };
    } else {
      return { success: false, error: `removeuser: Failed to completely remove user '${usernameToRemove}'. Details: ${errorMessages.join("; ")}` };
    }
  }
  };

  const chmodCommandDefinition = {
  commandName: "chmod",
  argValidation: {
    exact: 2,
    error: "Usage: chmod <mode> <path>"
  },
  pathValidation: [{
    argIndex: 1
  }],
  permissionChecks: [{
    pathArgIndex: 1,
    permissions: ['write']
  }],
  coreLogic: async (context) => {
    const { args, currentUser, validatedPaths } = context;
    const modeArg = args[0];
    const pathArg = args[1];
    const pathInfo = validatedPaths[1];
    const node = pathInfo.node;
    const nowISO = new Date().toISOString();

    if (!/^[0-7]{2}$/.test(modeArg)) {
      return { success: false, error: `chmod: invalid mode '${modeArg}'. Use two octal digits (e.g., 75 for rwxr-x, 64 for rw-r--).` };
    }
    const newMode = parseInt(modeArg, 8);

    node.mode = newMode;
    node.mtime = nowISO;
    FileSystemManager._updateNodeAndParentMtime(pathInfo.resolvedPath, nowISO);

    if (!(await FileSystemManager.save(currentUser))) {
      return { success: false, error: "chmod: Failed to save file system changes." };
    }

    return { success: true, output: `Permissions of '${pathArg}' changed to ${modeArg}`, messageType: Config.CSS_CLASSES.SUCCESS_MSG };
  }
  };

  const chownCommandDefinition = {
  commandName: "chown",
  argValidation: {
    exact: 2,
    error: "Usage: chown <new_owner> <path>"
  },
  pathValidation: [{
    argIndex: 1,
  }],
  permissionChecks: [{
    pathArgIndex: 1,
    permissions: ['write']
  }],
  coreLogic: async (context) => {
    const { args, currentUser, validatedPaths } = context;
    const newOwnerArg = args[0];
    const pathArg = args[1];
    const pathInfo = validatedPaths[1];
    const node = pathInfo.node;
    const nowISO = new Date().toISOString();

    const users = StorageManager.loadItem(Config.STORAGE_KEYS.USER_CREDENTIALS, "User list", {});

    if (!users[newOwnerArg] && newOwnerArg !== Config.USER.DEFAULT_NAME) {
      return { success: false, error: `chown: user '${newOwnerArg}' does not exist.` };
    }
    if (node.owner !== currentUser && currentUser !== 'root') {
      return { success: false, error: `chown: changing ownership of '${pathArg}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX} (not owner)` };
    }

    node.owner = newOwnerArg;
    node.mtime = nowISO;
    FileSystemManager._updateNodeAndParentMtime(pathInfo.resolvedPath, nowISO);

    if (!(await FileSystemManager.save(currentUser))) {
      return { success: false, error: "chown: Failed to save file system changes." };
    }
    return { success: true, output: `Owner of '${pathArg}' changed to ${newOwnerArg}`, messageType: Config.CSS_CLASSES.SUCCESS_MSG };
  }
  };

  const listusersCommandDefinition = {
  commandName: "listusers",
  argValidation: {
    exact: 0
  },
  coreLogic: async (context) => {
    const users = StorageManager.loadItem(Config.STORAGE_KEYS.USER_CREDENTIALS, "User list", {});
    const userNames = Object.keys(users);

    if (!userNames.includes(Config.USER.DEFAULT_NAME)) {
      userNames.push(Config.USER.DEFAULT_NAME);
    }
    userNames.sort();

    if (userNames.length === 0)
      return { success: true, output: "No users registered.", messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG };

    return { success: true, output: "Registered users:\n" + userNames.map((u) => `  ${u}`).join("\n") };
  }
  };

  const clearCommandDefinition = {
    commandName: "clear",
    argValidation: {
      exact: 0
    },
    coreLogic: async (context) => {
      if (context.options.isInteractive) {
        OutputManager.clearOutput();
      }
      return { success: true, output: "" };
    }
  };

  const printscreenCommandDefinition = {
  commandName: "printscreen",
  argValidation: {
    exact: 1,
    error: "Usage: printscreen <filepath>"
  },
  pathValidation: [{
    argIndex: 0,
    options: {
      allowMissing: true,
      disallowRoot: true,
    }
  }],
  coreLogic: async (context) => {
    const { args, currentUser, validatedPaths } = context;
    const filePathArg = args[0];
    const pathInfo = validatedPaths[0];
    const resolvedPath = pathInfo.resolvedPath;
    const nowISO = new Date().toISOString();

    if (resolvedPath === Config.FILESYSTEM.ROOT_PATH) {
      return { success: false, error: `printscreen: Cannot save directly to root ('${Config.FILESYSTEM.ROOT_PATH}'). Please specify a filename.` };
    }
    if (resolvedPath.endsWith(Config.FILESYSTEM.PATH_SEPARATOR)) {
      return { success: false, error: `printscreen: Target path '${filePathArg}' must be a file, not a directory path (ending with '${Config.FILESYSTEM.PATH_SEPARATOR}').` };
    }

    const outputContent = DOM.outputDiv ? DOM.outputDiv.innerText : "";
    const existingNode = pathInfo.node;

    if (existingNode) {
      if (existingNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
        return { success: false, error: `printscreen: Cannot overwrite directory '${filePathArg}'.` };
      }
      if (!FileSystemManager.hasPermission(existingNode, currentUser, "write")) {
        return { success: false, error: `printscreen: '${filePathArg}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}` };
      }
      existingNode.content = outputContent;
    } else {
      const parentDirResult = FileSystemManager.createParentDirectoriesIfNeeded(resolvedPath);
      if (parentDirResult.error) {
        return { success: false, error: `printscreen: ${parentDirResult.error}` };
      }
      const parentNodeForCreation = parentDirResult.parentNode;
      const fileName = resolvedPath.substring(resolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1);

      if (!parentNodeForCreation) {
        console.error("printscreen: parentNodeForCreation is null despite createParentDirectoriesIfNeeded success.");
        return { success: false, error: `printscreen: Critical internal error obtaining parent directory for '${filePathArg}'.` };
      }

      if (!FileSystemManager.hasPermission(parentNodeForCreation, currentUser, "write")) {
        return { success: false, error: `printscreen: Cannot create file in '${FileSystemManager.getAbsolutePath(fileName, parentNodeForCreation.path)}', permission denied in parent.` };
      }

      parentNodeForCreation.children[fileName] = {
        type: Config.FILESYSTEM.DEFAULT_FILE_TYPE,
        content: outputContent,
        owner: currentUser,
        mode: Config.FILESYSTEM.DEFAULT_FILE_MODE,
        mtime: nowISO,
      };
    }

    FileSystemManager._updateNodeAndParentMtime(resolvedPath, nowISO);

    if (!await FileSystemManager.save(currentUser)) {
      return { success: false, error: "printscreen: Failed to save file system changes." };
    }

    return { success: true, output: `Terminal output saved to '${resolvedPath}'`, messageType: Config.CSS_CLASSES.SUCCESS_MSG };
  }
  };

  const adventureCommandDefinition = {
  commandName: "adventure",
  argValidation: {
    max: 1,
    error: "Usage: adventure [path_to_adventure_file.json]"
  },
  pathValidation: [{
    argIndex: 0,
    optional: true,
    options: {
      allowMissing: true,
      expectedType: Config.FILESYSTEM.DEFAULT_FILE_TYPE
    }
  }],
  coreLogic: async (context) => {
    const { args, currentUser, validatedPaths } = context;

    if (typeof TextAdventureModal === 'undefined' || typeof TextAdventureModal.isActive !== 'function') {
      return { success: false, error: "Adventure UI (TextAdventureModal) is not available. Check console for JS errors." };
    }
    if (typeof TextAdventureEngine === 'undefined' || typeof TextAdventureEngine.startAdventure !== 'function') {
      return { success: false, error: "Adventure Engine (TextAdventureEngine) is not available. Check console for JS errors." };
    }
    if (TextAdventureModal.isActive()) {
      return { success: false, error: "An adventure is already in progress. Type 'quit' or 'exit' in the adventure window to leave the current game." };
    }

    let adventureToLoad;
    if (typeof window.sampleAdventure !== 'undefined') {
      adventureToLoad = window.sampleAdventure;
    } else {
      console.warn("adventure command: window.sampleAdventure not found, using minimal fallback. Ensure adventure.js loads and defines it globally.");
      adventureToLoad = { title: "Fallback Sample Adventure", startingRoomId: "room1", rooms: { "room1": { id: "room1", name: "A Plain Room", description: "You are in a plain room. There are no exits.", exits: {} } }, items: {} };
    }

    if (args.length > 0) {
      const filePath = args[0];
      const pathInfo = validatedPaths[0];
      
      if (pathInfo.error) return { success: false, error: pathInfo.error };
      
      const fileNode = pathInfo.node;
      if (fileNode) {
        if (!FileSystemManager.hasPermission(fileNode, currentUser, "read")) {
          return { success: false, error: `adventure: Cannot read file '${filePath}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}` };
        }
        try {
          const parsedAdventure = JSON.parse(fileNode.content);
          if (!parsedAdventure.rooms || !parsedAdventure.startingRoomId || !parsedAdventure.items) {
            throw new Error("Invalid adventure file format. Missing essential parts like rooms, items, or startingRoomId.");
          }
          if (!parsedAdventure.title) parsedAdventure.title = filePath;
          adventureToLoad = parsedAdventure;
        } catch (e) {
          return { success: false, error: `adventure: Error parsing adventure file '${filePath}': ${e.message}` };
        }
      } else {
         return { success: false, error: `adventure: File not found at '${filePath}'.` };
      }
    }

    TextAdventureEngine.startAdventure(adventureToLoad);
    return { success: true, output: `Launching adventure: "${adventureToLoad.title || 'Untitled Adventure'}"...\n(Game interaction now happens in the adventure modal.)`, messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG };
  }
  };

  const lsCommandDefinition = {
    commandName: "ls",
    flagDefinitions: [
      { name: "long", short: "-l", long: "--long" },
      { name: "all", short: "-a", long: "--all" },
      { name: "recursive", short: "-R", long: "--recursive" },
      { name: "reverseSort", short: "-r", long: "--reverse" },
      { name: "sortByTime", short: "-t" },
      { name: "sortBySize", short: "-S" },
      { name: "sortByExtension", short: "-X" },
      { name: "noSort", short: "-U" },
      { name: "dirsOnly", short: "-d" }
    ],
    coreLogic: async (context) => {
        const { args, flags, currentUser } = context;

        function getItemDetails(itemName, itemNode, itemPath) {
          if (!itemNode) return null;
          return { name: itemName, path: itemPath, node: itemNode, type: itemNode.type, owner: itemNode.owner || "unknown", mode: itemNode.mode, mtime: itemNode.mtime ? new Date(itemNode.mtime) : new Date(0), size: FileSystemManager.calculateNodeSize(itemNode), extension: Utils.getFileExtension(itemName), linkCount: 1 };
        }

        function formatLongListItem(itemDetails) {
          const perms = FileSystemManager.formatModeToString(itemDetails.node);
          const owner = itemDetails.owner.padEnd(10);
          const size = Utils.formatBytes(itemDetails.size).padStart(8);
          let dateStr = "            ";
          if (itemDetails.mtime && itemDetails.mtime.getTime() !== 0) {
            const d = itemDetails.mtime;
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            dateStr = `${months[d.getMonth()].padEnd(3)} ${d.getDate().toString().padStart(2, " ")} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
          }
          const nameSuffix = (itemDetails.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE && !flags.dirsOnly) ? Config.FILESYSTEM.PATH_SEPARATOR : "";
          return `${perms}  ${String(itemDetails.linkCount).padStart(2)} ${owner} ${size} ${dateStr} ${itemDetails.name}${nameSuffix}`;
        }

        function sortItems(items, currentFlags) {
            let sortedItems = [...items];
            if (currentFlags.noSort) {}
            else if (currentFlags.sortByTime) { sortedItems.sort((a, b) => b.mtime - a.mtime || a.name.localeCompare(b.name)); }
            else if (currentFlags.sortBySize) { sortedItems.sort((a, b) => b.size - a.size || a.name.localeCompare(b.name)); }
            else if (currentFlags.sortByExtension) { sortedItems.sort((a, b) => { const extComp = a.extension.localeCompare(b.extension); if (extComp !== 0) return extComp; return a.name.localeCompare(b.name); }); }
            else { sortedItems.sort((a, b) => a.name.localeCompare(b.name)); }
            if (currentFlags.reverseSort) { sortedItems.reverse(); }
            return sortedItems;
        }

        const pathsToList = args.length > 0 ? args : [FileSystemManager.getCurrentPath()];
        let outputBlocks = [];
        let overallSuccess = true;

        async function listSinglePathContents(targetPathArg, effectiveFlags) {
            const pathValidation = FileSystemManager.validatePath("ls", targetPathArg);
            if (pathValidation.error) return { success: false, output: pathValidation.error };

            const targetNode = pathValidation.node;
            if (!FileSystemManager.hasPermission(targetNode, currentUser, "read")) {
                return { success: false, output: `ls: cannot access '${targetPathArg}': Permission denied` };
            }

            let itemDetailsList = [];
            let singleItemResultOutput = null;

            if (effectiveFlags.dirsOnly && targetNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
                const details = getItemDetails(targetPathArg, targetNode, pathValidation.resolvedPath);
                if (details) singleItemResultOutput = effectiveFlags.long ? formatLongListItem(details) : details.name;
                else return { success: false, output: `ls: cannot stat '${targetPathArg}': Error retrieving details` };
            } else if (targetNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
                const childrenNames = Object.keys(targetNode.children);
                for (const name of childrenNames) {
                    if (!effectiveFlags.all && name.startsWith(".")) continue;
                    const details = getItemDetails(name, targetNode.children[name], FileSystemManager.getAbsolutePath(name, pathValidation.resolvedPath));
                    if (details) itemDetailsList.push(details);
                }
                itemDetailsList = sortItems(itemDetailsList, effectiveFlags);
            } else {
                const fileName = pathValidation.resolvedPath.substring(pathValidation.resolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1);
                const details = getItemDetails(fileName, targetNode, pathValidation.resolvedPath);
                if (details) singleItemResultOutput = effectiveFlags.long ? formatLongListItem(details) : details.name;
                else return { success: false, output: `ls: cannot stat '${targetPathArg}': Error retrieving details` };
            }

            let currentPathOutputLines = [];
            if (singleItemResultOutput !== null) {
                currentPathOutputLines.push(singleItemResultOutput);
            } else if (targetNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE && !effectiveFlags.dirsOnly) {
                if (effectiveFlags.long && itemDetailsList.length > 0) currentPathOutputLines.push(`total ${itemDetailsList.length}`);
                itemDetailsList.forEach((item) => {
                    const nameSuffix = item.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE ? Config.FILESYSTEM.PATH_SEPARATOR : "";
                    currentPathOutputLines.push(effectiveFlags.long ? formatLongListItem(item) : `${item.name}${nameSuffix}`);
                });
            }
            return { success: true, output: currentPathOutputLines.join("\n"), items: itemDetailsList };
        }

        async function displayRecursive(currentPath, displayFlags, depth = 0) {
            let blockOutputs = [];
            let encounteredErrorInThisBranch = false;
            if (depth > 0 || pathsToList.length > 1) blockOutputs.push(`${currentPath}:`);

            const listResult = await listSinglePathContents(currentPath, displayFlags);
            if (!listResult.success) {
                blockOutputs.push(listResult.output);
                encounteredErrorInThisBranch = true;
                return { outputs: blockOutputs, encounteredError: encounteredErrorInThisBranch };
            }
            if (listResult.output) blockOutputs.push(listResult.output);

            if (listResult.items && FileSystemManager.getNodeByPath(currentPath)?.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
                const subdirectories = listResult.items.filter(item => item.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE && item.name !== "." && item.name !== "..");
                for (const dirItem of subdirectories) {
                    if (blockOutputs.length > 0) blockOutputs.push("");
                    const subDirResult = await displayRecursive(dirItem.path, displayFlags, depth + 1);
                    blockOutputs = blockOutputs.concat(subDirResult.outputs);
                    if (subDirResult.encounteredError) encounteredErrorInThisBranch = true;
                }
            }
            return { outputs: blockOutputs, encounteredError: encounteredErrorInThisBranch };
        }
        
        if (flags.recursive) {
            for (let i = 0; i < pathsToList.length; i++) {
                const path = pathsToList[i];
                const recursiveResult = await displayRecursive(path, flags);
                outputBlocks = outputBlocks.concat(recursiveResult.outputs);
                if (recursiveResult.encounteredError) overallSuccess = false;
                if (i < pathsToList.length - 1) outputBlocks.push("");
            }
        } else {
            for (let i = 0; i < pathsToList.length; i++) {
                const path = pathsToList[i];
                if (pathsToList.length > 1) {
                    if (i > 0) outputBlocks.push("");
                    outputBlocks.push(`${path}:`);
                }
                const listResult = await listSinglePathContents(path, flags);
                if (!listResult.success) overallSuccess = false;
                if (listResult.output) outputBlocks.push(listResult.output);
            }
        }
        return { success: overallSuccess, output: outputBlocks.join("\n") };
    }
  };

  const mkdirCommandDefinition = {
    commandName: "mkdir",
    flagDefinitions: [{ name: "parents", short: "-p", long: "--parents" }],
    argValidation: { min: 1 },
    coreLogic: async (context) => {
        const { args, flags, currentUser } = context;
        let allSuccess = true;
        const messages = [];
        let changesMade = false;
        const nowISO = new Date().toISOString();

        for (const pathArg of args) {
            const resolvedPath = FileSystemManager.getAbsolutePath(pathArg, FileSystemManager.getCurrentPath());
            const dirName = resolvedPath.substring(resolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1);

            if (resolvedPath === Config.FILESYSTEM.ROOT_PATH || dirName === "" || dirName === "." || dirName === "..") {
                messages.push(`mkdir: cannot create directory '${pathArg}': Invalid path or name`);
                allSuccess = false;
                continue;
            }

            let parentNodeToCreateIn;
            if (flags.parents) {
                const parentDirResult = FileSystemManager.createParentDirectoriesIfNeeded(resolvedPath);
                if (parentDirResult.error) {
                    messages.push(`mkdir: ${parentDirResult.error}`);
                    allSuccess = false;
                    continue;
                }
                parentNodeToCreateIn = parentDirResult.parentNode;
            } else {
                const parentPathForTarget = resolvedPath.substring(0, resolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR)) || Config.FILESYSTEM.ROOT_PATH;
                parentNodeToCreateIn = FileSystemManager.getNodeByPath(parentPathForTarget);
                if (!parentNodeToCreateIn) {
                    messages.push(`mkdir: cannot create directory '${pathArg}': Parent directory '${parentPathForTarget}' does not exist`);
                    allSuccess = false;
                    continue;
                }
                if (parentNodeToCreateIn.type !== Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
                    messages.push(`mkdir: cannot create directory '${pathArg}': Path component '${parentPathForTarget}' is not a directory`);
                    allSuccess = false;
                    continue;
                }
                if (!FileSystemManager.hasPermission(parentNodeToCreateIn, currentUser, "write")) {
                    messages.push(`mkdir: cannot create directory '${pathArg}' in '${parentPathForTarget}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`);
                    allSuccess = false;
                    continue;
                }
            }
            
            if (parentNodeToCreateIn.children && parentNodeToCreateIn.children[dirName]) {
                const existingItem = parentNodeToCreateIn.children[dirName];
                if (existingItem.type === Config.FILESYSTEM.DEFAULT_FILE_TYPE) {
                    messages.push(`mkdir: cannot create directory '${pathArg}': File exists`);
                    allSuccess = false;
                } else if (existingItem.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE && !flags.parents) {
                    messages.push(`mkdir: cannot create directory '${pathArg}': Directory already exists.`);
                    allSuccess = false;
                }
            } else {
                parentNodeToCreateIn.children[dirName] = { type: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE, children: {}, owner: currentUser, mode: Config.FILESYSTEM.DEFAULT_DIR_MODE, mtime: nowISO };
                parentNodeToCreateIn.mtime = nowISO;
                messages.push(`created directory '${pathArg}'`);
                changesMade = true;
            }
        }

        if (changesMade && !(await FileSystemManager.save(currentUser))) {
            allSuccess = false;
            messages.unshift("mkdir: Failed to save file system changes.");
        }
        if (!allSuccess) {
            return { success: false, error: messages.join("\n") };
        }
        return { success: true, output: messages.join("\n"), messageType: Config.CSS_CLASSES.SUCCESS_MSG };
    }
  };

  const treeCommandDefinition = {
    commandName: "tree",
    flagDefinitions: [
        { name: "level", short: "-L", long: "--level", takesValue: true },
        { name: "dirsOnly", short: "-d", long: "--dirs-only" },
    ],
    argValidation: { max: 1 },
    coreLogic: async (context) => {
        const { args, flags, currentUser } = context;
        const pathArg = args.length > 0 ? args[0] : ".";
        const maxDepth = flags.level ? Utils.parseNumericArg(flags.level, { min: 0 }) : { value: Infinity };

        if (flags.level && (maxDepth.error || maxDepth.value === null))
            return { success: false, error: `tree: invalid level value for -L: '${flags.level}' ${maxDepth.error || ""}` };

        const pathValidation = FileSystemManager.validatePath("tree", pathArg, { expectedType: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE });
        if (pathValidation.error) return { success: false, error: pathValidation.error };
        if (!FileSystemManager.hasPermission(pathValidation.node, currentUser, "read"))
            return { success: false, error: `tree: '${pathArg}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}` };
        
        const outputLines = [pathValidation.resolvedPath];
        let dirCount = 0;
        let fileCount = 0;

        function buildTreeRecursive(currentDirPath, currentDepth, indentPrefix) {
            if (currentDepth > maxDepth.value) return;
            const node = FileSystemManager.getNodeByPath(currentDirPath);
            if (!node || node.type !== Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) return;
            if (currentDepth > 1 && !FileSystemManager.hasPermission(node, currentUser, "read")) {
                outputLines.push(indentPrefix + "└── [Permission Denied]");
                return;
            }
            const childrenNames = Object.keys(node.children).sort();
            childrenNames.forEach((childName, index) => {
                const childNode = node.children[childName];
                if (childNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
                    dirCount++;
                    outputLines.push(indentPrefix + (index === childrenNames.length - 1 ? "└── " : "├── ") + childName + Config.FILESYSTEM.PATH_SEPARATOR);
                    if (currentDepth < maxDepth.value)
                        buildTreeRecursive(FileSystemManager.getAbsolutePath(childName, currentDirPath), currentDepth + 1, indentPrefix + (index === childrenNames.length - 1 ? "    " : "│   "));
                } else if (!flags.dirsOnly) {
                    fileCount++;
                    outputLines.push(indentPrefix + (index === childrenNames.length - 1 ? "└── " : "├── ") + childName);
                }
            });
        }
        buildTreeRecursive(pathValidation.resolvedPath, 1, "");
        outputLines.push("");
        let report = `${dirCount} director${dirCount === 1 ? "y" : "ies"}`;
        if (!flags.dirsOnly) report += `, ${fileCount} file${fileCount === 1 ? "" : "s"}`;
        outputLines.push(report);
        return { success: true, output: outputLines.join("\n") };
    }
  };

  const touchCommandDefinition = {
    commandName: "touch",
    flagDefinitions: [
        { name: "noCreate", short: "-c", long: "--no-create" },
        { name: "dateString", short: "-d", long: "--date", takesValue: true },
        { name: "stamp", short: "-t", takesValue: true },
    ],
    argValidation: { min: 1 },
    coreLogic: async (context) => {
        const { args, flags, currentUser } = context;
        const timestampResult = TimestampParser.resolveTimestampFromCommandFlags(flags, "touch");
        if (timestampResult.error) return { success: false, error: timestampResult.error };
        
        const timestampToUse = timestampResult.timestampISO;
        const nowActualISO = new Date().toISOString();
        let allSuccess = true;
        const messages = [];
        let changesMade = false;

        for (const pathArg of args) {
            const pathValidation = FileSystemManager.validatePath("touch", pathArg, { allowMissing: true, disallowRoot: true });
            if (pathValidation.node) {
                if (!FileSystemManager.hasPermission(pathValidation.node, currentUser, "write")) {
                    messages.push(`touch: cannot update timestamp of '${pathArg}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`);
                    allSuccess = false;
                    continue;
                }
                pathValidation.node.mtime = timestampToUse;
                changesMade = true;
            } else if (pathValidation.error) {
                messages.push(pathValidation.error);
                allSuccess = false;
            } else { // Node does not exist and no error
                if (flags.noCreate) continue;
                if (pathArg.trim().endsWith(Config.FILESYSTEM.PATH_SEPARATOR)) {
                    messages.push(`touch: cannot touch '${pathArg}': No such file or directory`);
                    allSuccess = false;
                    continue;
                }
                const parentPath = pathValidation.resolvedPath.substring(0, pathValidation.resolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR)) || Config.FILESYSTEM.ROOT_PATH;
                const parentNode = FileSystemManager.getNodeByPath(parentPath);
                if (!parentNode || parentNode.type !== Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
                    messages.push(`touch: cannot create '${pathArg}': Parent directory not found or is not a directory.`);
                    allSuccess = false;
                    continue;
                }
                if (!FileSystemManager.hasPermission(parentNode, currentUser, 'write')) {
                    messages.push(`touch: cannot create '${pathArg}': Permission denied in parent directory.`);
                    allSuccess = false;
                    continue;
                }
                const fileName = pathValidation.resolvedPath.substring(pathValidation.resolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1);
                const newFileNode = FileSystemManager._createNewFileNode(fileName, "", currentUser);
                newFileNode.mtime = timestampToUse;
                parentNode.children[fileName] = newFileNode;
                parentNode.mtime = nowActualISO;
                changesMade = true;
            }
        }

        if (changesMade && !(await FileSystemManager.save(currentUser))) {
            messages.push("touch: CRITICAL - Failed to save file system changes.");
            allSuccess = false;
        }

        const outputMessage = messages.join("\n");
        if (!allSuccess) return { success: false, error: outputMessage || "touch: Not all operations were successful." };
        return { success: true, output: "" };
    }
  };
  
  const catCommandDefinition = {
    commandName: "cat",
    coreLogic: async (context) => {
        const { args, options, currentUser } = context;
        if (args.length === 0 && (options.stdinContent === null || options.stdinContent === undefined)) {
            return { success: true, output: "" };
        }
        
        let outputContent = "";
        let firstFile = true;
        if (options.stdinContent !== null && options.stdinContent !== undefined) {
            outputContent += options.stdinContent;
            firstFile = false;
        }

        for (const pathArg of args) {
            const pathValidation = FileSystemManager.validatePath("cat", pathArg, { expectedType: Config.FILESYSTEM.DEFAULT_FILE_TYPE });
            if (pathValidation.error) return { success: false, error: pathValidation.error };
            if (!FileSystemManager.hasPermission(pathValidation.node, currentUser, "read"))
                return { success: false, error: `cat: '${pathArg}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}` };
            
            if (!firstFile && outputContent && !outputContent.endsWith("\n")) outputContent += "\n";
            outputContent += pathValidation.node.content || "";
            firstFile = false;
        }
        return { success: true, output: outputContent };
    }
  };

  const rmCommandDefinition = {
    commandName: "rm",
    flagDefinitions: [
      { name: "recursive", short: "-r", long: "--recursive", aliases: ["-R"] },
      { name: "force", short: "-f", long: "--force" }
    ],
    argValidation: { min: 1, error: "missing operand" },
    coreLogic: async (context) => {
        const { args, flags, currentUser, options } = context;
        let allSuccess = true;
        let anyChangeMade = false;
        const messages = [];

        for (const pathArg of args) {
            const pathValidation = FileSystemManager.validatePath("rm", pathArg, { disallowRoot: true });
            
            if (flags.force && !pathValidation.node) continue;
            if (pathValidation.error) {
                messages.push(pathValidation.error);
                allSuccess = false;
                continue;
            }

            const node = pathValidation.node;
            if (node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE && !flags.recursive) {
                messages.push(`rm: cannot remove '${pathArg}': Is a directory (use -r or -R)`);
                allSuccess = false;
                continue;
            }
            
            let confirmed = flags.force;
            if (!confirmed && options.isInteractive) {
                const promptMsg = node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE ? `Recursively remove directory '${pathArg}'?` : `Remove file '${pathArg}'?`;
                confirmed = await new Promise((resolve) => {
                    ModalManager.request({ context: 'terminal', messageLines: [promptMsg], onConfirm: () => resolve(true), onCancel: () => resolve(false) });
                });
            } else if (!confirmed && !options.isInteractive) {
                 // Non-interactive without -f implies no confirmation
                 messages.push(`rm: removal of '${pathArg}' requires confirmation in non-interactive mode (use -f)`);
                 allSuccess = false;
                 continue;
            }

            if (confirmed) {
                const deleteResult = await FileSystemManager.deleteNodeRecursive(pathArg, { force: true, currentUser });
                if (deleteResult.success) {
                    if (deleteResult.anyChangeMade) anyChangeMade = true;
                } else {
                    allSuccess = false;
                    messages.push(...deleteResult.messages);
                }
            } else {
                messages.push(`${Config.MESSAGES.REMOVAL_CANCELLED_PREFIX}'${pathArg}'${Config.MESSAGES.REMOVAL_CANCELLED_SUFFIX}`);
            }
        }

        if (anyChangeMade) await FileSystemManager.save();
        
        const finalOutput = messages.filter((m) => m).join("\n");
        return { success: allSuccess, output: finalOutput, error: allSuccess ? null : (finalOutput || "Unknown error during rm operation.") };
    }
  };

  const cpCommandDefinition = {
    commandName: "cp",
    flagDefinitions: [
        { name: "recursive", short: "-r", long: "--recursive", aliases: ["-R"] },
        { name: "force", short: "-f", long: "--force" },
        { name: "preserve", short: "-p", long: "--preserve" },
        { name: "interactive", short: "-i", long: "--interactive" },
    ],
    argValidation: { min: 2 },
    coreLogic: async (context) => {
        const { args, flags, currentUser } = context;
        const nowISO = new Date().toISOString();
        flags.isInteractiveEffective = flags.interactive && !flags.force;

        const rawDestPathArg = args.pop();
        const sourcePathArgs = args;
        let operationMessages = [];
        let overallSuccess = true;
        let anyChangesMadeGlobal = false;

        async function _executeCopyInternal(sourceNode, sourcePathForMsg, targetContainerAbsPath, targetEntryName, currentCommandFlags) {
            let currentOpMessages = [];
            let currentOpSuccess = true;
            let madeChangeInThisCall = false;
            const targetContainerNode = FileSystemManager.getNodeByPath(targetContainerAbsPath);

            if (!targetContainerNode || targetContainerNode.type !== Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
                return { success: false, messages: [`cp: target '${targetContainerAbsPath}' is not a directory.`], changesMade: false };
            }
            if (!FileSystemManager.hasPermission(targetContainerNode, currentUser, "write")) {
                return { success: false, messages: [`cp: cannot create item in '${targetContainerAbsPath}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`], changesMade: false };
            }

            const fullFinalDestPath = FileSystemManager.getAbsolutePath(targetEntryName, targetContainerAbsPath);
            let existingNodeAtDest = targetContainerNode.children[targetEntryName];

            if (existingNodeAtDest) {
                if (sourceNode.type !== existingNodeAtDest.type) {
                    return { success: false, messages: [`cp: cannot overwrite ${existingNodeAtDest.type} '${fullFinalDestPath}' with ${sourceNode.type} '${sourcePathForMsg}'`], changesMade: false };
                }
                if (currentCommandFlags.isInteractiveEffective) {
                    const confirmed = await new Promise(r => ModalManager.request({ context: 'terminal', messageLines: [`Overwrite '${fullFinalDestPath}'?`], onConfirm: () => r(true), onCancel: () => r(false) }));
                    if (!confirmed) return { success: true, messages: [`cp: not overwriting '${fullFinalDestPath}' (skipped)`], changesMade: false };
                } else if (!currentCommandFlags.force) {
                    return { success: false, messages: [`cp: '${fullFinalDestPath}' already exists. Use -f to overwrite or -i to prompt.`], changesMade: false };
                }
            }

            if (sourceNode.type === Config.FILESYSTEM.DEFAULT_FILE_TYPE) {
                const newFileNode = { type: Config.FILESYSTEM.DEFAULT_FILE_TYPE, content: sourceNode.content, owner: currentCommandFlags.preserve ? sourceNode.owner : currentUser, mode: currentCommandFlags.preserve ? sourceNode.mode : Config.FILESYSTEM.DEFAULT_FILE_MODE, mtime: currentCommandFlags.preserve ? sourceNode.mtime : nowISO };
                targetContainerNode.children[targetEntryName] = newFileNode;
                targetContainerNode.mtime = nowISO;
                madeChangeInThisCall = true;
            } else if (sourceNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
                if (!currentCommandFlags.recursive) {
                    return { success: true, messages: [`cp: omitting directory '${sourcePathForMsg}' (use -r or -R)`], changesMade: false };
                }
                let destDirNode = existingNodeAtDest || { type: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE, children: {}, owner: currentCommandFlags.preserve ? sourceNode.owner : currentUser, mode: currentCommandFlags.preserve ? sourceNode.mode : Config.FILESYSTEM.DEFAULT_DIR_MODE, mtime: currentCommandFlags.preserve ? sourceNode.mtime : nowISO };
                targetContainerNode.children[targetEntryName] = destDirNode;
                targetContainerNode.mtime = nowISO;
                madeChangeInThisCall = true;

                for (const childName in sourceNode.children) {
                    const childCopyResult = await _executeCopyInternal(sourceNode.children[childName], FileSystemManager.getAbsolutePath(childName, sourcePathForMsg), fullFinalDestPath, childName, currentCommandFlags);
                    currentOpMessages.push(...childCopyResult.messages);
                    if (!childCopyResult.success) currentOpSuccess = false;
                    if (childCopyResult.changesMade) madeChangeInThisCall = true;
                }
            }
            return { success: currentOpSuccess, messages: currentOpMessages, changesMade: madeChangeInThisCall };
        }

        const destValidation = FileSystemManager.validatePath("cp (dest)", rawDestPathArg, { allowMissing: true });
        if (destValidation.error && !(destValidation.optionsUsed.allowMissing && !destValidation.node)) {
            return { success: false, error: destValidation.error };
        }
        const isDestADirectory = destValidation.node && destValidation.node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE;
        if (sourcePathArgs.length > 1 && !isDestADirectory) {
            return { success: false, error: `cp: target '${rawDestPathArg}' is not a directory` };
        }

        for (const sourcePathArg of sourcePathArgs) {
            const sourceValidation = FileSystemManager.validatePath("cp (source)", sourcePathArg);
            if (sourceValidation.error) {
                operationMessages.push(sourceValidation.error);
                overallSuccess = false; continue;
            }
            if (!FileSystemManager.hasPermission(sourceValidation.node, currentUser, "read")) {
                operationMessages.push(`cp: cannot read '${sourcePathArg}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`);
                overallSuccess = false; continue;
            }
            let targetContainerAbsPath, targetEntryName;
            if (isDestADirectory) {
                targetContainerAbsPath = destValidation.resolvedPath;
                targetEntryName = sourceValidation.resolvedPath.substring(sourceValidation.resolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1);
            } else {
                targetContainerAbsPath = destValidation.resolvedPath.substring(0, destValidation.resolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR)) || Config.FILESYSTEM.ROOT_PATH;
                targetEntryName = destValidation.resolvedPath.substring(destValidation.resolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1);
            }
            const copyResult = await _executeCopyInternal(sourceValidation.node, sourcePathArg, targetContainerAbsPath, targetEntryName, flags);
            operationMessages.push(...copyResult.messages);
            if (!copyResult.success) overallSuccess = false;
            if (copyResult.changesMade) anyChangesMadeGlobal = true;
        }

        if (anyChangesMadeGlobal && !(await FileSystemManager.save())) {
            operationMessages.push("cp: CRITICAL - Failed to save file system changes.");
            overallSuccess = false;
        }
        const finalMessages = operationMessages.filter(m => m).join("\n");
        return { success: overallSuccess, output: finalMessages, error: overallSuccess ? null : finalMessages || "An unknown error occurred." };
    }
  };

  const historyCommandDefinition = {
    commandName: "history",
    flagDefinitions: [{ name: "clear", short: "-c", long: "--clear" }],
    coreLogic: async (context) => {
        if (context.flags.clear) {
            HistoryManager.clearHistory();
            return { success: true, output: "Command history cleared.", messageType: Config.CSS_CLASSES.SUCCESS_MSG };
        }
        const history = HistoryManager.getFullHistory();
        if (history.length === 0) return { success: true, output: Config.MESSAGES.NO_COMMANDS_IN_HISTORY };
        return { success: true, output: history.map((cmd, i) => `  ${String(i + 1).padStart(3)}  ${cmd}`).join("\n") };
    }
  };

  const grepCommandDefinition = {
    commandName: "grep",
    flagDefinitions: [
        { name: "ignoreCase", short: "-i", long: "--ignore-case" },
        { name: "invertMatch", short: "-v", long: "--invert-match" },
        { name: "lineNumber", short: "-n", long: "--line-number" },
        { name: "count", short: "-c", long: "--count" },
        { name: "recursive", short: "-R" },
    ],
    coreLogic: async (context) => {
        const { args, flags, options, currentUser } = context;
        if (args.length === 0 && options.stdinContent === null) return { success: false, error: "grep: missing pattern" };
        const patternStr = args[0];
        const filePathsArgs = args.slice(1);
        let regex;
        try {
          regex = new RegExp(patternStr, flags.ignoreCase ? "i" : "");
        } catch (e) {
          return { success: false, error: `grep: invalid regular expression '${patternStr}': ${e.message}` };
        }
        
        let outputLines = [];
        let overallSuccess = true;
        const processContent = (content, filePathForDisplay) => {
            const lines = content.split("\n");
            let fileMatchCount = 0;
            let currentFileLines = [];
            lines.forEach((line, index) => {
                if (index === lines.length - 1 && line === "" && content.endsWith("\n")) return;
                const isMatch = regex.test(line);
                const effectiveMatch = flags.invertMatch ? !isMatch : isMatch;
                if (effectiveMatch) {
                    fileMatchCount++;
                    if (!flags.count) {
                        let outputLine = "";
                        if (filePathForDisplay) outputLine += `${filePathForDisplay}:`;
                        if (flags.lineNumber) outputLine += `${index + 1}:`;
                        outputLine += line;
                        currentFileLines.push(outputLine);
                    }
                }
            });
            if (flags.count) {
                let countOutput = "";
                if (filePathForDisplay) countOutput += `${filePathForDisplay}:`;
                countOutput += fileMatchCount;
                outputLines.push(countOutput);
            } else {
                outputLines.push(...currentFileLines);
            }
        };

        async function searchRecursively(currentPath, displayPathArg) {
            const pathValidation = FileSystemManager.validatePath("grep", currentPath);
            if (pathValidation.error) {
                OutputManager.appendToOutput(pathValidation.error, { typeClass: Config.CSS_CLASSES.ERROR_MSG });
                overallSuccess = false; return;
            }
            const node = pathValidation.node;
            if (!FileSystemManager.hasPermission(node, currentUser, "read")) {
                OutputManager.appendToOutput(`grep: ${displayPathArg}${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`, { typeClass: Config.CSS_CLASSES.ERROR_MSG });
                overallSuccess = false; return;
            }
            if (node.type === Config.FILESYSTEM.DEFAULT_FILE_TYPE) {
                processContent(node.content || "", currentPath);
            } else if (node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
                if (!flags.recursive) {
                    OutputManager.appendToOutput(`grep: ${displayPathArg}: Is a directory`, { typeClass: Config.CSS_CLASSES.ERROR_MSG });
                    overallSuccess = false; return;
                }
                for (const childName of Object.keys(node.children || {})) {
                    await searchRecursively(FileSystemManager.getAbsolutePath(childName, currentPath), FileSystemManager.getAbsolutePath(childName, currentPath));
                }
            }
        }

        if (filePathsArgs.length > 0) {
            for (const pathArg of filePathsArgs) {
                if (flags.recursive) {
                    await searchRecursively(FileSystemManager.getAbsolutePath(pathArg, FileSystemManager.getCurrentPath()), pathArg);
                } else {
                    const pathValidation = FileSystemManager.validatePath("grep", pathArg, { expectedType: Config.FILESYSTEM.DEFAULT_FILE_TYPE });
                    if (pathValidation.error) {
                        OutputManager.appendToOutput(pathValidation.error, { typeClass: Config.CSS_CLASSES.ERROR_MSG });
                        overallSuccess = false; continue;
                    }
                    if (!FileSystemManager.hasPermission(pathValidation.node, currentUser, "read")) {
                        OutputManager.appendToOutput(`grep: ${pathArg}${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`, { typeClass: Config.CSS_CLASSES.ERROR_MSG });
                        overallSuccess = false; continue;
                    }
                    processContent(pathValidation.node.content || "", pathArg);
                }
            }
        } else if (options.stdinContent !== null) {
            processContent(options.stdinContent, null);
        } else {
            return { success: false, error: "grep: No input files or stdin provided after pattern." };
        }
        return { success: overallSuccess, output: outputLines.join("\n") };
    }
  };

  const uploadCommandDefinition = {
    commandName: "upload",
    flagDefinitions: [{ name: "force", short: "-f", long: "--force" }],
    argValidation: { max: 1 },
    coreLogic: async (context) => {
        const { args, flags, currentUser, options } = context;
        if (!options.isInteractive) return { success: false, error: "upload: Can only be run in interactive mode." };
        
        let targetDirPath = FileSystemManager.getCurrentPath();
        const nowISO = new Date().toISOString();
        const operationMessages = [];
        let allFilesSuccess = true;
        let anyFileProcessed = false;

        if (args.length === 1) {
            const destPathValidation = FileSystemManager.validatePath("upload (destination)", args[0], { expectedType: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE });
            if (destPathValidation.error) return { success: false, error: destPathValidation.error };
            targetDirPath = destPathValidation.resolvedPath;
        }

        const targetDirNode = FileSystemManager.getNodeByPath(targetDirPath);
        if (!targetDirNode || !FileSystemManager.hasPermission(targetDirNode, currentUser, "write"))
            return { success: false, error: `upload: cannot write to directory '${targetDirPath}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}` };
        
        const input = Utils.createElement("input", { type: "file", multiple: true });
        input.style.display = "none";
        document.body.appendChild(input);

        try {
            const filesToUpload = await new Promise((resolve, reject) => {
                let dialogClosed = false;
                const onFocus = () => { setTimeout(() => { window.removeEventListener("focus", onFocus); if (!dialogClosed) { dialogClosed = true; reject(new Error(Config.MESSAGES.UPLOAD_NO_FILE)); } }, 300); };
                input.onchange = (e) => { dialogClosed = true; window.removeEventListener("focus", onFocus); if (e.target.files?.length > 0) resolve(e.target.files); else reject(new Error(Config.MESSAGES.UPLOAD_NO_FILE)); };
                window.addEventListener("focus", onFocus);
                input.click();
            });
            anyFileProcessed = true;
            
            for (const file of Array.from(filesToUpload)) {
                try {
                    const explicitMode = file.name.endsWith('.sh') ? Config.FILESYSTEM.DEFAULT_SH_MODE : null;
                    const content = await file.text();
                    const existingFileNode = targetDirNode.children[file.name];
                    if (existingFileNode) {
                        if (!FileSystemManager.hasPermission(existingFileNode, currentUser, "write")) throw new Error(`cannot overwrite '${file.name}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`);
                        if (!flags.force) {
                            const confirmed = await new Promise(r => ModalManager.request({ context: 'terminal', messageLines: [`'${file.name}' already exists. Overwrite?`], onConfirm: () => r(true), onCancel: () => r(false) }));
                            if (!confirmed) { operationMessages.push(`Skipped '${file.name}'.`); continue; }
                        }
                    }
                    const newFileNode = FileSystemManager._createNewFileNode(file.name, content, currentUser, explicitMode);
                    targetDirNode.children[file.name] = newFileNode;
                    targetDirNode.mtime = nowISO;
                    operationMessages.push(`'${file.name}' uploaded to '${targetDirPath}'.`);
                } catch (fileError) {
                    operationMessages.push(`Error uploading '${file.name}': ${fileError.message}`);
                    allFilesSuccess = false;
                }
            }
            if (anyFileProcessed && !(await FileSystemManager.save(currentUser))) {
                operationMessages.push("Critical: Failed to save file system changes after uploads.");
                allFilesSuccess = false;
            }
            return { success: allFilesSuccess, output: operationMessages.join("\n") || "Upload complete.", messageType: allFilesSuccess && anyFileProcessed ? Config.CSS_CLASSES.SUCCESS_MSG : Config.CSS_CLASSES.WARNING_MSG };
        } catch (e) {
            return { success: false, error: `upload: ${e.message}` };
        } finally {
            if (input.parentNode) document.body.removeChild(input);
        }
    }
  };

  const restoreCommandDefinition = {
    commandName: "restore",
    argValidation: { exact: 0 },
    coreLogic: async (context) => {
        if (!context.options.isInteractive) return { success: false, error: "restore: Can only be run in interactive mode." };
        const input = Utils.createElement("input", { type: "file", accept: ".json" });
        input.style.display = "none";
        document.body.appendChild(input);

        try {
            const file = await new Promise((res, rej) => {
                input.onchange = (e) => {
                    const f = e.target.files[0];
                    if (f) res(f);
                    else rej(new Error(Config.MESSAGES.RESTORE_CANCELLED_NO_FILE));
                };
                // This is a failsafe for when the user closes the dialog without selecting a file.
                // It requires the main window to be focused again.
                let dialogClosed = false;
                const onFocus = () => { setTimeout(() => { window.removeEventListener("focus", onFocus); if (!dialogClosed) { dialogClosed = true; rej(new Error(Config.MESSAGES.RESTORE_CANCELLED_NO_FILE)); } }, 300); };
                window.addEventListener("focus", onFocus);

                input.click();
            });

            const backupData = JSON.parse(await file.text());

            // Validate the backup file format
            if (!backupData || !backupData.dataType || !backupData.dataType.startsWith("OopisOS_System_State_Backup")) {
                 throw new Error(`'${file.name}' is not a valid OopisOS System State backup file.`);
            }

            const messageLines = [
                `WARNING: This will completely overwrite the current OopisOS state.`,
                `All users, files, and sessions will be replaced with data from '${file.name}'.`,
                "This action cannot be undone. Are you sure you want to restore?"
            ];

            const confirmed = await new Promise((conf) =>
                ModalManager.request({
                    context: 'terminal',
                    messageLines,
                    onConfirm: () => conf(true),
                    onCancel: () => conf(false),
                }),
            );

            if (!confirmed) {
                return { success: true, output: Config.MESSAGES.OPERATION_CANCELLED, messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG };
            }

            // --- The Restore Process Begins ---

            // 1. Clear existing localStorage state (protecting the API key)
            const allKeys = StorageManager.getAllLocalStorageKeys();
            allKeys.forEach((key) => {
                if (key !== Config.STORAGE_KEYS.GEMINI_API_KEY) {
                    StorageManager.removeItem(key);
                }
            });

            // 2. Restore data from backup file to localStorage
            if (backupData.userCredentials) StorageManager.saveItem(Config.STORAGE_KEYS.USER_CREDENTIALS, backupData.userCredentials);
            if (backupData.editorWordWrapEnabled !== undefined) StorageManager.saveItem(Config.STORAGE_KEYS.EDITOR_WORD_WRAP_ENABLED, backupData.editorWordWrapEnabled);
            if (backupData.automaticSessionStates) {
                for (const key in backupData.automaticSessionStates) StorageManager.saveItem(key, backupData.automaticSessionStates[key]);
            }
            if (backupData.manualSaveStates) {
                for (const key in backupData.manualSaveStates) StorageManager.saveItem(key, backupData.manualSaveStates[key]);
            }

            // 3. Restore the entire filesystem to IndexedDB
            FileSystemManager.setFsData(Utils.deepCopyNode(backupData.fsDataSnapshot));
            if (!(await FileSystemManager.save())) {
                throw new Error(`Critical failure: Could not save the restored file system to the database.`);
            }

            // 4. Announce completion and trigger a reboot to load the new state
            OutputManager.appendToOutput("System state restored successfully. Rebooting OopisOS to apply changes...", { typeClass: Config.CSS_CLASSES.SUCCESS_MSG });
            setTimeout(() => { window.location.reload(true); }, 1500);

            return { success: true, output: "" }; // Output won't be seen due to reload, but good practice.

        } catch (e) {
            return { success: false, error: `restore: ${e.message}` };
        } finally {
            if (input.parentNode) document.body.removeChild(input);
        }
    }
  };

  const findCommandDefinition = {
    commandName: "find",
    argValidation: { min: 1, error: "missing path specification" },
    coreLogic: async (context) => {
        const { args, currentUser, options } = context;
        const startPathArg = args[0];
        const expressionArgs = args.slice(1);
        let outputLines = [];
        let overallSuccess = true, filesProcessedSuccessfully = true, anyChangeMadeDuringFind = false;

        const predicates = {
          "-name": (node, path, pattern) => { const regex = Utils.globToRegex(pattern); if (!regex) { OutputManager.appendToOutput(`find: invalid pattern for -name: ${pattern}`, { typeClass: Config.CSS_CLASSES.ERROR_MSG }); overallSuccess = false; return false; } return regex.test(path.substring(path.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1)); },
          "-type": (node, path, typeChar) => { if (typeChar === "f") return node.type === Config.FILESYSTEM.DEFAULT_FILE_TYPE; if (typeChar === "d") return node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE; OutputManager.appendToOutput(`find: unknown type '${typeChar}' for -type`, { typeClass: Config.CSS_CLASSES.ERROR_MSG }); overallSuccess = false; return false; },
          "-user": (node, path, username) => node.owner === username,
          "-perm": (node, path, modeStr) => { if (!/^[0-7]{2}$/.test(modeStr)) { OutputManager.appendToOutput(`find: invalid mode '${modeStr}' for -perm`, { typeClass: Config.CSS_CLASSES.ERROR_MSG }); overallSuccess = false; return false; } return node.mode === parseInt(modeStr, 8); },
          "-mtime": (node, path, mtimeSpec) => { 
            if (!node.mtime) return false;
            const ageInMs = new Date().getTime() - new Date(node.mtime).getTime();
            const days = ageInMs / (24 * 60 * 60 * 1000);
            let n;
            if (mtimeSpec.startsWith("+")) { n = parseInt(mtimeSpec.substring(1), 10); return !isNaN(n) && days > n; }
            else if (mtimeSpec.startsWith("-")) { n = parseInt(mtimeSpec.substring(1), 10); return !isNaN(n) && days < n; }
            else { n = parseInt(mtimeSpec, 10); return !isNaN(n) && Math.floor(days) === n; }
          },
        };
        const actions = {
          "-print": async (node, path) => { outputLines.push(path); return true; },
          "-exec": async (node, path, commandParts) => { 
            const cmdStr = commandParts.map(part => part === '{}' ? path : part).join(' ');
            const result = await CommandExecutor.processSingleCommand(cmdStr, false);
            if (!result.success) { OutputManager.appendToOutput(`find: -exec: command '${cmdStr}' failed: ${result.error}`, { typeClass: Config.CSS_CLASSES.WARNING_MSG }); filesProcessedSuccessfully = false; return false; }
            return true;
          },
          "-delete": async (node, path) => {
            const result = await FileSystemManager.deleteNodeRecursive(path, { force: true, currentUser });
            if (!result.success) { OutputManager.appendToOutput(`find: -delete: ${result.messages.join(';') || `failed to delete '${path}'`}`, { typeClass: Config.CSS_CLASSES.WARNING_MSG }); filesProcessedSuccessfully = false; return false; }
            if (result.anyChangeMade) anyChangeMadeDuringFind = true;
            return true;
          },
        };

        let parsedExpression = [], currentTermGroup = [], nextTermNegated = false, hasExplicitAction = false, i = 0;
        while (i < expressionArgs.length) {
            const token = expressionArgs[i];
            if (token === "-not" || token === "!") { nextTermNegated = true; i++; continue; }
            if (token === "-or" || token === "-o") { if (currentTermGroup.length > 0) parsedExpression.push({ type: "AND_GROUP", terms: currentTermGroup }); currentTermGroup = []; parsedExpression.push({ type: "OR" }); i++; continue; }
            let term = { name: token, negated: nextTermNegated }; nextTermNegated = false;
            if (predicates[token]) {
                term.type = "TEST"; term.eval = predicates[token];
                if (i + 1 < expressionArgs.length) { term.arg = expressionArgs[++i]; } else { return { success: false, error: `find: missing argument to \`${token}\`` }; }
            } else if (actions[token]) {
                term.type = "ACTION"; term.perform = actions[token]; hasExplicitAction = true;
                if (token === "-exec") {
                    term.commandParts = []; i++;
                    while (i < expressionArgs.length && expressionArgs[i] !== ";") term.commandParts.push(expressionArgs[i++]);
                    if (i >= expressionArgs.length || expressionArgs[i] !== ";") return { success: false, error: "find: missing terminating ';' for -exec" };
                }
            } else { return { success: false, error: `find: unknown predicate '${token}'` }; }
            currentTermGroup.push(term); i++;
        }
        if (currentTermGroup.length > 0) parsedExpression.push({ type: "AND_GROUP", terms: currentTermGroup });
        if (!hasExplicitAction) {
          if (parsedExpression.length === 0 || parsedExpression[parsedExpression.length - 1].type === "OR") parsedExpression.push({ type: "AND_GROUP", terms: [] });
          parsedExpression[parsedExpression.length - 1].terms.push({ type: "ACTION", name: "-print", perform: actions["-print"], negated: false });
        }

        async function evaluateExpressionForNode(node, path) {
            let orGroupValue = false, isFirstAndGroup = true;
            for (const groupOrOperator of parsedExpression) {
                if (groupOrOperator.type === "OR") { orGroupValue = orGroupValue || isFirstAndGroup; isFirstAndGroup = false; }
                else if (groupOrOperator.type === "AND_GROUP") {
                    let andSubResult = true;
                    for (const term of groupOrOperator.terms.filter(t => t.type === 'TEST')) {
                        let result = await term.eval(node, path, term.arg);
                        if (term.negated) result = !result;
                        if (!result) { andSubResult = false; break; }
                    }
                    if (isFirstAndGroup) orGroupValue = andSubResult; else orGroupValue = orGroupValue && andSubResult;
                }
            }
            return orGroupValue;
        }

        async function recurseFind(currentResolvedPath, isDepthFirst) {
            const node = FileSystemManager.getNodeByPath(currentResolvedPath);
            if (!node) { OutputManager.appendToOutput(`find: ‘${currentResolvedPath}’: No such file or directory`, { typeClass: Config.CSS_CLASSES.ERROR_MSG }); filesProcessedSuccessfully = false; return; }
            if (!FileSystemManager.hasPermission(node, currentUser, "read")) { OutputManager.appendToOutput(`find: ‘${currentResolvedPath}’: Permission denied`, { typeClass: Config.CSS_CLASSES.ERROR_MSG }); filesProcessedSuccessfully = false; return; }
            
            const processNode = async () => {
                if (await evaluateExpressionForNode(node, currentResolvedPath)) {
                    for (const groupOrOperator of parsedExpression) {
                        if (groupOrOperator.type === "AND_GROUP") {
                            for (const term of groupOrOperator.terms.filter(t => t.type === 'ACTION')) await term.perform(node, currentResolvedPath, term.commandParts);
                        }
                    }
                }
            };

            if (!isDepthFirst) await processNode();
            if (node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
                for (const childName of Object.keys(node.children || {})) {
                    await recurseFind(FileSystemManager.getAbsolutePath(childName, currentResolvedPath), isDepthFirst);
                }
            }
            if (isDepthFirst) await processNode();
        }

        const startPathValidation = FileSystemManager.validatePath("find", startPathArg);
        if (startPathValidation.error) return { success: false, error: startPathValidation.error };
        const impliesDepth = parsedExpression.some((g) => g.type === "AND_GROUP" && g.terms.some((t) => t.name === "-delete"));
        await recurseFind(startPathValidation.resolvedPath, impliesDepth);
        if (anyChangeMadeDuringFind) await FileSystemManager.save();
        return { success: (overallSuccess && filesProcessedSuccessfully), output: outputLines.join("\n") };
    }
  };

  const commands = {
    gemini: {
      handler: createCommandHandler(geminiCommandDefinition),
      description: "Sends a context-aware prompt to Gemini AI.",
      // --- UPDATE THIS HELP TEXT ---
      helpText: `Usage: gemini [-n|--new] "<prompt>"

Engages in a context-aware conversation with the Gemini AI.

FEATURES:
  - FILE SYSTEM AWARENESS: Can run OopisOS commands (ls, cat, find, etc.)
    to gather information from your file system to answer questions.

  - CONVERSATIONAL MEMORY: Remembers the previous turns of your
    conversation. You can ask follow-up questions, and Gemini will
    understand the context.

  - SESSION CONTROL:
    -n, --new    Starts a new, fresh conversation, clearing any
                 previous conversational memory for this session.

EXAMPLES:
  # Ask a question that requires finding and reading files
  gemini "Summarize my README.md and list the functions in diag_2.2.sh"

  # Ask a follow-up question (Gemini remembers the context)
  gemini "Now, what was the first function you listed?"

  # Start a completely new conversation, ignoring the previous one
  gemini -n "What is OopisOS?"`,
    },
    help: {
      handler: createCommandHandler(helpCommandDefinition),
      description: "Displays help information.",
      helpText: "Usage: help [command]\n\nDisplays a list of commands or help for a specific [command].",
    },
    echo: {
      handler: createCommandHandler(echoCommandDefinition),
      description: "Displays a line of text.",
      helpText: "Usage: echo [text...]\n\nPrints the specified [text] to the terminal.",
    },
    reboot: {
      handler: createCommandHandler(rebootCommandDefinition),
      description: "Reboots OopisOS by reloading the browser page and clearing its cache, preserving user data.",
      helpText: "Usage: reboot",
    },
    clear: {
      handler: createCommandHandler(clearCommandDefinition),
      description: "Clears the terminal screen.",
      helpText: "Usage: clear\n\nClears all previous output from the terminal screen.",
    },
    date: {
      handler: createCommandHandler(dateCommandDefinition),
      description: "Displays the current date and time.",
      helpText: "Usage: date\n\nShows the current system date and time.",
    },
    pwd: {
      handler: createCommandHandler(pwdCommandDefinition),
      description: "Prints the current working directory.",
      helpText: "Usage: pwd\n\nDisplays the full path of the current directory.",
    },
    ls: {
      handler: createCommandHandler(lsCommandDefinition),
      description: "Lists directory contents or file information.",
      helpText: `Usage: ls [OPTIONS] [PATH...]\n\nLists information about the FILEs (the current directory by default).\nSort entries alphabetically if none of -tSUXU is specified.\n\nOptions:\n  -a, --all          Do not ignore entries starting with .\n  -d, --dirs-only    List directories themselves, rather than their contents.\n  -l, --long         Use a long listing format.\n  -R, --recursive    List subdirectories recursively.\n  -r, --reverse      Reverse order while sorting.\n  -S                 Sort by file size, largest first.\n  -t                 Sort by modification time, newest first.\n  -X                 Sort alphabetically by entry extension.\n  -U                 Do not sort; list entries in directory order.`,
    },
    cd: {
      handler: createCommandHandler(cdCommandDefinition),
      description: "Changes the current directory.",
      helpText: "Usage: cd <directory_path>\n\nChanges the current working directory to the specified <directory_path>.",
    },
    mkdir: {
      handler: createCommandHandler(mkdirCommandDefinition),
      description: "Creates new directories.",
      helpText: "Usage: mkdir [-p] <directory_name>...\n\nCreates one or more new directories with the specified names.\n  -p, --parents   No error if existing, make parent directories as needed.",
    },
    tree: {
      handler: createCommandHandler(treeCommandDefinition),
      description: "Lists contents of directories in a tree-like format.",
      helpText: "Usage: tree [-L level] [-d] [path]\n\nLists the contents of directories in a tree-like format.\n  -L level  Descend only level directories deep.\n  -d        List directories only.",
    },
    touch: {
      handler: createCommandHandler(touchCommandDefinition),
      description: "Changes file/directory timestamps or creates empty files.",
      helpText: `Usage: touch [-c] [-d DATETIME_STRING | -t STAMP] <item_path>...\n\nUpdates the modification time of each specified <item_path>.\nIf <item_path> does not exist, it is created empty (as a file), unless -c is given.\n\nOptions:\n  -c, --no-create    Do not create any files.\n  -d, --date=STRING  Parse STRING and use it instead of current time.\n  -t STAMP           Use [[CC]YY]MMDDhhmm[.ss] instead of current time.`,
    },
    cat: {
      handler: createCommandHandler(catCommandDefinition),
      description: "Concatenates and displays files.",
      helpText: "Usage: cat [file...]\n\nConcatenates and displays the content of one or more specified files. If no files are given, it reads from standard input (e.g., from a pipe).",
    },
    rm: {
      handler: createCommandHandler(rmCommandDefinition),
      description: "Removes files or directories.",
      helpText: `Usage: rm [-rRf] <item_path>...\n\nRemoves specified files or directories.\n  -r, -R, --recursive   Remove directories and their contents recursively.\n  -f, --force           Ignore nonexistent files and arguments, never prompt.`,
    },
    mv: {
      handler: createCommandHandler(mvCommandDefinition),
      description: "Moves or renames files and directories.",
      helpText: `Usage: mv [-f] [-i] <source> <dest>\n       mv [-f] [-i] <source>... <directory>\n\nMoves (renames) files or moves them to a different directory.\n  -f, --force       Do not prompt before overwriting.\n  -i, --interactive Prompt before overwriting.`,
    },
    cp: {
      handler: createCommandHandler(cpCommandDefinition),
      description: "Copies files and directories.",
      helpText: `Usage: cp [-rR] [-fip] <source> <dest>\n       cp [-rR] [-fip] <source>... <directory>\n\nCopies files and directories.\n  -r, -R, --recursive Copy directories recursively.\n  -f, --force         Do not prompt before overwriting.\n  -i, --interactive   Prompt before overwriting.\n  -p, --preserve      Preserve mode, ownership, and timestamps.`,
    },
    history: {
      handler: createCommandHandler(historyCommandDefinition),
      description: "Displays command history.",
      helpText: "Usage: history [-c]\n\nDisplays the command history. Use '-c' or '--clear' to clear the history.",
    },
    edit: {
      handler: createCommandHandler(editCommandDefinition),
      description: "Opens a file in the text editor.",
      helpText: "Usage: edit <file_path>\n\nOpens the specified <file_path> in the built-in text editor. If the file does not exist, it will be created upon saving.",
    },
    grep: {
      handler: createCommandHandler(grepCommandDefinition),
      description: "Searches for patterns in files or input.",
      helpText: "Usage: grep [OPTIONS] PATTERN [FILE...]\n\nSearch for PATTERN in each FILE or standard input.\n\nOptions:\n  -i, --ignore-case   Ignore case distinctions.\n  -v, --invert-match  Select non-matching lines.\n  -n, --line-number   Print line number with output lines.\n  -c, --count         Print only a count of matching lines per FILE.\n  -R, --recursive     Read all files under each directory, recursively.",
    },
    useradd: {
      handler: createCommandHandler(useraddCommandDefinition),
      description: "Creates a new user account.",
      helpText: "Usage: useradd <username>\n\nCreates a new user account with the specified username. Will prompt for a password.",
    },
    login: {
      handler: createCommandHandler(loginCommandDefinition),
      description: "Logs in as a specified user.",
      helpText: "Usage: login <username> [password]\n\nLogs in as the specified user. If a password is not provided and one is required, you will be prompted.",
    },
    logout: {
      handler: createCommandHandler(logoutCommandDefinition),
      description: "Logs out the current user.",
      helpText: "Usage: logout\n\nLogs out the current user and returns to the Guest session.",
    },
    whoami: {
      handler: createCommandHandler(whoamiCommandDefinition),
      description: "Displays the current username.",
      helpText: "Usage: whoami\n\nPrints the username of the currently logged-in user.",
    },
    export: {
      handler: createCommandHandler(exportCommandDefinition),
      description: "Exports a file from the virtual FS to the user's computer.",
      helpText: "Usage: export <file_path>\n\nDownloads the specified file from OopisOS's virtual file system.",
    },
    upload: {
      handler: createCommandHandler(uploadCommandDefinition),
      description: "Uploads one or more files from the user's computer to the virtual FS.",
      helpText: "Usage: upload [-f] [destination_directory]\n\nPrompts to select files to upload to the current or specified directory.\n  -f, --force   Overwrite existing files without prompting.",
    },
    backup: {
      handler: createCommandHandler(backupCommandDefinition),
      description: "Creates a JSON backup of the current user's file system.",
      helpText: "Usage: backup\n\nCreates a JSON file containing a snapshot of the current user's entire file system.",
    },
    restore: {
      handler: createCommandHandler(restoreCommandDefinition),
      description: "Restores the file system from a JSON backup file.",
      helpText: "Usage: restore\n\nPrompts to select an OopisOS JSON backup file to restore the file system. Requires confirmation.",
    },
    savefs: {
      handler: createCommandHandler(savefsCommandDefinition),
      description: "Manually saves the current user's file system state.",
      helpText: "Usage: savefs\n\nManually triggers a save of the current user's file system to persistent storage.",
    },
    su: {
      handler: createCommandHandler(suCommandDefinition),
      description: "Substitute user identity.",
      helpText: "Usage: su [username]\n\nSwitches the current user to [username] (defaults to 'root'). Will prompt for password if required.",
    },
    clearfs: {
      handler: createCommandHandler(clearfsCommandDefinition),
      description: "Clears the current user's home directory to a default empty state.",
      helpText: `Usage: clearfs\n\nWARNING: This command will permanently erase all files and directories in your home directory. This action requires confirmation.`,
    },
    savestate: {
      handler: createCommandHandler(savestateCommandDefinition),
      description: "Saves the current terminal session (FS, output, history).",
      helpText: "Usage: savestate\n\nManually saves the entire current terminal session for the current user.",
    },
    loadstate: {
      handler: createCommandHandler(loadstateCommandDefinition),
      description: "Loads a previously saved terminal session.",
      helpText: "Usage: loadstate\n\nAttempts to load a manually saved terminal session for the current user. Requires confirmation.",
    },
    reset: {
      handler: createCommandHandler(resetCommandDefinition),
      description: "Resets all OopisOS data (users, FS, states) to factory defaults.",
      helpText: "Usage: reset\n\nWARNING: Resets all OopisOS data to its initial factory state. This operation is irreversible and requires confirmation.",
    },
    run: {
      handler: createCommandHandler(runCommandDefinition),
      description: "Executes a script file containing OopisOS commands.",
      helpText: "Usage: run <script_path> [arg1 arg2 ...]\n\nExecutes the commands listed in the specified .sh script file.\nSupports argument passing: $1, $2, ..., $@, $#.",
    },
    find: {
      handler: createCommandHandler(findCommandDefinition),
      description: "Searches for files in a directory hierarchy based on expressions.",
      helpText: `Usage: find [path] [expression]\n\nSearches for files. Default path is '.' Default action is '-print'.\nTests: -name, -type, -user, -perm, -mtime\nOperators: -not, -o, -a\nActions: -print, -exec, -delete`,
    },
    delay: {
      handler: createCommandHandler(delayCommandDefinition),
      description: "Pauses execution for a specified time.",
      helpText: "Usage: delay <milliseconds>\n\nPauses command execution for the specified number of milliseconds.",
    },
    check_fail: {
      handler: createCommandHandler(check_failCommandDefinition),
      description: "Tests if a given command string fails, for use in test scripts.",
      helpText: 'Usage: check_fail "<command_string>"\n\nSucceeds if the command fails, and fails if the command succeeds.',
    },
    removeuser: {
      handler: createCommandHandler(removeuserCommandDefinition),
      description: "Removes a user account and all their data.",
      helpText: "Usage: removeuser <username>\n\nPermanently removes the specified user and all their data. Requires confirmation.",
    },
    chmod: {
      handler: createCommandHandler(chmodCommandDefinition),
      description: "Changes file mode bits (permissions).",
      helpText: "Usage: chmod <mode> <path>\n\nChanges the permissions of <path> to <mode> (a two-digit octal number like 75 or 64).",
    },
    chown: {
      handler: createCommandHandler(chownCommandDefinition),
      description: "Changes file owner.",
      helpText: "Usage: chown <new_owner> <path>\n\nChanges the owner of <path>. Only the current owner or root can do this.",
    },
    listusers: {
      handler: createCommandHandler(listusersCommandDefinition),
      description: "Lists all registered user accounts.",
      helpText: "Usage: listusers\n\nDisplays a list of all user accounts registered in OopisOS.",
    },
    printscreen: {
      handler: createCommandHandler(printscreenCommandDefinition),
      description: "Saves the current terminal output to a file.",
      helpText: `Usage: printscreen <filepath>\n\nSaves the visible terminal output history to the specified file.`,
    },
    adventure: {
      handler: createCommandHandler(adventureCommandDefinition),
      description: "Starts a text-based adventure game.",
      helpText: "Usage: adventure [path_to_adventure_file.json]\n\nStarts a text adventure. Loads from file if specified, otherwise starts a sample game."
    }
  };

  async function _executeCommandHandler(segment, execCtxOpts, stdinContent = null) {
    const cmdData = commands[segment.command.toLowerCase()];
    if (cmdData?.handler) {
      try {
        return await cmdData.handler(segment.args, { ...execCtxOpts, stdinContent });
      } catch (e) {
        console.error(`Error in command handler for '${segment.command}':`, e);
        return { success: false, error: `Command '${segment.command}' failed: ${e.message || "Unknown error"}` };
      }
    } else if (segment.command) {
      return { success: false, error: `${segment.command}: command not found` };
    }
    return { success: true, output: "" };
  }

  async function _executePipeline(pipeline, isInteractive) {
    let currentStdin = null;
    let lastResult = { success: true, output: "" };

    if (typeof UserManager === 'undefined' || typeof UserManager.getCurrentUser !== 'function') {
        const errorMsg = "FATAL: State corruption detected (UserManager is unavailable). Please refresh the page.";
        console.error(errorMsg);
        await OutputManager.appendToOutput(errorMsg, { typeClass: Config.CSS_CLASSES.ERROR_MSG });
        return { success: false, error: errorMsg };
    }

    const user = UserManager.getCurrentUser().name;
    const nowISO = new Date().toISOString();

    for (let i = 0; i < pipeline.segments.length; i++) {
      const segment = pipeline.segments[i];
      lastResult = await _executeCommandHandler(segment, { isInteractive }, currentStdin);

      if (!lastResult) {
          const err = `Critical: Command handler for '${segment.command}' returned an undefined result.`;
          console.error(err, "Pipeline:", pipeline, "Segment:", segment);
          lastResult = { success: false, error: err };
      }

      if (!lastResult.success) {
        const err = `${Config.MESSAGES.PIPELINE_ERROR_PREFIX}'${segment.command}': ${lastResult.error || "Unknown"}`;
        if (!pipeline.isBackground) { 
            await OutputManager.appendToOutput(err, { typeClass: Config.CSS_CLASSES.ERROR_MSG });
        } else {
            console.log(`Background job pipeline error: ${err}`); 
        }
        return lastResult; 
      }
      currentStdin = lastResult.output;
    }

    if (pipeline.redirection && lastResult.success) {
      const { type: redirType, file: redirFile } = pipeline.redirection;
      const outputToRedir = lastResult.output || "";
      const redirVal = FileSystemManager.validatePath("redirection", redirFile, { allowMissing: true, disallowRoot: true, defaultToCurrentIfEmpty: false });

      if (redirVal.error && !(redirVal.optionsUsed.allowMissing && !redirVal.node)) {
        if (!pipeline.isBackground) await OutputManager.appendToOutput(redirVal.error, { typeClass: Config.CSS_CLASSES.ERROR_MSG });
        return { success: false, error: redirVal.error };
      }
      const absRedirPath = redirVal.resolvedPath;
      let targetNode = redirVal.node;
      const pDirRes = FileSystemManager.createParentDirectoriesIfNeeded(absRedirPath);
      if (pDirRes.error) {
        if (!pipeline.isBackground) await OutputManager.appendToOutput(`Redir err: ${pDirRes.error}`, { typeClass: Config.CSS_CLASSES.ERROR_MSG });
        return { success: false, error: pDirRes.error };
      }
      
      const finalParentDirPath = absRedirPath.substring(0, absRedirPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR)) || Config.FILESYSTEM.ROOT_PATH;
      const finalParentNodeForFile = FileSystemManager.getNodeByPath(finalParentDirPath);

      if (!finalParentNodeForFile) {
        if (!pipeline.isBackground) await OutputManager.appendToOutput(`Redir err: critical internal error, parent dir '${finalParentDirPath}' for file write not found.`, { typeClass: Config.CSS_CLASSES.ERROR_MSG });
        return { success: false, error: `parent dir '${finalParentDirPath}' for file write not found (internal)` };
      }
      targetNode = FileSystemManager.getNodeByPath(absRedirPath);

      if (targetNode && targetNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
        if (!pipeline.isBackground) await OutputManager.appendToOutput(`Redir err: '${redirFile}' is dir.`, { typeClass: Config.CSS_CLASSES.ERROR_MSG });
        return { success: false, error: `'${redirFile}' is dir.` };
      }
      if (targetNode && !FileSystemManager.hasPermission(targetNode, user, "write")) {
         if (!pipeline.isBackground) await OutputManager.appendToOutput(`Redir err: no write to '${redirFile}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`, { typeClass: Config.CSS_CLASSES.ERROR_MSG });
        return { success: false, error: `no write to '${redirFile}'` };
      }
      if (!targetNode && !FileSystemManager.hasPermission(finalParentNodeForFile, user, "write")) {
         if (!pipeline.isBackground) await OutputManager.appendToOutput(`Redir err: no create in '${finalParentDirPath}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`, { typeClass: Config.CSS_CLASSES.ERROR_MSG });
        return { success: false, error: `no create in '${finalParentDirPath}'` };
      }

      const fName = absRedirPath.substring(absRedirPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1);
      let exContent = "";
      if (redirType === "append" && finalParentNodeForFile.children[fName]?.type === Config.FILESYSTEM.DEFAULT_FILE_TYPE) {
        exContent = finalParentNodeForFile.children[fName].content || "";
        if (exContent && !exContent.endsWith("\n") && outputToRedir) exContent += "\n";
      }
      
      if (targetNode) {
        targetNode.content = exContent + outputToRedir;
      } else {
        const newFileNode = FileSystemManager._createNewFileNode(fName, exContent + outputToRedir, user);
        if (newFileNode) {
            finalParentNodeForFile.children[fName] = newFileNode;
        } else {
            if (!pipeline.isBackground) await OutputManager.appendToOutput(`Redirection error: internal failure creating new file node for '${redirFile}'.`, { typeClass: Config.CSS_CLASSES.ERROR_MSG });
            return { success: false, error: "internal redirection error" };
        }
      }

      FileSystemManager._updateNodeAndParentMtime(absRedirPath, nowISO);
      if (!(await FileSystemManager.save(user))) {
        if (!pipeline.isBackground) await OutputManager.appendToOutput(`Failed to save redir to '${redirFile}'.`, { typeClass: Config.CSS_CLASSES.ERROR_MSG });
        return { success: false, error: `save redir fail` };
      }
      lastResult.output = null; 
    }

    if (!pipeline.redirection && lastResult.success && lastResult.output !== null && lastResult.output !== undefined) {
      if (!pipeline.isBackground) {
        if (lastResult.output) {
          await OutputManager.appendToOutput(lastResult.output, { typeClass: lastResult.messageType || null });
        }
      } else if (lastResult.output && pipeline.isBackground) {
        await OutputManager.appendToOutput(`${Config.MESSAGES.BACKGROUND_PROCESS_OUTPUT_SUPPRESSED} (Job ${pipeline.jobId})`, { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG, isBackground: true });
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
    let overallResult = { success: true, output: null, error: null }; 

    if (scriptExecutionInProgress && isInteractive && !ModalManager.isAwaiting()) {
      OutputManager.appendToOutput("Script execution in progress. Input suspended.", { typeClass: Config.CSS_CLASSES.WARNING_MSG });
      return { success: false, error: "Script execution in progress." };
    }

    if (ModalManager.isAwaiting()) {
      await ModalManager.handleTerminalInput(rawCommandText);
      if (isInteractive) await _finalizeInteractiveModeUI(rawCommandText);
      return overallResult;
    }

    if (EditorManager.isActive()) return overallResult;

    const cmdToEcho = rawCommandText.trim();
    if (isInteractive) {
      DOM.inputLineContainerDiv.classList.add(Config.CSS_CLASSES.HIDDEN);
      const prompt = `${DOM.promptUserSpan.textContent}${Config.TERMINAL.PROMPT_AT}${DOM.promptHostSpan.textContent}${Config.TERMINAL.PROMPT_SEPARATOR}${DOM.promptPathSpan.textContent}${Config.TERMINAL.PROMPT_CHAR} `;
      await OutputManager.appendToOutput(`${prompt}${cmdToEcho}`);
    }

    if (cmdToEcho === "") {
      if (isInteractive) await _finalizeInteractiveModeUI(rawCommandText);
      return overallResult; 
    }

    if (isInteractive) HistoryManager.add(cmdToEcho);
    if (isInteractive && !TerminalUI.getIsNavigatingHistory()) HistoryManager.resetIndex();

     let parsedPipelines; 
    try {
      parsedPipelines = new Parser(new Lexer(rawCommandText).tokenize()).parse();
      if (parsedPipelines.length === 0 || (parsedPipelines.length === 1 && parsedPipelines[0].segments.length === 0 && !parsedPipelines[0].redirection && !parsedPipelines[0].isBackground)) {
        if (isInteractive) await _finalizeInteractiveModeUI(rawCommandText);
        return { success: true, output: "" };
      }
    } catch (e) {
      await OutputManager.appendToOutput(e.message || "Command parse error.", { typeClass: Config.CSS_CLASSES.ERROR_MSG });
      if (isInteractive) await _finalizeInteractiveModeUI(rawCommandText);
      return { success: false, error: e.message || "Command parse error." };
    }

    for (const pipeline of parsedPipelines) {
        if (pipeline.segments.length === 0 && !pipeline.redirection && !pipeline.isBackground) {
            continue;
        }

        const executeCurrentPipeline = async () => await _executePipeline(pipeline, isInteractive);

        if (pipeline.isBackground) {
            pipeline.jobId = ++backgroundProcessIdCounter;
            await OutputManager.appendToOutput(`${Config.MESSAGES.BACKGROUND_PROCESS_STARTED_PREFIX}${pipeline.jobId}${Config.MESSAGES.BACKGROUND_PROCESS_STARTED_SUFFIX}`, { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG });
            overallResult = { success: true, output: null }; 
            setTimeout(async () => {
                const bgResult = await executeCurrentPipeline(); 
                const statusMsg = `[Job ${pipeline.jobId} ${bgResult.success ? "finished" : "finished with error"}${bgResult.success ? "" : `: ${bgResult.error || "Unknown error"}`}]`;
                OutputManager.appendToOutput(statusMsg, { typeClass: bgResult.success ? Config.CSS_CLASSES.CONSOLE_LOG_MSG : Config.CSS_CLASSES.WARNING_MSG, isBackground: true });
                if (!bgResult.success) console.log(`Background job ${pipeline.jobId} error details: ${bgResult.error || "No specific error message."}`);
            }, 0); 
        } else {
            overallResult = await executeCurrentPipeline(); 
            if (!overallResult) {
                const err = "Critical: Pipeline execution returned an undefined result.";
                console.error(err, "Pipeline:", pipeline);
                overallResult = { success: false, error: err };
            }
            if (!overallResult.success) break;
        }
    }

    if (isInteractive && !scriptExecutionInProgress) {
      await _finalizeInteractiveModeUI(rawCommandText);
    }
    
    return overallResult || { success: false, error: "Fell through processSingleCommand logic." };
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