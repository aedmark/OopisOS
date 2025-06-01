#!/bin/sh
# OopisOS Comprehensive Test Script
# Version 1.1.9.4 (Further Enhanced Tests)
#

echo "===== OopisOS Test Suite Initializing (Version 1.1.9.4a) ====="
echo "IMPORTANT: This script will create/delete files/dirs and manage users."
echo "Initial state (should be Guest or initial user):"
whoami
pwd
ls
delay 500
echo "------------------------------------------------------"

# --- Test Setup: Cleaning up and preparing environment as initial user (Guest) ---
echo ""
echo "--- Test Setup by Initial User (Guest) ---"
echo "Current user for setup: (should be Guest)"
whoami
delay 250

echo "Attempting to remove previous /test_workspace (if any from Guest's FS)..."
rm -r -f "/test_workspace" 
delay 250

echo "Attempting to remove test users (if any from previous runs)..."
removeuser testuser_perms
removeuser otheruser_perms
delay 500

echo "--- Test: Username validation for 'register' (as Guest) ---"
check_fail "register aa" # Too short
check_fail "register averylongusernameovertwentyonechars" # Too long
check_fail "register user withspace" # Contains space
check_fail "register guest" # Reserved name
delay 500

echo "Registering test users..."
register testuser_perms
register otheruser_perms
delay 250

echo "--- Test: listusers command (as Guest) ---"
listusers 
delay 250

echo "Initial user setup complete."
echo "------------------------------------------------------"

# --- Login as primary test user and create their workspace ---
echo ""
echo "--- Logging in as testuser_perms to create their workspace ---"
login testuser_perms
delay 250

echo "Current user after login: (should be testuser_perms)"
whoami
pwd # Should be /
delay 250

echo "Attempting to remove /test_workspace (if it exists from a previous run for testuser_perms)..."
rm -r -f "/test_workspace" 
delay 250

echo "Creating /test_workspace as testuser_perms..."
mkdir "/test_workspace" 
delay 250

cd "/test_workspace" 
echo "Setup complete for testuser_perms. Current directory:"
whoami
pwd
echo "Contents and permissions of /test_workspace (owned by testuser_perms):"
ls -l . 
delay 500
echo "------------------------------------------------------"

# --- Test Section: File System - mkdir, touch, ls, pwd ---
echo ""
echo "===== Testing: File System - mkdir, touch, ls, pwd (as testuser_perms) ====="
echo "Current user: (should be testuser_perms)"
whoami
cd "/test_workspace" 
delay 250

echo "--- Test: mkdir basic (owned by testuser_perms) ---"
mkdir my_dir
ls -l
delay 250

echo "--- Test: mkdir multiple & nested (with -p) ---"
mkdir -p level1/level2/level3
ls -l . 
ls -l level1
ls -l level1/level2
delay 250
tree level1 
delay 500

echo "--- Test: mkdir error cases ---"
echo "Creating existing_file_for_mkdir_test..."
touch existing_file_for_mkdir_test
check_fail "mkdir existing_file_for_mkdir_test" 
rm -f existing_file_for_mkdir_test
delay 250
echo "Creating existing_dir_for_mkdir_test..."
mkdir existing_dir_for_mkdir_test
check_fail "mkdir existing_dir_for_mkdir_test" 
rm -r -f existing_dir_for_mkdir_test
delay 250
echo "--- Test: mkdir -p where an intermediate path component is a file ---"
echo "iam_a_file" > file_as_intermediate_path_for_mkdir
check_fail "mkdir -p file_as_intermediate_path_for_mkdir/new_subdir"
rm -f file_as_intermediate_path_for_mkdir 
delay 500

echo "--- Test: touch new_file.txt (owned by testuser_perms) ---"
touch new_file.txt
ls -l
delay 250
echo "--- Test: touch existing_file.txt (update timestamp) ---"
touch new_file.txt
ls -l
delay 250

echo "--- Test: touch error handling ---"
echo "Test: touch on an existing directory (should succeed and update timestamp)"
mkdir touch_dir_test_timestamp
echo "Initial timestamp for touch_dir_test_timestamp:"
ls -l . | grep touch_dir_test_timestamp
delay 1500 
echo "Touching the directory touch_dir_test_timestamp..."
touch touch_dir_test_timestamp # This should now succeed
echo "Timestamp after touch for touch_dir_test_timestamp:"
ls -l . | grep touch_dir_test_timestamp # Check the timestamp again
rm -r -f touch_dir_test_timestamp
delay 250

