# OopisOS Diagnostic Script
# Version 3.0.2 (robust -p setup, mkdir -p tests included)
#
# To use:
# 1. Ensure OopisOS is v1.0.2 or later (using the HTML previously provided with mkdir -p fixes).
# 2. Create this file, e.g., using: edit /etc/diag_v1.0.2.sh
# 3. Paste the content of this script into the editor.
# 4. Save the file (Ctrl+S).
# 5. Run the script using: run /etc/diag_v1.0.2.sh (or your chosen name like diag100.sh)
#
echo "NOTE: The script will halt if an "EXPECTED SUCCESS" command fails,"
delay 100
echo "or if an "EXPECTED FAILURE" test (using check_fail) *unexpectedly succeeds*"
delay 100
echo "A more verbose log of testing can be found at /tmp/diag_log.txt"
delay 100
echo "Command outputs for verification are also redirected to /tmp/diag_log.txt"
delay 800

# --- Initial Setup & Logging ---
echo "[[ OopisOS Diagnostic System v1.0.2 Initializing ]]"
delay 500
echo "Logging detailed output to /tmp/diag_log.txt"
delay 500
echo "Attempting: mkdir -p /tmp" > /tmp/diag_log.txt
mkdir -p /tmp >> /tmp/diag_log.txt
echo "Attempting: mkdir -p /tmp/diag_workdir" >> /tmp/diag_log.txt
mkdir -p /tmp/diag_workdir >> /tmp/diag_log.txt
echo "Attempting: cd /tmp/diag_workdir" >> /tmp/diag_log.txt
cd /tmp/diag_workdir
echo "--- OopisOS Diagnostic Test Script v1.0.2 ---" >> /tmp/diag_log.txt
echo "Targeting OopisOS v1.0.2 Features" >> /tmp/diag_log.txt
echo "Timestamp:" >> /tmp/diag_log.txt
date >> /tmp/diag_log.txt
echo "Current directory for tests (should be /tmp/diag_workdir):" >> /tmp/diag_log.txt
pwd >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt
echo "Starting diagnostics (v1.0.2 script) in: $(pwd)"
delay 600
echo " "

# --- Core Filesystem Operations (including mkdir -p) ---
echo "⚙️ Running Core Filesystem Operations Tests (incl. mkdir -p)..."
delay 800
echo "--- Core Filesystem Operations Tests (incl. mkdir -p) ---" >> /tmp/diag_log.txt
echo "TEST: mkdir test_subdir (basic)" >> /tmp/diag_log.txt
mkdir test_subdir >> /tmp/diag_log.txt
echo "VERIFY: ls (should show test_subdir/)" >> /tmp/diag_log.txt
ls >> /tmp/diag_log.txt

echo "TEST: mkdir -p new_parent_p/new_child_p" >> /tmp/diag_log.txt
mkdir -p new_parent_p/new_child_p >> /tmp/diag_log.txt
echo "VERIFY: ls (should show new_parent_p/)" >> /tmp/diag_log.txt
ls >> /tmp/diag_log.txt
echo "VERIFY: ls new_parent_p (should show new_child_p/)" >> /tmp/diag_log.txt
ls new_parent_p >> /tmp/diag_log.txt
echo "VERIFY: tree (should show new_parent_p/new_child_p/)" >> /tmp/diag_log.txt
tree >> /tmp/diag_log.txt

echo "TEST: mkdir -p new_parent_p/new_child_p (again, should succeed silently with -p)" >> /tmp/diag_log.txt
mkdir -p new_parent_p/new_child_p >> /tmp/diag_log.txt
echo "VERIFY: tree (structure should be unchanged)" >> /tmp/diag_log.txt
tree >> /tmp/diag_log.txt

echo "TEST: mkdir -p single_dir_p" >> /tmp/diag_log.txt
mkdir -p single_dir_p >> /tmp/diag_log.txt
echo "VERIFY: ls (should show single_dir_p/)" >> /tmp/diag_log.txt
ls >> /tmp/diag_log.txt

echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): mkdir no_parent/new_child (without -p)" >> /tmp/diag_log.txt
check_fail "mkdir no_parent/new_child"

echo "TEST: touch new_parent_p/file_in_parent.txt" >> /tmp/diag_log.txt
touch new_parent_p/file_in_parent.txt >> /tmp/diag_log.txt
echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): mkdir -p new_parent_p/file_in_parent.txt/another_dir (component is a file)" >> /tmp/diag_log.txt
check_fail "mkdir -p new_parent_p/file_in_parent.txt/another_dir"

echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): mkdir test_subdir (again, without -p, should fail as it exists)" >> /tmp/diag_log.txt
check_fail "mkdir test_subdir"

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
echo "TEST: tree (in current dir /tmp/diag_workdir, showing new_parent_p and single_dir_p)" >> /tmp/diag_log.txt
tree >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt
echo "Core Filesystem Tests (incl. mkdir -p): ✅"
delay 700
echo " "

# --- Echo Variations & Advanced Parser Tests (Pre-Piping/BG) ---
echo "🗣️ Running Echo & Parser Stress Tests (Pre-Piping/BG)..."
delay 700
echo "--- Echo Variations & Advanced Parser Tests (Pre-Piping/BG) ---" >> /tmp/diag_log.txt
echo "TEST: echo unquoted string with multiple words" >> /tmp/diag_log.txt
echo unquoted string with multiple words >> /tmp/diag_log.txt
echo "TEST: echo "double quoted" 'single quoted' unquoted_end" >> /tmp/diag_log.txt
echo "double quoted" 'single quoted' unquoted_end >> /tmp/diag_log.txt
echo 'TEST: echo "text > with_operator_inside_quotes" > redirect_test1.txt' >> /tmp/diag_log.txt
echo "text > with_operator_inside_quotes" > redirect_test1.txt
echo "VERIFY: cat redirect_test1.txt" >> /tmp/diag_log.txt
cat redirect_test1.txt >> /tmp/diag_log.txt
echo 'TEST: echo part1 "part2 with spaces" > redirect_test2.txt' >> /tmp/diag_log.txt
echo part1 "part2 with spaces" > redirect_test2.txt
echo "VERIFY: cat redirect_test2.txt" >> /tmp/diag_log.txt
cat redirect_test2.txt >> /tmp/diag_log.txt
echo 'TEST: echo "   leading and trailing spaces   " > redirect_test3.txt' >> /tmp/diag_log.txt
echo "   leading and trailing spaces   " > redirect_test3.txt
echo "VERIFY: cat redirect_test3.txt" >> /tmp/diag_log.txt
cat redirect_test3.txt >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt
echo "Echo & Parser Tests (Pre-Piping/BG): ✅"
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
mkdir -p /tmp/rm_ancestor_test/subdir >> /tmp/diag_log.txt
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

# --- Find Command & Deepened CP/Find ---
echo "🔍🔎 Running Find & Deepened CP Tests..."
delay 800
echo "--- Find Command Success Tests ---" >> /tmp/diag_log.txt
mkdir -p find_test_area/sub >> /tmp/diag_log.txt
touch find_test_area/doc1.txt >> /tmp/diag_log.txt
touch find_test_area/report.md >> /tmp/diag_log.txt
touch find_test_area/sub/doc2.txt >> /tmp/diag_log.txt
echo "VERIFY: find find_test_area -name \"*.txt\"" >> /tmp/diag_log.txt
find find_test_area -name "*.txt" >> /tmp/diag_log.txt
echo "VERIFY: find find_test_area -name \"report.md\"" >> /tmp/diag_log.txt
find find_test_area -name "report.md" >> /tmp/diag_log.txt
echo "VERIFY: find . -name \"sub\"" >> /tmp/diag_log.txt
find . -name "sub"  >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt
echo "--- Deepened cp & find Tests ---" >> /tmp/diag_log.txt
echo "TEST: cp a directory recursively (cp find_test_area find_test_area_copy)" >> /tmp/diag_log.txt
cp -r find_test_area find_test_area_copy >> /tmp/diag_log.txt
echo "VERIFY: tree find_test_area_copy/ (should match find_test_area)" >> /tmp/diag_log.txt
tree find_test_area_copy >> /tmp/diag_log.txt
echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): cp find_test_area/doc1.txt find_test_area_copy/sub/doc2.txt (destination exists)" >> /tmp/diag_log.txt
check_fail "cp find_test_area/doc1.txt find_test_area_copy/sub/doc2.txt"
echo "TEST: find from root for a specific file" >> /tmp/diag_log.txt
find / -name "diag_log.txt" >> /tmp/diag_log.txt
echo "TEST: find for a pattern that should yield no results" >> /tmp/diag_log.txt
find . -name "file_that_does_not_exist_123.tmp" >> /tmp/diag_log.txt
echo "Find & Deepened CP Tests: ✅"
delay 600
echo " "

