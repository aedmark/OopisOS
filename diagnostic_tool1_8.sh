# OopisOS Comprehensive Test Script
# Script Version for OopisOS v1.8 (Merged & Enhanced)

echo "===== OopisOS Test Suite Initializing (Targeting OopisOS v1.8 Features) ====="
echo "IMPORTANT: This script will create/delete files/dirs and manage users."
echo "It assumes it starts as the default 'Guest' user or in a clean initial state."
echo "Ensure OopisOS v1.8 is running."
echo ""
echo "--- Initial State Verification ---"
echo "Current User (expected: Guest):"
whoami
echo "Current Path (expected: /home/Guest):"
pwd
echo "Initial Home FS Listing (should be empty):"
ls .
delay 700 # Allow time for initial commands to settle
echo "---------------------------------------------------------------------"

# --- Test Setup: Cleaning up and preparing environment as initial user (Guest) ---
echo ""
echo "--- Test Setup Phase (Executing as Initial User 'Guest') ---"
echo "Verifying current user for setup (expected: Guest):"
whoami
delay 400

echo "Attempting to remove previous '/test_workspace_main' and '/test_workspace_helper' from Guest's FS (if any)..."
rm -r -f "/test_workspace_main"
rm -r -f "/test_workspace_helper"
delay 400

echo "Attempting to remove test users (if any from previous runs)..."
removeuser testuser_main
delay 400
removeuser testuser_helper
delay 700

echo "--- Test: Username Validation for 'register' command (as Guest) ---"
echo "Testing invalid username: 'aa' (too short)"
check_fail "register aa"
echo "Testing invalid username: 'averylongusernameovertwentyonechars' (too long)"
check_fail "register averylongusernameovertwentyonechars"
echo "Testing invalid username: 'user withspace' (contains space)"
check_fail 'register "user withspace"'
echo "Testing invalid username: 'guest' (reserved name)"
check_fail "register guest"
delay 700

echo "Registering fresh test users: 'testuser_main' and 'testuser_helper'..."
register testuser_main
delay 400
register testuser_helper
delay 400

echo "--- Test: 'listusers' command after registration (as Guest) ---"
echo "Expected to show Guest, testuser_main, testuser_helper"
listusers
delay 400
echo "Initial user setup and preliminary checks complete."
echo "---------------------------------------------------------------------"

# --- Login as primary test user (testuser_main) and set up their workspace ---
echo ""
echo "--- Phase: Logging in as 'testuser_main' and Workspace Setup ---"
login testuser_main
delay 400

echo "Current User (expected: testuser_main):"
whoami
echo "Current Path after login (expected: /home/testuser_main):"
pwd
delay 400

# Use relative paths to create workspace inside the user's home directory
rm -r -f "test_workspace_main" 
delay 400
mkdir "test_workspace_main"
delay 400
cd "test_workspace_main"

echo "Current User (expected: testuser_main):"
whoami
echo "Current Path (expected: /test_workspace_main):"
pwd
echo "Listing contents of '/test_workspace_main':"
ls -l .
delay 700
echo "---------------------------------------------------------------------"

# --- Test Section: Core File System (mkdir, touch, ls, pwd as 'testuser_main') ---
echo ""
echo "===== Testing: Core File System (mkdir, touch, ls, pwd) ====="
echo "User: testuser_main, CWD: /test_workspace_main"
delay 400

echo "--- Test: 'mkdir' basic & '-p' for nested directories ---"
mkdir my_dir
mkdir -p level1/level2/level3
ls -l .
ls -l level1
tree level1
delay 700

echo "--- Test: 'mkdir' error cases ---"
touch existing_file.txt
check_fail "mkdir existing_file.txt"
rm -f existing_file.txt; delay 300
mkdir existing_dir
check_fail "mkdir existing_dir"
rm -r -f existing_dir; delay 300
echo "file_content" > intermediate_file.txt
check_fail "mkdir -p intermediate_file.txt/new_dir"
rm -f intermediate_file.txt
delay 700

