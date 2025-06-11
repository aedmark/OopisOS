#!/oopis

# OopisOS Test Drive Population Script - Polished Showcase Edition (v2.2)
# This script populates a fresh file system with a rich, witty, and
# demonstrative set of data designed to showcase OopisOS capabilities.
# Upgraded by your friendly neighborhood AI.

echo "Initializing Showcase Test Drive population sequence (v2.2)..."
delay 500

# --- Root Directory Population ---
echo "Populating root directory with foundational texts..."

# README.md - The Grand Welcome
echo "# OopisOS Test Drive - README" > ./README.md
echo "" >> ./README.md
echo "Welcome, brave tester, to the meticulously crafted digital landscape of the OopisOS Test Drive!" >> ./README.md
echo "" >> ./README.md
echo "## Purpose" >> ./README.md
echo "This environment has been lovingly populated with a veritable smorgasbord of files and directories. Why? So you can unleash the full power of OopisOS commands like \`find\`, \`grep\`, \`cp\`, \`mv\`, and \`rm\` without the nagging fear of accidentally deleting your _actual_ imaginary work." >> ./README.md
echo "" >> ./README.md
echo "## What is Inside?" >> ./README.md
echo "- **./docs**: For all your textual and markdown perusal needs, now with subdirectories!" >> ./README.md
echo "- **./src**: A peek into the (simulated) bustling world of OopisOS development." >> ./README.md
echo "- **./data**: A treasure trove for \`grep\` enthusiasts and data sifters, complete with logs and structured data." >> ./README.md
echo "- **./reports**: Sample files ready for complex summarization with the 'gemini' command." >> ./README.md
echo "- **./games**: Custom adventures to be launched with the 'adventure' command." >> ./README.md
echo "- **./vault**: A restricted area for testing permissions and ownership. Trespassers will be reformatted." >> ./README.md
echo "- **./for_guest**: A special place for the Guest user." >> ./README.md
echo "- Hidden stuff! Because what is an OS without a few secrets?" >> ./README.md
echo "" >> ./README.md
echo "-- TestBot Prime" >> ./README.md

# system_config.txt - The Bizarre Settings
echo "# System Configuration - OopisOS Test Drive" > ./system_config.txt
echo "# Do NOT edit unless you enjoy unpredictable digital fireworks." >> ./system_config.txt
echo "" >> ./system_config.txt
echo 'VERSION="2.2_showcase_deluxe"' >> ./system_config.txt
echo 'AUTHOR="TestBot Prime (Upgraded)"' >> ./system_config.txt
echo 'PURPOSE="Advanced General System Testing & Light Entertainment"' >> ./system_config.txt
echo "" >> ./system_config.txt
echo 'KERNEL_PANIC_MESSAGE="Oops! The digital hamsters fell off their wheels. Try turning it off and on again?"' >> ./system_config.txt
echo 'COFFEE_LEVEL_REQUIRED="critically_high"' >> ./system_config.txt
echo 'ENABLE_UNICORN_CURSOR_THEME=true # Non-negotiable.' >> ./system_config.txt
echo 'SOUND_ON_ERROR="sad_trombone.wav"' >> ./system_config.txt
echo 'RUBBER_DUCK_ASSISTANCE_MODE=enabled' >> ./system_config.txt

# CHANGELOG.md - A History of Progress
echo "# Changelog" > ./CHANGELOG.md
echo "" >> ./CHANGELOG.md
echo "## v2.2 - The 'Delightfully Deluxe' Update" >> ./CHANGELOG.md
echo "- Added even more directories for deeper \`ls -R\` and \`find\` testing." >> ./CHANGELOG.md
echo "- Implemented the /vault for rigorous permission trials." >> ./CHANGELOG.md
echo "- Expanded /data with structured CSV and detailed system logs." >> ./CHANGELOG.md
echo "" >> ./CHANGELOG.md
echo "## v2.2 - The 'Showcase' Update" >> ./CHANGELOG.md
echo "- Initial population of the test drive environment." >> ./CHANGELOG.md
echo "- Fixed bug where the test script was in the wrong directory. We don't talk about that." >> ./CHANGELOG.md

delay 300

# --- /docs Directory ---
echo "Populating ./docs directory and its new API section..."
mkdir ./docs
mkdir ./docs/api

echo "# OopisOS Documentation - Index" > ./docs/index.md
echo "Welcome to the grand library of OopisOS knowledge!" >> ./docs/index.md
echo "## Table of Contents" >> ./docs/index.md
echo "- [Chapter 1: Getting Started](./chapter1.txt)" >> ./docs/index.md
echo "- [Chapter 2: Advanced Commands](./chapter2.txt)" >> ./docs/index.md
echo "- [API: Command Reference](./api/command_reference.md)" >> ./docs/api/command_reference.md
echo "- [API: Permissions Guide](./api/permissions.md)" >> ./docs/api/permissions.md

echo "# Chapter 1: Getting Started with OopisOS" > ./docs/chapter1.txt
echo "So, you have found yourself within OopisOS. The \`ls\` command is your friend. It shows you things. Now try \`pwd\`. That tells you _where_ you are seeing things. The 'run' command executes a script, a powerful tool for any user." >> ./docs/chapter1.txt