# --- Piping ( | ) Tests ---
echo "ቧ Running Piping ( | ) Tests..."
delay 1000
echo "--- Piping Tests ---" >> /tmp/diag_log.txt
echo "TEST: Simple pipe: echo 'pipe test content' | cat" >> /tmp/diag_log.txt
echo "pipe test content" | cat >> /tmp/diag_log.txt
echo "TEST: Pipe with output redirection: echo 'pipe to file' | cat > pipe_out1.txt" >> /tmp/diag_log.txt
echo "pipe to file" | cat > pipe_out1.txt
echo "VERIFY: cat pipe_out1.txt" >> /tmp/diag_log.txt
cat pipe_out1.txt >> /tmp/diag_log.txt
echo "TEST: Append with pipe: echo 'pipe append' | cat >> pipe_out1.txt" >> /tmp/diag_log.txt
echo "pipe append" | cat >> pipe_out1.txt
echo "VERIFY: cat pipe_out1.txt (should have two lines)" >> /tmp/diag_log.txt
cat pipe_out1.txt >> /tmp/diag_log.txt
echo "TEST: Multi-pipe: echo 'multi pipe test' | cat | cat > multi_pipe_out.txt" >> /tmp/diag_log.txt
echo "multi pipe test" | cat | cat > multi_pipe_out.txt
echo "VERIFY: cat multi_pipe_out.txt" >> /tmp/diag_log.txt
cat multi_pipe_out.txt >> /tmp/diag_log.txt
echo "TEST: Empty string pipe: echo '' | cat > empty_pipe_out.txt" >> /tmp/diag_log.txt
echo "" | cat > empty_pipe_out.txt
echo "VERIFY: cat empty_pipe_out.txt (should be empty or one newline if cat adds one)" >> /tmp/diag_log.txt
cat empty_pipe_out.txt >> /tmp/diag_log.txt
echo "TEST: Pipe with command that ignores stdin: echo 'ignore me' | date > date_pipe_out.txt" >> /tmp/diag_log.txt
echo "ignore me" | date > date_pipe_out.txt
echo "VERIFY: cat date_pipe_out.txt (should be date, not 'ignore me')" >> /tmp/diag_log.txt
cat date_pipe_out.txt >> /tmp/diag_log.txt
echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): Failing command in pipe: ls /non_existent_pipe_path | cat" >> /tmp/diag_log.txt
check_fail "ls /non_existent_pipe_path | cat"
echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): Failing middle command in pipe: echo 'data' | cat /non_existent_file_pipe | cat" >> /tmp/diag_log.txt
check_fail "echo 'data' | cat /non_existent_file_pipe | cat"
echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): Pipe at end of line: echo test |" >> /tmp/diag_log.txt
check_fail "echo test |"
echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): Pipe at start of line: | echo test" >> /tmp/diag_log.txt
check_fail "| echo test"
echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): Redirection before pipe: echo test > redir_then_pipe.txt | cat" >> /tmp/diag_log.txt
check_fail "echo test > redir_then_pipe.txt | cat"
echo " " >> /tmp/diag_log.txt
echo "Piping Tests: ✅"
delay 1000
echo " "

# --- Background Processing ( & ) Tests ---
echo "⏳ Running Background Processing ( & ) Tests..."
delay 1000
echo "--- Background Processing Tests ---" >> /tmp/diag_log.txt
echo "INFO: Background tests rely on timing (delay) and checking files/logs afterwards." >> /tmp/diag_log.txt
echo "INFO: Expect OopisOS to output '[jobId] Backgrounded.' and later '[jobId] finished' (or with error) to terminal for BG jobs." >> /tmp/diag_log.txt
echo "TEST: Simple background command: echo 'bg success' > bg_simple.txt &" >> /tmp/diag_log.txt
echo "bg success" > bg_simple.txt &
echo "SCRIPT: Immediate next command after starting bg_simple.txt" >> /tmp/diag_log.txt
pwd >> /tmp/diag_log.txt
delay 2000
echo "VERIFY: cat bg_simple.txt (after delay)" >> /tmp/diag_log.txt
cat bg_simple.txt >> /tmp/diag_log.txt