echo "--- Test: 'touch' new files, mtime updates, -c, -t, --date ---"
touch new_file.txt; ls -l new_file.txt
delay 1600; touch new_file.txt; ls -l new_file.txt # mtime update
delay 1600; touch -c new_file.txt; ls -l new_file.txt # -c update
touch -c non_existent_c.txt; check_fail "ls non_existent_c.txt" # -c no create
touch -t 2401151030 stamp_file.txt; ls -l stamp_file.txt; rm -f stamp_file.txt
touch --date "2023-07-04T12:00:00Z" date_file.txt; ls -l date_file.txt; rm -f date_file.txt
mkdir touch_dir; delay 1600; touch touch_dir; ls -l . | grep touch_dir; rm -r -f touch_dir
delay 700

echo "--- Test: 'ls' basic, -a, error cases ---"
mkdir empty_ls_dir; ls empty_ls_dir; rm -r -f empty_ls_dir
touch .hidden_file; mkdir .hidden_dir; ls; ls -a; rm -f .hidden_file; rm -r -f .hidden_dir
check_fail "ls non_existent_ls_dir"
delay 700

echo "--- Test: 'pwd' and 'cd' navigation & errors ---"
pwd # /test_workspace_main
cd level1/level2; pwd # /test_workspace_main/level1/level2
cd ../..; pwd # /test_workspace_main
touch file_for_cd_error.txt; check_fail "cd file_for_cd_error.txt"; rm -f file_for_cd_error.txt
mkdir no_exec_dir_cd; chmod 60 no_exec_dir_cd; check_fail "cd no_exec_dir_cd"; chmod 70 no_exec_dir_cd; rm -r -f no_exec_dir_cd
delay 700
echo "---------------------------------------------------------------------"

# --- Test Section: File Content (echo, cat, redirection, pipes as 'testuser_main') ---
echo ""
echo "===== Testing: File Content (echo, cat, >, >>, |) ====="
echo "User: testuser_main, CWD: /test_workspace_main"
delay 400

echo "--- Test: 'echo > file' & 'cat' ---"
echo "Hello OopisOS" > file_a.txt; cat file_a.txt
echo "New Content" > file_a.txt; cat file_a.txt
delay 400

echo "--- Test: 'echo >> file' ---"
echo "Initial line" >> file_b.txt; cat file_b.txt
echo "Appended line" >> file_b.txt; cat file_b.txt
delay 400

echo "--- Test: 'cat' multiple files ---"
cat file_a.txt file_b.txt
delay 400

echo "--- Test: Redirection to new subdir ---"
echo "Nested content" > new_sub/redir.txt; ls -l new_sub; cat new_sub/redir.txt; rm -r -f new_sub
delay 400

echo "--- Test: 'cat' error cases ---"
check_fail "cat non_existent_cat.txt"
check_fail "cat my_dir" # my_dir exists
delay 400

echo "--- Test: Redirection permissions ---"
touch redir_perm.txt; chmod 40 redir_perm.txt # r-- ---
check_fail "echo 'overwrite fail' > redir_perm.txt"
check_fail "echo 'append fail' >> redir_perm.txt"
cat redir_perm.txt; rm -f redir_perm.txt
delay 400

echo "--- Test: Piping ---"
echo "Piped content" | cat
echo "L1\nL2\nL3" > pipe_src.txt
cat pipe_src.txt | grep "L2"
cat pipe_src.txt | grep -v "L1" | grep "L3"
check_fail "cat pipe_src.txt | non_existent_pipe_cmd | cat"
cat pipe_src.txt | grep "L3" > pipe_out.txt; cat pipe_out.txt; rm -f pipe_out.txt
rm -f pipe_src.txt
delay 700
echo "---------------------------------------------------------------------"

# --- Test Section: Advanced 'ls' Flags (as 'testuser_main') ---
echo ""
echo "===== Testing: Advanced 'ls' Flags ====="
mkdir ls_adv_dir; cd ls_adv_dir
touch file_c.txt; delay 100; touch file_z.log; delay 100 # short delay for mtime
echo "smallest" > file_c.txt
echo "medium content here" > file_z.log
delay 1600; touch file_a.txt; echo "largest file content for size sort" > file_a.txt
delay 1600; touch file_b.md; echo "markdown" > file_b.md
mkdir sub_ls; touch sub_ls/nested.sh; echo "shell" > sub_ls/nested.sh
touch .hidden_adv.txt
delay 400
echo "--- ls (default sort by name) ---"; ls
echo "--- ls -l (long format) ---"; ls -l
echo "--- ls -a (all, including hidden) ---"; ls -a
echo "--- ls -t (sort by time, newest first) ---"; ls -t
echo "--- `ls -tr (sort by time, oldest first) ---"; ls -tr
echo "--- ls -S (sort by size, largest first) ---"; ls -S
echo "--- ls -Sr (sort by size, smallest first) ---"; ls -Sr
echo "--- ls -X (sort by extension) ---"; ls -X
echo "--- ls -U (no sort, directory order) ---"; ls -U
echo "--- ls -R (recursive) ---"; ls -R
echo "--- ls -laRt (combined flags, recursive, all, long, time sort rev) ---"; ls -laRt
cd ..; rm -r -f ls_adv_dir
delay 700
echo "---------------------------------------------------------------------"

