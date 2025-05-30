#!/bin/sh
# OopisOS Comprehensive Test Script
# Version 1.5.1
#
# Instructions:
# 1. Save this script as "full_test.sh" in your OopisOS (e.g., using 'edit full_test.sh').
# 2. Run the script using: run full_test.sh
# 3. Observe the output for "SUCCESS", "FAILURE", "CHECK_FAIL: SUCCESS", or "CHECK_FAIL: FAILURE".
#    - "SUCCESS" means a positive test passed.
#    - "CHECK_FAIL: SUCCESS" means a negative test (where an error was expected) passed.
#    - "FAILURE" or "CHECK_FAIL: FAILURE" indicates a potential issue.
#
# Changes in v1.5.1:
# - Added 'cd "/test_workspace"' after user management tests to ensure subsequent
#   operations occur in the intended directory before final cleanup.
#
# Changes in v1.5:
# - Added explicit "EXPECTED FAIL:" messages before `check_fail` calls.
# - Added `delay` commands to improve readability of output during script execution.
#
# Changes in v1.4:
# - Replaced more shell variable assignments in the User Management section
#   with hardcoded strings.
#
# Changes in v1.3:
# - Changed `rm -rf` to `rm -r -f` to accommodate shells/parseFlags
#   that do not automatically expand combined short options.
#
# Changes in v1.2:
# - Removed direct shell variable assignments (TEST_DIR, SUB_SCRIPT_NAME)
#   as OopisOS 'run' command does not support them. Values are now hardcoded.

echo "===== OopisOS Test Suite Initializing (Version 1.5.1) ====="
echo "IMPORTANT: This script will create and delete files/directories."
echo "It will also attempt to register and manage users."
echo "Initial state:"
whoami
pwd
ls
delay 500
echo "------------------------------------------------------"

# --- Test Setup: Cleaning up previous test environment ---
echo ""
echo "--- Test Setup: Cleaning up previous test environment ---"
echo "Attempting to remove previous /test_workspace (if any)..."
rm -r -f "/test_workspace" # Use -r -f to ensure it's gone if it exists
delay 250
mkdir "/test_workspace"
cd "/test_workspace"
echo "Setup complete. Current directory:"
pwd
delay 500
echo "------------------------------------------------------"

# --- Test Section: File System - mkdir, touch, ls, pwd ---
echo ""
echo "===== Testing: File System - mkdir, touch, ls, pwd ====="
echo "--- Test: mkdir basic ---"
mkdir my_dir
ls
delay 250
echo "--- Test: mkdir multiple & nested (with -p) ---"
mkdir -p level1/level2/level3
ls -l level1/level2
delay 250
tree level1 # Assuming tree command exists and works
delay 500
echo "--- Test: touch new_file.txt ---"
touch new_file.txt
ls
delay 250
echo "--- Test: touch existing_file.txt (update timestamp - visual check in ls -l if implemented) ---"
touch new_file.txt
ls -l
delay 250
echo "--- Test: ls in an empty directory ---"
mkdir empty_dir
ls empty_dir
delay 250
echo "--- EXPECTED FAIL: Testing ls on non-existent directory ---"
check_fail "ls non_existent_dir_for_ls"
delay 250
echo "--- Test: pwd after cd ---"
cd level1/level2
pwd
delay 250
cd "/test_workspace" # Return to test_workspace
pwd
delay 500
echo "------------------------------------------------------"

# --- Test Section: File Content (echo >, cat) ---
echo ""
echo "===== Testing: File Content - echo >, cat ====="
echo "--- Test: echo to new file (overwrite) ---"
echo "Hello OopisOS" > file_a.txt
cat file_a.txt
delay 250
echo "--- Test: echo to existing file (overwrite) ---"
echo "New Content for A" > file_a.txt
cat file_a.txt
delay 250
echo "--- Test: echo to new file (append) ---"
echo "Hello Again" >> file_b.txt
cat file_b.txt
delay 250
echo "--- Test: echo to existing file (append) ---"
echo "And Again" >> file_b.txt
cat file_b.txt
delay 250
echo "--- Test: cat multiple files ---"
cat file_a.txt file_b.txt
delay 500
echo "--- EXPECTED FAIL: Testing cat on non-existent file ---"
check_fail "cat non_existent_file_for_cat.txt"
delay 250
echo "--- EXPECTED FAIL: Testing cat on a directory ---"
check_fail "cat my_dir"
delay 500
echo "------------------------------------------------------"

