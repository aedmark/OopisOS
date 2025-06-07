#!/oopis

# OopisOS Test Drive Population Script - Polished Showcase Edition (v2.0)
# This script populates a fresh file system with a rich set of data.

echo "Initializing Showcase Test Drive population sequence (v2.0)..."
delay 500

# Root level files
echo "Populating root directory..."
echo "# OopisOS Test Drive - README" > ./README.md
echo "" >> ./README.md
echo "Welcome, brave tester, to the meticulously crafted digital landscape of the OopisOS Test Drive!" >> ./README.md
echo "" >> ./README.md
echo "## Purpose" >> ./README.md
echo "This environment has been lovingly populated with a veritable smorgasbord of files and directories. Why? So you can unleash the full power of OopisOS commands like \`find\`, \`grep\`, \`cp\`, \`mv\`, and \`rm\` without the nagging fear of accidentally deleting your _actual_ imaginary work." >> ./README.md
echo "" >> ./README.md
echo "## What is Inside?" >> ./README.md
echo "- **./docs**: For all your textual and markdown perusal needs." >> ./README.md
echo "- **./src**: A peek into the (simulated) bustling world of OopisOS development." >> ./README.md
echo "- **./data**: A treasure trove for \`grep\` enthusiasts and data sifters." >> ./README.md
echo "- **./reports**: Sample files ready for use with the 'gemini' command." >> ./README.md
echo "- **./games**: Custom adventures to be launched with the 'adventure' command." >> ./README.md
echo "- Hidden stuff! Because what is an OS without a few secrets?" >> ./README.md
echo "" >> ./README.md
echo "-- TestBot Prime" >> ./README.md

echo "# System Configuration - OopisOS Test Drive" > ./system_config.txt
echo "# Do NOT edit unless you enjoy unpredictable digital fireworks." >> ./system_config.txt
echo "" >> ./system_config.txt
echo 'VERSION="2.0_showcase_edition"' >> ./system_config.txt
echo 'AUTHOR="TestBot Prime (Upgraded)"' >> ./system_config.txt
echo 'PURPOSE="Advanced General System Testing & Light Entertainment"' >> ./system_config.txt
echo "" >> ./system_config.txt
echo 'KERNEL_PANIC_MESSAGE="Oops! The digital hamsters fell off their wheels. Try turning it off and on again?"' >> ./system_config.txt
echo 'COFFEE_LEVEL_REQUIRED="critically_high"' >> ./system_config.txt
echo 'ENABLE_UNICORN_CURSOR_THEME=true # Non-negotiable.' >> ./system_config.txt
echo 'SOUND_ON_ERROR="sad_trombone.wav"' >> ./system_config.txt
delay 200

touch ./empty_file.dat
echo "This file has no specific extension. It contains profound thoughts about the nature of file types, or perhaps just this sentence. The ambiguity is the point. It asks, 'What am I? Who defines me?'" > ./justafile
echo "This is another file, placed here for the sole purpose of adding a bit more clutter. It serves as a testament to the fact that not every file needs a grand destiny. Some files are just... files." > ./another_file

# ./docs directory
echo "Populating ./docs directory..."
mkdir ./docs
echo "# OopisOS Documentation - Index" > ./docs/index.md
echo "Welcome to the grand library of OopisOS knowledge!" >> ./docs/index.md
echo "## Table of Contents" >> ./docs/index.md
echo "- [Chapter 1: Getting Started](./chapter1.txt)" >> ./docs/index.md
echo "- [Chapter 2: Advanced Commands](./chapter2.txt)" >> ./docs/index.md
echo "- [Search Tips](./search_tips.txt)" >> ./docs/index.md
delay 200

echo "# Chapter 1: Getting Started with OopisOS" > ./docs/chapter1.txt
echo "So, you have found yourself within OopisOS. The \`ls\` command is your friend. It shows you things. Now try \`pwd\`. That tells you _where_ you are seeing things." >> ./docs/chapter1.txt
delay 200

