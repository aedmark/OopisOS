#!/bin/sh
# OopisOS Comprehensive Test Script
# Version 1.1.9.2 (Revised for Isolated User Filesystems)
#

echo "===== OopisOS Test Suite Initializing (Version 1.1.9.2) ====="
echo "IMPORTANT: This script will create/delete files/dirs and manage users."
echo "Initial state (should be Guest or initial user):"
whoami
pwd
ls
delay 500
echo "------------------------------------------------------"
# Performed by Guest, perhaps during initial setup or before user cleanup
echo "--- Test: Username validation for 'register' ---"
check_fail "register aa" # Too short
check_fail "register averylongusernameovertwentyonechars" # Too long
check_fail "register user withspace" # Contains space
check_fail "register guest" # Reserved name
delay 250

# --- Test Setup: Cleaning up and preparing environment as initial user ---
echo ""
echo "--- Test Setup by Initial User ---"
echo "Attempting to remove previous /test_workspace (if any from Guest's FS)..."
rm -r -f "/test_workspace" 
delay 250

echo "Attempting to remove test users (if any from previous runs)..."
removeuser testuser_perms
removeuser otheruser_perms
delay 500

echo "Registering test users..."
register testuser_perms
register otheruser_perms
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

echo "Attempting to remove /test_workspace (if it exists from a previous run for testuser_perms)..."
rm -r -f "/test_workspace" # testuser_perms cleans their own potential old workspace
delay 250

echo "Creating /test_workspace as testuser_perms..."
mkdir "/test_workspace" # NOW created by testuser_perms in their own FS
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
echo "===== Testing: File System - mkdir, touch, ls, pwd ====="
echo "--- Test: mkdir basic (owned by testuser_perms) ---"
mkdir my_dir
ls -l
delay 250
echo "--- Test: mkdir where target exists and is a file ---"
touch existing_file_for_mkdir_test
check_fail "mkdir existing_file_for_mkdir_test"
rm -f existing_file_for_mkdir_test # Cleanup
delay 250
echo "--- Test: mkdir where target directory already exists (no -p) ---"
mkdir existing_dir_for_mkdir_test
check_fail "mkdir existing_dir_for_mkdir_test"
rm -r -f existing_dir_for_mkdir_test # Cleanup
delay 250
echo "--- Test: mkdir multiple & nested (with -p) ---"
mkdir -p level1/level2/level3
ls -l . # Show current dir
ls -l level1
ls -l level1/level2
delay 250
tree level1 
delay 500
echo "--- Test: touch new_file.txt (owned by testuser_perms) ---"
touch new_file.txt
ls -l
delay 250
echo "--- Test: touch existing_file.txt (update timestamp) ---"
touch new_file.txt
ls -l
delay 250
echo "--- Test: touch on an existing directory (should fail) ---"
mkdir touch_dir_test
check_fail "touch touch_dir_test"
rm -r -f touch_dir_test
delay 250
echo "--- Test: touch with an empty final filename (e.g., path ends with /) ---"
# Assuming /test_workspace/ exists and is a directory
check_fail "touch /test_workspace/"
# This should attempt to create a file named "" in /test_workspace
delay 250
echo "--- Test: touch where an intermediate path component is a file ---"
echo "content" > file_as_path_component
check_fail "touch file_as_path_component/new_file.txt"
rm -f file_as_path_component
delay 250
echo "--- Test: touch new file in a directory without write permission ---"
mkdir no_write_parent_for_touch
chmod 50 no_write_parent_for_touch # Owner r-x, Other ---
check_fail "touch no_write_parent_for_touch/cannot_create_this.txt"
chmod 70 no_write_parent_for_touch
rm -r -f no_write_parent_for_touch
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
cd "/test_workspace" 
pwd
delay 500
echo "------------------------------------------------------"

# --- Test Section: File Content (echo >, cat) ---
echo ""
echo "===== Testing: File Content - echo >, cat ====="
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
check_fail "cat non_existent_file_for_cat.txt"
delay 250
echo "--- EXPECTED FAIL: Testing cat on a directory ---"
check_fail "cat my_dir"
delay 500
echo "------------------------------------------------------"

# --- Test Section: File Permissions (chmod, chown, access checks) ---
echo ""
echo "===== Testing: File Permissions (chmod, chown, access checks) ====="
echo "Current user for permission tests: (should be testuser_perms)"
whoami # testuser_perms
cd "/test_workspace" # Ensure we are in the correct directory for testuser_perms
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
delay 500

echo "--- Test: Owner access based on new permissions (testuser_perms) ---"
echo "Test: Owner can read perm_file_owner.txt (has rwx)"
cat perm_file_owner.txt
delay 250
echo "Test: Owner can write to perm_file_owner.txt (has rwx)"
echo "Appended by owner" >> perm_file_owner.txt
cat perm_file_owner.txt
delay 250
echo "Test: Owner can list perm_dir_owner (has rwx)"
ls perm_dir_owner 
delay 250
echo "Test: Owner can create file in perm_dir_owner (has rwx)"
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
# perm_dir_owner is still owned by testuser_perms for now
ls -l perm_file_owner.txt # Should show otheruser_perms as owner, mode 64
ls -l perm_dir_owner    # Should show testuser_perms as owner
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
whoami # Should be otheruser_perms
pwd    # Should be / for otheruser_perms initially

