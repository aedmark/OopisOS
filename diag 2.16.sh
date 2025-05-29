# OopisOS Diagnostic Script
# Version 2.1.6 (Removed 2>> stderr redirection)
#
# To use:
# 1. Ensure OopisOS is v0.8.1 or later.
# 2. Create this file, e.g., using: edit /etc/diag_v2.1.6.sh
# 3. Paste the content of this script into the editor.
# 4. Save the file (Ctrl+S).
# 5. Run the script using: run /etc/diag_v2.1.6.sh
#
# The script will halt if an "EXPECTED SUCCESS" command fails,
# or if an "EXPECTED FAILURE" test (using check_fail) *unexpectedly succeeds*.
# Script's own informational echos are redirected to /tmp/diag_log.txt.
# Command outputs for verification are also redirected to /tmp/diag_log.txt.

# --- Initial Setup & Logging ---
echo "[[ OopisOS Diagnostic System v2.1.6 Initializing ]]"
delay 500
echo "Logging detailed output to /tmp/diag_log.txt"
delay 500
echo "Attempting: mkdir /tmp" > /tmp/diag_log.txt
mkdir /tmp >> /tmp/diag_log.txt # Log mkdir's own output/error
echo "Attempting: mkdir /tmp/diag_workdir" >> /tmp/diag_log.txt
mkdir /tmp/diag_workdir >> /tmp/diag_log.txt
echo "Attempting: cd /tmp/diag_workdir" >> /tmp/diag_log.txt
cd /tmp/diag_workdir
echo "--- OopisOS Diagnostic Test Script v2.1.6 ---" >> /tmp/diag_log.txt
echo "Timestamp:" >> /tmp/diag_log.txt
date >> /tmp/diag_log.txt
echo "Current directory for tests (should be /tmp/diag_workdir):" >> /tmp/diag_log.txt
pwd >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt
echo "Starting diagnostics in: $(pwd)"
delay 600
echo " "

# --- Core Filesystem Operations ---
echo "⚙️ Running Core Filesystem Operations Tests..."
delay 800
echo "--- Core Filesystem Operations Tests ---" >> /tmp/diag_log.txt
echo "TEST: mkdir test_subdir" >> /tmp/diag_log.txt
mkdir test_subdir >> /tmp/diag_log.txt
echo "VERIFY: ls (should show test_subdir/)" >> /tmp/diag_log.txt
ls >> /tmp/diag_log.txt
echo "TEST: touch test_subdir/file1.txt" >> /tmp/diag_log.txt
touch test_subdir/file1.txt >> /tmp/diag_log.txt
echo "VERIFY: ls test_subdir (should show file1.txt)" >> /tmp/diag_log.txt
ls test_subdir >> /tmp/diag_log.txt
echo "TEST: echo 'Hello OopisOS' > test_subdir/file1.txt" >> /tmp/diag_log.txt
echo "Hello OopisOS" > test_subdir/file1.txt 
echo "VERIFY: cat test_subdir/file1.txt (should show 'Hello OopisOS')" >> /tmp/diag_log.txt
cat test_subdir/file1.txt >> /tmp/diag_log.txt
echo "TEST: echo 'Appending line' >> test_subdir/file1.txt" >> /tmp/diag_log.txt
echo "Appending line" >> test_subdir/file1.txt 
echo "VERIFY: cat test_subdir/file1.txt (should show appended content)" >> /tmp/diag_log.txt
cat test_subdir/file1.txt >> /tmp/diag_log.txt
echo "TEST: cp test_subdir/file1.txt file2.txt" >> /tmp/diag_log.txt
cp test_subdir/file1.txt file2.txt >> /tmp/diag_log.txt
echo "VERIFY: ls (should show file2.txt, test_subdir/, etc.)" >> /tmp/diag_log.txt
ls >> /tmp/diag_log.txt
echo "VERIFY: cat file2.txt (should match appended content)" >> /tmp/diag_log.txt
cat file2.txt >> /tmp/diag_log.txt
echo "TEST: mv file2.txt test_subdir/file2_moved.txt" >> /tmp/diag_log.txt
mv file2.txt test_subdir/file2_moved.txt >> /tmp/diag_log.txt
echo "VERIFY: ls test_subdir (should show file1.txt and file2_moved.txt)" >> /tmp/diag_log.txt
ls test_subdir >> /tmp/diag_log.txt
echo "VERIFY: cat test_subdir/file2_moved.txt (should match appended content)" >> /tmp/diag_log.txt
cat test_subdir/file2_moved.txt >> /tmp/diag_log.txt
echo "TEST: rm -f test_subdir/file1.txt" >> /tmp/diag_log.txt
rm -f test_subdir/file1.txt >> /tmp/diag_log.txt
echo "TEST: rm -f test_subdir/file2_moved.txt" >> /tmp/diag_log.txt
rm -f test_subdir/file2_moved.txt >> /tmp/diag_log.txt
echo "VERIFY: ls test_subdir (should be empty)" >> /tmp/diag_log.txt
ls test_subdir >> /tmp/diag_log.txt
echo "TEST: tree (in current dir /tmp/diag_workdir)" >> /tmp/diag_log.txt
tree >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt
echo "Core Filesystem Tests: ✅"
delay 700
echo " "