echo "Test: touch with an empty final filename component (e.g., path ends with /)"
mkdir touch_parent_for_empty_name
touch touch_parent_for_empty_name/
delay 1500
rm -r -f touch_parent_for_empty_name
delay 250

echo "Test: touch new file in a directory without write permission"
mkdir no_write_parent_for_touch_test
chmod 50 no_write_parent_for_touch_test
check_fail "touch no_write_parent_for_touch_test/cannot_create_this.txt"
chmod 70 no_write_parent_for_touch_test
rm -r -f no_write_parent_for_touch_test
delay 500

echo "--- Test: ls in an empty directory ---"
mkdir empty_dir_for_ls
ls empty_dir_for_ls
rm -r -f empty_dir_for_ls
delay 250
echo "--- EXPECTED FAIL: Testing ls on non-existent directory ---"
check_fail "ls non_existent_dir_for_ls_test"
delay 250

echo "--- Test: pwd after cd ---"
cd level1/level2
pwd
delay 250
cd .. 
pwd 
delay 250
cd "/test_workspace" 
pwd
delay 250

echo "--- Test: cd error cases ---"
echo "Creating file_to_cd_into.txt..."
touch file_to_cd_into_error_test.txt
check_fail "cd file_to_cd_into_error_test.txt" 
rm -f file_to_cd_into_error_test.txt
delay 250
echo "Creating dir_no_exec_for_cd_test..."
mkdir dir_no_exec_for_cd_test
chmod 60 dir_no_exec_for_cd_test 
check_fail "cd dir_no_exec_for_cd_test" 
chmod 70 dir_no_exec_for_cd_test 
rm -r -f dir_no_exec_for_cd_test
delay 500
echo "------------------------------------------------------"

# --- Test Section: File Content (echo >, cat) ---
echo ""
echo "===== Testing: File Content - echo >, cat (as testuser_perms) ====="
cd "/test_workspace" 
delay 250
echo "--- Test: echo to new file (file_a.txt by testuser_perms) ---"
echo "Hello OopisOS" > file_a.txt
ls -l file_a.txt
cat file_a.txt
delay 250
echo "--- Test: echo to existing file (overwrite) ---"
echo "New Content for A" > file_a.txt
cat file_a.txt
delay 250
echo "--- Test: echo to new file (append file_b.txt) ---"
echo "Hello Again" >> file_b.txt
ls -l file_b.txt
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
check_fail "cat non_existent_file_for_cat_test.txt"
delay 250
echo "--- EXPECTED FAIL: Testing cat on a directory ---"
check_fail "cat my_dir" # my_dir was created earlier
delay 500
echo "------------------------------------------------------"

# --- Test Section: File Permissions (chmod, chown, access checks) ---
echo ""
echo "===== Testing: File Permissions (chmod, chown, access checks) ====="
echo "Current user for permission tests: (should be testuser_perms)"
whoami 
cd "/test_workspace" 
delay 250

echo "--- Test: Create files for permission tests by testuser_perms ---"
touch perm_file_owner.txt
mkdir perm_dir_owner
echo "Initial content" > perm_file_owner.txt
ls -l perm_file_owner.txt
ls -l perm_dir_owner
delay 500

echo "--- Test: chmod - Owner (testuser_perms) changes permissions ---"
echo "Setting perm_file_owner.txt to 75 (rwxr-x for owner, r-x for other)"
chmod 75 perm_file_owner.txt
ls -l perm_file_owner.txt
delay 250
echo "Setting perm_dir_owner to 70 (rwx--- for owner, --- for other)"
chmod 70 perm_dir_owner
ls -l perm_dir_owner
delay 250

echo "--- Test: chmod with invalid mode string (as testuser_perms) ---"
touch file_for_chmod_invalid_mode.txt
check_fail "chmod 99 file_for_chmod_invalid_mode.txt" # 9 is not a valid octal
check_fail "chmod abc file_for_chmod_invalid_mode.txt"
check_fail "chmod 7 file_for_chmod_invalid_mode.txt" # Needs two digits
rm -f file_for_chmod_invalid_mode.txt
delay 250

