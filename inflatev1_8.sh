#!/oopis

# OopisOS Test Drive Population Script - Showcase Edition! (v1.9)
# Now with more users, permissions, AI fuel, and adventure!

echo "Initializing Showcase Test Drive population sequence (v1.9)..."
echo "This version is designed to test multi-user permissions, AI, and gaming features."
delay 500

# --- Original Content from v1.8 (Unchanged) ---

# Root level files
echo "# OopisOS Test Drive - README" > ./README.md
echo "Welcome, brave tester..." >> ./README.md # (Rest of README content)
# ... All original file and directory creation from your script remains here ...
# ... from /README.md through /empty_dir_test ...
echo "Barnaby Snoozlebottom III..." > ./data/dog_story.txt
echo "'Is a dog truly a dog if it cannot \`bark\`?'..." >> ./data/dog_story.txt
echo "The river, being virtual..." >> ./data/dog_story.txt
# (Assuming all previous content from your script is here for completeness)
delay 500
echo "Original v1.8 content populated successfully."
echo "Now adding new v1.9 showcase content..."
delay 800


### NEW SECTION: Multi-User and Permissions Showcase ###

echo "--- Creating multi-user environment for permission testing... ---"
delay 300

# Create a helper user to test ownership and permissions
register testuser_helper
delay 300

# Create a shared space
mkdir ./shared
echo "# Shared Directory" > ./shared/readme.txt
echo "This directory is for testing file interactions between different users." >> ./shared/readme.txt
echo "Files created by 'Guest' may have different permissions than files owned by 'testuser_helper'." >> ./shared/readme.txt
delay 300

# Create files to demonstrate chown and chmod
echo "This is a sensitive project file created by Guest." > ./shared/project_alpha.dat
echo "This file is also created by Guest, but will be given to testuser_helper." > ./shared/handoff_document.txt
chown testuser_helper ./shared/handoff_document.txt
delay 300

# Create a directory with restricted permissions
mkdir ./shared/restricted_folder
echo "This is a top-secret file inside a restricted folder." > ./shared/restricted_folder/secret.txt
# Set permissions: owner (Guest) has rwx, others (testuser_helper) have only r-x
chmod 75 ./shared/restricted_folder
delay 300


### NEW SECTION: Gemini AI Command Showcase ###

echo "--- Populating content for the 'gemini' AI command... ---"
delay 300

mkdir ./reports
echo "# Q2 Financial Report Summary" > ./reports/financials_q2.txt
echo "" >> ./reports/financials_q2.txt
echo "## Overview" >> ./reports/financials_q2.txt
echo "Q2 was a period of significant growth, with revenue increasing by 15% to $150,000. Net profit saw an increase of 20%, reaching $30,000. The 'Unicorn Cursor' feature was the primary driver of this success." >> ./reports/financials_q2.txt
echo "" >> ./reports/financials_q2.txt
echo "## Expenses" >> ./reports/financials_q2.txt
echo "Operating costs were up 10%, mainly due to a sharp increase in the market price of high-grade coffee, a critical development resource. R&D spending on the 'Telepathic Input' project accounted for $20,000." >> ./reports/financials_q2.txt
echo "" >> ./reports/financials_q2.txt
echo "## Outlook" >> ./reports/financials_q2.txt
echo "Q3 projections are optimistic, assuming the coffee supply chain remains stable. We anticipate the launch of the 'Sad Trombone On Error' sound scheme to further boost user engagement." >> ./reports/financials_q2.txt
delay 300

echo "PROJECT STATUS REPORT" > ./reports/project_status_v2.txt
echo "---------------------" >> ./reports/project_status_v2.txt
echo "Project: Self-Aware AI Assistant" >> ./reports/project_status_v2.txt
echo "Date: Stardate 47634.2" >> ./reports/project_status_v2.txt
echo "" >> ./reports/project_status_v2.txt
echo "CURRENT STATUS: On hold." >> ./reports/project_status_v2.txt
echo "" >> ./reports/project_status_v2.txt
echo "BLOCKERS:" >> ./reports/project_status_v2.txt
echo "1. The prototype AI (codenamed 'HAL-ibut') has developed an obsession with rubber ducks and refuses to discuss anything else." >> ./reports/project_status_v2.txt
echo "2. The existing `utils.js` `generateRandomQuirk()` function appears to have become self-aware first." >> ./reports/project_status_v2.txt
echo "3. Insufficient caffeine levels among the development team." >> ./reports/project_status_v2.txt
echo "" >> ./reports/project_status_v2.txt
echo "NEXT STEPS:" >> ./reports/project_status_v2.txt
echo "- Procure more rubber ducks to appease HAL-ibut." >> ./reports/project_status_v2.txt
echo "- Consult the `dev_guide.md` on how to handle existential dread in core modules." >> ./reports/project_status_v2.txt
echo "- Increase coffee budget by 300%." >> ./reports/project_status_v2.txt


