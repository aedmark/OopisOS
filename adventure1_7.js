// adventure.js - OopisOS Adventure Engine and Editor v1.7

const TextAdventureModal = (() => {
  "use strict";
  // DOM Elements for the adventure modal
  let adventureModal, adventureContainer, adventureTitle, adventureOutput, adventureInput, adventureCloseBtn;
  let isActive = false;
  let currentAdventureData = null;
  let currentEngineInstance = null;

  // Initializes DOM elements for the modal
  function _initDOM() {
    adventureModal = document.getElementById('adventure-modal');
    adventureContainer = document.getElementById('adventure-container');
    adventureTitle = document.getElementById('adventure-title');
    adventureOutput = document.getElementById('adventure-output');
    adventureInput = document.getElementById('adventure-input');
    adventureCloseBtn = document.getElementById('adventure-close-btn');

    if (!adventureModal || !adventureInput || !adventureCloseBtn || !adventureOutput) {
      console.error("TextAdventureModal: Critical UI elements not found in DOM!");
      // Fallback: attempt to create them if they are missing (basic structure)
      // This is not ideal and assumes the main container #adventure-modal exists.
      if (adventureModal && !adventureContainer) { // If only modal exists, try to build inner
        adventureModal.innerHTML = `
                    <div id="adventure-container" style="width: 700px; height: 500px; background: #0A0A0A; border: 1px solid #0F0; display: flex; flex-direction: column; padding: 10px; font-family: 'VT323', monospace; color: #0F0;">
                        <div id="adventure-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <span id="adventure-title" style="font-size: 1.2em;">Text Adventure</span>
                            <button id="adventure-close-btn" style="background: #333; color: #0F0; border: 1px solid #0F0; padding: 2px 5px; cursor: pointer;">Exit</button>
                        </div>
                        <div id="adventure-output" style="flex-grow: 1; overflow-y: auto; margin-bottom: 10px; white-space: pre-wrap;"></div>
                        <div id="adventure-input-container" style="display: flex;"><span style="margin-right: 5px;">&gt;</span><input type="text" id="adventure-input" style="flex-grow: 1; background: transparent; border: none; color: #0F0; font-family: 'VT323', monospace; outline: none;"></div>
                    </div>`;
        // Re-query after creation
        _initDOM(); // Recursive call to re-assign variables, ensure it has a base case or limit
      }
      return false;
    }
    return true;
  }

  // Shows the adventure modal and sets up listeners
  function show(adventureData, engineInstance) {
    if (!_initDOM()) {
      // Attempt to access OutputManager and Config, but be defensive as they might not be loaded if this script fails early
      if (typeof OutputManager !== 'undefined' && typeof OutputManager.appendToOutput === 'function' && typeof Config !== 'undefined' && Config.CSS_CLASSES) {
        OutputManager.appendToOutput("Error: Text Adventure UI could not be initialized.", {
          typeClass: Config.CSS_CLASSES.ERROR_MSG
        });
      } else {
        console.error("Critical Error: Text Adventure UI could not be initialized, and OutputManager/Config are not available for error reporting.");
      }
      return;
    }

    currentAdventureData = adventureData;
    currentEngineInstance = engineInstance;
    isActive = true;

    if (adventureTitle && currentAdventureData && currentAdventureData.title) {
      adventureTitle.textContent = currentAdventureData.title;
    }
    adventureOutput.innerHTML = ''; // Clear previous output
    adventureInput.value = '';
    adventureInput.disabled = false; // Ensure input is enabled when showing

    adventureModal.classList.remove('hidden');

    // Ensure OutputManager and TerminalUI are available before calling their methods
    if (typeof OutputManager !== 'undefined' && typeof OutputManager.setEditorActive === 'function') {
      OutputManager.setEditorActive(true); // Use editor's flag to suppress terminal output
    } else {
      console.warn("TextAdventureModal: OutputManager not available to set editor active state.");
    }
    if (typeof TerminalUI !== 'undefined' && typeof TerminalUI.setInputState === 'function') {
      TerminalUI.setInputState(false); // Disable main terminal input
    } else {
      console.warn("TextAdventureModal: TerminalUI not available to set input state.");
    }


    adventureInput.focus();
    adventureInput.addEventListener('keydown', _handleInputKeydown);
    adventureCloseBtn.addEventListener('click', hide);
  }

  // Hides the adventure modal and cleans up
  function hide() {
    if (!_initDOM() || !isActive) return;

    isActive = false;
    currentAdventureData = null;
    currentEngineInstance = null;

    adventureModal.classList.add('hidden');

    if (typeof OutputManager !== 'undefined' && typeof OutputManager.setEditorActive === 'function') {
      OutputManager.setEditorActive(false); // Release suppression
    }
    if (typeof TerminalUI !== 'undefined' && typeof TerminalUI.setInputState === 'function') {
      TerminalUI.setInputState(true); // Re-enable main terminal input
      TerminalUI.focusInput(); // Focus main terminal
    }

    adventureInput.removeEventListener('keydown', _handleInputKeydown);
    adventureCloseBtn.removeEventListener('click', hide);

    if (typeof OutputManager !== 'undefined' && typeof OutputManager.appendToOutput === 'function' && typeof Config !== 'undefined' && Config.CSS_CLASSES) {
      OutputManager.appendToOutput("Exited text adventure.", {
        typeClass: Config.CSS_CLASSES.CONSOLE_LOG_MSG
      });
    }
  }

  // Handles keydown events on the adventure input (specifically Enter)
  function _handleInputKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const command = adventureInput.value.trim();
      adventureInput.value = '';
      if (command && currentEngineInstance) {
        currentEngineInstance.processCommand(command);
      }
    }
  }

  // Appends text to the adventure output area
  function appendOutput(text, type = 'room-desc') { // type can be 'room-name', 'room-desc', 'exits', 'items', 'error', 'info', 'system'
    if (!adventureOutput && !_initDOM()) return; // Ensure DOM is ready, if not, try to init
    if (adventureOutput) {
      const p = document.createElement('p');
      p.textContent = text;
      if (type) {
        p.className = type; // Apply class for styling
      }
      adventureOutput.appendChild(p);
      adventureOutput.scrollTop = adventureOutput.scrollHeight; // Auto-scroll
    }
  }

  // Public API
  return {
    show,
    hide,
    appendOutput,
    isActive: () => isActive,
  };
})(); // Correctly close TextAdventureModal IIFE