echo "--- Test: Owner (testuser_perms) tries chown to a non-existent user ---"
touch temp_chown_target_by_owner.txt
check_fail "chown non_existent_user_test temp_chown_target_by_owner.txt"
rm -f temp_chown_target_by_owner.txt
delay 500

echo "--- Test: Owner access based on new permissions (testuser_perms) ---"
echo "Test: Owner can read perm_file_owner.txt (has rwx from 75)"
cat perm_file_owner.txt
delay 250
echo "Test: Owner can write to perm_file_owner.txt (has rwx from 75)"
echo "Appended by owner" >> perm_file_owner.txt
cat perm_file_owner.txt
delay 250
echo "Test: Owner can list perm_dir_owner (has rwx from 70)"
ls perm_dir_owner 
delay 250
echo "Test: Owner can create file in perm_dir_owner (has rwx from 70)"
touch perm_dir_owner/owner_created.txt
ls -l perm_dir_owner
delay 500

echo "--- Test: chmod to read-only for owner (testuser_perms) (mode 44: r--r--) ---"
chmod 44 perm_file_owner.txt
ls -l perm_file_owner.txt
delay 250
echo "--- EXPECTED FAIL: Owner (testuser_perms) tries to write to their read-only file (44) ---"
check_fail "echo 'owner write fail' >> perm_file_owner.txt"
delay 250
echo "Owner (testuser_perms) can still read their read-only file:"
cat perm_file_owner.txt
delay 250
chmod 64 perm_file_owner.txt # Reset to rw-r-- for next tests
ls -l perm_file_owner.txt
delay 250

echo "--- Test: chown - Owner (testuser_perms) changes ownership of perm_file_owner.txt to otheruser_perms ---"
chown otheruser_perms perm_file_owner.txt
ls -l perm_file_owner.txt 
ls -l perm_dir_owner    
delay 500

echo "--- Test: Original owner (testuser_perms) access to perm_file_owner.txt (now owned by otheruser_perms, mode 64) ---"
echo "File perm_file_owner.txt is owned by otheruser_perms, mode 64 (owner=rw-, other=r--)"
echo "Current user is testuser_perms (now 'other' to this file)."
delay 250
echo "--- EXPECTED FAIL: testuser_perms (original owner) tries chmod on perm_file_owner.txt (not owner anymore) ---"
check_fail "chmod 77 perm_file_owner.txt"
delay 250
echo "--- EXPECTED FAIL: testuser_perms (as 'other') tries to write to perm_file_owner.txt (needs w, 'other' has r--) ---"
check_fail "echo 'original owner write fail after chown' >> perm_file_owner.txt"
delay 250
echo "testuser_perms (as 'other') can still read perm_file_owner.txt ('other' has r--)"
cat perm_file_owner.txt
delay 500

echo "--- Test: Login as otheruser_perms to test their general owner capabilities on THEIR OWN files ---"
login otheruser_perms
delay 250
echo "Current user: (should be otheruser_perms)"
whoami 
pwd    
delay 250
echo "Creating /opsy_workspace for otheruser_perms" 
rm -r -f /opsy_workspace 
mkdir /opsy_workspace
delay 250
cd /opsy_workspace 
pwd 
delay 250

echo "--- Test: otheruser_perms creates and manages THEIR OWN file (opsy_file.txt) ---"
echo "Content by otheruser_perms in opsy_file.txt" > opsy_file.txt
ls -l opsy_file.txt 
delay 250
echo "otheruser_perms (as owner of opsy_file.txt) sets mode 70 (rwx---)"
chmod 70 opsy_file.txt
ls -l opsy_file.txt
delay 250
echo "otheruser_perms (as owner) appends to their opsy_file.txt (has rwx)"
echo "Appended by otheruser_perms" >> opsy_file.txt
cat opsy_file.txt
delay 250
echo "--- Test: otheruser_perms (owner) chowns THEIR file (opsy_file.txt) to testuser_perms ---"
chown testuser_perms opsy_file.txt
ls -l opsy_file.txt # Verify owner is now testuser_perms
delay 250
echo "--- EXPECTED FAIL: otheruser_perms (no longer owner) tries to chmod opsy_file.txt ---"
check_fail "chmod 60 opsy_file.txt"
delay 250
# opsy_file.txt (owned by testuser_perms) still has mode 70 (rwx--- from otheruser_perms' last chmod)
# otheruser_perms is now 'other' and mode 70 grants 'other' no permissions.
echo "--- EXPECTED FAIL: otheruser_perms (now 'other') tries to read opsy_file.txt (mode 70 rwx---) ---"
check_fail "cat opsy_file.txt" 
delay 250
cd / 
delay 250