# --- Echo Variations & Advanced Parser Tests ---
echo "🗣️ Running Echo & Parser Stress Tests..."
delay 700
echo "--- Echo Variations & Advanced Parser Tests ---" >> /tmp/diag_log.txt
echo "TEST: echo unquoted string with multiple words" >> /tmp/diag_log.txt
echo unquoted string with multiple words >> /tmp/diag_log.txt
echo "TEST: echo "double quoted" 'single quoted' unquoted_end" >> /tmp/diag_log.txt
echo "double quoted" 'single quoted' unquoted_end >> /tmp/diag_log.txt
echo 'TEST: echo "text > with_operator_inside_quotes" > redirect_test1.txt' >> /tmp/diag_log.txt
echo "text > with_operator_inside_quotes" > redirect_test1.txt 
echo "VERIFY: cat redirect_test1.txt" >> /tmp/diag_log.txt
cat redirect_test1.txt >> /tmp/diag_log.txt
echo 'TEST: echo part1 > redirect_test2.txt "part2 with spaces"' >> /tmp/diag_log.txt
echo part1 > redirect_test2.txt "part2 with spaces" 
echo "VERIFY: cat redirect_test2.txt" >> /tmp/diag_log.txt
cat redirect_test2.txt >> /tmp/diag_log.txt
echo 'TEST: echo "   leading and trailing spaces   " > redirect_test3.txt' >> /tmp/diag_log.txt
echo "   leading and trailing spaces   " > redirect_test3.txt 
echo "VERIFY: cat redirect_test3.txt" >> /tmp/diag_log.txt
cat redirect_test3.txt >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt
echo "Echo & Parser Tests: ✅"
delay 600
echo " "

# --- Path Traversal ---
echo "🗺️ Running Path Traversal Tests..."
delay 800
echo "--- Path Traversal Tests ---" >> /tmp/diag_log.txt
cd test_subdir
echo "CWD after cd test_subdir:" >> /tmp/diag_log.txt
pwd >> /tmp/diag_log.txt
cd ..
echo "CWD after cd ..:" >> /tmp/diag_log.txt
pwd >> /tmp/diag_log.txt
cd /
echo "CWD after cd /:" >> /tmp/diag_log.txt
pwd >> /tmp/diag_log.txt
cd /tmp/diag_workdir
echo "CWD after cd /tmp/diag_workdir:" >> /tmp/diag_log.txt
pwd >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt
echo "Path Traversal Tests: ✅"
delay 800
echo " "

# --- RM Ancestor CWD Test ---
echo "🗑️ Running RM Ancestor CWD Test..."
delay 900
echo "--- RM Ancestor CWD Test ---" >> /tmp/diag_log.txt
mkdir /tmp/rm_ancestor_test >> /tmp/diag_log.txt
mkdir /tmp/rm_ancestor_test/subdir >> /tmp/diag_log.txt
cd /tmp/rm_ancestor_test/subdir
echo "Current CWD (for log):" >> /tmp/diag_log.txt
pwd >> /tmp/diag_log.txt
echo "Attempting to remove /tmp/rm_ancestor_test (an ancestor of CWD) using -f" >> /tmp/diag_log.txt
rm -f /tmp/rm_ancestor_test >> /tmp/diag_log.txt
echo "CWD after removing ancestor (should be /tmp):" >> /tmp/diag_log.txt
pwd >> /tmp/diag_log.txt
echo "Listing contents of new CWD (should be /tmp's contents):" >> /tmp/diag_log.txt
ls >> /tmp/diag_log.txt
cd /tmp/diag_workdir 
echo " " >> /tmp/diag_log.txt
echo "RM Ancestor CWD Test: ✅"
delay 600
echo " "