# --- Test Section: File Removal (rm) ---
echo ""
echo "===== Testing: File Removal - rm ====="
echo "--- Test: rm a file (to_be_removed.txt) ---"
touch to_be_removed.txt
ls
delay 250
rm to_be_removed.txt
ls
delay 250
echo "--- EXPECTED FAIL: Testing rm on non-existent file (without -f) ---"
check_fail "rm non_existent_for_rm.txt"
delay 250
echo "--- Test: rm non-existent file with -f (should succeed silently) ---"
rm -f non_existent_for_rm_force.txt
ls # To show it didn't error
delay 250
echo "--- EXPECTED FAIL: Testing rm on a directory without -r ---"
mkdir dir_to_rm_fail
check_fail "rm dir_to_rm_fail"
delay 250
rm -r -f dir_to_rm_fail # Cleanup
echo "--- Test: rm an empty directory with -r ---"
mkdir empty_dir_for_rm
rm -r empty_dir_for_rm # or -R
ls
delay 250
echo "--- Test: rm a non-empty directory with -r ---"
mkdir -p complex_dir/sub_dir
touch complex_dir/file1.txt
touch complex_dir/sub_dir/file2.txt
echo "Contents before rm -r complex_dir:"
tree complex_dir
delay 500
rm -r complex_dir # or -R
ls
delay 250
echo "--- Test: rm with -i (interactive - manual check needed if script bypasses prompt) ---"
echo "MANUAL CHECK: The following 'rm -i file_for_interactive_rm.txt' should prompt if run interactively."
echo "Script will auto-answer 'NO' or proceed based on non-interactive behavior."
echo "This test is more for observing interactive behavior."
touch file_for_interactive_rm.txt
# For now, we'll try to remove it forcefully to ensure cleanup and script continuation.
rm -f file_for_interactive_rm.txt
delay 250
echo "--- Test: rm -r -f on a complex structure ---"
mkdir -p structure/s1/s1_1
mkdir -p structure/s2
touch structure/f1.txt
touch structure/s1/f_s1.txt
touch structure/s1/s1_1/f_s1_1.txt
touch structure/s2/f_s2.txt
echo "Structure before rm -r -f:"
tree structure
delay 500
rm -r -f structure
ls
delay 500
echo "------------------------------------------------------"

# --- Test Section: Move and Copy (mv, cp) ---
echo ""
echo "===== Testing: Move and Copy - mv, cp ====="
echo "--- Test: mv file to new name ---"
touch original_mv.txt
mv original_mv.txt renamed_mv.txt
ls
delay 250
echo "--- EXPECTED FAIL: Original file for mv should be gone ---"
check_fail "ls original_mv.txt"
delay 250
echo "--- Test: mv file into directory ---"
mkdir mv_target_dir
mv renamed_mv.txt mv_target_dir/
ls mv_target_dir
delay 250
echo "--- EXPECTED FAIL: Moved file should be gone from source location ---"
check_fail "ls renamed_mv.txt"
delay 250
echo "--- Test: mv directory ---"
mkdir dir_to_move
mv dir_to_move moved_dir
ls
delay 250
echo "--- EXPECTED FAIL: Original directory for mv should be gone ---"
check_fail "ls dir_to_move"
delay 250
echo "--- Test: cp file to new name ---"
echo "cp content" > cp_source.txt
cp cp_source.txt cp_dest.txt
cat cp_source.txt
delay 100
cat cp_dest.txt
delay 250
echo "--- Test: cp file into directory ---"
mkdir cp_target_dir
cp cp_source.txt cp_target_dir/
ls cp_target_dir
delay 250
cat cp_target_dir/cp_source.txt
delay 250
echo "--- Test: cp directory recursively (-r or -R) ---"
mkdir -p cp_src_dir/sub
echo "in cp_src_dir" > cp_src_dir/file_in_src.txt
echo "in sub" > cp_src_dir/sub/file_in_sub.txt
cp -r cp_src_dir cp_dest_dir_complex
echo "Copied structure:"
tree cp_dest_dir_complex
delay 500
cat cp_dest_dir_complex/file_in_src.txt
delay 100
cat cp_dest_dir_complex/sub/file_in_sub.txt
delay 250
echo "--- EXPECTED FAIL: mv non-existent file ---"
check_fail "mv non_existent_mv_src.txt non_existent_mv_dest.txt"
delay 250
echo "--- EXPECTED FAIL: cp non-existent file ---"
check_fail "cp non_existent_cp_src.txt non_existent_cp_dest.txt"
delay 250
echo "--- EXPECTED FAIL: cp directory without -r ---"
mkdir cp_dir_no_r_test
check_fail "cp cp_dir_no_r_test cp_dir_no_r_dest"
delay 250
rm -r -f cp_dir_no_r_test # cleanup
delay 500
echo "------------------------------------------------------"