echo "--- Test: Login back to testuser_perms ---"
login testuser_perms
delay 250
cd "/test_workspace" 
echo "Current user for permission tests: (should be testuser_perms again)"
whoami 
pwd    
delay 250

echo "Re-checking testuser_perms (as 'other') access to perm_file_owner.txt (owned by otheruser_perms, mode 64)"
ls -l perm_file_owner.txt 
cat perm_file_owner.txt 
check_fail "echo 'another attempt by testuser_perms to write' >> perm_file_owner.txt" 
delay 500

echo "--- Test: Permissions for execution (by testuser_perms in their workspace) ---"
echo "echo 'Executable script content'" > script_to_run.sh
echo "echo 'Arg1: \$1'" >> script_to_run.sh
ls -l script_to_run.sh 
delay 250
echo "--- EXPECTED FAIL: Running script_to_run.sh without execute permission (testuser_perms owning) ---"
check_fail "run ./script_to_run.sh an_arg" 
delay 250
echo "Setting execute permission for owner (testuser_perms) on script_to_run.sh (mode 74: rwxr--r--)"
chmod 74 script_to_run.sh
ls -l script_to_run.sh
delay 250
echo "Running script_to_run.sh with execute permission (as testuser_perms):"
run ./script_to_run.sh first_arg
delay 500

echo "--- Test: Directory permissions for cd and creating files (by testuser_perms) ---"
echo "Verifying perm_dir_owner (owned by testuser_perms, mode 70 rwx---)"
ls -l perm_dir_owner
delay 250
echo "testuser_perms can cd into perm_dir_owner (has rwx)"
cd perm_dir_owner
pwd
delay 250
echo "testuser_perms can create file in perm_dir_owner (has rwx)"
touch file_in_perm_dir_owner.txt
ls
delay 250
cd "/test_workspace" 
delay 250
echo "------------------------------------------------------"

# --- Test Section: File Removal (rm) - Extended (as testuser_perms) ---
echo ""
echo "===== Testing: File Removal - rm Extended (as testuser_perms) ====="
cd "/test_workspace" 
delay 250
echo "--- Test: rm on a directory without -r (should fail) ---"
mkdir dir_to_rm_fail_no_r_test
check_fail "rm dir_to_rm_fail_no_r_test"
rm -r -f dir_to_rm_fail_no_r_test 
delay 250
echo "--- Test: rm -r on a directory with contents ---"
mkdir dir_to_rm_with_r_test
touch dir_to_rm_with_r_test/some_file.txt
rm -r dir_to_rm_with_r_test
ls 
delay 250
echo "--- Test: rm -f on a non-existent file (should succeed silently) ---"
rm -f this_file_does_not_exist_for_rm_f_test.txt
delay 250
echo "--- Test: rm on an owner's read-only file (should succeed if parent is writable) ---"
touch owner_read_only_rm_test_file.txt
chmod 40 owner_read_only_rm_test_file.txt 
ls -l owner_read_only_rm_test_file.txt
rm owner_read_only_rm_test_file.txt
ls 
delay 250
echo "--- Test: rm on a file in a parent directory without write permission ---"
mkdir rm_parent_no_write_test
touch rm_parent_no_write_test/file_to_try_removing.txt
chmod 50 rm_parent_no_write_test # Owner r-x (no write)
ls -l rm_parent_no_write_test # Show perms
check_fail "rm rm_parent_no_write_test/file_to_try_removing.txt"
chmod 70 rm_parent_no_write_test # Allow cleanup
rm -r -f rm_parent_no_write_test
delay 500
echo "------------------------------------------------------"


# --- Test Section: Input/Output Redirection & Piping (By Owner) ---
echo ""
echo "===== Testing: I/O Redirection & Piping (as testuser_perms) ====="
cd "/test_workspace" 
delay 250

echo "Creating redir_owner.txt as testuser_perms, mode 64 (rw-r--)"
echo "Initial Owner Content" > redir_owner.txt
ls -l redir_owner.txt
cat redir_owner.txt
delay 250