echo "# Chapter 2: Advanced Commands - The Path to Power" > ./docs/chapter2.txt
echo "This chapter delves into the arcane arts of pipes (\`|\`), redirection (\`>\` and \`>>\`), and the mighty \`find\` command." >> ./docs/chapter2.txt
echo "Example: \`ls -a / | grep 'home'\` will list all files in root and then filter that list." >> ./docs/chapter2.txt

echo "### OopisOS Command Reference" > ./docs/api/command_reference.md
echo "A quick, unofficial guide to some key commands." >> ./docs/api/command_reference.md
echo "- \`grep\`: The digital equivalent of finding a needle in a haystack, assuming the needle is a string and the haystack is a text file." >> ./docs/api/command_reference.md
echo "- \`find\`: Your all-seeing eye. Use it to find files by name, type, owner, and more. Less creepy than it sounds." >> ./docs/api/command_reference.md

echo "### Understanding OopisOS Permissions" > ./docs/api/permissions.md
echo "Permissions are simple: owner and other. They use octal modes." >> ./docs/api/permissions.md
echo "Example: \`chmod 75 somefile\` gives the owner read/write/execute (7) and others read/execute (5)." >> ./docs/api/permissions.md
echo "The 'root' user scoffs at your mortal permissions." >> ./docs/api/permissions.md

delay 300

# --- /src Directory ---
echo "Populating ./src with a more complex structure..."
mkdir ./src
mkdir ./src/core
mkdir ./src/styles

echo '<!DOCTYPE html><html><head><title>OopisOS Portal</title><link rel="stylesheet" href="../styles/theme.css"></head><body><h1>Loading Kernel...</h1><script src="../core/kernel.js"></script></body></html>' > ./src/index.html

echo "/* theme.css - Governs the aesthetic of OopisOS */" > ./src/styles/theme.css
echo "body { font-family: 'Comic Sans MS', 'VT323', monospace; }" >> ./src/styles/theme.css
echo ".cursor { animation: rainbow-blink 1s infinite; /* For the Unicorn Cursor Theme */ }" >> ./src/styles/theme.css

echo "// kernel.js - The *real* heart of the beast. Handle with care." > ./src/core/kernel.js
echo "import { Helper } from '../utils.js';" >> ./src/core/kernel.js
echo "console.log('Kernel is loading... surprise quirk of the day:', Helper.generateRandomQuirk());" >> ./src/core/kernel.js

echo "// utils.js - A collection of utilities." > ./src/utils.js
echo "export class Helper { static generateRandomQuirk() { const q = ['Suddenly speaks in rhymes', 'Replaces all nouns with banana', 'Insists on being called Your Majesty', 'Develops a strange obsession with rubber ducks']; return q[Math.floor(Math.random() * q.length)]; } }" >> ./src/utils.js

delay 300

# --- /data Directory ---
echo "Populating ./data with structured logs and data..."
mkdir ./data
mkdir ./data/logs

echo "The quick brown fox, known as Fred, deftly vaulted over Bartholomew, the astonishingly lazy bulldog." > ./data/pangrams.txt
echo "Meanwhile, Jacqueline, my big sphinx of quartz, judged their grammar quite harshly." >> ./data/pangrams.txt
echo "This file contains the word 'fox' multiple times. A fox is a cunning creature. Fox." >> ./data/pangrams.txt

echo "id,user,action,timestamp" > ./data/user_activity.csv
echo "101,root,login,2025-06-08T20:10:00Z" >> ./data/user_activity.csv
echo "102,Guest,adventure,2025-06-08T20:15:12Z" >> ./data/user_activity.csv
echo "103,userDiag,run,2025-06-08T20:18:45Z" >> ./data/user_activity.csv
echo "104,root,chown,2025-06-08T20:20:05Z" >> ./data/user_activity.csv

echo "[2025-06-08T21:00:01Z] [INFO] System boot sequence initiated." > ./data/logs/system.log
echo "[2025-06-08T21:00:02Z] [INFO] Unicorn Cursor Theme loaded successfully." >> ./data/logs/system.log
echo "[2025-06-08T21:00:03Z] [WARN] Coffee level below 50%. Performance may be suboptimal." >> ./data/logs/system.log
echo "[2025-06-08T21:00:04Z] [INFO] User 'root' logged in." >> ./data/logs/system.log
echo "[2025-06-08T21:05:15Z] [ERROR] Sad trombone failed to play: sad_trombone.wav not found." >> ./data/logs/system.log
echo "[2025-06-08T21:05:16Z] [FATAL] Critical failure detected in rubber duck motivation matrix." >> ./data/logs/system.log

delay 300

# --- Permissions and Ownership Showcase ---
login root mcgoopis
echo "Configuring files and directories for permission testing..."
mkdir ./vault

echo "The launch codes are: 1, 2, 3, 4, 5. Seriously." > ./vault/top_secret.txt