# --- Test Section: File Permissions (chmod, chown, access checks) ---
# Merging detailed tests from v1.7, adapting user names
echo ""
echo "===== Testing: File Permissions ('chmod', 'chown', Access Checks) ====="

echo "--- Setup: 'testuser_main' creates items for permission tests ---"
touch perm_file1.txt; mkdir perm_dir1
echo "owner content for perm_file1.txt" > perm_file1.txt
ls -l perm_file1.txt perm_dir1
delay 600

echo "--- Test: 'chmod' by owner 'testuser_main' ---"
chmod 75 perm_file1.txt; ls -l perm_file1.txt
chmod 70 perm_dir1; ls -l perm_dir1
delay 300
check_fail "chmod 99 perm_file1.txt"; check_fail "chmod abc perm_file1.txt"; check_fail "chmod 7 perm_file1.txt"
delay 300

echo "--- Test: 'chown' by owner 'testuser_main' to 'testuser_helper' ---"
chown testuser_helper perm_file1.txt
ls -l perm_file1.txt # owner: testuser_helper, mode 75 (original from testuser_main)
delay 300

echo "--- Test: 'testuser_main' (now 'other') access to 'perm_file1.txt' (owned by testuser_helper) ---"
echo "'perm_file1.txt' (in /test_workspace_main) is mode 75 (rwxr-xr-x), owned by 'testuser_helper'."
echo "'testuser_main' is 'other' for this file (permissions r-x)."
check_fail "chmod 66 perm_file1.txt" # chmod fail (testuser_main is not owner)
check_fail "echo 'append fail by testuser_main' >> perm_file1.txt" # write fail (other is r-x)
cat perm_file1.txt # read success (other is r-x)
delay 600

echo "--- Test: Login as 'testuser_helper' ---"
login testuser_helper
delay 300
whoami # Expected: testuser_helper
# The CWD is now /home/testuser_helper, no need to cd to root.
# Create the workspace relative to the current (home) directory.
rm -r -f "test_workspace_helper"; mkdir "test_workspace_helper"; cd "test_workspace_helper"
pwd # Expected: /home/testuser_helper/test_workspace_helper
delay 300

echo "--- Test: 'testuser_helper' creates and manages THEIR OWN file ('helper_file.txt') ---"
echo "Creating 'helper_file.txt' with content by 'testuser_helper'..."
echo "Content by testuser_helper in helper_file.txt" > helper_file.txt
ls -l helper_file.txt # Default mode 64 for testuser_helper
delay 300
echo "'testuser_helper' (as owner) sets 'helper_file.txt' to mode 70 (owner rwx, other ---)..."
chmod 70 helper_file.txt
ls -l helper_file.txt
delay 300
echo "'testuser_helper' (as owner) appends to their 'helper_file.txt' (mode 70, owner has rwx, should succeed)..."
echo "Appended by testuser_helper" >> helper_file.txt
cat helper_file.txt
delay 300

echo "--- Test: 'testuser_helper' (owner) 'chown's THEIR file ('helper_file.txt') to 'testuser_main' ---"
chown testuser_main helper_file.txt
# ls -l helper_file.txt # This line was removed as testuser_helper loses read permission
echo "File 'helper_file.txt' is now owned by 'testuser_main', mode was 70 (rwx--- by testuser_helper before chown)."
delay 300

echo "--- Test: 'testuser_helper' (now 'other') access to 'helper_file.txt' (owned by testuser_main) ---"
echo "'helper_file.txt' (in /test_workspace_helper) is now owned by 'testuser_main' and has mode 70 (rwx---)."
echo "'testuser_helper' is 'other' for this file (permissions ---)."
check_fail "cat helper_file.txt" # read fail (other is ---)
check_fail "echo 'append fail by testuser_helper' >> helper_file.txt" # write fail (other is ---)
check_fail "chmod 66 helper_file.txt" # chmod fail (not owner)
delay 300