echo "Creating /opsy_workspace for otheruser_perms" # otheruser_perms's own workspace
mkdir /opsy_workspace
delay 250
cd /opsy_workspace
pwd
delay 250

echo "--- Test: otheruser_perms creates and manages THEIR OWN file ---"
echo "Content by otheruser_perms in opsy_file.txt" > opsy_file.txt
ls -l opsy_file.txt # Verify ownership (otheruser_perms) and default mode (64)
delay 250

echo "otheruser_perms (as owner of opsy_file.txt) sets mode 70 (rwx---)"
chmod 70 opsy_file.txt
ls -l opsy_file.txt
delay 250
echo "otheruser_perms (as owner) appends to their opsy_file.txt (has rwx)"
echo "Appended by otheruser_perms" >> opsy_file.txt
cat opsy_file.txt
delay 250

echo "otheruser_perms (as owner of opsy_file.txt) sets mode 40 (r-----)"
chmod 40 opsy_file.txt
ls -l opsy_file.txt
delay 250
echo "--- EXPECTED FAIL: otheruser_perms (as owner) tries to write to their own r-- file ---"
check_fail "echo 'opsy write fail to r--' >> opsy_file.txt"
delay 250
echo "otheruser_perms can still read their own r-- file:"
cat opsy_file.txt
delay 250
cd / # Navigate otheruser_perms to their root before logging out or further tests
delay 250

echo "--- Test: Login back to testuser_perms ---"
login testuser_perms
delay 250
cd "/test_workspace" # testuser_perms back to their workspace
echo "Current user for permission tests: (should be testuser_perms again)"
whoami # testuser_perms
pwd    # /test_workspace
delay 250

# As testuser_perms in /test_workspace
echo "--- Test: chown to a non-existent user ---"
touch file_for_chown_nonexistent_user.txt
check_fail "chown nosuchuser perm_file_owner.txt" # or file_for_chown_nonexistent_user.txt
rm -f file_for_chown_nonexistent_user.txt
delay 250
# As testuser_perms in /test_workspace
echo "--- Test: chmod with invalid mode string ---"
touch file_for_chmod_invalid_mode.txt
check_fail "chmod 99 file_for_chmod_invalid_mode.txt" # 9 is not a valid octal
check_fail "chmod abc file_for_chmod_invalid_mode.txt"
check_fail "chmod 7 file_for_chmod_invalid_mode.txt" # Needs two digits
rm -f file_for_chmod_invalid_mode.txt
delay 250
echo "--- Test: listusers command ---"
listusers # Should show Guest, testuser_perms, otheruser_perms
delay 250


# Note: perm_file_owner.txt in /test_workspace is still owned by otheruser_perms.
# testuser_perms is 'other' to it. Mode was 64.
echo "Re-checking testuser_perms (as 'other') access to perm_file_owner.txt (owned by otheruser_perms, mode 64)"
ls -l perm_file_owner.txt # Should show otheruser_perms as owner, mode 64
cat perm_file_owner.txt # Should succeed (other has r)
check_fail "echo 'another attempt by testuser_perms to write' >> perm_file_owner.txt" # Should fail (other has no w)
delay 500

echo "--- Test: Permissions for execution (by testuser_perms in their workspace) ---"
echo "echo 'Executable script content'" > script_to_run.sh
echo "echo 'Arg1: \$1'" >> script_to_run.sh
ls -l script_to_run.sh # Default mode likely 64 (rw-r--) by testuser_perms
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
# perm_dir_owner is owned by testuser_perms, mode 70 (rwx---)
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
cd "/test_workspace" # Back to base for testuser_perms
delay 250
echo "--- Test: cd into a file ---"
touch file_to_cd_into.txt
check_fail "cd file_to_cd_into.txt"
rm -f file_to_cd_into.txt # Cleanup
delay 250
echo "--- Test: cd into a directory without execute permission ---"
mkdir dir_no_exec_for_cd
chmod 60 dir_no_exec_for_cd # Owner rw-, Other ---
check_fail "cd dir_no_exec_for_cd"
chmod 70 dir_no_exec_for_cd # Allow cleanup
rm -r -f dir_no_exec_for_cd # Cleanup
delay 250

echo "--- Test: testuser_perms creates a directory 'dir_for_other_test' (mode 75 rwxr-x) ---"
mkdir dir_for_other_test
chmod 75 dir_for_other_test # owner=rwx, other=r-x
ls -l dir_for_other_test
delay 250

echo "--- Cleanup: Removing perm_dir_owner and dir_for_other_test to simplify remaining tests ---"
# These were for specific permission sub-tests.
rm -r -f perm_dir_owner
rm -r -f dir_for_other_test
delay 250

echo "------------------------------------------------------"