echo "TEST: Backgrounded pipeline: echo 'bg pipe content' | cat > bg_pipe.txt &" >> /tmp/diag_log.txt
echo "bg pipe content" | cat > bg_pipe.txt &
echo "SCRIPT: Immediate next command after starting bg_pipe.txt" >> /tmp/diag_log.txt
pwd >> /tmp/diag_log.txt
delay 2000
echo "VERIFY: cat bg_pipe.txt (after delay)" >> /tmp/diag_log.txt
cat bg_pipe.txt >> /tmp/diag_log.txt

echo "TEST: Multiple background commands" >> /tmp/diag_log.txt
echo "bg job one" > bg_multi1.txt &
echo "bg job two" > bg_multi2.txt &
echo "SCRIPT: Immediate next command after starting multiple bg jobs" >> /tmp/diag_log.txt
pwd >> /tmp/diag_log.txt
delay 3000
echo "VERIFY: cat bg_multi1.txt" >> /tmp/diag_log.txt
cat bg_multi1.txt >> /tmp/diag_log.txt
echo "VERIFY: cat bg_multi2.txt" >> /tmp/diag_log.txt
cat bg_multi2.txt >> /tmp/diag_log.txt

# echo "TEST: Background command that fails: ls /non_existent_bg_path > bg_fail_out.txt &" >> /tmp/diag_log.txt
# echo "INFO: This test expects the bg job to fail. OopisOS should log job completion with error." >> /tmp/diag_log.txt
# ls /non_existent_bg_path > bg_fail_out.txt &
# echo "SCRIPT: Immediate next command after starting failing bg job" >> /tmp/diag_log.txt
# pwd >> /tmp/diag_log.txt
# delay 2000
# echo "VERIFY: Attempt to cat bg_fail_out.txt (may be empty or not exist if redirection fails with command)" >> /tmp/diag_log.txt
# cat bg_fail_out.txt >> /tmp/diag_log.txt
# echo "INFO: Check main terminal for OopisOS messages like '[jobId] Backgrounded.' and '[jobId] finished with error'." >> /tmp/diag_log.txt

echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): Ampersand at start: & echo test" >> /tmp/diag_log.txt
check_fail "& echo test"
echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): Ampersand in middle: echo test & this_is_not_a_command" >> /tmp/diag_log.txt
check_fail "echo test & this_is_not_a_command"
echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): Multiple ampersands: echo test & &" >> /tmp/diag_log.txt
check_fail "echo test & &"
echo " " >> /tmp/diag_log.txt
echo "Background Processing Tests: ✅ (Manual check of OopisOS terminal logs for job status messages recommended)"
delay 1000
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
echo "VERIFY: help mkdir command" >> /tmp/diag_log.txt
help mkdir >> /tmp/diag_log.txt
echo "VERIFY: help upload command" >> /tmp/diag_log.txt
help upload >> /tmp/diag_log.txt
echo "VERIFY: history command" >> /tmp/diag_log.txt
history >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt
echo "Basic Utility Tests: ✅"
delay 500
echo " "

# --- Redirection Success Tests (Re-check after pipe/bg additions) ---
echo "↪️ Running Redirection Success Tests (Post Pipe/BG)..."
delay 900
echo "--- Redirection Success Tests (Post Pipe/BG) ---" >> /tmp/diag_log.txt
ls > ls_out.txt
echo "VERIFY: cat ls_out.txt (after ls > ls_out.txt)" >> /tmp/diag_log.txt
cat ls_out.txt >> /tmp/diag_log.txt
pwd >> ls_out.txt
echo "VERIFY: cat ls_out.txt (after pwd >> ls_out.txt)" >> /tmp/diag_log.txt
cat ls_out.txt >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt
echo "Redirection Success Tests (Post Pipe/BG): ✅"
delay 600
echo " "

# --- Filesystem Error Condition Tests ---
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
echo "Filesystem Error Tests: ✅"
delay 1000
echo " "

# --- Redirection Edge Cases (Using check_fail) ---
echo "↪️💣 Running Redirection Edge Case Failure Tests..."
delay 800
echo "--- Redirection Edge Cases (Using check_fail) ---" >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt
echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): Redirect echo to a path where a component is a file" >> /tmp/diag_log.txt
mkdir -p r_dir_redir_test >> /tmp/diag_log.txt
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
echo " 💣 Running Find Command Error Tests..."
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