cd / # Logout from root as testuser_helper
logout # Back to Guest
delay 300
login testuser_main # Back to testuser_main
delay 300
# Corrected path to navigate to the correct workspace location
cd /home/testuser_main/test_workspace_main 
delay 700
echo "---------------------------------------------------------------------"

# --- Test Section: File Removal (rm) - Extended (as 'testuser_main') ---
echo ""
echo "===== Testing: File Removal ('rm') - Extended ====="
echo "--- Test: 'rm directory' (no -r, non-empty, EXPECTED FAIL) ---"
mkdir rm_dir_ne; touch rm_dir_ne/file.txt; check_fail "rm rm_dir_ne"; rm -rf rm_dir_ne
delay 300
echo "--- Test: 'rm directory' (no -r, empty, EXPECTED FAIL in OopisOS) ---"
mkdir rm_dir_e; check_fail "rm rm_dir_e"; rm -rf rm_dir_e # OopisOS rm needs -r for dirs
delay 300
echo "--- Test: 'rm -r directory_with_contents' (success) ---"
mkdir rm_dir_r; touch rm_dir_r/f1; mkdir rm_dir_r/sub; touch rm_dir_r/sub/f2
rm -rf rm_dir_r; check_fail "ls rm_dir_r"
delay 300
echo "--- Test: 'rm -f non_existent' (success, no error) ---"
rm -f rm_non_exist.txt
delay 300
echo "--- Test: 'rm' owner's read-only file (mode 40) ---"
touch rm_ro_file; chmod 40 rm_ro_file; rm -f rm_ro_file; check_fail "ls rm_ro_file"
delay 300
echo "--- Test: 'rm' file in no-write-permission parent (mode 50) ---"
mkdir rm_parent_no_w; touch rm_parent_no_w/file.txt; chmod 50 rm_parent_no_w
check_fail "rm -f rm_parent_no_w/file.txt"
chmod 70 rm_parent_no_w; rm -rf rm_parent_no_w
delay 300
echo "--- Test: 'rm .', 'rm ..', 'rm /' (EXPECTED FAILURES) ---"
check_fail "rm ."; check_fail "rm .."; check_fail "rm /"; check_fail "rm -r /"
delay 700
echo "---------------------------------------------------------------------"

# --- Test Section: File Copy (cp) and Move (mv) (as 'testuser_main') ---
echo ""
echo "===== Testing: File Copy ('cp') and Move ('mv') ====="
echo "--- Setup for cp/mv ---"
echo "cp_content_A" > cp_file_A.txt; echo "cp_content_B" > cp_file_B.txt
mkdir cp_dir_S; echo "in_S" > cp_dir_S/s_file.txt
mkdir cp_dir_D; mkdir cp_dir_D_empty
chmod 64 cp_file_A.txt; chmod 75 cp_dir_S
ls -l
delay 400

echo "--- 'cp' file to file (new) ---"; cp cp_file_A.txt cp_file_C.txt; cat cp_file_C.txt; ls -l cp_file_C.txt
echo "--- 'cp' file to file (overwrite, no flags) ---"; check_fail "cp cp_file_B.txt cp_file_C.txt"
echo "--- 'cp -f' file to file (overwrite) ---"; cp -f cp_file_B.txt cp_file_C.txt; cat cp_file_C.txt
echo "--- 'cp -i' file to file (interactive - script will auto-cancel) ---"; cp -i cp_file_A.txt cp_file_C.txt
delay 300
echo "--- 'cp' file to dir ---"; cp cp_file_A.txt cp_dir_D; cat cp_dir_D/cp_file_A.txt
echo "--- 'cp' multiple files to dir ---"; cp cp_file_B.txt cp_file_C.txt cp_dir_D_empty; ls cp_dir_D_empty
delay 300
echo "--- 'cp -r' dir to dir (new) ---"; cp -r cp_dir_S cp_dir_S_new_copy; tree cp_dir_S_new_copy
echo "--- 'cp -r' dir to dir (existing) ---"; cp -r cp_dir_S cp_dir_D; tree cp_dir_D # cp_dir_S will be inside cp_dir_D
delay 300
echo "--- 'cp -p' (preserve metadata - check mtime manually/visually if possible) ---"
touch -t 2301010000 cp_file_A.txt; cp -p cp_file_A.txt cp_file_A_preserved.txt; ls -l cp_file_A.txt cp_file_A_preserved.txt
delay 300
echo "--- 'cp' error: source not found ---"; check_fail "cp non_existent_source.txt cp_dest_fail.txt"
echo "--- 'cp' error: multiple sources, dest not dir ---"; check_fail "cp cp_file_A.txt cp_file_B.txt cp_file_C.txt"
echo "--- 'cp -r' dir onto file ---"; check_fail "cp -r cp_dir_S cp_file_A.txt"
delay 300