echo "Owner (testuser_perms) redirects (append >>) to redir_owner.txt (has rw)"
echo "Owner Appended Content" >> redir_owner.txt
cat redir_owner.txt
delay 250

echo "Owner (testuser_perms) changes mode of redir_owner.txt to 44 (r--r--)"
chmod 44 redir_owner.txt
ls -l redir_owner.txt
delay 250
echo "--- EXPECTED FAIL: Owner (testuser_perms) tries to redirect (overwrite >) to their own r-- file ---"
check_fail "echo 'Owner Overwrite Fail on r--' > redir_owner.txt"
cat redir_owner.txt 
delay 250
echo "--- EXPECTED FAIL: Owner (testuser_perms) tries to redirect (append >>) to their own r-- file ---"
check_fail "echo 'Owner Append Fail on r--' >> redir_owner.txt"
cat redir_owner.txt 
delay 250

echo "--- Test: Basic command piping ---"
echo "Piped hello test content for cat" | cat
delay 250
echo "Creating pipe_source_test.txt for complex pipe test..."
echo "Line1 for pipe test" > pipe_source_test.txt
echo "Line2 for pipe test" >> pipe_source_test.txt
cat pipe_source_test.txt | cat 
rm -f pipe_source_test.txt
delay 500
echo "------------------------------------------------------"

# --- Test Section: Scripting (run, arguments) - By Owner ---
echo ""
echo "===== Testing: Scripting - run (By Owner) ====="
cd "/test_workspace" 
delay 250
echo "Script execution tests for owner (testuser_perms) were performed in the main permissions section (script_to_run.sh)."
echo "--- Test: Running a script readable but not executable by owner ---"
echo "echo 'This script contents should not matter, it should not run.'" > non_exec_by_owner_script.sh
chmod 60 non_exec_by_owner_script.sh # Owner rw-, Other ---
ls -l non_exec_by_owner_script.sh
check_fail "run ./non_exec_by_owner_script.sh"
rm -f non_exec_by_owner_script.sh
delay 500
echo "------------------------------------------------------"

# --- Final Cleanup of users and test_workspace ---
echo ""
echo "--- Test Completion: Cleaning up users and test directory /test_workspace ---"
echo "Current user before final logout: (should be testuser_perms)"
whoami
delay 250
cd / # Change to root before attempting self-removal or other user removals
echo "--- EXPECTED FAIL: testuser_perms tries to remove self ---"
check_fail "removeuser testuser_perms"
delay 250
echo "--- EXPECTED FAIL: testuser_perms tries to remove Guest ---"
check_fail "removeuser Guest" 
delay 250

# Log out testuser_perms to allow Guest to clean up
echo "Logging out testuser_perms to Guest to remove test users..."
logout # To Guest
delay 250
echo "Current user: (should be Guest)"
whoami
delay 250

echo "--- EXPECTED FAIL: Guest tries to remove Guest ---"
check_fail "removeuser Guest"
delay 250

echo "Removing testuser_perms (and their FS)..."
removeuser testuser_perms
delay 250
echo "Removing otheruser_perms (and their FS)..."
removeuser otheruser_perms
delay 250

# Guest attempts to remove /test_workspace from its own FS (if it ever created one from a previous interrupted run)
rm -r -f "/test_workspace" 
echo "Filesystem after cleanup (Guest's perspective):"
ls -l /
delay 500
echo "------------------------------------------------------"

echo ""
echo "===== OopisOS Test Suite Complete (v1.1.9.4a) ====="
# --- Success Animation ---
echo " "
delay 500
echo "  ======================================================"
delay 200
echo "  ==                                                  =="
delay 200
echo "  ==         OopisOS Diagnostics - v1.1.9.4a            =="
delay 200
echo "  ==                ALL SYSTEMS GO!                   =="
delay 200
echo "  ==               CONGRATULATIONS!                   =="
delay 200
echo "  ==   (As always, you've been a real pantload!)      ==" 
echo "  ==                                                  =="
delay 200
echo "  ======================================================"
echo " "
echo "Review output above for SUCCESS, FAILURE, CHECK_FAIL: SUCCESS, or CHECK_FAIL: FAILURE messages."
echo "Remember that some tests like interactive prompts (-i flags) are best verified manually."