echo "# Chapter 2: Advanced Commands - The Path to Power" > ./docs/chapter2.txt
echo "This chapter delves into the arcane arts of pipes (\`|\`), redirection (\`>\` and \`>>\`), and the mighty \`find\` command." >> ./docs/chapter2.txt
echo "Example: \`ls -a / | grep 'home'\` will list all files in root and then filter that list." >> ./docs/chapter2.txt
delay 200

# ./src directory
echo "Populating ./src directory with sample code..."
mkdir ./src
echo "// main_script.js - The heart of the beast." > ./src/main_script.js
echo "function main() {" >> ./src/main_script.js
echo "  console.log('System appears to be... operational. For now.');" >> ./src/main_script.js
echo "  // TODO: Add feature that definitely will not break everything." >> ./src/main_script.js
echo "}" >> ./src/main_script.js
delay 200

echo "// utils.js - A collection of utilities." > ./src/utils.js
echo "class Helper {" >> ./src/utils.js
echo "  static generateRandomQuirk() {" >> ./src/utils.js
echo "    const quirks = [" >> ./src/utils.js
echo "      'Suddenly speaks in rhymes'," >> ./src/utils.js
echo "      'Replaces all nouns with the word banana'," >> ./src/utils.js
echo "      'Insists on being called Your Majesty'," >> ./src/utils.js
echo "      'Develops a strange obsession with rubber ducks'," >> ./src/utils.js
echo "    ];" >> ./src/utils.js
echo "    return quirks[Math.floor(Math.random() * quirks.length)];" >> ./src/utils.js
echo "  }" >> ./src/utils.js
echo "}" >> ./src/utils.js
delay 200

echo "# data_processor.py - A completely legit Python script." > ./src/data_processor.py
echo "# (If OopisOS suddenly learned Python, which it has not. Yet.)" >> ./src/data_processor.py
echo "def process_data(input_file):" >> ./src/data_processor.py
echo "  print(f'Pretending to process {input_file}...')" >> ./src/data_processor.py
echo "" >> ./src/data_processor.py
echo "if __name__ == '__main__':" >> ./src/data_processor.py
echo "  print('Data Processor Script Initialized (in theory).')" >> ./src/data_processor.py
delay 200

# /data directory
echo "Populating ./data directory with searchable text..."
mkdir ./data
echo "The quick brown fox, known as Fred, deftly vaulted over Bartholomew, the astonishingly lazy bulldog." > ./data/pangrams.txt
echo "Meanwhile, Jacqueline, my big sphinx of quartz, judged their grammar quite harshly." >> ./data/pangrams.txt
echo "This file contains the word 'fox' multiple times. A fox is a cunning creature. Fox." >> ./data/pangrams.txt
delay 200

echo "Barnaby Snoozlebottom III, the laziest brown dog in all of OopisOS, sighed. 'Is a dog truly a dog if it cannot \`bark\`?' he mused." > ./data/dog_story.txt
echo "His nemesis, a clever cat named Seraphina, just smirked." >> ./data/dog_story.txt
delay 200

# Hidden files
echo "Creating some hidden files for discovery..."
touch ./.env
echo "SECRET_CODE='12345'" >> ./.env
echo "API_KEY='not_a_real_key_obviously'" >> ./.env
delay 200

# Files for timestamp testing
echo "Creating files with older timestamps..."
touch -t 202301151030 ./ancient_document.txt
echo "This document hails from the distant past of January 15th, 2023." > ./ancient_document.txt
delay 200
touch -t 202405201400.30 ./previous_year_file.log
echo "Log File from a Bygone Era (Last Year)" > ./previous_year_file.log
delay 200