const TextAdventureEngine = (() => {
  "use strict";

  let adventure; // Holds the entire adventure data {title, rooms, items, startingRoomId, player}
  let player; // Holds player state {currentLocation, inventory}
  let adventureInputRef; // To store reference to the input field for disabling

  // Starts a new adventure
  function startAdventure(adventureData) {
    adventure = JSON.parse(JSON.stringify(adventureData)); // Deep copy to avoid modifying original
    player = {
      currentLocation: adventure.startingRoomId,
      inventory: adventure.player?.inventory || [], // Initialize inventory from adventure data or empty
    };
    // Store reference to the input field from TextAdventureModal if available
    // This is a bit of a hack; ideally, the modal would handle disabling its own input.
    // However, to fix the immediate error, we'll try to get it.
    const advInput = document.getElementById('adventure-input');
    if (advInput) {
      adventureInputRef = advInput;
    } else {
      console.warn("TextAdventureEngine: Could not get reference to adventure input field.");
      adventureInputRef = null;
    }

    TextAdventureModal.show(adventure, {
      processCommand
    }); // Pass engine instance for callbacks
    _displayCurrentRoom();
  }

  // Processes a player command
  function processCommand(command) {
    TextAdventureModal.appendOutput(`> ${command}`, 'system'); // Echo command
    const parts = command.toLowerCase().trim().split(/\s+/);
    const action = parts[0];
    const target = parts.slice(1).join(" ");

    if (!action) return;

    switch (action) {
      case 'look':
        _handleLook(target);
        break;
      case 'go':
      case 'move':
        _handleGo(target);
        break;
      case 'take':
      case 'get':
        _handleTake(target);
        break;
      case 'drop':
        _handleDrop(target);
        break;
      case 'inventory':
      case 'i':
        _handleInventory();
        break;
      case 'help':
        _handleHelp();
        break;
      case 'quit':
      case 'exit':
        TextAdventureModal.hide();
        break;
      default:
        TextAdventureModal.appendOutput("I don't understand that command. Try 'help'.", 'error');
    }
    // After processing a command that might change game state (like picking up an item that was the win condition)
    _checkWinConditions();
  }

  // Displays the current room's information
  function _displayCurrentRoom() {
    const room = adventure.rooms[player.currentLocation];
    if (!room) {
      TextAdventureModal.appendOutput("Error: You are in an unknown void!", 'error');
      return;
    }

    TextAdventureModal.appendOutput(`\n--- ${room.name} ---`, 'room-name');
    TextAdventureModal.appendOutput(room.description, 'room-desc');

    const roomItems = _getItemsInRoom(player.currentLocation);
    if (roomItems.length > 0) {
      TextAdventureModal.appendOutput("You see here: " + roomItems.map(item => adventure.items[item.id].name).join(", ") + ".", 'items');
    }

    const exitNames = Object.keys(room.exits || {});
    if (exitNames.length > 0) {
      TextAdventureModal.appendOutput("Exits: " + exitNames.join(", ") + ".", 'exits');
    } else {
      TextAdventureModal.appendOutput("There are no obvious exits.", 'exits');
    }
  }

  // Handles the 'look' command
  function _handleLook(target) {
    if (!target || target === 'room' || target === 'around') {
      _displayCurrentRoom();
    } else {
      // Look at item in room or inventory
      const item = _findItemByName(target, player.currentLocation) || _findItemInInventory(target);
      if (item) {
        TextAdventureModal.appendOutput(item.description, 'info');
      } else {
        TextAdventureModal.appendOutput(`You don't see any "${target}" here.`, 'error');
      }
    }
  }

  // Handles the 'go' command
  function _handleGo(direction) {
    const room = adventure.rooms[player.currentLocation];
    if (room.exits && room.exits[direction]) {
      const nextRoomId = room.exits[direction];
      if (adventure.rooms[nextRoomId]) {
        player.currentLocation = nextRoomId;
        _displayCurrentRoom();
      } else {
        TextAdventureModal.appendOutput(`Error: The path to ${direction} leads to an undefined area!`, 'error');
      }
    } else {
      TextAdventureModal.appendOutput(`You can't go ${direction}.`, 'error');
    }
  }

  // Handles the 'take' command
  function _handleTake(itemName) {
    const item = _findItemByName(itemName, player.currentLocation);
    if (item) {
      if (item.canTake !== false) { // Default to true if not specified
        player.inventory.push(item.id);
        // Remove from room (by setting its location to 'player' or similar)
        item.location = 'player'; // Or remove from room's item list if structured that way
        TextAdventureModal.appendOutput(`You take the ${item.name}.`, 'info');
      } else {
        TextAdventureModal.appendOutput(`You can't take the ${item.name}.`, 'error');
      }
    } else {
      TextAdventureModal.appendOutput(`There is no "${itemName}" here to take.`, 'error');
    }
  }

  // Handles the 'drop' command
  function _handleDrop(itemName) {
    const item = _findItemInInventory(itemName);
    if (item) {
      player.inventory = player.inventory.filter(id => id !== item.id);
      // Add to room
      item.location = player.currentLocation; // Or add to room's item list
      TextAdventureModal.appendOutput(`You drop the ${item.name}.`, 'info');
    } else {
      TextAdventureModal.appendOutput(`You don't have a "${itemName}" to drop.`, 'error');
    }
  }

  // Handles the 'inventory' command
  function _handleInventory() {
    if (player.inventory.length === 0) {
      TextAdventureModal.appendOutput("You are not carrying anything.", 'info');
    } else {
      const itemNames = player.inventory.map(id => adventure.items[id].name);
      TextAdventureModal.appendOutput("You are carrying: " + itemNames.join(", ") + ".", 'info');
    }
  }

  // Handles the 'help' command
  function _handleHelp() {
    TextAdventureModal.appendOutput("\nAvailable commands:", 'system');
    TextAdventureModal.appendOutput("  look [target] - Describes the room or an item.", 'system');
    TextAdventureModal.appendOutput("  go [direction] - Moves in a direction (e.g., go north).", 'system');
    TextAdventureModal.appendOutput("  take [item]   - Picks up an item.", 'system');
    TextAdventureModal.appendOutput("  drop [item]   - Drops an item.", 'system');
    TextAdventureModal.appendOutput("  inventory (i) - Shows what you are carrying.", 'system');
    TextAdventureModal.appendOutput("  help          - Shows this help message.", 'system');
    TextAdventureModal.appendOutput("  quit / exit   - Exits the adventure.", 'system');
  }

  // Finds an item by name in the current room or globally if no location specified
  function _findItemByName(name, locationId = null) {
    for (const id in adventure.items) {
      const item = adventure.items[id];
      if (item.name.toLowerCase() === name.toLowerCase()) {
        if (locationId === null || item.location === locationId) { // Check if item is in the specified room
          return item;
        }
      }
    }
    return null;
  }

  // Finds an item by name in the player's inventory
  function _findItemInInventory(name) {
    const itemId = player.inventory.find(id => adventure.items[id].name.toLowerCase() === name.toLowerCase());
    return itemId ? adventure.items[itemId] : null;
  }

  // Gets all items currently in a specific room
  function _getItemsInRoom(roomId) {
    const itemsInRoom = [];
    for (const id in adventure.items) {
      if (adventure.items[id].location === roomId) {
        itemsInRoom.push(adventure.items[id]);
      }
    }
    return itemsInRoom;
  }

  // Placeholder for win condition checking
  function _checkWinConditions() {
    const winCondition = adventure.winCondition;
    if (!winCondition) return;

    let won = false;
    if (winCondition.type === "itemInRoom" &&
      adventure.items[winCondition.itemId]?.location === winCondition.roomId) {
      won = true;
    } else if (winCondition.type === "playerHasItem" &&
      player.inventory.includes(winCondition.itemId)) {
      won = true;
    }
    // Add more win condition types as needed

    if (won) {
      TextAdventureModal.appendOutput(adventure.winMessage || "\n*** Congratulations! You have won! ***", 'system');
      if (adventureInputRef) { // Check if reference exists
        adventureInputRef.disabled = true; // Simple way to stop input
      }
      // TextAdventureModal.hide(); // Or just close
    }
  }


  // Public API
  return {
    startAdventure,
    processCommand, // Exposed for TextAdventureModal to call
  };
})(); // Correctly close TextAdventureEngine IIFE


