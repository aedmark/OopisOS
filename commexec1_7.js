// commexec.js - OopisOS Command Executor v1.7

const CommandExecutor = (() => {
  "use strict";
  let scriptExecutionInProgress = false;
  let backgroundProcessIdCounter = 0;

  const commands = {
    // --- START OF NEW GEMINI COMMAND ---
    gemini: {
      handler: async (args, options) => {
        const prompt = args.join(" ");
        if (!prompt) {
          return {
            success: false,
            error: "gemini: Please provide a prompt. Usage: gemini \"your prompt\"",
          };
        }

        // Display a thinking message
        if (options.isInteractive) {
            OutputManager.appendToOutput("Gemini is thinking...", { typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG });
        }

        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = "AIzaSyBp2mGVsfMk2_buCcLCHXNextXQgudt6F4"; // Left empty as per instructions for Canvas environment
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: { message: "Unknown error structure" } }));
            console.error("Gemini API Error Response:", errorBody);
            return {
              success: false,
              error: `gemini: API request failed with status ${response.status}. ${errorBody?.error?.message || response.statusText}`,
            };
          }

          const result = await response.json();

          if (result.candidates && result.candidates.length > 0 &&
              result.candidates[0].content && result.candidates[0].content.parts &&
              result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            return {
              success: true,
              output: text,
            };
          } else {
            console.error("Gemini API Unexpected Response Structure:", result);
            return {
              success: false,
              error: "gemini: Received an unexpected response structure from the API.",
            };
          }
        } catch (error) {
          console.error("Gemini API Fetch Error:", error);
          return {
            success: false,
            error: `gemini: Failed to fetch response from API. ${error.message}`,
          };
        }
      },
      description: "Sends a prompt to the Gemini AI model and displays the response.",
      helpText: "Usage: gemini \"<prompt_text>\"\n\nSends the provided <prompt_text> to the Gemini AI and shows the result.\nExample: gemini \"What is the capital of Illinois?\"",
    },
    // --- END OF NEW GEMINI COMMAND ---
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
          ) : [FileSystemManager.getCurrentPath()];
        const currentUser = UserManager.getCurrentUser().name;
        let outputBlocks = [];
        let overallSuccess = true;

        // Helper to get item details
        function getItemDetails(itemName, itemNode, itemPath) {
          // Basic check for itemNode
          if (!itemNode) return null;
          const details = {
            name: itemName,
            path: itemPath,
            node: itemNode,
            type: itemNode.type,
            owner: itemNode.owner || "unknown",
            mode: itemNode.mode,
            mtime: itemNode.mtime ? new Date(itemNode.mtime) : new Date(0), // Handle potentially missing mtime
            size: FileSystemManager.calculateNodeSize(itemNode),
            extension: Utils.getFileExtension(itemName),
            linkCount: 1, // Simplified, not tracking hard links
          };
          return details;
        }

        // Helper to format for long listing
        function formatLongListItem(itemDetails) {
          // console.log("Formatting item:", itemDetails);
          const perms = FileSystemManager.formatModeToString(itemDetails.node);
          const owner = itemDetails.owner.padEnd(10);
          const size = Utils.formatBytes(itemDetails.size).padStart(8);
          let dateStr = "            "; // 12 spaces
          if (itemDetails.mtime && itemDetails.mtime.getTime() !== 0) { // Check if mtime is valid
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

        // Helper for sorting items
        function sortItems(items, currentFlags) {
          let sortedItems = [...items];
          if (currentFlags.noSort) {
            // No sorting needed
          } else if (currentFlags.sortByTime) {
            sortedItems.sort(
              (a, b) => b.mtime - a.mtime || a.name.localeCompare(b.name),
            ); // Sort by mtime, then name
          } else if (currentFlags.sortBySize) {
            sortedItems.sort(
              (a, b) => b.size - a.size || a.name.localeCompare(b.name),
            ); // Sort by size, then name
          } else if (currentFlags.sortByExtension) {
            sortedItems.sort((a, b) => {
              const extComp = a.extension.localeCompare(b.extension);
              if (extComp !== 0) return extComp;
              return a.name.localeCompare(b.name); // Sort by extension, then name
            });
          } else {
            // Default: sort by name
            sortedItems.sort((a, b) => a.name.localeCompare(b.name));
          }
          if (currentFlags.reverseSort) {
            sortedItems.reverse();
          }
          return sortedItems;
        }

        // Main logic for listing a single path's contents
        async function listSinglePathContents(targetPathArg, effectiveFlags) {
          // Resolve the absolute path
          const resolvedPath = FileSystemManager.getAbsolutePath(
            targetPathArg,
            FileSystemManager.getCurrentPath(),
          );
          const pathValidation = FileSystemManager.validatePath(
            "ls",
            resolvedPath,
          ); // No expectedType, can be file or dir

          if (pathValidation.error) {
            // overallSuccess = false; // This will be set by the caller
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
              output: `ls: cannot open directory '${targetPathArg}': Permission denied`, // Standard Unix error
            };
          }

          let itemDetailsList = [];
          let singleFileResultOutput = null;

          if (targetNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
            const childrenNames = Object.keys(targetNode.children);
            for (const name of childrenNames) {
              if (!effectiveFlags.all && name.startsWith(".")) continue; // Skip hidden if -a not set
              const childNode = targetNode.children[name];
              // Get full path for each child to pass to getItemDetails
              const childFullPath = FileSystemManager.getAbsolutePath(
                name,
                resolvedPath,
              );
              const details = getItemDetails(name, childNode, childFullPath);
              if (details) itemDetailsList.push(details);
            }
            itemDetailsList = sortItems(itemDetailsList, effectiveFlags);
          } else {
            // It's a file, get its details
            const fileName = resolvedPath.substring(
              resolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1,
            );
            const details = getItemDetails(fileName, targetNode, resolvedPath);
            if (details) {
              if (effectiveFlags.long)
                singleFileResultOutput = formatLongListItem(details);
              else singleFileResultOutput = details.name;
            } else {
              // This case should be rare if validatePath succeeded
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
            // For directories, format the list of items
            if (effectiveFlags.long) {
              currentPathOutputLines.push(`total ${itemDetailsList.length}`); // Standard for -l
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
            items: itemDetailsList, // For recursive calls
          };
        }

        // Recursive display function
        async function displayRecursive(currentPath, displayFlags, depth = 0) {
          let blockOutputs = [];
          let encounteredErrorInThisBranch = false;

          if (depth > 0) blockOutputs.push(""); // Add separator for subdirectories
          blockOutputs.push(`${currentPath}:`);

          const listResult = await listSinglePathContents(
            currentPath,
            displayFlags,
          );

          if (!listResult.success) {
            // Append the specific error message for this path
            blockOutputs.push(listResult.output);
            encounteredErrorInThisBranch = true;
            return {
              outputs: blockOutputs,
              encounteredError: encounteredErrorInThisBranch,
            }; // Propagate error status
          }

          if (
            listResult.output ||
            (flags.long && listResult.items && listResult.items.length === 0)
          ) {
            // If there's output (even just "total 0" for -l on empty dir), add it
            blockOutputs.push(listResult.output);
          }

          if (listResult.items) {
            // Recursively list subdirectories
            const subdirectories = listResult.items.filter(
              (item) =>
              item.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE &&
              item.name !== "." &&
              item.name !== "..", // Avoid infinite loops
            );

            for (const dirItem of subdirectories) {
              // Construct the full path for the subdirectory
              const subDirResult = await displayRecursive(
                dirItem.path, // Use the full path from itemDetails
                displayFlags,
                depth + 1,
              );
              blockOutputs = blockOutputs.concat(subDirResult.outputs);
              if (subDirResult.encounteredError) {
                encounteredErrorInThisBranch = true; // Propagate error
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
              overallSuccess = false; // An error occurred somewhere in recursion
            }
            // Add a newline between outputs of different top-level paths if there are multiple
            if (pathsToList.length > 1 && i < pathsToList.length - 1) {
              outputBlocks.push("");
            }
          }
        } else {
          // Non-recursive listing
          for (let i = 0; i < pathsToList.length; i++) {
            const path = pathsToList[i];
            if (pathsToList.length > 1) {
              // If listing multiple paths, show path name before its content
              if (i > 0) outputBlocks.push(""); // Separator
              outputBlocks.push(`${path}:`);
            }

            const listResult = await listSinglePathContents(path, flags);
            if (!listResult.success) {
              overallSuccess = false; // Mark that an error occurred
              // Append the specific error message for this path
              outputBlocks.push(listResult.output);
            } else {
              // Only add output if it's not empty OR if it's a file being listed (even if its details are short)
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

        // Join all collected output blocks
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
            // Use the specific error message from validationResult
            error: validationResult.errorDetail, // Removed 'mkdir: ' prefix as it's often part of errorDetail
            messageType: Config.CSS_CLASSES.ERROR_MSG, // Keep message type consistent
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
            // Construct error specific to this path argument
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
              // Add specific error for this path
              messages.push(parentDirResult.error); // Use the error from createParentDirectoriesIfNeeded
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
                // Standard Unix-like message
                `cannot create directory '${pathArg}' because it conflicts with an existing file of the same name.`,
              );
              allSuccess = false;
            } else if (
              existingItem.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE &&
              !flags.parents
            ) {
              messages.push(
                // Standard Unix-like message for existing directory without -p
                `cannot create directory '${pathArg}': Directory already exists.`,
              );
              allSuccess = false;
            }
            continue; // Skip if already exists (or error reported)
          } else {
            // Create the directory if it doesn't exist (or we're in -p mode and it's okay)
            parentNodeToCreateIn.children[dirName] = {
              type: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE,
              children: {},
              owner: currentUser,
              mode: Config.FILESYSTEM.DEFAULT_DIR_MODE,
              mtime: nowISO,
            };
            parentNodeToCreateIn.mtime = nowISO; // Update parent mtime
            messages.push(`created directory '${pathArg}'`);
            changesMade = true;
          }
        }

        if (changesMade && !(await FileSystemManager.save(currentUser))) {
          // This is a critical error if saving the FS fails after changes
          allSuccess = false;
          // Prepend a critical error message to ensure it's seen
          messages.unshift("Failed to save file system changes.");
        }

        if (!allSuccess) {
          // Filter out success messages to only report errors
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
          output: messages.join("\n"), // Join all messages (creations)
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
          }) : {
            value: Infinity
          }; // Default to infinite depth
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
            return; // Should not happen if initial validation passed
          if (
            currentDepth > 1 && // Don't check perms for the starting directory itself
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
            ); // Get absolute path for recursion
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
                  childAbsPath, // Recurse with absolute path
                  currentDepth + 1,
                  indentPrefix + (isLast ? "    " : "│   "),
                );
            } else if (!flags.dirsOnly) {
              fileCount++;
              outputLines.push(indentPrefix + connector + childName);
            }
          });
        }
        buildTreeRecursive(absStartPath, 1, ""); // Start recursion from depth 1
        outputLines.push(""); // Trailing newline before summary
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
      helpText: "Usage: tree [-L level] [-d] [path]\n\nLists the contents of directories in a tree-like format.\n  -L level  Descend only level directories deep.\n  -d        List directories only.",
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
          // Note: -a and -m for access/modification time only are not fully implemented
          // in OopisOS's simplified mtime model. They will behave like standard touch.
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
        const nowActualISO = new Date().toISOString(); // For parent dir mtime update

        let allSuccess = true;
        const messages = [];
        let changesMade = false;
        const currentUser = UserManager.getCurrentUser().name;

        for (const pathArg of remainingArgs) {
          const pathValidation = FileSystemManager.validatePath(
            "touch",
            pathArg, {
              allowMissing: true, // Allow file to be created
              disallowRoot: true // Cannot touch root
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
            // File/directory exists, update its timestamp
            const node = pathValidation.node;
            if (!FileSystemManager.hasPermission(node, currentUser, "write")) {
              messages.push(
                `touch: cannot update timestamp of '${pathArg}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`,
              );
              allSuccess = false;
              continue;
            }
            node.mtime = timestampToUse;
            // Also update parent's mtime if applicable (done by _updateNodeAndParentMtime)
            changesMade = true;
            messages.push(
              `${Config.MESSAGES.TIMESTAMP_UPDATED_PREFIX}'${pathArg}'${node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE ? " (directory)" : ""}${Config.MESSAGES.TIMESTAMP_UPDATED_SUFFIX}`,
            );
          } else if (pathValidation.error) {
            // An actual error from validatePath (not just 'allowMissing' case)
            messages.push(pathValidation.error);
            allSuccess = false;
            continue;
          } else {
            // File does not exist and allowMissing was true
            if (flags.noCreate) {
              continue; // Do nothing if -c is specified and file doesn't exist
            }
            // Cannot create a directory with 'touch' implicitly
            if (pathArg.trim().endsWith(Config.FILESYSTEM.PATH_SEPARATOR)) {
              messages.push(
                `touch: cannot touch '${pathArg}': No such file or directory`,
              ); // Unix-like message if trailing slash suggests dir
              allSuccess = false;
              continue;
            }

            // Attempt to create the file
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
            if (fileName === "") { // Should be caught by disallowRoot or validatePath earlier
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
            parentNode.mtime = nowActualISO; // Update parent dir's mtime because its content changed
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
            error: errorToReport, // Return combined error messages
            output: errorToReport, // Also provide output for display
            messageType: Config.CSS_CLASSES.ERROR_MSG,
          };
        }
        return {
          success: true,
          output: outputMessage ||
            (changesMade ? "" : Config.MESSAGES.NO_ACTION_TAKEN), // No output if no change and no messages
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
          }; // No files and no stdin, output nothing
        if (args.length > 0) {
          const valRes = Utils.validateArguments(args, {
            min: 1
          }); // Ensure at least one if args provided
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
            }; // Return error directly
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
            outputContent += "\n"; // Add newline if concatenating and previous didn't end with one
          outputContent += pathValidation.node.content || "";
          firstFile = false;
        }
        return {
          success: true,
          output: outputContent
        };
      },
      description: "Concatenates and displays files.",
      helpText: "Usage: cat [file...]\n\nConcatenates and displays the content of one or more specified files. If no files are given, it reads from standard input (e.g., from a pipe).",
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
          }, // Alias for -r
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
          // No -d or --dir, standard rm removes empty dirs if specified or non-empty with -r
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
        // Interactive only if -i is present AND -f is NOT
        const isInteractiveOpt = flags.interactive && !isForceOpt;

        let allSuccess = true;
        let anyChangeMade = false;
        const messages = []; // Collect messages for output
        const currentUser = UserManager.getCurrentUser().name;
        const nowISO = new Date().toISOString();

        async function removeItemRecursively(
          itemResolvedPath,
          itemNode,
          originalPathArg, // For user-facing messages
        ) {
          const parentPath =
            itemResolvedPath.substring(
              0,
              itemResolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR),
            ) || Config.FILESYSTEM.ROOT_PATH;
          const parentNode = FileSystemManager.getNodeByPath(parentPath);

          if (!parentNode) {
            // This is an internal inconsistency if itemNode was found
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
                  null, // No specific data needed for confirmation
                  () => resolve(true),
                  () => resolve(false),
                );
              });
            }

            if (confirmed) {
              // Remove the file
              const itemName = itemResolvedPath.substring(
                itemResolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) +
                1,
              );
              if (parentNode.children && parentNode.children[itemName]) {
                delete parentNode.children[itemName];
                parentNode.mtime = nowISO; // Update parent mtime
                if (!isForceOpt)
                  messages.push(
                    `'${originalPathArg}'${Config.MESSAGES.ITEM_REMOVED_SUFFIX}`,
                  );
                anyChangeMade = true;
                return true;
              } else {
                // Should not happen if itemNode was valid
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
              return false; // Cancelled by user
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
              // Confirm before descending into directory if -i is active
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
              return false; // User cancelled descent
            }

            const childrenNames = Object.keys(itemNode.children || {});
            for (const childName of childrenNames) {
              if (!itemNode.children[childName]) continue; // Should not happen
              const childNode = itemNode.children[childName];
              const childResolvedPath = FileSystemManager.getAbsolutePath(
                childName,
                itemResolvedPath,
              );
              // Recursively remove child
              if (
                !(await removeItemRecursively(
                  childResolvedPath,
                  childNode,
                  childResolvedPath, // Use full path for messages of children
                ))
              ) {
                if (!isForceOpt) {
                  // If not forcing, and a child failed, stop removing this directory's contents
                  return false;
                }
                // If forcing, continue trying to remove other children
              }
            }

            // After attempting to remove all children, remove the directory itself
            const dirName = itemResolvedPath.substring(
              itemResolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) +
              1,
            );
            if (parentNode.children && parentNode.children[dirName]) {
              // Re-check if directory is empty (important if -f was NOT used and some children failed)
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
                // If forcing and still not empty, it's an issue, but force implies suppression.
                return false; // Even with force, if it couldn't empty it, can't delete.
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

          // Fallback for unknown types (should not happen with current FS)
          if (!isForceOpt)
            messages.push(
              `rm: cannot remove '${originalPathArg}': Unknown item type.`,
            );
          return false;
        }

        for (const pathArg of remainingArgs) {
          const pathValidation = FileSystemManager.validatePath("rm", pathArg, {
            disallowRoot: true, // Cannot rm root
          });

          if (pathValidation.error) {
            const isNoSuchFileError = pathValidation.node === null;
            if (isForceOpt && isNoSuchFileError) {
              continue; // -f: ignore non-existent files
            }
            messages.push(pathValidation.error);
            allSuccess = false;
            continue;
          }

          const node = pathValidation.node;
          const resolvedPath = pathValidation.resolvedPath;

          // Prevent removing '.' or '..'
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
            allSuccess = false; // An item failed to be removed
          }
        }

        if (anyChangeMade) {
          if (!(await FileSystemManager.save(currentUser))) {
            messages.push(
              "rm: CRITICAL - Failed to save file system changes after removal operations.",
            );
            // This is a more severe failure. The command result should reflect this.
            return {
              success: false,
              error: "rm: Failed to save file system changes after removal.",
              output: messages.join("\n"),
              messageType: Config.CSS_CLASSES.ERROR_MSG,
            };
          }
        }

        const finalOutput = messages.filter((m) => m).join("\n"); // Filter out empty/null messages

        // If -f was used and all we had were "no such file" type errors (which were skipped),
        // then the operation can be considered successful from `rm -f` perspective.
        if (isForceOpt && allSuccess === false && messages.length === 0) {
          // This implies all "errors" were of the type that -f suppresses (like non-existent files)
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
            Config.CSS_CLASSES.SUCCESS_MSG : Config.CSS_CLASSES.CONSOLE_LOG_MSG,
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
        // Parse flags like -f (force), -i (interactive)
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
          // Note: -n (no-clobber) is not implemented here but could be an addition
        ];
        const {
          flags,
          remainingArgs
        } = Utils.parseFlags(
          args,
          flagDefinitions,
        );

        const validationResult = Utils.validateArguments(remainingArgs, {
          exact: 2, // Expects source and destination
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

        // 1. Validate Source
        const sourceValidation = FileSystemManager.validatePath(
          "mv (source)",
          sourcePathArg, {
            disallowRoot: true
          }, // Cannot move root
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
          !sourceParentNode || // Should always exist if sourceNode does
          !FileSystemManager.hasPermission(
            sourceParentNode,
            currentUser,
            "write",
          ) // Need write in source's parent to remove it
        ) {
          return {
            success: false,
            error: `mv: cannot move '${sourcePathArg}' from '${sourceParentPath}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`,
          };
        }

        // 2. Validate Destination
        const destValidation = FileSystemManager.validatePath(
          "mv (destination)",
          destPathArg, {
            allowMissing: true
          }, // Destination might not exist
        );
        // If destValidation has an error AND it's not because allowMissing was used for a non-existent path
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
        let finalDestName = sourceName; // Default: keep original name
        let targetContainerNode; // The directory where the source will be moved into
        let targetContainerAbsPath;

        if (
          destNode &&
          destNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
        ) {
          // Case: Moving source INTO an existing directory destPathArg
          targetContainerNode = destNode;
          targetContainerAbsPath = absDestPath;
          // The final path of the moved item will be destPathArg/sourceName
          absDestPath = FileSystemManager.getAbsolutePath(
            sourceName,
            absDestPath,
          ); // Re-evaluate absDestPath for the item itself
          // Check if an item with sourceName already exists inside targetContainerNode
          destNode = targetContainerNode.children[sourceName]; // Update destNode to the potential conflict
        } else {
          // Case: Moving source TO destPathArg (either renaming or moving to new location with potential rename)
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
          // destNode already points to the target (if it exists) or is null
        }

        // Check permissions for the target container directory
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

        // 3. Handle Overwriting / Conflicts
        if (absSourcePath === absDestPath) {
          return {
            success: true,
            output: `mv: '${sourcePathArg}' and '${destPathArg}' are the same file. ${Config.MESSAGES.NO_ACTION_TAKEN}`,
            messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
          };
        }

        if (destNode) {
          // Destination item exists
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
            // Prompt if -i and not -f
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
                error: Config.MESSAGES.OPERATION_CANCELLED, // Not really an error, but a user choice
                output: `${Config.MESSAGES.OPERATION_CANCELLED} No changes made.`,
                messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
              };
          } else if (!flags.force) {
            // No -i, no -f, and destination exists: error
            return {
              success: false,
              error: `mv: '${absDestPath}' already exists. Use -f to overwrite or -i to prompt.`,
            };
          }
          // If -f or confirmed -i, overwrite will happen by placing new node.
        }

        // 4. Prevent moving directory into itself
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

        // 5. Perform Move (Copy + Delete Source)
        const movedNode = Utils.deepCopyNode(sourceNode); // Create a copy to move
        // Update mtime if not preserving (OopisOS mv doesn't have -p, so always update)
        movedNode.mtime = nowISO;

        // Place the copied node at the destination
        targetContainerNode.children[finalDestName] = movedNode;
        targetContainerNode.mtime = nowISO; // Update mtime of destination's parent

        // Delete the original source node
        if (
          sourceParentNode &&
          sourceParentNode.children &&
          sourceParentNode.children[sourceName]
        ) {
          delete sourceParentNode.children[sourceName];
          sourceParentNode.mtime = nowISO; // Update mtime of source's parent
        } else {
          // This case should be rare if source validation was correct
          // Rollback by removing the prematurely added node at destination
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

        // 6. Save and Return
        if (!(await FileSystemManager.save(currentUser))) {
          // Attempt to rollback (this is tricky and might not be perfect)
          // For simplicity, we'll just report the save error. A more robust system might try to undo.
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
        // Define flags for cp
        const flagDefinitions = [{
            name: "recursive",
            short: "-r",
            long: "--recursive"
          },
          {
            name: "recursiveAlias",
            short: "-R"
          }, // Common alias for -r
          {
            name: "force",
            short: "-f",
            long: "--force"
          },
          {
            name: "preserve",
            short: "-p",
            long: "--preserve"
          }, // Preserve mode, ownership, timestamps
          {
            name: "interactive",
            short: "-i",
            long: "--interactive"
          },
          // No -a (archive) or -u (update) for simplicity in OopisOS
        ];
        const {
          flags,
          remainingArgs
        } = Utils.parseFlags(
          args,
          flagDefinitions,
        );

        const validationResult = Utils.validateArguments(remainingArgs, {
          min: 2, // At least one source and one destination
        });
        if (!validationResult.isValid)
          return {
            success: false,
            error: `cp: ${validationResult.errorDetail}`,
          };

        const currentUser = UserManager.getCurrentUser().name;
        const nowISO = new Date().toISOString();
        flags.isRecursive = flags.recursive || flags.recursiveAlias; // Consolidate recursive flag

        flags.isInteractiveEffective = flags.interactive && !flags.force; // -i is overridden by -f

        const rawDestPathArg = remainingArgs.pop(); // Last argument is destination
        const sourcePathArgs = remainingArgs; // All others are sources
        let operationMessages = []; // Collect messages for final output
        let overallSuccess = true;
        let anyChangesMadeGlobal = false;

        // Internal recursive copy function
        async function _executeCopyInternal(
          sourceNode, // The actual node object of the source
          sourcePathForMsg, // The original path string for messages
          targetContainerAbsPath, // Absolute path of the directory to copy INTO
          targetEntryName, // The name the source will have in the target container
          currentCommandFlags, // Flags passed to cp
          currentDepth = 0, // For recursive calls, not strictly used here yet
        ) {
          // console.log(`_executeCopyInternal: src='${sourcePathForMsg}', targetContainer='${targetContainerAbsPath}', targetName='${targetEntryName}'`);

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
              // Prompt if -i and not -f
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
                }; // Skipped, but not an error for the overall cp operation
              }
            } else if (!currentCommandFlags.force) {
              // If not interactive and not forcing, and dest is a file (or non-dir source over dir dest - already checked)
              if (
                existingNodeAtDest.type ===
                Config.FILESYSTEM.DEFAULT_FILE_TYPE || // Overwriting a file
                (existingNodeAtDest.type ===
                  Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE &&
                  sourceNode.type !== Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) // File over dir (checked, but good to be clear)
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
              // If source is dir and dest is dir, and -r is given, we proceed to copy contents into it.
            }
            // If -f or confirmed -i, or if it's a dir-to-dir copy with -r, we proceed.
          }

          if (sourceNode.type === Config.FILESYSTEM.DEFAULT_FILE_TYPE) {
            const newFileNode = {
              type: Config.FILESYSTEM.DEFAULT_FILE_TYPE,
              content: sourceNode.content,
              owner: currentCommandFlags.preserve ?
                sourceNode.owner : currentUser,
              mode: currentCommandFlags.preserve ?
                sourceNode.mode : Config.FILESYSTEM.DEFAULT_FILE_MODE,
              mtime: currentCommandFlags.preserve ? sourceNode.mtime : nowISO,
            };
            targetContainerNode.children[targetEntryName] = newFileNode;
            targetContainerNode.mtime = nowISO; // Parent directory modified
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
              }; // Standard behavior: skip dir if not recursive
            }

            let destDirNode;
            if (
              existingNodeAtDest &&
              existingNodeAtDest.type ===
              Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
            ) {
              // Copying into an existing directory
              destDirNode = existingNodeAtDest;
            } else {
              // Creating a new directory at the destination
              destDirNode = {
                type: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE,
                children: {},
                owner: currentCommandFlags.preserve ?
                  sourceNode.owner : currentUser,
                mode: currentCommandFlags.preserve ?
                  sourceNode.mode : Config.FILESYSTEM.DEFAULT_DIR_MODE,
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
              ); // For clearer messages if recursion errors

              const childCopyResult = await _executeCopyInternal(
                childSourceNode,
                childSourcePathForMsg,
                fullFinalDestPath, // Children are copied INTO the newly created/existing dest dir
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
                // Update mtime of the copied directory if its contents changed and not preserving
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

        // --- Main cp handler logic starts here ---

        // 1. Validate destination argument
        const destValidation = FileSystemManager.validatePath(
          "cp (destination)",
          rawDestPathArg, {
            allowMissing: true
          }, // Destination might not exist, or might be a dir
        );
        if (destValidation.error && !destValidation.optionsUsed.allowMissing) {
          return {
            success: false,
            error: destValidation.error
          }; // Hard error if dest path is invalid for other reasons
        }
        const absDestPath = destValidation.resolvedPath;
        const destNode = destValidation.node;
        const destArgIsExistingDir =
          destNode &&
          destNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE;

        // If multiple sources, destination MUST be an existing directory
        if (sourcePathArgs.length > 1 && !destArgIsExistingDir) {
          return {
            success: false,
            error: `cp: target '${rawDestPathArg}' is not a directory (when copying multiple sources)`,
          };
        }

        // 2. Validate sources
        let sourcesInfo = [];
        for (const srcArg of sourcePathArgs) {
          const srcValidation = FileSystemManager.validatePath(
            "cp (source)",
            srcArg, {
              disallowRoot: false
            }, // Allow copying from root (e.g., cp /file /dir)
          );
          if (srcValidation.error) {
            operationMessages.push(srcValidation.error);
            overallSuccess = false;
            continue; // Skip this source, try others
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
          // All sources failed validation
          return {
            success: false,
            error: operationMessages.join("\n") || "cp: No valid source arguments.",
          };
        }

        // 3. Process each source
        for (const srcInfo of sourcesInfo) {
          let targetContainerAbsPath; // The directory we are copying INTO
          let targetEntryName; // The name the source will have AT the destination

          if (destArgIsExistingDir) {
            targetContainerAbsPath = absDestPath; // Copying into the destination directory
            targetEntryName =
              srcInfo.path.substring(
                srcInfo.path.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1,
              ) || srcInfo.path; // Use source's base name
          } else {
            // Destination is a file name (or a new directory name if -r source is dir)
            targetContainerAbsPath =
              absDestPath.substring(
                0,
                absDestPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR),
              ) || Config.FILESYSTEM.ROOT_PATH; // Parent of the destination
            targetEntryName = absDestPath.substring(
              absDestPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1,
            );
            if (
              targetEntryName === "" &&
              absDestPath === Config.FILESYSTEM.ROOT_PATH
            ) {
              // Edge case: cp /somefile / (targetEntryName becomes somefile)
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

          // Prevent copying a file onto itself
          const wouldBeFullFinalDestPath = FileSystemManager.getAbsolutePath(
            targetEntryName,
            targetContainerAbsPath,
          );
          if (srcInfo.path === wouldBeFullFinalDestPath) {
            operationMessages.push(
              `cp: '${srcInfo.originalArg}' and '${wouldBeFullFinalDestPath}' are the same file.`,
            );
            continue; // Standard cp behavior
          }

          // Call the internal copy logic
          const copyExecuteResult = await _executeCopyInternal(
            srcInfo.node,
            srcInfo.originalArg,
            targetContainerAbsPath,
            targetEntryName,
            flags, // Pass all flags
            0,
          );

          operationMessages.push(...copyExecuteResult.messages);
          if (!copyExecuteResult.success) overallSuccess = false;
          if (copyExecuteResult.changesMade) {
            anyChangesMadeGlobal = true;
            // Add a top-level success message if not already handled by recursive calls (e.g., simple file copy)
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

        // 4. Save filesystem if changes were made
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
            Config.CSS_CLASSES.SUCCESS_MSG : Config.CSS_CLASSES.CONSOLE_LOG_MSG,
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
      helpText: "Usage: history [-c]\n\nDisplays the command history. Use '-c' or '--clear' to clear the history.",
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
            allowMissing: true, // File can be new
            disallowRoot: true // Cannot edit root itself
          },
        );
        const currentUser = UserManager.getCurrentUser().name;
        if (
          pathValidation.error &&
          pathValidation.node && // Error is present, but node also exists
          pathValidation.node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE
        )
          return {
            success: false,
            error: `edit: '${filePathArg}' is a directory. Cannot edit.`,
          };
        if (
          pathValidation.node && // Node exists
          !FileSystemManager.hasPermission(
            pathValidation.node,
            currentUser,
            "read", // Need read to open, write will be checked on save
          )
        )
          return {
            success: false,
            error: `edit: '${filePathArg}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`,
          };
        if (
          pathValidation.error && // Error exists
          !pathValidation.node && // And node does not exist
          !pathValidation.optionsUsed.allowMissing // And it wasn't an error due to missing (which is allowed)
        )
          return {
            success: false,
            error: pathValidation.error
          }; // Some other validation error
        const resolvedPath = pathValidation.resolvedPath;
        let content = "";
        if (pathValidation.node) content = pathValidation.node.content || ""; // Load existing content
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
      helpText: "Usage: edit <file_path>\n\nOpens the specified <file_path> in the built-in text editor. If the file does not exist, it will be created upon saving.",
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
          }, // Common alias for recursive
          // { name: "recursiveAlias", short: "-r" }, // Handled by -R
        ];
        const {
          flags,
          remainingArgs
        } = Utils.parseFlags(
          args,
          flagDefinitions,
        );

        if (remainingArgs.length === 0 && options.stdinContent === null) {
          // No pattern, no files, no stdin
          return {
            // success: false, // Standard grep exits 0 if no match, 1 if match, >1 if error
            // For OopisOS, let's treat this as needing arguments for now.
            success: false,
            error: "grep: missing pattern and file arguments, and no stdin.",
          };
        }
        if (remainingArgs.length === 0 && options.stdinContent !== null) {
          // Has stdin, but no pattern
          return {
            success: false,
            error: "grep: missing pattern for stdin."
          };
        }

        const patternStr = remainingArgs[0];
        const filePathsArgs = remainingArgs.slice(1);
        const currentUser = UserManager.getCurrentUser().name;
        let outputLines = [];
        let overallSuccess = true; // Tracks if any errors occurred during processing (e.g., perm denied)
        let matchFoundOverall = false; // Tracks if any line matched the pattern anywhere

        let regex;
        try {
          regex = new RegExp(patternStr, flags.ignoreCase ? "i" : "");
        } catch (e) {
          return {
            // This is a pattern error, so definitely fail
            success: false,
            error: `grep: invalid regular expression '${patternStr}': ${e.message}`,
          };
        }

        const processContent = (content, filePathForDisplay) => {
          // filePathForDisplay can be null for stdin
          const lines = content.split("\n");
          let fileMatchCount = 0;
          let currentFileLines = [];

          lines.forEach((line, index) => {
            // Skip trailing empty line if content ends with newline
            if (index === lines.length - 1 && line === "" && content.endsWith("\n")) {
              return;
            }

            const isMatch = regex.test(line);
            const effectiveMatch = flags.invertMatch ? !isMatch : isMatch;

            if (effectiveMatch) {
              matchFoundOverall = true; // A match was found somewhere
              fileMatchCount++;
              if (!flags.count) {
                // Format and add line to output
                let outputLine = "";
                // Add filename prefix if multiple files OR recursive OR single file specified
                if (
                  filePathForDisplay &&
                  (flags.recursive || filePathsArgs.length > 1 || (filePathsArgs.length === 1 && !options.stdinContent))
                ) {
                  outputLine += `${filePathForDisplay}:`;
                }
                if (flags.lineNumber) {
                  // Add line number (1-based)
                  outputLine += `${index + 1}:`;
                }
                outputLine += line;
                currentFileLines.push(outputLine);
              }
            }
          });

          if (flags.count) {
            // Output count for this file/stdin
            let countOutput = "";
            if (
              filePathForDisplay &&
              (flags.recursive || filePathsArgs.length > 1 || (filePathsArgs.length === 1 && !options.stdinContent))
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
          ); // True if matches found for this file (or all non-matches for -v)
        };

        async function searchRecursively(currentPath, displayPathArg) {
          const pathValidation = FileSystemManager.validatePath(
            "grep",
            currentPath,
          ); // No expectedType, can be file or dir

          if (pathValidation.error) {
            OutputManager.appendToOutput(pathValidation.error, {
              typeClass: Config.CSS_CLASSES.ERROR_MSG,
            });
            overallSuccess = false; // An error occurred
            return;
          }

          const node = pathValidation.node;
          if (!FileSystemManager.hasPermission(node, currentUser, "read")) {
            // Permission denied for this specific file/directory
            OutputManager.appendToOutput(
              `grep: ${displayPathArg}${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`, {
                typeClass: Config.CSS_CLASSES.ERROR_MSG
              },
            );
            overallSuccess = false; // An error occurred
            return;
          }

          if (node.type === Config.FILESYSTEM.DEFAULT_FILE_TYPE) {
            // Process the file
            processContent(node.content || "", currentPath); // Use resolved path for display
          } else if (node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
            // If it's a directory
            if (!flags.recursive) {
              // Standard grep behavior: if not -R, output "Is a directory"
              OutputManager.appendToOutput(
                `grep: ${displayPathArg}: Is a directory`, {
                  typeClass: Config.CSS_CLASSES.ERROR_MSG
                },
              );
              overallSuccess = false; // An error occurred
              return;
            }
            // If -R, recurse into its children
            const childrenNames = Object.keys(node.children || {});
            for (const childName of childrenNames) {
              const childPath = FileSystemManager.getAbsolutePath(
                childName,
                currentPath,
              );
              // Recurse, using the child's full path for display in case of further errors
              await searchRecursively(childPath, childPath);
            }
          }
        }

        if (filePathsArgs.length > 0) {
          // Processing files listed in arguments
          for (const pathArg of filePathsArgs) {
            // Resolve path once before potential recursion or direct processing
            const absolutePath = FileSystemManager.getAbsolutePath(
              pathArg,
              FileSystemManager.getCurrentPath(),
            );
            if (flags.recursive) {
              // If -R, always use the recursive search function
              await searchRecursively(absolutePath, pathArg); // Pass original pathArg for initial error messages
            } else {
              // Not recursive, expect a file
              const pathValidation = FileSystemManager.validatePath(
                "grep",
                pathArg, {
                  expectedType: Config.FILESYSTEM.DEFAULT_FILE_TYPE
                }, // Expect a file if not recursive
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
          // Processing stdin
          processContent(options.stdinContent, null); // No filename for stdin
        } else {
          // This case should have been caught earlier (no pattern, no files, no stdin)
          // but as a fallback:
          return {
            success: false,
            error: "grep: No input files or stdin provided after pattern.",
          };
        }

        // Grep's success status is nuanced:
        // Exit 0 if matches found, 1 if no matches, >1 for errors.
        // For OopisOS: if overallSuccess is false (e.g., perm denied), it's a failure.
        // Otherwise, success is true, and output indicates matches.
        return {
          success: overallSuccess, // If any operational errors, it's a fail
          output: outputLines.join("\n"),
          // No specific error property unless overallSuccess is false.
          // The presence of output indicates if matches were found or not.
          // If overallSuccess is true AND no output, it means no matches and no errors.
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
      helpText: "Usage: useradd <username>\n\nCreates a new user account with the specified username. Usernames must be between 3 and 20 characters, alphanumeric, and cannot be a reserved name (e.g., guest, root).",
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
            Config.CSS_CLASSES.SUCCESS_MSG : Config.CSS_CLASSES.ERROR_MSG,
        };
      },
      description: "Logs in as a specified user.",
      helpText: "Usage: login <username>\n\nLogs in as the specified user. This will save the current user's session and load the new user's session and file system.",
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
          ...result, // Spread the result to include any specific properties like 'noAction'
          output: result.message,
          messageType: result.success ?
            Config.CSS_CLASSES.SUCCESS_MSG : Config.CSS_CLASSES.CONSOLE_LOG_MSG, // Log if already guest
        };
      },
      description: "Logs out the current user.",
      helpText: "Usage: logout\n\nLogs out the current user and returns to the Guest session. The current user's session is saved.",
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
            TerminalUI.setInputState(false); // Disable input
            DOM.inputLineContainerDiv.classList.add(Config.CSS_CLASSES.HIDDEN); // Hide input line
            OutputManager.appendToOutput("System halted. Refresh to restart.", {
              typeClass: Config.CSS_CLASSES.ERROR_MSG,
            });
          }, 1000); // Delay for message visibility
        }
        return {
          success: true,
          output: ""
        }; // No output for the command itself if successful
      },
      description: "Shuts down the OopisOS session.",
      helpText: "Usage: shutdown\n\nHalts the OopisOS session. The terminal will become unresponsive. Refresh the browser page to restart OopisOS.",
    },
    reboot: {
      handler: async (args, options) => {
        if (options.isInteractive) {
          await OutputManager.appendToOutput("OopisOS is rebooting...", {
            typeClass: Config.CSS_CLASSES.WARNING_MSG,
          });
          setTimeout(() => {
            window.location.reload();
          }, 1000); // Give time for message to display
        }
        return {
          success: true,
          output: ""
        }; // No direct output from the command
      },
      description: "Reboots the OopisOS session.",
      helpText: "Usage: reboot\n\nReloads the OopisOS environment, effectively restarting the session. All unsaved changes in the current state might be lost unless automatically saved by login/logout or manual save.",
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
      helpText: "Usage: export <file_path>\n\nDownloads the specified <file_path> from OopisOS's virtual file system to your local computer. Your browser will prompt you to save the file.",
    },
    upload: {
        handler: async (args, options) => {
            if (!options.isInteractive)
                return {
                    success: false,
                    error: "upload: Can only be run in interactive mode.",
                };

            const { flags, remainingArgs } = Utils.parseFlags(args, [
                { name: "force", short: "-f", long: "--force" }
            ]);

            const validationResult = Utils.validateArguments(remainingArgs, { max: 1 }); // 0 or 1 arg for destination dir
            if (!validationResult.isValid)
                return {
                    success: false,
                    error: `upload: ${validationResult.errorDetail}`,
                };

            let targetDirPath = FileSystemManager.getCurrentPath();
            const currentUser = UserManager.getCurrentUser().name;
            const nowISO = new Date().toISOString();
            const operationMessages = [];
            let allFilesSuccess = true;
            let anyFileProcessed = false;

            if (remainingArgs.length === 1) {
                const destPathValidation = FileSystemManager.validatePath(
                    "upload (destination)",
                    remainingArgs[0], { expectedType: Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE },
                );
                if (destPathValidation.error)
                    return { success: false, error: destPathValidation.error };
                targetDirPath = destPathValidation.resolvedPath;
            }

            const targetDirNode = FileSystemManager.getNodeByPath(targetDirPath);
            if (!targetDirNode || !FileSystemManager.hasPermission(targetDirNode, currentUser, "write"))
                return {
                    success: false,
                    error: `upload: cannot write to directory '${targetDirPath}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`,
                };

            const input = Utils.createElement("input", { type: "file", multiple: true }); // Enable multiple file selection
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
                    }, 300); // Increased timeout slightly
                };
                input.onchange = (e) => {
                    fileSelectedOrDialogClosed = true;
                    window.removeEventListener("focus", handleFocus);
                    const files = e.target.files; // This is a FileList
                    if (files && files.length > 0) resolve(files);
                    else reject(new Error(Config.MESSAGES.UPLOAD_NO_FILE));
                };
                window.addEventListener("focus", handleFocus);
                input.click();
            });

            try {
                const filesToUpload = await fileSelectionPromise; // This is a FileList
                anyFileProcessed = true;

                for (const file of filesToUpload) { // Iterate through the FileList
                    try {
                        const allowedExt = [".txt", ".md", ".html", ".sh", ".js", ".css", ".json"]; // Added .json
                        const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
                        if (!allowedExt.includes(fileExt))
                            throw new Error(`${Config.MESSAGES.UPLOAD_INVALID_TYPE_PREFIX}'${file.name}' (type '${fileExt}')${Config.MESSAGES.UPLOAD_INVALID_TYPE_SUFFIX}`);
                        
                        const content = await new Promise((resolveFile, rejectFile) => {
                            const reader = new FileReader();
                            reader.onload = (e) => resolveFile(e.target.result);
                            reader.onerror = (e) => rejectFile(new Error(`${Config.MESSAGES.UPLOAD_READ_ERROR_PREFIX}'${file.name}'${Config.MESSAGES.UPLOAD_READ_ERROR_SUFFIX}`));
                            reader.readAsText(file);
                        });

                        const targetPath = FileSystemManager.getAbsolutePath(file.name, targetDirPath);
                        const parentDirResult = FileSystemManager.createParentDirectoriesIfNeeded(targetPath);
                        if (parentDirResult.error) throw new Error(parentDirResult.error);
                        
                        const parentNode = parentDirResult.parentNode;
                        const newFileName = targetPath.substring(targetPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1);
                        const existingFileNode = parentNode.children[newFileName];

                        if (existingFileNode) {
                            if (!FileSystemManager.hasPermission(existingFileNode, currentUser, "write"))
                                throw new Error(`cannot overwrite existing file '${newFileName}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`);
                            if (!flags.force) { // Check force flag
                                const confirmed = await new Promise((resolveInner) =>
                                    ConfirmationManager.request(
                                        [`File '${newFileName}' already exists in '${targetDirPath}'. Overwrite?`], null,
                                        () => resolveInner(true), () => resolveInner(false),
                                    ),
                                );
                                if (!confirmed) {
                                    operationMessages.push(`Skipped overwriting '${file.name}'.`);
                                    continue; // Skip this file
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
                        operationMessages.push(`${Config.MESSAGES.UPLOAD_SUCCESS_PREFIX}'${file.name}'${Config.MESSAGES.UPLOAD_SUCCESS_MIDDLE}'${targetDirPath}'${Config.MESSAGES.UPLOAD_SUCCESS_SUFFIX}`);
                    } catch (fileError) {
                        operationMessages.push(`Error uploading '${file.name}': ${fileError.message}`);
                        allFilesSuccess = false;
                    }
                } // End of loop through files

                if (anyFileProcessed && (await FileSystemManager.save(currentUser))) {
                     // FS save is done once after all files are processed
                } else if (anyFileProcessed) {
                    operationMessages.push("Critical: Failed to save file system changes after uploads.");
                    allFilesSuccess = false;
                }

                return {
                    success: allFilesSuccess,
                    output: operationMessages.join("\n") || (anyFileProcessed ? "Upload process complete." : "No files selected or processed."),
                    messageType: allFilesSuccess && anyFileProcessed ? Config.CSS_CLASSES.SUCCESS_MSG : Config.CSS_CLASSES.WARNING_MSG,
                };

            } catch (e) { // Catch error from fileSelectionPromise (e.g., user cancelled dialog)
                return { success: false, error: `upload: ${e.message}` };
            } finally {
                if (input.parentNode === document.body) {
                    document.body.removeChild(input);
                }
            }
        },
        description: "Uploads one or more files from the user's computer to the virtual FS.",
        helpText: "Usage: upload [-f] [destination_directory]\n\nPrompts to select one or more files from your computer and uploads them to OopisOS's current directory, or to the optional [destination_directory].\nAllowed file types: .txt, .md, .html, .sh, .js, .css, .json.\n  -f, --force   Overwrite existing files without prompting.\nWill prompt to overwrite if a file exists and -f is not used.",
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
      helpText: "Usage: backup\n\nCreates a JSON file containing a snapshot of the current user's entire file system and downloads it to your local computer. This can be used with the 'restore' command.",
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
          accept: ".json", // Only accept JSON files
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
            msg += `\nWARNING: Current user is '${currentUser}'. Restored FS will be for '${targetUser}'. You may need to 'login ${targetUser}' after restoring.`;
          const confirmed = await new Promise((conf) =>
            ConfirmationManager.request(
              [msg],
              null, // No specific data needed for confirmation action
              () => conf(true),
              () => conf(false),
            ),
          );
          if (!confirmed)
            return {
              success: true, // User cancelled, not an error
              output: Config.MESSAGES.OPERATION_CANCELLED,
              messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
            };
          FileSystemManager.setFsData(
            Utils.deepCopyNode(backupData.fsDataSnapshot),
          );
          // Ensure permissions and mtimes are consistent after restore
          FileSystemManager._ensurePermissionsAndMtimeRecursive(
            // Ensure this function exists and is correctly scoped or called
            FileSystemManager.getFsData()[Config.FILESYSTEM.ROOT_PATH],
            targetUser, // Default owner for items that might be missing it
            Config.FILESYSTEM.DEFAULT_DIR_MODE, // Default mode
          );
          // Save the restored FS under the targetUser's key
          if (!(await FileSystemManager.save(targetUser)))
            throw new Error(`Could not save restored FS for '${targetUser}'.`);
          if (currentUser === targetUser) {
            // If restoring for the current user, reload their FS into active memory
            await FileSystemManager.load(currentUser); // Reload to ensure consistency
            FileSystemManager.setCurrentPath(Config.FILESYSTEM.ROOT_PATH); // Reset path
            TerminalUI.updatePrompt();
            OutputManager.clearOutput(); // Clear screen for a fresh view
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
      helpText: "Usage: restore\n\nPrompts to select an OopisOS JSON backup file from your local computer. Restores the file system for the user specified in the backup. This operation overwrites the target user's current file system and requires confirmation.",
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
      helpText: "Usage: savefs\n\nManually triggers a save of the current user's file system to persistent storage. This is useful to ensure changes are saved before any critical operations or if automatic saving is a concern.",
    },
    clearfs: {
      handler: async (args, options) => {
        const validationResult = Utils.validateArguments(args, {
          exact: 0
        }); // No arguments expected
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
            null, // No specific data needed for confirmation action
            () => resolve(true),
            () => resolve(false),
          ),
        );

        if (!confirmed) {
          return {
            success: true, // User cancelled, not an error
            output: `File system clear for '${currentUser.name}' cancelled. ${Config.MESSAGES.NO_ACTION_TAKEN}`,
            messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
          };
        }

        let operationSuccess = true;
        let finalMessage = "";

        try {
          // Delete the existing FS from IndexedDB
          await FileSystemManager.deleteUserFS(currentUser.name);
          // Initialize a new, empty FS in memory
          await FileSystemManager.initialize(currentUser.name);
          // Save the new empty FS to IndexedDB
          if (!(await FileSystemManager.save(currentUser.name))) {
            throw new Error("Failed to save the newly cleared file system to storage.");
          }
          // Update current working directory to root
          FileSystemManager.setCurrentPath(Config.FILESYSTEM.ROOT_PATH);
          // If interactive, update UI
          if (options.isInteractive) {
            TerminalUI.updatePrompt();
            OutputManager.clearOutput(); // Clear the screen for a fresh start
          }
          finalMessage = `File system for user '${currentUser.name}' has been cleared and reset to default.`;
          OutputManager.appendToOutput(finalMessage, {
            typeClass: Config.CSS_CLASSES.SUCCESS_MSG
          });

        } catch (e) {
          operationSuccess = false;
          finalMessage = `Error clearing file system for '${currentUser.name}': ${e.message || "Unknown error"}`;
          console.error("clearfs error:", e); // Log detailed error for debugging
          OutputManager.appendToOutput(finalMessage, {
            typeClass: Config.CSS_CLASSES.ERROR_MSG
          });
        }

        return {
          success: operationSuccess,
          // Output is handled by appendToOutput directly in the try/catch for clarity
          output: operationSuccess ? "" : finalMessage, // Only return error message if failed
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
      helpText: "Usage: savestate\n\nManually saves the entire current terminal session, including the file system snapshot, visible output, current input line, and command history, for the current user. This can be restored later using 'loadstate'.",
    },
    loadstate: {
      handler: async (args, options) => {
        const result = await SessionManager.loadManualState();
        return {
          success: result.success,
          output: result.message, // Message will indicate confirmation needed or status
          error: result.success ?
            undefined : result.message || "Failed to load state.",
          messageType: result.success ?
            Config.CSS_CLASSES.CONSOLE_LOG_MSG : Config.CSS_CLASSES.ERROR_MSG,
        };
      },
      description: "Loads a previously saved terminal session.",
      helpText: "Usage: loadstate\n\nAttempts to load a manually saved terminal session for the current user. This will restore the file system, terminal output, input line, and command history from the save point. Requires confirmation as it overwrites the current session.",
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
              "WARNING: This will erase ALL OopisOS data, including all users, file systems, and saved states. This action cannot be undone. Are you sure?",
            ],
            null, // No specific data needed for confirmation action
            () => resolve(true),
            () => resolve(false),
          ),
        );
        if (confirmed) {
          await SessionManager.performFullReset(); // This function now handles output messages
          return {
            success: true,
            output: "OopisOS reset to initial state. Please refresh the page if UI issues persist.", // Final message
            messageType: Config.CSS_CLASSES.SUCCESS_MSG,
          };
        } else
          return {
            success: true, // User cancelled, not an error
            output: `Reset cancelled. ${Config.MESSAGES.NO_ACTION_TAKEN}`,
            messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
          };
      },
      description: "Resets all OopisOS data (users, FS, states) to factory defaults.",
      helpText: "Usage: reset\n\nWARNING: Resets all OopisOS data to its initial factory state. This includes all user accounts, all file systems, all saved sessions, and settings. This operation is irreversible and requires confirmation.",
    },
    run: {
      handler: async (args, options) => {
        const validationResult = Utils.validateArguments(args, {
          min: 1
        }); // At least a script path
        if (!validationResult.isValid)
          return {
            success: false,
            error: `run: ${validationResult.errorDetail}`,
          };

        const scriptPathArg = args[0];
        const scriptArgs = args.slice(1); // Arguments for the script itself
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
          !FileSystemManager.hasPermission(scriptNode, currentUser, "execute") // Check execute permission
        ) {
          return {
            success: false,
            error: `run: '${scriptPathArg}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`,
          };
        }

        if (!scriptNode.content)
          return {
            success: true, // Empty script is not an error
            output: `run: Script '${scriptPathArg}' is empty.`,
          };

        let scriptContent = scriptNode.content;
        // Basic shebang handling (remove the line, but don't interpret the interpreter)
        if (scriptContent.startsWith("#!")) {
          const firstLine = scriptContent.split("\n", 1)[0];
          scriptContent = scriptContent.substring(firstLine.length + 1); // +1 for newline
        }

        const rawScriptLines = scriptContent.split("\n");
        const commandsToRun = [];
        for (const rawLine of rawScriptLines) {
          let processedLine = rawLine;
          // Enhanced comment handling: allows for comments after quotes
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
          processedLine = processedLine.trim(); // Trim after removing comment

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
        let lastOutput = null; // To potentially return the output of the last command

        const previousScriptExecutionState = CommandExecutor.isScriptRunning();
        CommandExecutor.setScriptExecutionInProgress(true);
        if (options.isInteractive) TerminalUI.setInputState(false); // Disable terminal input

        for (const commandLine of commandsToRun) {
          // Substitute script arguments ($1, $2, $@, $#)
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
            continue; // Skip empty lines after substitution
          }

          const result = await CommandExecutor.processSingleCommand(
            processedCommandLineWithArgs,
            false, // Commands in script are not "interactive" in the same way
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
            break; // Stop script on first error
          }
          lastOutput = result.output; // Store output of the last successful command
        }

        CommandExecutor.setScriptExecutionInProgress(
          previousScriptExecutionState,
        ); // Restore previous state
        if (options.isInteractive && !CommandExecutor.isScriptRunning()) {
          TerminalUI.setInputState(true); // Re-enable terminal input if no other script is running
        }

        if (overallScriptSuccess) {
          return {
            success: true,
            output: null // Scripts generally don't output their own aggregate, commands do
          };
        } else {
          return {
            success: false,
            error: `Script '${scriptPathArg}' failed.` // Summary error
          };
        }
      },
      description: "Executes a script file containing OopisOS commands.",
      helpText: "Usage: run <script_path> [arg1 arg2 ...]\n\nExecutes the commands listed in the specified <script_path> file.\nLines starting with '#' are comments. Basic argument passing is supported:\n  $1, $2, ... : Positional arguments passed to the script.\n  $@          : All arguments as a single string.\n  $#          : Number of arguments.",
    },
    find: {
      handler: async (args, execOptions) => {
        // Basic argument check: must have at least a path
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
        let overallSuccess = true; // Tracks if any operational errors occurred (perms, bad predicate)
        let filesProcessedSuccessfully = true; // Tracks if actions like -exec or -delete were successful

        // Predicates define tests for files/directories
        const predicates = {
          "-name": (node, path, pattern) => {
            const name = path.substring(
              path.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1,
            );
            const regex = Utils.globToRegex(pattern); // Convert glob to regex
            if (!regex) {
              // Log error to terminal directly, as find can have many such issues
              overallSuccess = false; // Mark that an error in the find command itself occurred
              OutputManager.appendToOutput(
                `find: invalid pattern for -name: ${pattern}`, {
                  typeClass: Config.CSS_CLASSES.ERROR_MSG
                },
              );
              return false; // Test fails due to bad pattern
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
            // Expects simplified OopisOS 2-digit octal mode, e.g., "75"
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
            if (!node.mtime) return false; // Node has no modification time recorded
            const fileMTime = new Date(node.mtime).getTime();
            const now = new Date().getTime();
            const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

            let n;
            let comparisonType = "exact"; // N days ago (between N*24h and (N+1)*24h)

            if (mtimeSpec.startsWith("+")) {
              n = parseInt(mtimeSpec.substring(1), 10);
              comparisonType = "older"; // More than N*24h ago (effectively > (N+1)*24h for common understanding)
            } else if (mtimeSpec.startsWith("-")) {
              n = parseInt(mtimeSpec.substring(1), 10);
              comparisonType = "newer"; // Less than N*24h ago
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
              // File modified N days ago (i.e., between N*24h and (N+1)*24h ago)
              return (
                ageInMs >= n * twentyFourHoursInMs &&
                ageInMs < (n + 1) * twentyFourHoursInMs
              );
            } else if (comparisonType === "older") {
              // File modified more than N days ago (+N means older than N days, so age > N*24h)
              // Standard find: +N means files whose age in 24-hour periods, rounded up, is > N.
              // Simpler: age is strictly greater than N full 24-hour periods.
              return ageInMs > n * twentyFourHoursInMs;
            } else if (comparisonType === "newer") {
              // File modified less than N days ago (-N means newer than N days, so age < N*24h)
              return ageInMs < n * twentyFourHoursInMs;
            }
            return false;
          },
          // Add more predicates here: -empty, -size, etc.
        };

        // Actions define what to do with matching files
        const actions = {
          "-print": async (node, path) => {
            outputLines.push(path);
            return true; // Action itself is successful
          },
          "-exec": async (node, path, commandParts) => {
            const commandTemplate = commandParts.join(" ");
            // Replace {} with the properly quoted file path
            const hydratedCommand = commandTemplate.replace(
              /\{\}/g,
              `'${path.replace(/'/g, "'\\''")}'`, // Basic quoting for paths with spaces/quotes
            );

            const result = await CommandExecutor.processSingleCommand(
              hydratedCommand,
              false, // Not interactive
            );
            if (!result.success) {
              // Log error for this specific exec instance but don't necessarily stop find
              OutputManager.appendToOutput(
                `find: -exec: ${hydratedCommand}: command failed${result.error ? `: ${result.error}` : ""}`, {
                  typeClass: Config.CSS_CLASSES.WARNING_MSG
                },
              );
              filesProcessedSuccessfully = false; // Mark that at least one action failed
              return false; // This instance of -exec failed
            }
            return true; // This instance of -exec succeeded
          },
          "-delete": async (node, path) => {
            // Construct arguments for 'rm' command
            let rmArgs = [];
            if (node.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
              rmArgs.push("-r"); // Recursive for directories
            }
            rmArgs.push("-f"); // Force to suppress errors about non-existence (though it should exist)
            rmArgs.push(path); // The path to delete

            const rmCommand = CommandExecutor.getCommands().rm;
            if (rmCommand) {
              // Call rm handler directly; set isInteractive to false
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
                return false; // Delete action failed
              }
              // Optionally, add to messages array for verbose output if needed:
              // messages.push(`Deleted: ${path}`);
              return true; // Delete action succeeded
            } else {
              OutputManager.appendToOutput(
                `find: -delete: 'rm' command not available`, {
                  typeClass: Config.CSS_CLASSES.ERROR_MSG
                },
              );
              overallSuccess = false; // Error in find command setup
              filesProcessedSuccessfully = false;
              return false;
            }
          },
        };

        // Parse the expression (simplified: assumes -a if no operator)
        let parsedExpression = [];
        let currentTermGroup = []; // For handling implicit AND
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
            // Implicit AND is default, so -a is mostly for clarity or grouping with () (not supported yet)
            i++;
            continue;
          }
          // Grouping with ( ) is not implemented here for simplicity

          let predicateFn = predicates[token];
          let actionFn = actions[token];
          let term = {
            name: token,
            negated: nextTermNegated
          };
          nextTermNegated = false; // Reset negation

          if (predicateFn) {
            term.type = "TEST";
            term.eval = predicateFn;
            if (i + 1 < expressionArgs.length) {
              term.arg = expressionArgs[i + 1]; // Argument for the test
              i++; // Consume the argument
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
              i++; // Move past '-exec'
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
              // i is now at ';', will be incremented by loop
            }
            // No argument needed for -print or -delete
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
          // If we had args but couldn't parse them into a valid expression
          OutputManager.appendToOutput(`find: invalid expression`, {
            typeClass: Config.CSS_CLASSES.ERROR_MSG,
          });
          return {
            success: false,
            error: `find: invalid expression`
          };
        }

        // Add default action -print if no other action specified
        if (!hasExplicitAction) {
          // Add to the last AND_GROUP, or create a new one
          if (parsedExpression.length === 0 || parsedExpression[parsedExpression.length - 1].type === "OR") {
            parsedExpression.push({
              type: "AND_GROUP",
              terms: []
            });
          }
          parsedExpression[parsedExpression.length - 1].terms.push({
            type: "ACTION",
            name: "-print",
            perform: actions["-print"],
            negated: false, // Actions are not negated
          });
        }

        // Evaluates the parsed expression against a node
        async function evaluateExpressionForNode(node, path) {
          if (!overallSuccess) return false; // If find command itself has issues, stop evaluation

          let orGroupValue = false; // Result of the OR chain
          let currentAndGroupValue = true; // Result of the current AND group
          let isFirstAndGroup = true;

          for (const groupOrOperator of parsedExpression) {
            if (groupOrOperator.type === "OR") {
              if (isFirstAndGroup) orGroupValue = currentAndGroupValue;
              else orGroupValue = orGroupValue || currentAndGroupValue;
              currentAndGroupValue = true; // Reset for next AND group
              isFirstAndGroup = false;
            } else if (groupOrOperator.type === "AND_GROUP") {
              let andSubResult = true;
              for (const term of groupOrOperator.terms) {
                if (term.type === "TEST") {
                  let result = await term.eval(node, path, term.arg);
                  if (term.negated) result = !result;
                  andSubResult = andSubResult && result;
                  if (!andSubResult) break; // Short-circuit AND group
                }
                // Actions don't affect the truthiness of the AND group for matching
              }
              currentAndGroupValue = currentAndGroupValue && andSubResult;
            }
          }
          // Final OR combination for the last group
          if (isFirstAndGroup)
            orGroupValue = currentAndGroupValue; // Only one AND group
          else orGroupValue = orGroupValue || currentAndGroupValue;

          return orGroupValue;
        }

        async function performActions(node, path) {
          let actionSuccess = true;
          for (const groupOrOperator of parsedExpression) {
            // Only look at AND_GROUPs because actions are part of them
            if (groupOrOperator.type === "AND_GROUP") {
              for (const term of groupOrOperator.terms) {
                if (term.type === "ACTION") {
                  const success = await term.perform(
                    node,
                    path,
                    term.commandParts, // For -exec
                  );
                  if (!success) {
                    actionSuccess = false; // If any action fails, overall action phase fails for this file
                    // Specific error message for action failure is handled by the action itself
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
          // No expected type, find works on files and dirs
        );
        if (startPathValidation.error) {
          return {
            success: false,
            error: startPathValidation.error
          };
        }

        // If -delete is present, find implies -depth (process children before parent)
        const impliesDepth = parsedExpression.some(
          (g) =>
          g.type === "AND_GROUP" && g.terms.some((t) => t.name === "-delete"),
        );

        async function recurseFind(
          currentResolvedPath,
          processSelfFirst = !impliesDepth, // Default: process self then children, unless -depth implied
        ) {
          if (!overallSuccess) return; // Stop if find command is malformed

          const node = FileSystemManager.getNodeByPath(currentResolvedPath);
          if (!node) {
            // This can happen if a file is deleted during find's execution by -exec or -delete
            // Only error out if it's the initial startPathArg that's missing, which validatePath should catch.
            if (currentResolvedPath !== startPathArg) {
              // Standard find often prints an error for paths that vanish mid-operation if not suppressed.
              OutputManager.appendToOutput(
                `find: ‘${currentResolvedPath}’: No such file or directory`, {
                  typeClass: Config.CSS_CLASSES.ERROR_MSG
                },
              );
            }
            filesProcessedSuccessfully = false; // Mark that we couldn't process something
            return;
          }
          if (!FileSystemManager.hasPermission(node, currentUser, "read")) {
            OutputManager.appendToOutput(
              `find: ‘${currentResolvedPath}’: Permission denied`, {
                typeClass: Config.CSS_CLASSES.ERROR_MSG
              },
            );
            filesProcessedSuccessfully = false; // Cannot read, so cannot process
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
            const childrenNames = Object.keys(node.children || {}); // Make a copy in case children are deleted
            for (const childName of childrenNames) {
              const childResolvedPath = FileSystemManager.getAbsolutePath(
                childName,
                currentResolvedPath,
              );
              await recurseFind(childResolvedPath, processSelfFirst);
              if (!overallSuccess) return; // Propagate critical find errors
            }
          }

          if (!processSelfFirst) {
            // Process self after children (for -depth behavior)
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
        // Standard find exits 0 if all files processed successfully, >0 if error.
        // It doesn't typically indicate "no matches found" as an error.
        return {
          success: finalSuccess,
          output: outputLines.join("\n")
        }; // Output is from -print or similar
      },
      description: " Searches for files in a directory hierarchy based on expressions.",
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
          allowFloat: false, // Delay usually integer ms
          allowNegative: false,
          min: 1, // Must be at least 1ms
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
            }); // No output for delay itself
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
          false, // Not interactive for the sub-command
        );

        if (testResult.success) {
          const failureMessage = `CHECK_FAIL: FAILURE - Command <${commandToTest}> unexpectedly SUCCEEDED.`;
          return {
            success: false, // check_fail itself fails if the command succeeded
            error: failureMessage
          };
        } else {
          const successMessage = `CHECK_FAIL: SUCCESS - Command <${commandToTest}> failed as expected. (Error: ${testResult.error || "N/A"})`;
          return {
            success: true, // check_fail succeeds if the command failed
            output: successMessage
          };
        }
      },
      description: "Tests if a given command string fails, as expected for negative test cases.",
      helpText: 'Usage: check_fail "<command_string>"\n\nExecutes the <command_string>. If <command_string> fails, check_fail succeeds (and the script continues).\nIf <command_string> succeeds, check_fail fails (and the script halts), reporting the unexpected success.',
    },
    register: {
      handler: async (args, options) => {
        // This is an alias for useradd. Call useradd's handler.
        if (commands.useradd?.handler) {
          // console.log("Register command calling useradd handler with args:", args);
          return commands.useradd.handler(args, options);
        }
        // Fallback if useradd somehow isn't defined (should not happen)
        return {
          success: false,
          error: "register: useradd command not found.",
          messageType: Config.CSS_CLASSES.ERROR_MSG,
        };
      },
      description: "Alias for useradd.",
      helpText: "Usage: register <username>\n\nCreates a new user account. This is an alias for the 'useradd' command. Refer to 'help useradd' for more details.",
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
            success: true, // Not an error if user doesn't exist, just no action.
            output: `removeuser: User '${usernameToRemove}' does not exist. No action taken.`,
            messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG,
          };
        }

        const confirmed = await new Promise((resolve) => {
          ConfirmationManager.request(
            [
              `WARNING: This will permanently remove user '${usernameToRemove}' and all their data (files, saved sessions). This cannot be undone. Are you sure?`,
            ],
            null, // No specific data for confirmation action
            () => resolve(true),
            () => resolve(false),
          );
        });

        if (!confirmed) {
          return {
            success: true, // User cancelled, not an error
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
          // This is less critical than FS or user list deletion, so just warn.
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
      helpText: "Usage: removeuser <username>\n\nPermanently removes the specified <username> and all their files and saved sessions. This action requires confirmation and cannot be undone. You cannot remove yourself or the default Guest user.",
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
        const newMode = parseInt(modeArg, 8); // Base 8 for octal

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
        node.mtime = nowISO; // Changing metadata updates mtime
        FileSystemManager._updateNodeAndParentMtime(
          pathValidation.resolvedPath,
          nowISO,
        ); // Ensure parent mtime also updates if necessary

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
        node.mtime = nowISO; // Changing metadata updates mtime
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
          userNames.push(Config.USER.DEFAULT_NAME); // Ensure Guest is always listed
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
      helpText: "Usage: listusers\n\nDisplays a list of all user accounts currently registered in OopisOS, including the default Guest user.",
    },
    printscreen: {
      handler: async (args, options) => {
        // Validate that exactly one argument (filepath) is provided.
        const validationResult = Utils.validateArguments(args, {
          exact: 1
        });
        if (!validationResult.isValid) {
          return {
            success: false,
            error: `printscreen: ${validationResult.errorDetail}`
          };
        }
        const filePathArg = args[0];
        const currentUser = UserManager.getCurrentUser().name;
        const nowISO = new Date().toISOString();

        // Resolve the absolute path for the target file.
        const resolvedPath = FileSystemManager.getAbsolutePath(filePathArg, FileSystemManager.getCurrentPath());

        // Prevent writing directly to root or if path ends with separator (implying directory).
        if (resolvedPath === Config.FILESYSTEM.ROOT_PATH) {
          return {
            success: false,
            error: `printscreen: Cannot save directly to root ('${Config.FILESYSTEM.ROOT_PATH}'). Please specify a filename.`
          };
        }
        if (resolvedPath.endsWith(Config.FILESYSTEM.PATH_SEPARATOR)) {
          return {
            success: false,
            error: `printscreen: Target path '${filePathArg}' must be a file, not a directory path (ending with '${Config.FILESYSTEM.PATH_SEPARATOR}').`
          };
        }

        // Get the current terminal output content.
        const outputContent = DOM.outputDiv ? DOM.outputDiv.innerText : "";

        // Check if the target file already exists.
        const existingNode = FileSystemManager.getNodeByPath(resolvedPath);

        if (existingNode) {
          // If it exists and is a directory, error out.
          if (existingNode.type === Config.FILESYSTEM.DEFAULT_DIRECTORY_TYPE) {
            return {
              success: false,
              error: `printscreen: Cannot overwrite directory '${filePathArg}'.`
            };
          }
          // Check write permission for existing file.
          if (!FileSystemManager.hasPermission(existingNode, currentUser, "write")) {
            return {
              success: false,
              error: `printscreen: '${filePathArg}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`
            };
          }
          // Overwrite existing file content.
          existingNode.content = outputContent;
          // existingNode.mtime = nowISO; // mtime updated by _updateNodeAndParentMtime
        } else {
          // File does not exist, create it.
          // Ensure parent directories exist or can be created.
          const parentDirResult = FileSystemManager.createParentDirectoriesIfNeeded(resolvedPath);
          if (parentDirResult.error) {
            return {
              success: false,
              error: `printscreen: ${parentDirResult.error}`
            };
          }
          const parentNodeForCreation = parentDirResult.parentNode;
          const fileName = resolvedPath.substring(resolvedPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR) + 1);

          if (!parentNodeForCreation) {
            // This should ideally be caught by createParentDirectoriesIfNeeded
            console.error("printscreen: parentNodeForCreation is null despite createParentDirectoriesIfNeeded success.");
            return {
              success: false,
              error: `printscreen: Critical internal error obtaining parent directory for '${filePathArg}'.`
            };
          }

          // Check write permission for the parent directory where the new file will be created.
          if (!FileSystemManager.hasPermission(parentNodeForCreation, currentUser, "write")) {
            return {
              success: false,
              error: `printscreen: Cannot create file in '${FileSystemManager.getAbsolutePath(fileName, parentNodeForCreation.path)}', permission denied in parent.`
            };
          }

          parentNodeForCreation.children[fileName] = {
            type: Config.FILESYSTEM.DEFAULT_FILE_TYPE,
            content: outputContent,
            owner: currentUser,
            mode: Config.FILESYSTEM.DEFAULT_FILE_MODE,
            mtime: nowISO,
          };
        }

        // Update mtime for the node itself and its parent.
        FileSystemManager._updateNodeAndParentMtime(resolvedPath, nowISO);

        // Save changes to the file system.
        if (!await FileSystemManager.save(currentUser)) {
          return {
            success: false,
            error: "printscreen: Failed to save file system changes."
          };
        }

        return {
          success: true,
          output: `Terminal output saved to '${resolvedPath}'`,
          messageType: Config.CSS_CLASSES.SUCCESS_MSG
        };
      },
      description: "Saves the current terminal output to a file.",
      helpText: `Usage: printscreen <filepath>/<filename>\n\nSaves the visible terminal output history to the specified text file within the OopisOS file system.
Example: printscreen /documents/session_log.txt
         printscreen my_output.txt (saves in the current directory)
If the file exists, it will be overwritten. If the path does not exist, parent directories will be created if possible.`
    },
    adventure: {
      handler: async (args, options) => {
        // Check if the TextAdventureModal and TextAdventureEngine are available
        if (typeof TextAdventureModal === 'undefined' || typeof TextAdventureModal.isActive !== 'function') {
          return {
            success: false,
            error: "Adventure UI (TextAdventureModal) is not available."
          };
        }
        if (typeof TextAdventureEngine === 'undefined' || typeof TextAdventureEngine.startAdventure !== 'function') {
          return {
            success: false,
            error: "Adventure Engine (TextAdventureEngine) is not available."
          };
        }

        if (TextAdventureModal.isActive()) {
          return {
            success: false,
            error: "An adventure is already in progress. Type 'quit' or 'exit' in the adventure window to leave the current game."
          };
        }

        // Default sample adventure data (copied from adventure.js for self-containment if needed, or ensure it's globally accessible)
        // For now, assuming sampleAdventure is defined in adventure.js and accessible here or we redefine it.
        // This command handler in CommandExecutor might be defined before adventure.js fully executes.
        // A better approach would be for adventure.js to register this command.
        // For now, let's assume `sampleAdventure` is accessible or we define a fallback.
        let sampleAdventureData;
        if (typeof window.sampleAdventure !== 'undefined') {
            sampleAdventureData = window.sampleAdventure;
        } else {
            // Fallback minimal sample if not globally available - ideally, this isn't hit.
            console.warn("adventure command: window.sampleAdventure not found, using minimal fallback. Ensure adventure.js loads and defines it globally or registers the command itself.");
            sampleAdventureData = {
                title: "Fallback Sample Adventure",
                startingRoomId: "room1",
                rooms: { "room1": { id: "room1", name: "A Plain Room", description: "You are in a plain room. There are no exits.", exits: {} } },
                items: {}
            };
        }


        let adventureToLoad = sampleAdventureData; // Default to sample

        if (args.length > 0) {
          const filePath = args[0];
          // Ensure FileSystemManager and other dependencies are available
          if (typeof FileSystemManager === 'undefined' || typeof UserManager === 'undefined' || typeof Config === 'undefined') {
            return {
              success: false,
              error: "FileSystemManager or UserManager or Config not available for loading adventure file."
            };
          }

          const pathValidation = FileSystemManager.validatePath("adventure", filePath, {
            expectedType: Config.FILESYSTEM.DEFAULT_FILE_TYPE
          });

          if (pathValidation.error) {
            return {
              success: false,
              error: pathValidation.error
            };
          }

          const fileNode = pathValidation.node;
          const currentUser = UserManager.getCurrentUser().name;

          if (!FileSystemManager.hasPermission(fileNode, currentUser, "read")) {
            return {
              success: false,
              error: `adventure: Cannot read file '${filePath}'${Config.MESSAGES.PERMISSION_DENIED_SUFFIX}`
            };
          }

          try {
            adventureToLoad = JSON.parse(fileNode.content);
            // Basic validation of adventure file structure
            if (!adventureToLoad.rooms || !adventureToLoad.startingRoomId || !adventureToLoad.items) { // Added items check
              throw new Error("Invalid adventure file format. Missing essential parts like rooms, items, or startingRoomId.");
            }
            if (!adventureToLoad.title) adventureToLoad.title = filePath; // Use filename as title if not specified
          } catch (e) {
            return {
              success: false,
              error: `adventure: Error parsing adventure file '${filePath}': ${e.message}`
            };
          }
        }

        TextAdventureEngine.startAdventure(adventureToLoad); // This should now correctly handle the modal

        return {
          success: true,
          output: `Launching adventure: "${adventureToLoad.title || 'Untitled Adventure'}"...\n(Game interaction now happens in the adventure modal.)`,
          messageType: Config.CSS_CLASSES.CONSOLE_LOG_MSG
        };
      },
      description: "Starts a text-based adventure game.",
      helpText: "Usage: adventure [path_to_adventure_file.json]\n\nStarts a text-based adventure game. If a JSON file path is provided, it attempts to load that adventure. Otherwise, a sample adventure is launched."
    }

  };
  async function _executeCommandHandler(
    segment,
    execCtxOpts, // Execution context options (like isInteractive)
    stdinContent = null, // Content from stdin (piping)
  ) {
    const cmdData = commands[segment.command.toLowerCase()];
    if (cmdData?.handler) {
      try {
        return await cmdData.handler(segment.args, {
          ...execCtxOpts,
          stdinContent,
          explicitForce: segment.args.includes("-f") || segment.args.includes("--force"), // Pass explicit force flag if present
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
    }; // Should not happen if parser ensures command exists
  }
  async function _executePipeline(pipeline, isInteractive) {
    let currentStdin = null,
      lastResult = {
        success: true,
        output: ""
      }; // Initialize lastResult
    const user = UserManager.getCurrentUser().name; // For file operations
    const nowISO = new Date().toISOString(); // For timestamps

    for (let i = 0; i < pipeline.segments.length; i++) {
      lastResult = await _executeCommandHandler(
        pipeline.segments[i], {
          isInteractive
        }, // Pass isInteractive to handlers
        currentStdin, // Pass output of previous command as stdin
      );
      if (!lastResult.success) {
        const err = `${Config.MESSAGES.PIPELINE_ERROR_PREFIX}'${pipeline.segments[i].command}': ${lastResult.error || "Unknown"}`;
        if (!pipeline.isBackground) {
          await OutputManager.appendToOutput(err, {
            typeClass: Config.CSS_CLASSES.ERROR_MSG,
          });
        } else {
          console.log(`BG pipe err: ${err}`); // Log for background if needed
        }
        return {
          success: false,
          error: err,
          output: lastResult.output
        }; // Stop pipeline on error
      }
      currentStdin = lastResult.output; // Set stdin for next command
    }

    // Handle output redirection if specified and last command was successful
    if (pipeline.redirection && lastResult.success) {
      const {
        type: redirType,
        file: redirFile
      } = pipeline.redirection;
      const outputToRedir = lastResult.output || ""; // Use empty string if null/undefined

      const redirVal = FileSystemManager.validatePath(
        "redirection",
        redirFile, {
          allowMissing: true, // File might be created
          disallowRoot: true, // Cannot redirect to root itself
          defaultToCurrentIfEmpty: false, // Filename must be specified for redirection
        },
      );

      if (
        redirVal.error &&
        !(redirVal.optionsUsed.allowMissing && !redirVal.node)
      ) {
        if (!pipeline.isBackground) {
          await OutputManager.appendToOutput(redirVal.error, {
            // Display specific validation error
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

      // Ensure parent directories exist (important for `mkdir -p somewhere/file > out`)
      const pDirRes =
        FileSystemManager.createParentDirectoriesIfNeeded(absRedirPath);
      // console.log("Redirection Parent Dir Result for", absRedirPath, ":", pDirRes);

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
      // Parent directory creation might have updated 'targetNode' if it was a parent path. Re-validate.
      // targetNode = FileSystemManager.getNodeByPath(absRedirPath); // Re-fetch node if needed (or rely on pDirRes structure)

      if (targetNode) {
        // Target file/path exists
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
        // Target file does not exist, check permission in parent directory
        const parentP =
          absRedirPath.substring(
            0,
            absRedirPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR),
          ) || Config.FILESYSTEM.ROOT_PATH;
        // pDirRes.parentNode should be the correct parent node here after createParentDirectoriesIfNeeded
        const parentN = pDirRes.parentNode || FileSystemManager.getNodeByPath(parentP);
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
          // Check parentN from createParentDirectoriesIfNeeded result
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

      // Get the final parent node where the file will be written
      const finalParentDirPath =
        absRedirPath.substring(
          0,
          absRedirPath.lastIndexOf(Config.FILESYSTEM.PATH_SEPARATOR),
        ) || Config.FILESYSTEM.ROOT_PATH;
      const finalParentNodeForFile =
        FileSystemManager.getNodeByPath(finalParentDirPath);

      if (!finalParentNodeForFile) {
        // This should be caught by pDirRes or earlier checks
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
          // Add newline before appending if needed
          exContent += "\n";
        }
      }

      const owner = targetNode ? targetNode.owner : user; // Preserve owner if exists, else current user
      const mode = targetNode ?
        targetNode.mode :
        Config.FILESYSTEM.DEFAULT_FILE_MODE; // Preserve mode or use default

      finalParentNodeForFile.children[fName] = {
        // Create/overwrite file in parent's children
        type: Config.FILESYSTEM.DEFAULT_FILE_TYPE,
        content: exContent + outputToRedir,
        owner: owner,
        mode: mode,
        mtime: nowISO,
      };
      // finalParentNodeForFile.mtime = nowISO; // Parent mtime updated by _updateNodeAndParentMtime
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
      // Redirection consumes the output, so lastResult.output becomes null for terminal display
      lastResult.output = null;
    }

    // Display output of the last command if not redirected and successful
    if (
      !pipeline.redirection &&
      lastResult.success &&
      lastResult.output !== null &&
      lastResult.output !== undefined // Check for undefined explicitly
    ) {
      if (!pipeline.isBackground) {
        if (lastResult.output) {
          // Check if output is not just an empty string
          await OutputManager.appendToOutput(lastResult.output, {
            typeClass: lastResult.messageType || null, // Use messageType from command if provided
          });
        }
      } else if (lastResult.output && pipeline.isBackground) {
        // For background processes, maybe log to console or a special area, or just suppress
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
    TerminalUI.updatePrompt(); // Update prompt after command execution (e.g., after cd)

    if (!EditorManager.isActive()) {
      // Only show input line and focus if editor is not active
      if (DOM.inputLineContainerDiv) {
        // console.log("Finalize: Showing input line");
        DOM.inputLineContainerDiv.classList.remove(Config.CSS_CLASSES.HIDDEN);
      }
      TerminalUI.focusInput();
    }
    // else {
    // console.log("Finalize: Editor is active, not showing input line or focusing.");
    // }

    if (DOM.outputDiv) {
      // Scroll to bottom, ensures new prompt and output are visible
      DOM.outputDiv.scrollTop = DOM.outputDiv.scrollHeight;
    }
    if (!TerminalUI.getIsNavigatingHistory() && originalCommandText.trim()) {
      HistoryManager.resetIndex(); // Reset history index if not navigating
    }
    TerminalUI.setIsNavigatingHistory(false); // Reset navigation flag
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

    if (ConfirmationManager.isAwaiting()) {
      await ConfirmationManager.handleConfirmation(rawCommandText);
      if (isInteractive) await _finalizeInteractiveModeUI(rawCommandText);
      return finalResult; // Confirmation manager handles its own output
    }
    if (EditorManager.isActive()) return finalResult; // Editor handles its own input flow

    if (EditorManager.isActive()) {
      // console.log("ProcessSingleCommand: Editor is active, returning early.");
      return finalResult; // Should not process terminal commands if editor is active
    }

    const cmdToEcho = rawCommandText.trim();
    if (isInteractive) {
      DOM.inputLineContainerDiv.classList.add(Config.CSS_CLASSES.HIDDEN); // Hide input during processing
      const prompt = `${DOM.promptUserSpan.textContent}${Config.TERMINAL.PROMPT_AT}${DOM.promptHostSpan.textContent}${Config.TERMINAL.PROMPT_SEPARATOR}${DOM.promptPathSpan.textContent}${Config.TERMINAL.PROMPT_CHAR} `;
      await OutputManager.appendToOutput(`${prompt}${cmdToEcho}`);
    }
    if (cmdToEcho === "") {
      if (isInteractive) await _finalizeInteractiveModeUI(rawCommandText);
      return finalResult; // Empty command, do nothing
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
        }; // Parsed to empty pipeline (e.g. just spaces or only '&')
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
            Config.CSS_CLASSES.CONSOLE_LOG_MSG : Config.CSS_CLASSES.WARNING_MSG,
          isBackground: true,
        });
        if (!bgRes.success)
          console.log( // Log detailed error for background job to actual console
            `Info: BG job ${parsedPipe.jobId} (${parsedPipe.segments.map((s) => s.command).join(" | ")}) err: ${bgRes.error || "Unknown"}`,
          );
      }, 0); // Run in next tick
      finalResult = {
        success: true,
        output: null
      }; // BG command itself returns success to terminal immediately
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