# Gemini AI Command Showcase
echo "Populating content for the 'gemini' AI command..."
mkdir ./reports
echo "# Q2 Financial Report Summary" > ./reports/financials_q2.txt
echo "Q2 was a period of significant growth, with revenue increasing by 15% to $150,000. Net profit saw an increase of 20%, reaching $30,000. The 'Unicorn Cursor' feature was the primary driver of this success." >> ./reports/financials_q2.txt
echo "Operating costs were up 10%, mainly due to a sharp increase in the market price of high-grade coffee." >> ./reports/financials_q2.txt
delay 200

# Adventure Game Showcase
echo "Installing a sample adventure game..."
mkdir ./games
echo '{' > ./games/quest_for_the_semicolon.json
echo '  "title": "Quest for the Lost Semicolon",' >> ./games/quest_for_the_semicolon.json
echo '  "startingRoomId": "dev_desk",' >> ./games/quest_for_the_semicolon.json
echo '  "winCondition": { "type": "playerHasItem", "itemId": "semicolon" },' >> ./games/quest_for_the_semicolon.json
echo '  "winMessage": "\\n*** You found the Lost Semicolon! The main_script.js can now be compiled! You are a hero! ***", ' >> ./games/quest_for_the_semicolon.json
echo '  "rooms": {' >> ./games/quest_for_the_semicolon.json
echo '    "dev_desk": {' >> ./games/quest_for_the_semicolon.json
echo '      "name": "A Developer Desk",' >> ./games/quest_for_the_semicolon.json
echo '      "description": "You are at a cluttered developer desk. A cold mug of coffee sits next to a glowing monitor showing a syntax error. A path leads north to the kitchen.",' >> ./games/quest_for_the_semicolon.json
echo '      "exits": { "north": "kitchen" }' >> ./games/quest_for_the_semicolon.json
echo '    },' >> ./games/quest_for_the_semicolon.json
echo '    "kitchen": {' >> ./games/quest_for_the_semicolon.json
echo '      "name": "The Office Kitchen",' >> ./games/quest_for_the_semicolon.json
echo '      "description": "The coffee machine is empty. A suspicious-looking rubber duck sits on the counter. You can go south back to the desk.",' >> ./games/quest_for_the_semicolon.json
echo '      "exits": { "south": "dev_desk" }' >> ./games/quest_for_the_semicolon.json
echo '    }' >> ./games/quest_for_the_semicolon.json
echo '  },' >> ./games/quest_for_the_semicolon.json
echo '  "items": {' >> ./games/quest_for_the_semicolon.json
echo '    "coffee_mug": { "id": "coffee_mug", "name": "Cold Coffee Mug", "description": "It is cold, dark, and bitter. Like a Monday morning.", "location": "dev_desk", "canTake": true },' >> ./games/quest_for_the_semicolon.json
echo '    "rubber_duck": { "id": "rubber_duck", "name": "Suspicious Rubber Duck", "description": "It seems to be watching you. It squeaks ominously. Underneath, a tiny, shiny object is wedged.", "location": "kitchen", "canTake": false },' >> ./games/quest_for_the_semicolon.json
echo '    "semicolon": { "id": "semicolon", "name": "The Lost Semicolon", "description": "A perfect, gleaming semicolon. A beacon of hope for broken code.", "location": "kitchen", "canTake": true }' >> ./games/quest_for_the_semicolon.json
echo '  }' >> ./games/quest_for_the_semicolon.json
echo '}' >> ./games/quest_for_the_semicolon.json
delay 500

# --- Finalization ---
echo " "
echo "*********************************************************"
echo "SHOWCASE Test Drive Population Sequence COMPLETE!"
echo "*********************************************************"
echo "Your OopisOS drive is now ready for demonstration."
echo "Suggestions for immediate testing:"
echo " find . -name '*.txt'"
echo " grep -iR 'fox' ./data"
echo " ls -R"
echo " "
echo " # --- Test Gemini AI ---"
echo " gemini ./reports/financials_q2.txt \"What was the net profit?\""
echo " "
echo " # --- Test the Adventure Game ---"
echo " adventure ./games/quest_for_the_semicolon.json"
echo " "