// --- Sample Adventure Data ---
const sampleAdventure = {
  title: "The Lost Key of Oopis",
  startingRoomId: "forest_entrance",
  player: {
    inventory: [] // Player starts with no items
  },
  rooms: {
    "forest_entrance": {
      id: "forest_entrance",
      name: "Forest Entrance",
      description: "You are at the edge of a dark, ancient forest. A narrow path leads north into the woods. To the south is a vast, open plain you just crossed.",
      exits: {
        "north": "clearing",
        "south": "plains_edge"
      }
    },
    "plains_edge": {
      id: "plains_edge",
      name: "Edge of the Plains",
      description: "You are on the edge of a wide, windswept plain. The forest entrance is to the north. The plains stretch endlessly south.",
      exits: {
        "north": "forest_entrance"
      }
    },
    "clearing": {
      id: "clearing",
      name: "Forest Clearing",
      description: "You are in a small clearing. Sunlight dapples through the leaves. Paths lead east and west. The way south leads back to the forest entrance. There is an old, locked chest here.",
      exits: {
        "south": "forest_entrance",
        "east": "grove",
        "west": "cave_mouth"
      },
    },
    "grove": {
      id: "grove",
      name: "Quiet Grove",
      description: "A peaceful grove. A small, shiny object glints under a bush. A path leads west back to the clearing.",
      exits: {
        "west": "clearing"
      }
    },
    "cave_mouth": {
      id: "cave_mouth",
      name: "Cave Mouth",
      description: "The path ends at the dark mouth of a cave. It looks spooky. You can go east to return to the clearing or enter the cave to the north.",
      exits: {
        "east": "clearing",
        "north": "dark_cave"
      }
    },
    "dark_cave": {
      id: "dark_cave",
      name: "Dark Cave",
      description: "It's pitch black. You can't see a thing! Maybe you should have brought a light source. You can only feel your way south, back to the cave mouth.",
      exits: {
        "south": "cave_mouth"
      }
    }
  },
  items: {
    "key": {
      id: "key",
      name: "Shiny Key",
      description: "A small, intricately carved key. It looks important.",
      location: "grove",
      canTake: true
    },
    "chest": {
      id: "chest",
      name: "Old Chest",
      description: "A sturdy wooden chest, bound with iron. It's locked.",
      location: "clearing",
      canTake: false,
      isLocked: true,
      unlocksWith: "key"
    },
    "treasure": {
      id: "treasure",
      name: "Oopis Gem",
      description: "A brilliant, pulsating gem. The legendary Oopis Gem!",
      location: "chest_contents",
      canTake: true
    }
  },
  winCondition: {
    type: "playerHasItem",
    itemId: "treasure"
  },
  winMessage: "\n*** You found the Oopis Gem! Your quest is complete! ***"
};