echo "--- 'mv' file to file (rename) ---"; mv cp_file_A.txt mv_file_A_new.txt; ls -l mv_file_A_new.txt; check_fail "ls cp_file_A.txt"
echo "--- 'mv' file to file (overwrite) ---"; echo "orig_mv_B" > mv_file_B.txt; mv -f cp_file_B.txt mv_file_B.txt; cat mv_file_B.txt
echo "--- 'mv' file to dir ---"; mv mv_file_A_new.txt cp_dir_D_empty; ls cp_dir_D_empty/mv_file_A_new.txt
delay 300
echo "--- 'mv' dir to dir (new) ---"; mkdir mv_dir_S_orig; mv mv_dir_S_orig mv_dir_S_new; ls mv_dir_S_new
echo "--- 'mv' dir to dir (existing, moves S_new into D_existing) ---"; mkdir mv_D_existing; mv mv_dir_S_new mv_D_existing; ls mv_D_existing/mv_dir_S_new
delay 300
echo "--- 'mv' error: source not found ---"; check_fail "mv non_existent_mv_source.txt mv_dest_fail.txt"
echo "--- 'mv' error: move dir into itself ---"; mkdir mv_dir_parent; mkdir mv_dir_parent/mv_dir_child; check_fail "mv mv_dir_parent mv_dir_parent/mv_dir_child"
delay 300
# Cleanup cp/mv
rm -rf cp_file_A.txt cp_file_B.txt cp_file_C.txt cp_dir_S cp_dir_D cp_dir_D_empty cp_dir_S_new_copy cp_file_A_preserved.txt
rm -rf mv_file_B.txt mv_D_existing mv_dir_parent
delay 700
echo "---------------------------------------------------------------------"

# --- Test Section: `find` command (as 'testuser_main') ---
echo ""
echo "===== Testing: 'find' Command ====="
echo "--- Setup for find ---"
mkdir find_root; cd find_root
echo "find_A" > fileA.txt; echo "find_B" > fileB.log; touch -t 2301010000 fileA.txt # Older file
mkdir dir1; echo "in_dir1" > dir1/fileC.txt; chmod 70 dir1/fileC.txt # Executable for owner
mkdir dir1/subD; echo "in_subD" > dir1/subD/fileD.log
mkdir dir2; echo "find_E" > dir2/fileE.txt
chmod 64 dir2/fileE.txt # Add this line to make the file readable by others
chown testuser_helper dir2/fileE.txt # Different owner
ls -R
delay 400
echo "--- find . -name \"*.txt\" ---"; find . -name "*.txt"
echo "--- find . -type d ---"; find . -type d
echo "--- find . -name \"fileA.txt\" -exec cat {} \; ---"; find . -name "fileA.txt" -exec cat {} \;
echo "--- find . -user testuser_helper ---"; find . -user testuser_helper
echo "--- Test: find -exec with permission checks ---"
# testuser_main is running find. fileE.txt is owned by testuser_helper with perms 64 (rw-r--r--)
# testuser_main (as 'other') has read but not write permission.
# The 'echo' command with '>' redirection is effectively a 'write' operation.
# Therefore, this -exec command should fail.
check_fail "find . -name fileE.txt -exec echo 'overwrite failed' > {} \\;"
echo "Verified that find -exec correctly fails on write-protected file."
delay 400
echo "--- find ./dir1 -perm 70 ---"; find ./dir1 -perm 70
echo "--- find . -mtime +5 (files older than 5 days - fileA.txt should match) ---"; find . -mtime +5
echo "--- find . -type f -delete (BE CAREFUL - should delete files) ---"
echo "Before delete:"; find . -type f -print
find . -type f -delete
echo "After delete (files should be gone):"; find . -type f -print
ls -R # Check what remains (should be only dirs)
cd ..; rm -r -f find_root
delay 700
echo "---------------------------------------------------------------------"