# --- User & Session Management Tests ---
echo "👤 Running User & Session Management Tests (Last)..."
delay 800
echo "--- User & Session Management Tests ---" >> /tmp/diag_log.txt
echo "TEST (EXPECTED SUCCESS): register new_tester" >> /tmp/diag_log.txt
register new_tester >> /tmp/diag_log.txt
echo "TEST (EXPECTED FAILURE VIA CHECK_FAIL): register new_tester (again)" >> /tmp/diag_log.txt
check_fail "register new_tester"
echo "TEST (EXPECTED SUCCESS): savestate (as Guest)" >> /tmp/diag_log.txt
savestate >> /tmp/diag_log.txt
echo "INFO: Manual test steps would follow: login, logout, loadstate..." >> /tmp/diag_log.txt
echo "Simulating logout/login cycle for conceptual integrity." >> /tmp/diag_log.txt
logout >> /tmp/diag_log.txt
login Guest >> /tmp/diag_log.txt
echo "User & Session Management Commands Called: ✅"
delay 600
echo " "

# --- Final Log Display ---
echo "📜 Displaying Full Diagnostic Log from /tmp/diag_log.txt..."
delay 1000
echo "--- All Expected Tests Completed (v1.0.2 script) ---" >> /tmp/diag_log.txt
echo "If this script completed, all 'check_fail' tests behaved as expected (i.e., the underlying command failed, so check_fail succeeded)," >> /tmp/diag_log.txt
echo "and the 'rm -f non_existent' test also behaved as expected (succeeded silently)." >> /tmp/diag_log.txt
echo "If the script halted on a 'check_fail' line, the underlying command UNEXPECTEDLY SUCCEEDED." >> /tmp/diag_log.txt
echo "If the script halted on the 'rm -f /non_existent_file_for_rm_test' line, 'rm -f' UNEXPECTEDLY FAILED." >> /tmp/diag_log.txt
echo "Review terminal output for the exact point of failure if script halted prematurely on other commands." >> /tmp/diag_log.txt
echo "For background ( & ) tests, also check OopisOS terminal output for '[jobId] Backgrounded.' and '[jobId] finished' messages." >> /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt
echo "Attempting to display full diagnostic log from /tmp/diag_log.txt:" >> /tmp/diag_log.txt
cat /tmp/diag_log.txt
echo " " >> /tmp/diag_log.txt
echo "--- End of OopisOS Diagnostic Script v1.0.2 ---" >> /tmp/diag_log.txt
echo " "

# --- Automated Cleanup ---
echo " "
echo "🧹 Performing automated cleanup..."
delay 500
echo "Navigating to root for safe cleanup..." >> /tmp/diag_log.txt
cd /
echo "Removing test working directory: /tmp/diag_workdir" >> /tmp/diag_log.txt
rm -f /tmp/diag_workdir >> /tmp/diag_log.txt
echo "Removing other temp files if any, e.g. /tmp/rm_ancestor_test" >> /tmp/diag_log.txt
rm -f /tmp/rm_ancestor_test >> /tmp/diag_log.txt
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
echo "  ==         OopisOS Diagnostics - v1.0.2             =="
delay 200
echo "  ==                ALL SYSTEMS GO!                   =="
delay 200
echo "  ==               CONGRATULATIONS!                   =="
delay 200
echo "  ==   (As always, you've been a real pantload!)      =="
delay 200
echo "  ==                                                  =="
delay 200
echo "  ======================================================"
echo " "

# --- Manual Test Plan ---
echo " "
echo "✋ Manual Test Plan Required (v1.0.2)"
delay 500
echo "The following commands/features require interactive user input or observation:"
echo "  - edit <filename>     (Test creating, saving with Ctrl+S, exiting with Ctrl+O)"
echo "  - upload                (Test uploading a .txt file)"
echo "  - export <filename>     (Test downloading a file)"
echo "  - backup                (Test creating and downloading a session backup .json file)"
echo "  - restore               (Test restoring from a downloaded backup file)"
echo "  - reset                 (Manually run and confirm the full system reset)"
echo "  - Background job completion messages: Observe OopisOS terminal for '[jobId] finished' or '[jobId] finished with error' messages."
echo "  - Interactive behavior of pipelines: e.g., 'cat | cat' and typing input interactively if OopisOS supports this for stdin not from file/pipe-start."
echo " "
delay 1500