// Integration with OopisOS (placeholder for CommandExecutor)
if (typeof CommandExecutor !== 'undefined' && CommandExecutor.getCommands) {
  const oopisCommands = CommandExecutor.getCommands();
  if (!oopisCommands.adventure) {
    oopisCommands.adventure = {
      handler: async (args, options) => {
        // Defensive checks for TextAdventureModal and TextAdventureEngine
        if (typeof TextAdventureModal === 'undefined' || typeof TextAdventureModal.isActive !== 'function') {
          console.error("Command 'adventure': TextAdventureModal is not defined or not initialized correctly.");
          return {
            success: false,
            error: "Adventure UI (TextAdventureModal) is not available. Check console for JS errors."
          };
        }
        if (typeof TextAdventureEngine === 'undefined' || typeof TextAdventureEngine.startAdventure !== 'function') {
          console.error("Command 'adventure': TextAdventureEngine is not defined or not initialized correctly.");
          return {
            success: false,
            error: "Adventure Engine (TextAdventureEngine) is not available. Check console for JS errors."
          };
        }


        if (TextAdventureModal.isActive()) {
          return {
            success: false,
            error: "An adventure is already in progress. Type 'quit' in the adventure window to exit."
          };
        }

        let adventureToLoad = sampleAdventure; // Default to sample

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
            if (!adventureToLoad.rooms || !adventureToLoad.startingRoomId || !adventureToLoad.items) { // Added items check
              throw new Error("Invalid adventure file format. Missing essential parts like rooms, items, or startingRoomId.");
            }
            if (!adventureToLoad.title) adventureToLoad.title = filePath;
          } catch (e) {
            return {
              success: false,
              error: `adventure: Error parsing adventure file '${filePath}': ${e.message}`
            };
          }
        }

        TextAdventureEngine.startAdventure(adventureToLoad);
        return {
          success: true,
          output: `Launching adventure: "${adventureToLoad.title || 'Untitled Adventure'}"...\n(Game interaction now happens in the adventure modal.)`,
          messageType: (typeof Config !== 'undefined' && Config.CSS_CLASSES) ? Config.CSS_CLASSES.CONSOLE_LOG_MSG : null
        };
      },
      description: "Starts a text-based adventure game.",
      helpText: "Usage: adventure [adventure_file.json]\n\nStarts a text adventure. If no file is specified, a sample adventure is launched."
    };
  }
} else {
  console.warn("CommandExecutor not found, 'adventure' command cannot be added. Run 'adventure_start()' manually from console for testing.");
}

// Manual start function for testing if CommandExecutor integration is not immediate
function adventure_start() {
  if (typeof TextAdventureModal !== 'undefined' && typeof TextAdventureEngine !== 'undefined' && typeof sampleAdventure !== 'undefined') {
    if (TextAdventureModal.isActive()) {
      console.log("Adventure already active. Close it first.");
      return;
    }
    console.log("Manually starting sample adventure...");
    TextAdventureEngine.startAdventure(sampleAdventure);
  } else {
    console.error("TextAdventureModal, Engine, or sampleAdventure not ready for manual start.");
  }
}