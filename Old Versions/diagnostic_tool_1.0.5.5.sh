#!/bin/sh
# OopisOS Comprehensive Test Script
# Version 1.0.5.5 (Permissions Update & Setup Fix)
#

echo "===== OopisOS Test Suite Initializing (Version 1.0.5.5) ====="
echo "IMPORTANT: This script will create/delete files/dirs and manage users."
echo "Initial state (should be Guest or initial user):"
whoami
pwd
ls
delay 500
echo "------------------------------------------------------"

# --- Test Setup: Cleaning up and preparing environment as initial user ---
echo ""
echo "--- Test Setup by Initial User ---"
echo "Attempting to remove previous /test_workspace (if any from ANY user - this rm is by Guest on Guest's FS)..."
# Note: This rm -r -f /test_workspace is run by Guest. If testuser_perms created it in a previous failed run,
# Guest might not have permission or it might not exist in Guest's FS. This is mostly for Guest's FS.
rm -r -f "/test_workspace" 
delay 250

echo "Attempting to remove test users (if any from previous runs)..."
removeuser testuser_perms # This should be lenient now
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

# --- Test Section: File Permissions ---
echo ""
echo "===== Testing: File Permissions (chmod, chown, access checks) ====="
echo "Current user for permission tests: (should be testuser_perms)"
whoami
delay 250

echo "--- Test: Create files for permission tests ---"
touch perm_file_owner.txt
mkdir perm_dir_owner
echo "Initial content" > perm_file_owner.txt
ls -l perm_file_owner.txt perm_dir_owner
delay 500

echo "--- Test: chmod - Owner changes permissions ---"
echo "Setting perm_file_owner.txt to 75 (rwxr-x)"
chmod 75 perm_file_owner.txt
ls -l perm_file_owner.txt
delay 250
echo "Setting perm_dir_owner to 70 (rwx---)"
chmod 70 perm_dir_owner
ls -l perm_dir_owner
delay 500

echo "--- Test: Owner access based on new permissions ---"
echo "Test: Owner can read perm_file_owner.txt (rwx)"
cat perm_file_owner.txt
delay 250
echo "Test: Owner can write to perm_file_owner.txt (rwx)"
echo "Appended by owner" >> perm_file_owner.txt
cat perm_file_owner.txt
delay 250
echo "Test: Owner can list perm_dir_owner (rwx)"
ls perm_dir_owner 
delay 250
echo "Test: Owner can create file in perm_dir_owner (rwx)"
touch perm_dir_owner/owner_created.txt
ls -l perm_dir_owner
delay 500

echo "--- Test: chmod to read-only for owner (44) ---"
chmod 44 perm_file_owner.txt
ls -l perm_file_owner.txt
delay 250
echo "--- EXPECTED FAIL: Owner tries to write to read-only file (44) ---"
check_fail "echo 'owner write fail' >> perm_file_owner.txt"
delay 250
echo "Owner can still read read-only file:"
cat perm_file_owner.txt
delay 250
chmod 64 perm_file_owner.txt # Reset for next tests

echo "--- Test: chown - Owner (testuser_perms) changes ownership to otheruser_perms ---"
chown otheruser_perms perm_file_owner.txt
chown otheruser_perms perm_dir_owner
ls -l perm_file_owner.txt perm_dir_owner
delay 500

echo "--- EXPECTED FAIL: Original owner (testuser_perms) tries chmod after chown ---"
check_fail "chmod 77 perm_file_owner.txt"
delay 250
echo "--- EXPECTED FAIL: Original owner (testuser_perms) tries to write to file now owned by otheruser_perms (mode 64 gives 'other' r--) ---"
check_fail "echo 'original owner write fail' >> perm_file_owner.txt" # This should fail as 'other' doesn't have write
delay 250
echo "Original owner (testuser_perms) can still read file owned by otheruser_perms (mode 64 - other has read)"
cat perm_file_owner.txt
delay 500