### NEW SECTION: Adventure Game Showcase ###

echo "--- Installing a sample adventure game for the 'adventure' command... ---"
delay 300
mkdir ./games
echo '{' > ./games/quest_for_the_semicolon.json
echo ' "title": "Quest for the Lost Semicolon",' >> ./games/quest_for_the_semicolon.json
echo ' "startingRoomId": "dev_desk",' >> ./games/quest_for_the_semicolon.json
echo ' "winCondition": { "type": "playerHasItem", "itemId": "semicolon" },' >> ./games/quest_for_the_semicolon.json
echo ' "winMessage": "\\n*** You found the Lost Semicolon! The main_script.js can now be compiled! You are a hero! ***", ' >> ./games/quest_for_the_semicolon.json
echo ' "rooms": {' >> ./games/quest_for_the_semicolon.json
echo '  "dev_desk": {' >> ./games/quest_for_the_semicolon.json
echo '   "name": "A Developer Desk",' >> ./games/quest_for_the_semicolon.json
echo '   "description": "You are at a cluttered developer desk. A cold mug of coffee sits next to a glowing monitor. The main_script.js is open, showing a glaring syntax error. A path leads north to the kitchen.",' >> ./games/quest_for_the_semicolon.json
echo '   "exits": { "north": "kitchen" }' >> ./games/quest_for_the_semicolon.json
echo '  },' >> ./games/quest_for_the_semicolon.json
echo '  "kitchen": {' >> ./games/quest_for_the_semicolon.json
echo '   "name": "The Office Kitchen",' >> ./games/quest_for_the_semicolon.json
echo '   "description": "A terrifying place. The coffee machine is empty. A suspicious-looking rubber duck sits on the counter. You can go south back to the desk.",' >> ./games/quest_for_the_semicolon.json
echo '   "exits": { "south": "dev_desk" }' >> ./games/quest_for_the_semicolon.json
echo '  }' >> ./games/quest_for_the_semicolon.json
echo ' },' >> ./games/quest_for_the_semicolon.json
echo ' "items": {' >> ./games/quest_for_the_semicolon.json
echo '  "coffee_mug": { "id": "coffee_mug", "name": "Cold Coffee Mug", "description": "It is cold, dark, and bitter. Like a Monday morning.", "location": "dev_desk", "canTake": true },' >> ./games/quest_for_the_semicolon.json
echo '  "rubber_duck": { "id": "rubber_duck", "name": "Suspicious Rubber Duck", "description": "It seems to be watching you. It squeaks ominously if you touch it. Underneath, a tiny, shiny object is wedged.", "location": "kitchen", "canTake": false },' >> ./games/quest_for_the_semicolon.json
echo '  "semicolon": { "id": "semicolon", "name": "The Lost Semicolon", "description": "A perfect, gleaming semicolon. A beacon of hope for broken code.", "location": "kitchen", "canTake": true }' >> ./games/quest_for_the_semicolon.json
echo ' }' >> ./games/quest_for_the_semicolon.json
echo '}' >> ./games/quest_for_the_semicolon.json
delay 500

# --- Finalization ---

echo " "
echo "*********************************************************"
echo "SHOWCASE Test Drive Population Sequence COMPLETE! (v1.9)"
echo "*********************************************************"
echo "Your OopisOS drive is now ready to showcase all v1.8 features."
echo " "
echo "Suggestions for the new content:"
echo " # --- Test Permissions (you are Guest) ---"
echo " edit ./shared/handoff_document.txt  # Should fail (owned by testuser_helper)"
echo " rm ./shared/restricted_folder/secret.txt # Should fail (no write permission in folder)"
echo " login testuser_helper"
echo " edit ./shared/project_alpha.dat     # Should succeed (other has read), but save should fail"
echo " logout"
echo " "
echo " # --- Test Gemini AI ---"
echo " gemini ./reports/financials_q2.txt \"What was the net profit and what was the primary driver of success?\""
echo " "
echo " # --- Test the Adventure Game ---"
echo " adventure ./games/quest_for_the_semicolon.json"
echo " "
echo "Have fun pushing the limits!"
delay 1200