mkdir ./for_guest
chown Guest ./for_guest
chmod 75 ./for_guest
echo "Hello Guest! This is a file just for you. Feel free to write in it." > ./for_guest/welcome.txt
chown Guest ./for_guest/welcome.txt
chmod 66 ./for_guest/welcome.txt
su Guest

delay 300

# --- Gemini AI Command Showcase ---
delay 1200
echo "Populating enhanced content for the 'gemini' AI command..."
mkdir ./reports
echo "# Q2 Financial Report & Market Analysis" > ./reports/financials_q2.txt
echo "" >> ./reports/financials_q2.txt
echo "## Executive Summary" >> ./reports/financials_q2.txt
echo "Q2 was a period of significant growth, with revenue increasing by 15% to $150,000. Net profit saw an increase of 20%, reaching $30,000. Market analysis indicates the 'Unicorn Cursor' feature was the primary driver of this unprecedented success, boosting user engagement by over 300%." >> ./reports/financials_q2.txt
echo "" >> ./reports/financials_q2.txt
echo "## Key Financials" >> ./reports/financials_q2.txt
echo "- Total Revenue: $150,000" >> ./reports/financials_q2.txt
echo "- Operating Costs: $120,000" >> ./reports/financials_q2.txt
echo "- Net Profit: $30,000" >> ./reports/financials_q2.txt
echo "" >> ./reports/financials_q2.txt
echo "## Operational Notes" >> ./reports/financials_q2.txt
echo "Operating costs were up 10%, mainly due to a sharp increase in the market price of high-grade coffee beans required to fuel our development team. Furthermore, R&D spending on the 'Rubber Duck Assistance Mode' has exceeded initial projections." >> ./reports/financials_q2.txt

delay 800

# --- Adventure Game Showcase ---
echo "Installing custom adventure games..."
mkdir ./games
# Quest for the Lost Semicolon (kept from original)
echo '{ "title": "Quest for the Lost Semicolon", "startingRoomId": "dev_desk", "winCondition": { "type": "playerHasItem", "itemId": "semicolon" }, "winMessage": "\n*** You found the Lost Semicolon! The main_script.js can now be compiled! You are a hero! ***", "rooms": { "dev_desk": { "name": "A Developer Desk", "description": "You are at a cluttered developer desk. A cold mug of coffee sits next to a glowing monitor showing a syntax error. A path leads north to the kitchen.", "exits": { "north": "kitchen" } }, "kitchen": { "name": "The Office Kitchen", "description": "The coffee machine is empty. A suspicious-looking rubber duck sits on the counter. You can go south back to the desk.", "exits": { "south": "dev_desk" } } }, "items": { "coffee_mug": { "id": "coffee_mug", "name": "Cold Coffee Mug", "description": "It is cold, dark, and bitter. Like a Monday morning.", "location": "dev_desk", "canTake": true }, "rubber_duck": { "id": "rubber_duck", "name": "Suspicious Rubber Duck", "description": "It seems to be watching you. It squeaks ominously. Underneath, a tiny, shiny object is wedged.", "location": "kitchen", "canTake": false }, "semicolon": { "id": "semicolon", "name": "The Lost Semicolon", "description": "A perfect, gleaming semicolon. A beacon of hope for broken code.", "location": "kitchen", "canTake": true } } }' > ./games/quest_for_the_semicolon.json

# NEW: The Duck Pond Adventure
echo '{ "title": "The Duck Pond", "startingRoomId": "pond_edge", "rooms": { "pond_edge": { "name": "Edge of a Serene Pond", "description": "You are at the edge of a small, digital pond. Several rubber ducks float aimlessly. One of them looks... different. It has a crown.", "exits": {} } }, "items": { "king_duck": { "id": "king_duck", "name": "The Duck King", "description": "This rubber duck wears a tiny, majestic crown. It judges your every command.", "location": "pond_edge", "canTake": false } } }' > ./games/duck_pond.json
delay 500

# --- Finalization ---
echo " "
echo "*********************************************************"
echo "SHOWCASE Test Drive Population Sequence COMPLETE!"
echo "*********************************************************"
echo "Your OopisOS drive is now ready for demonstration."
delay 50
echo "Suggestions for immediate testing:"
echo " "
echo " # --- Basic Navigation & Search ---"
echo " ls -R"
echo " find . -name '*.js' -o -name '*.css'"
echo " grep -iR 'duck' ."
echo " grep 'ERROR' ./data/logs/system.log"
echo " "
delay 50
echo " # --- Permissions Testing ---"
echo " ls -l ./vault"
echo " cat ./vault/top_secret.txt"
echo " su Guest"
echo " cat /home/userDiag/vault/top_secret.txt # (Should fail)"
echo " ls -l /home/userDiag/for_guest"
echo " echo 'A message from Guest!' >> /home/userDiag/for_guest/welcome.txt # (Should succeed)"
echo " logout # (Return to userDiag)"
delay 50
echo " "
echo " # --- Test Gemini AI ---"
echo " gemini ./reports/financials_q2.txt \"What was the net profit and what was the main reason for increased costs?\""
echo " "
delay 50
echo " # --- Test the Adventure Game ---"
echo " adventure ./games/quest_for_the_semicolon.json"
echo " "
delay 50