# --- Find Command ---
echo "🔍 Running Find Command Tests..."
delay 800
echo "--- Find Command Success Tests ---" >> /tmp/diag_log.txt
mkdir find_test_area >> /tmp/diag_log.txt
touch find_test_area/doc1.txt >> /tmp/diag_log.txt
touch find_test_area/report.md >> /tmp/diag_log.txt
mkdir find_test_area/sub >> /tmp/diag_log.txt
touch find_test_area/sub/doc2.txt >> /tmp/diag_log.txt
echo "VERIFY: find find_test_area -name \"*.txt\"" >> /tmp/diag_log.txt
find find_test_area -name "*.txt" >> /tmp/diag_log.txt
echo "VERIFY: find find_test_area -name \"report.md\"" >> /tmp/diag_log.txt
find find_test_area -name "report.md" >> /tmp/diag_log.txt
echo "VERIFY: find . -name \"sub\"" >> /tmp/diag_log.txt
find . -name "sub"  >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt
echo "Find Command Tests: ✅"
delay 600
echo " "

# --- Basic Utility Commands ---
echo "🛠️ Running Basic Utility Command Tests..."
delay 800
echo "--- Basic Utility Command Tests ---" >> /tmp/diag_log.txt
echo "VERIFY: date command" >> /tmp/diag_log.txt
date >> /tmp/diag_log.txt
echo "VERIFY: help command (general)" >> /tmp/diag_log.txt
help >> /tmp/diag_log.txt
echo "VERIFY: help find command" >> /tmp/diag_log.txt
help find >> /tmp/diag_log.txt
echo "VERIFY: help upload command" >> /tmp/diag_log.txt
help upload >> /tmp/diag_log.txt
echo "VERIFY: history command" >> /tmp/diag_log.txt
history >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt
echo "Basic Utility Tests: ✅"
delay 500
echo " "

# --- Redirection Success Tests ---
echo "↪️ Running Redirection Success Tests..."
delay 900
echo "--- Redirection Success Tests ---" >> /tmp/diag_log.txt
ls > ls_out.txt 
echo "VERIFY: cat ls_out.txt (after ls > ls_out.txt)" >> /tmp/diag_log.txt
cat ls_out.txt >> /tmp/diag_log.txt
pwd >> ls_out.txt 
echo "VERIFY: cat ls_out.txt (after pwd >> ls_out.txt)" >> /tmp/diag_log.txt
cat ls_out.txt >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt
echo "Redirection Success Tests: ✅"
delay 600
echo " "

# --- Filesystem Error Condition Tests (Using check_fail or direct execution for rm -f) ---
echo "💣 Running Expected Failure Condition Tests..."
delay 800
echo "--- Filesystem Error Condition Tests ---" >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt

echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): ls /non_existent_path" >> /tmp/diag_log.txt
check_fail "ls /non_existent_path" 
echo " " >> /tmp/diag_log.txt

echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): mkdir existing_file_as_dir (after touch existing_file_as_dir)" >> /tmp/diag_log.txt
touch existing_file_as_dir >> /tmp/diag_log.txt
check_fail "mkdir existing_file_as_dir"
rm -f existing_file_as_dir >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt

echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): touch test_subdir/ (path is a directory)" >> /tmp/diag_log.txt
check_fail "touch test_subdir/" 
echo " " >> /tmp/diag_log.txt

echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): cat test_subdir/ (path is a directory)" >> /tmp/diag_log.txt
check_fail "cat test_subdir/" 
echo " " >> /tmp/diag_log.txt

echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): mv /non_existent_source /tmp/diag_workdir/q" >> /tmp/diag_log.txt
check_fail "mv /non_existent_source /tmp/diag_workdir/q"
echo " " >> /tmp/diag_log.txt