# --- Test Section: File Removal (rm) - By Owner ---
echo ""
echo "===== Testing: File Removal - rm (By Owner) ====="
echo "Current user: (should be testuser_perms)"
whoami
cd "/test_workspace"
echo "Creating file_to_rm.txt as testuser_perms"
touch file_to_rm.txt
ls -l file_to_rm.txt
delay 250
echo "--- Test: rm on a directory without -r (should fail) ---"
mkdir dir_to_rm_fail_no_r
check_fail "rm dir_to_rm_fail_no_r"
rm -r -f dir_to_rm_fail_no_r
delay 250
echo "--- Test: rm -r on a directory with contents ---"
mkdir dir_to_rm_with_r
touch dir_to_rm_with_r/some_file.txt
rm -r dir_to_rm_with_r
ls
delay 500
echo "--- Test: rm -f on a non-existent file (should succeed silently) ---"
rm -f this_file_does_not_exist_for_rm_f.txt
# No check_fail needed, just ensure no error output and script continues
delay 250
echo "--- Test: rm on an owner's read-only file (should succeed if parent is writable) ---"
touch owner_read_only_rm_test.txt
chmod 40 owner_read_only_rm_test.txt
ls -l owner_read_only_rm_test.txt
rm owner_read_only_rm_test.txt
ls
# Verify owner_read_only_rm_test.txt is gone
delay 250
echo "testuser_perms (owner) removes file_to_rm.txt"
rm file_to_rm.txt
ls
delay 500
echo "------------------------------------------------------"


# --- Test Section: Input/Output Redirection & Piping (By Owner) ---
# Original script had otheruser_perms trying to redirect to testuser_perms's file.
# Fails due to pathing. Let's test owner redirecting to their own file with various perms.
echo ""
echo "===== Testing: I/O Redirection & Piping (By Owner) ====="
echo "Current user: (should be testuser_perms)"
whoami
cd "/test_workspace"

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
cat redir_owner.txt # Should be unchanged from "Owner Appended Content"
delay 250
echo "--- EXPECTED FAIL: Owner (testuser_perms) tries to redirect (append >>) to their own r-- file ---"
check_fail "echo 'Owner Append Fail on r--' >> redir_owner.txt"
cat redir_owner.txt # Should be unchanged
delay 500
echo "------------------------------------------------------"

# As testuser_perms
echo "--- EXPECTED FAIL: testuser_perms tries to remove self ---"
check_fail "removeuser testuser_perms"
delay 250
# As testuser_perms in /test_workspace
echo "--- Test: Basic command piping ---"
echo "Piped hello content" | cat
# Expected output: "Piped hello content"
delay 250
# More complex, though depends on ls output format
# ls -l | echo "Output of ls was: " # This won't work as expected with current echo.
# A better pipe might be:
echo "Line1 for pipe" > pipe_source.txt
echo "Line2 for pipe" >> pipe_source.txt
cat pipe_source.txt | cat # cat should echo the content from the first cat
rm -f pipe_source.txt
delay 250

# (Must be Guest to try removing Guest)
# In the final cleanup section, before removing testuser_perms:
# Logout to Guest is already there.
# echo "Current user: (should be Guest)"
# whoami
echo "--- EXPECTED FAIL: Guest tries to remove Guest ---"
check_fail "removeuser Guest"
delay 250


# --- Test Section: Scripting (run, arguments) - By Owner ---
# Original script had otheruser_perms trying to run testuser_perms's script.
# Fails due to pathing. Test owner running their own script is already covered.
# This section can be considered complete from previous execution permission tests.
echo ""
echo "===== Testing: Scripting - run (By Owner - Covered Earlier) ====="
echo "Script execution tests for owner (testuser_perms) were performed in the main permissions section."
delay 500
echo "------------------------------------------------------"

# --- Final Cleanup of users and test_workspace ---
# (This section seems okay as it uses `logout` to Guest for user removal)
echo ""
echo "--- Test Completion: Cleaning up users and test directory /test_workspace ---"
echo "Current user before final logout: (should be testuser_perms)"
whoami
cd "/test_workspace" # Ensure in correct dir for context
ls -l # Show final state of testuser_perms's workspace before logout
delay 250

echo "Changing to root directory and logging out to Guest to remove test users..."
cd /
logout # To Guest
delay 250
echo "Current user: (should be Guest)"
whoami
delay 250

echo "Removing testuser_perms (and their FS)..."
removeuser testuser_perms
delay 250
echo "Removing otheruser_perms (and their FS)..."
removeuser otheruser_perms
delay 250

# Guest attempts to remove /test_workspace from its own FS (if it ever created one)
rm -r -f "/test_workspace" 
echo "Filesystem after cleanup (Guest's perspective):"
ls -l /
delay 500
echo "------------------------------------------------------"

echo ""
echo "===== OopisOS Test Suite Complete (v1.1.9.2) ====="
# --- Success Animation ---
echo " "
delay 500
echo "  ======================================================"
delay 200
echo "  ==                                                  =="
delay 200
echo "  ==         OopisOS Diagnostics - v1.1.9.2               =="
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