# --- Test Section: Scripting (`run` as 'testuser_main') - Merging from v1.7 style ---
echo ""
echo "===== Testing: Scripting - 'run' Command (Detailed) ====="
echo "--- Test: Basic Script Execution ---"
echo "echo \"Basic script ran\"" > run_basic.sh; chmod 70 run_basic.sh; run ./run_basic.sh
delay 300
echo "--- Test: Running a script that is readable but NOT executable ---"
echo "echo \"Should not run\"" > run_noexec.sh; chmod 60 run_noexec.sh; check_fail "run ./run_noexec.sh"
delay 300
echo "--- Test: Script with Argument Passing (\$1, \$2, \$@, \$#) ---"
echo "#!/bin/oopis_test_shell" > run_args.sh
echo "echo \"Script Name: \$0 (OopisOS run doesn't set \$0)\"" >> run_args.sh
echo "echo \"Arg1: \$1\"" >> run_args.sh
echo "echo \"Arg2: \$2\"" >> run_args.sh
echo 'echo "All=$@"' >> run_args.sh  # CORRECTED LINE
echo "echo \"Count=\$#\"" >> run_args.sh
echo "# Comment" >> run_args.sh
chmod 70 run_args.sh; cat ./run_args.sh
run ./run_args.sh first "second arg" third
delay 300
echo "--- Test: Script with a failing command ---"
echo "echo \"Starting failing script...\"" > run_fail.sh
echo "cat /non_existent_in_script.txt" >> run_fail.sh
echo "echo \"This should not print\"" >> run_fail.sh
chmod 70 run_fail.sh; check_fail "run ./run_fail.sh"
delay 300
echo "--- Test: Running an empty script ---"
touch run_empty.sh; chmod 70 run_empty.sh; run ./run_empty.sh
delay 300
echo "--- Test: Running script via absolute path ---"
# Create the script in the CWD, then run it with its full, correct absolute path
echo "echo \"Absolute path script!\"" > run_abs.sh
chmod 70 run_abs.sh
run /home/testuser_main/test_workspace_main/run_abs.sh
delay 300
# Cleanup scripting tests
rm -f run_basic.sh run_noexec.sh run_args.sh run_fail.sh run_empty.sh /test_workspace_main/run_abs.sh
delay 700
echo "---------------------------------------------------------------------"

echo ""
echo "===== Testing: grep -R, printscreen, gemini, adventure, upload/export ====="
echo "--- Testing: Recursive 'grep -R' ---"
mkdir grep_R_test; mkdir grep_R_test/s1; echo "K1" > grep_R_test/f1.txt; echo "K2" > grep_R_test/s1/f2.txt
grep -R K grep_R_test; grep -iR k1 grep_R_test; rm -rf grep_R_test
delay 400

# --- Final Cleanup of users and test_workspace ---
echo ""
echo "--- Test Completion: Final Cleanup Phase ---"
cd / # Ensure not in a directory that will be removed
delay 300
echo "Current user before final logout (expected: testuser_main):"; whoami
su # Switch to the root user for administrative tasks
delay 300
echo "Current user after login (expected: root):"; whoami
delay 300

echo "--- Removing Test Users (as 'root') ---"
removeuser testuser_main
delay 700
removeuser testuser_helper
delay 700

echo "--- Final Sanity Checks (as 'Guest') ---"
logout
listusers # Verify test users are gone
delay 300
rm -r -f "/test_workspace_main" # Cleanup any remnants from Guest's view
rm -r -f "/test_workspace_helper"
ls -la /
delay 700
echo "---------------------------------------------------------------------"

echo ""
echo "===== OopisOS Test Suite Complete (v1.8 - Merged & Enhanced) ======="
# --- Success Animation ---
echo " "
delay 700
echo "  ======================================================"
delay 200
echo "  ==                                                  =="
delay 200
echo "  ==         OopisOS Diagnostics - v1.8               =="
delay 200
echo "  ==              CONGRATULATIONS,                    =="
delay 200
echo "  ==            ALL SYSTEMS ARE GO!                   =="
delay 250
echo "  ==                                                  =="
echo "  ==   (As usual, you've been a real pantload!)       =="
echo "  ==                                                  =="
delay 200
echo "  ======================================================"
echo " "
delay 700
echo "...kthxbye"
delay 500