echo "--- Test: Login as otheruser_perms to test their new ownership ---"
login otheruser_perms
delay 250
cd "/test_workspace" # Ensure CWD
echo "Current user for permission tests: (should be otheruser_perms)"
whoami
delay 250

echo "--- Test: New owner (otheruser_perms) changes permissions of perm_file_owner.txt ---"
chmod 70 perm_file_owner.txt # rwx for new owner, --- for other
ls -l perm_file_owner.txt
delay 250
echo "New owner (otheruser_perms) writes to their file:"
echo "Written by new owner otheruser_perms" >> perm_file_owner.txt
cat perm_file_owner.txt
delay 500

echo "--- Test: Login back to testuser_perms to test 'other' permissions ---"
login testuser_perms
delay 250
cd "/test_workspace" # Ensure CWD
echo "Current user for permission tests: (should be testuser_perms again)"
whoami
delay 250

echo "--- EXPECTED FAIL: testuser_perms (now 'other') tries to write to perm_file_owner.txt (mode 70 by otheruser_perms, other is ---) ---"
check_fail "echo 'other write fail' >> perm_file_owner.txt"
delay 250
echo "--- EXPECTED FAIL: testuser_perms (now 'other') tries to read perm_file_owner.txt (mode 70 by otheruser_perms, other is ---) ---"
check_fail "cat perm_file_owner.txt"
delay 500

echo "--- Test: Permissions for execution ---"
echo "echo 'Executable script content'" > script_to_run.sh
echo "echo 'Arg1: \$1'" >> script_to_run.sh
ls -l script_to_run.sh # Default mode likely 64 (rw-r--)
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

echo "--- Test: Directory permissions for cd and creating files ---"
mkdir restricted_dir
chmod 50 restricted_dir # Owner: r-x, Other: ---
ls -l restricted_dir
delay 250
echo "Owner (testuser_perms) can cd into restricted_dir (r-x)"
cd restricted_dir
pwd
delay 250
echo "--- EXPECTED FAIL: Owner (testuser_perms) tries to create file in restricted_dir (needs w, has r-x) ---"
check_fail "touch new_file_in_restricted.txt"
ls # Show if file was created or not
delay 250
cd "/test_workspace" # Back to base
delay 250

login otheruser_perms # Switch to other user
delay 250
cd "/test_workspace"
echo "Current user: (should be otheruser_perms)"
whoami
delay 250
echo "--- EXPECTED FAIL: otheruser_perms tries to cd into restricted_dir (mode 50, other has ---) ---"
check_fail "cd restricted_dir"
delay 250
echo "--- EXPECTED FAIL: otheruser_perms tries to ls restricted_dir (mode 50, other has ---) ---"
check_fail "ls restricted_dir"
delay 500

login testuser_perms # Back to original owner for cleanup
delay 250
cd "/test_workspace"
echo "------------------------------------------------------"


# --- Test Section: File Removal (rm) - With Permission Context ---
echo ""
echo "===== Testing: File Removal - rm (Permission Context) ====="
echo "Creating file_to_rm_perm.txt as testuser_perms"
touch file_to_rm_perm.txt
chmod 64 file_to_rm_perm.txt # rw-r--
ls -l file_to_rm_perm.txt
delay 250
login otheruser_perms
delay 250
cd "/test_workspace" # otheruser_perms is in /test_workspace (owned by testuser_perms with mode 075 by default)
echo "Current user: (should be otheruser_perms)"
whoami
delay 250
echo "--- EXPECTED FAIL: otheruser_perms tries to rm file_to_rm_perm.txt (owned by testuser_perms). Needs write on parent /test_workspace. ---"
# /test_workspace is owned by testuser_perms. If default mode for dir is 075, 'other' has r-x. So otheruser_perms lacks write on /test_workspace.
check_fail "rm file_to_rm_perm.txt"
delay 250
login testuser_perms # Back to owner
delay 250
cd "/test_workspace"
echo "Current user: (should be testuser_perms)"
whoami
rm file_to_rm_perm.txt # Owner should be able to remove from their own directory.
ls
delay 500
echo "------------------------------------------------------"