echo "TEST (RM -F NON-EXISTENT): rm -f /non_existent_file_for_rm_test" >> /tmp/diag_log.txt
rm -f /non_existent_file_for_rm_test >> /tmp/diag_log.txt 
echo "INFO: 'rm -f /non_existent_file_for_rm_test' completed. If script continues, it behaved as expected (succeeded silently)." >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt

echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): rm file_in_script_without_force (should fail in script)" >> /tmp/diag_log.txt
touch script_rm_noforce_test.txt >> /tmp/diag_log.txt
check_fail "rm script_rm_noforce_test.txt"
rm -f script_rm_noforce_test.txt >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt

echo "Filesystem Error Tests: ✅ (individual checks passed or were correctly handled by check_fail)"
delay 1000
echo " "

# --- Redirection Edge Cases (Using check_fail) ---
echo "↪️💣 Running Redirection Edge Case Failure Tests..."
delay 800
echo "--- Redirection Edge Cases (Using check_fail) ---" >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt

echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): Redirect echo to a path where a component is a file" >> /tmp/diag_log.txt
mkdir r_dir_redir_test >> /tmp/diag_log.txt
touch r_dir_redir_test/file_component.txt >> /tmp/diag_log.txt
check_fail "echo content > r_dir_redir_test/file_component.txt/output.txt"
echo " " >> /tmp/diag_log.txt

echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): Redirect echo directly to root '/'" >> /tmp/diag_log.txt
check_fail "echo test > /"
echo " " >> /tmp/diag_log.txt
echo "Redirection Edge Case Tests: ✅"
delay 800
echo " "

# --- Find Command Error Tests (Using check_fail) ---
echo "🔍💣 Running Find Command Error Tests..."
delay 700
echo "--- Find Command Error Tests (Using check_fail) ---" >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt

echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): find -name (missing pattern)" >> /tmp/diag_log.txt
check_fail "find -name"
echo " " >> /tmp/diag_log.txt

echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): find *.txt (missing -name flag)" >> /tmp/diag_log.txt
check_fail "find *.txt"
echo " " >> /tmp/diag_log.txt
echo "Find Error Tests: ✅"
delay 800
echo " "


# --- Final Log Display ---
echo "📜 Displaying Full Diagnostic Log from /tmp/diag_log.txt..."
delay 1000
echo "--- All Expected Tests Completed ---" >> /tmp/diag_log.txt
echo "If this script completed, all 'check_fail' tests behaved as expected (i.e., the underlying command failed, so check_fail succeeded)," >> /tmp/diag_log.txt
echo "and the 'rm -f non_existent' test also behaved as expected (succeeded silently)." >> /tmp/diag_log.txt
echo "If the script halted on a 'check_fail' line, the underlying command UNEXPECTEDLY SUCCEEDED." >> /tmp/diag_log.txt
echo "If the script halted on the 'rm -f /non_existent_file_for_rm_test' line, 'rm -f' UNEXPECTEDLY FAILED." >> /tmp/diag_log.txt
echo "Review terminal output for the exact point of failure if script halted prematurely on other commands." >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt
echo "Attempting to display full diagnostic log from /tmp/diag_log.txt:" >> /tmp/diag_log.txt

cat /tmp/diag_log.txt 

echo " " >> /tmp/diag_log.txt 
echo "--- End of OopisOS Diagnostic Script v2.1.6 ---" >> /tmp/diag_log.txt
echo " "

# --- Automated Cleanup ---
echo " "
echo "🧹 Performing automated cleanup..."
delay 500
echo "Navigating to root for safe cleanup..." >> /tmp/diag_log.txt
cd / 

echo "Removing test working directory: /tmp/diag_workdir" >> /tmp/diag_log.txt
rm -f /tmp/diag_workdir >> /tmp/diag_log.txt

echo "Automated cleanup complete. Log file /tmp/diag_log.txt is preserved."
delay 500
echo " "


# --- Success Animation ---
echo " "
delay 500
echo "  ======================================================"
delay 200
echo "  ==                                                  =="
delay 200
echo "  ==                OopisOS Diagnostics               =="
delay 200
echo "  ==                  ALL SYSTEMS GO!                 =="
delay 200
echo "  ==                  CONGRATION! :-)                 =="
delay 200
echo "  ==                                                  =="
delay 200
echo "  ======================================================"
echo " "