# --- Test Section: Advanced FS (tree, find) ---
echo ""
echo "===== Testing: Advanced FS - tree, find ====="
mkdir -p find_area/dir1/sub_dir1
mkdir -p find_area/dir2
touch find_area/file_root.txt
touch find_area/dir1/file_in_dir1.txt
touch find_area/dir1/another_file.md
touch find_area/dir1/sub_dir1/file_deep.txt
touch find_area/dir2/file_in_dir2.sh
echo "--- Test: tree command (visual check) ---"
tree find_area
delay 1000
echo "--- Test: find all files (-type f) ---"
find find_area -type f
delay 500
echo "--- Test: find all directories (-type d) ---"
find find_area -type d
delay 500
echo "--- Test: find by name pattern (*file*) ---"
find find_area -name file
delay 500
echo "--- Test: find by name pattern (*.txt) ---"
find find_area -name .txt
delay 500
echo "--- Test: find by name and type (dir1, type d) ---"
find find_area -name dir1 -type d
delay 500
echo "--- EXPECTED FAIL: find in non-existent path ---"
check_fail "find non_existent_find_path -name test"
delay 500
echo "------------------------------------------------------"

# --- Test Section: User Management ---
echo ""
echo "===== Testing: User Management ====="
echo "--- Test: whoami (should be current user, likely Guest initially) ---"
whoami
delay 250
echo "--- Test: register a new user (testuser123) ---"
register testuser123
delay 250
echo "--- EXPECTED FAIL: register an existing user (testuser123) ---"
check_fail "register testuser123"
delay 250
echo "--- EXPECTED FAIL: register a reserved username (guest) ---"
check_fail "register guest"
delay 250
echo "--- EXPECTED FAIL: register invalid username (short) ---"
check_fail "register u"
delay 250
echo "--- EXPECTED FAIL: register invalid username (long) ---"
check_fail "register averylongusernameoverlimit"
delay 250
echo "--- EXPECTED FAIL: register invalid username (spaces) ---"
check_fail "register test user"
delay 250

echo "--- Test: login as new user (testuser123) ---"
login testuser123
delay 250
echo "--- Test: whoami (NOTE: in script, this might still show original script runner) ---"
whoami
delay 250
echo "--- Test: logout (from testuser123, back to Guest) ---"
logout
delay 250
echo "--- Test: whoami (NOTE: in script, this might still show original script runner) ---"
whoami
delay 250
echo "--- EXPECTED FAIL: login non-existent user ---"
check_fail "login nonexistuser99"
delay 250
echo "--- Test: su (alias for login, to Guest) ---"
su # Defaults to Guest
delay 250
whoami
delay 250
echo "--- Test: su testuser123 (alias for login) ---"
su testuser123
delay 250
whoami
delay 250
logout # Back to original user for subsequent tests
delay 500
echo "------------------------------------------------------"
echo "Re-establishing CWD to /test_workspace for subsequent tests"
cd "/test_workspace"
pwd # For verification
echo "------------------------------------------------------"