# --- Test Section: Input/Output Redirection & Piping (Permission Context) ---
echo ""
echo "===== Testing: I/O Redirection & Piping (Permission Context) ====="
echo "Creating redir_perm.txt as testuser_perms, mode 64 (rw-r--)"
echo "Initial" > redir_perm.txt
chmod 64 redir_perm.txt # owner=rw, other=r
ls -l redir_perm.txt
delay 250
login otheruser_perms
delay 250
cd "/test_workspace"
echo "Current user: (should be otheruser_perms)"
whoami
delay 250
echo "--- EXPECTED FAIL: otheruser_perms tries to redirect (overwrite >) to redir_perm.txt (needs write on file, has only read) ---"
check_fail "echo 'other fail write' > redir_perm.txt"
cat redir_perm.txt # Should still be "Initial"
delay 250
echo "--- EXPECTED FAIL: otheruser_perms tries to redirect (append >>) to redir_perm.txt (needs write on file, has only read) ---"
check_fail "echo 'other fail append' >> redir_perm.txt"
cat redir_perm.txt # Should still be "Initial"
delay 250
login testuser_perms # Back to owner
delay 250
cd "/test_workspace"
echo "Owner (testuser_perms) redirects (overwrite >) to redir_perm.txt (has rw on file)"
echo "Owner overwrite" > redir_perm.txt
cat redir_perm.txt
delay 500
echo "------------------------------------------------------"


# --- Test Section: Scripting (run, arguments) - With Permission Context ---
echo ""
echo "===== Testing: Scripting - run (Permission Context) ====="
echo "Creating script_perm.sh as testuser_perms, mode 64 (rw-r--)"
echo "echo 'Script permission test'" > script_perm.sh
chmod 64 script_perm.sh # owner=rw, other=r (no x for anyone)
ls -l script_perm.sh
delay 250
echo "--- EXPECTED FAIL: testuser_perms tries to run script_perm.sh (no execute permission) ---"
check_fail "run ./script_perm.sh"
delay 250
echo "Setting execute permission (mode 74: rwxr--r--) for testuser_perms"
chmod 74 script_perm.sh # owner=rwx, other=r
ls -l script_perm.sh
delay 250
echo "testuser_perms runs script_perm.sh:"
run ./script_perm.sh
delay 250

login otheruser_perms
delay 250
cd "/test_workspace"
echo "Current user: (should be otheruser_perms)"
whoami
delay 250
echo "--- EXPECTED FAIL: otheruser_perms tries to run script_perm.sh (other has r--, needs x) ---"
check_fail "run ./script_perm.sh"
delay 500

login testuser_perms # Back to original user
delay 250
cd "/test_workspace"
echo "------------------------------------------------------"

# --- Final Cleanup of users and test_workspace ---
echo ""
echo "--- Test Completion: Cleaning up users and test directory /test_workspace ---"
echo "Current user before final logout: (should be testuser_perms or otheruser_perms)"
whoami
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

# Guest attempts to remove /test_workspace from its own FS (if it ever created one, which it doesn't in this flow)
# This line is mostly vestigial now but harmless with -f.
rm -r -f "/test_workspace" 
echo "Filesystem after cleanup (Guest's perspective):"
ls -l /
delay 500
echo "------------------------------------------------------"

echo ""
echo "===== OopisOS Test Suite Complete (v1.0.5.5) ====="
# --- Success Animation ---
echo " "
delay 500
echo "  ======================================================"
delay 200
echo "  ==                                                  =="
delay 200
echo "  ==         OopisOS Diagnostics - v1.0.5.5           =="
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
echo "Review output above for SUCCESS, FAILURE, CHECK_FAIL: SUCCESS, or CHECK_FAIL: FAILURE messages."
echo "Remember that some tests like interactive prompts (-i flags) are best verified manually."