# --- Test Section: Input/Output Redirection & Basic Piping ---
echo ""
echo "===== Testing: I/O Redirection & Piping ====="
echo "--- Test: Output redirection (overwrite >) ---"
echo "Redirection test line 1" > redir_out.txt
cat redir_out.txt
delay 250
echo "--- Test: Output redirection (append >>) ---"
echo "Redirection test line 2" >> redir_out.txt
cat redir_out.txt
delay 250
echo "--- Test: Simple pipe (echo | cat) ---"
echo "Piped content" | cat
delay 250
echo "--- Test: Redirection with multi-word echo ---"
echo "This is a sentence" > sentence.txt
cat sentence.txt
delay 250
echo "--- Test: Appending multi-word echo ---"
echo "Another sentence here" >> sentence.txt
cat sentence.txt
delay 250
echo "--- Test: Piping 'ls' to 'cat' (if cat handles piped input correctly) ---"
mkdir pipe_test_dir
touch pipe_test_dir/pipe_file1.txt
touch pipe_test_dir/pipe_file2.txt
ls pipe_test_dir | cat # Output might be one line depending on ls and cat
delay 250
rm -r -f pipe_test_dir # cleanup
delay 500
echo "------------------------------------------------------"

# --- Test Section: Scripting (run, arguments) ---
echo ""
echo "===== Testing: Scripting - run, arguments ====="
echo "--- Test: Creating a sub-script (sub_script.sh) ---"
echo "#!/bin/sh" > "sub_script.sh"
echo "echo \"Sub-script executing!\"" >> "sub_script.sh"
echo "echo \"Arg1 (\$1): \$1\"" >> "sub_script.sh"
echo "echo \"Arg2 (\$2): \$2\"" >> "sub_script.sh"
echo "echo \"All args (\$@): \$@\"" >> "sub_script.sh"
echo "echo \"Num args (\$#): \$#\"" >> "sub_script.sh"
echo "mkdir sub_script_dir_test" >> "sub_script.sh"
echo "touch sub_script_dir_test/sub_script_file.txt" >> "sub_script.sh"
echo "ls sub_script_dir_test" >> "sub_script.sh"
cat "sub_script.sh"
delay 1000
echo "--- Test: Running the sub-script with arguments ---"
run "sub_script.sh" hello world "third arg"
delay 500
echo "--- Test: Check if sub-script created items ---"
ls sub_script_dir_test
delay 250
echo "--- EXPECTED FAIL: Running a non-existent script ---"
check_fail "run non_existent_script.sh"
delay 250
echo "--- EXPECTED FAIL: Running a file that is not a script ---"
echo "This is not a script" > not_a_script.txt
check_fail "run not_a_script.txt"
delay 500
echo "------------------------------------------------------"

# --- Test Section: History Command ---
echo ""
echo "===== Testing: History Command ====="
echo "--- Test: history (visual check - should show commands from this script) ---"
history
delay 1000
echo "--- Test: history -c (clear history) ---"
history -c
delay 250
echo "--- Test: history (should be empty or show only 'history -c' and 'history') ---"
history
delay 500
echo "------------------------------------------------------"

# --- Test Section: Miscellaneous Commands ---
echo ""
echo "===== Testing: Miscellaneous - date, delay ====="
echo "--- Test: date (visual check) ---"
date
delay 500
echo "--- Test: delay (100ms) ---"
echo "Before delay..."
delay 100 # 100 milliseconds
echo "After delay."
delay 250
echo "--- EXPECTED FAIL: delay with invalid input (text) ---"
check_fail "delay not_a_number"
delay 250
echo "--- EXPECTED FAIL: delay with invalid input (negative) ---"
check_fail "delay -100"
delay 500
echo "------------------------------------------------------"

# --- Test Section: Session/State Management (Basic command execution) ---
echo ""
echo "===== Testing: Session/State Management Commands (Execution Check) ====="
echo "--- Test: savefs (command execution) ---"
savefs
delay 250
echo "--- Test: savestate (command execution) ---"
savestate
delay 250
echo "--- Test: loadstate (command execution - will prompt, script might bypass) ---"
loadstate
delay 500
echo "------------------------------------------------------"


# --- Final Cleanup ---
echo ""
echo "--- Test Completion: Cleaning up test directory /test_workspace ---"
cd / # Go to root to ensure we can remove /test_workspace
rm -r -f "/test_workspace"
echo "Filesystem after cleanup:"
ls -l /
delay 500
echo "------------------------------------------------------"

echo ""
echo "===== OopisOS Test Suite Complete ====="
echo "Review output above for SUCCESS, FAILURE, CHECK_FAIL: SUCCESS, or CHECK_FAIL: FAILURE messages."
echo "Remember that some tests like 'login' context changes and interactive prompts (-i flags) are best verified manually."
