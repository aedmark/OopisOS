# OopisOS Comprehensive Test Script
# Script Version for OopisOS v1.4.1

echo "===== OopisOS Test Suite Initializing (Testing OopisOS v1.4.1) ====="
echo "IMPORTANT: This script will create/delete files/dirs and manage users."
echo "Script assumes it starts as the default 'Guest' user or a clean initial state."
echo ""
echo "--- Initial State Check ---"
echo "Current User (expected: Guest):"
whoami
echo "Current Path (expected: /):"
pwd
echo "Initial Root FS Listing:"
ls
delay 500 # Allow time for initial commands to settle if any async ops
echo "------------------------------------------------------"

# --- Test Setup: Cleaning up and preparing environment as initial user (Guest) ---
echo ""
echo "--- Test Setup Phase (Executing as Initial User) ---"
echo "Verifying current user for setup (expected: Guest):"
whoami
delay 250

echo "Attempting to remove previous '/test_workspace' from Guest's FS (if any)..."
echo "(Note: rm -f suppresses errors for non-existent items)"
rm -r -f "/test_workspace"
delay 250 # Delay for FS operation

echo "Attempting to remove test users (if any from previous runs)..."
echo "(Note: In non-interactive script, 'removeuser' confirmation defaults to 'no', so users might not be deleted if they exist and had data. This is okay for setup as 'register' will fail if they truly still exist in a way that blocks re-registration.)"
removeuser testuser_perms
delay 250 # Delay for potential FS operations within removeuser
removeuser otheruser_perms
delay 500 # Delay for potential FS operations within removeuser

echo "--- Test: Username Validation for 'register' command (as Guest) ---"
echo "Testing invalid username: 'aa' (too short)"
check_fail "register aa" # Min length is 3
echo "Testing invalid username: 'averylongusernameovertwentyonechars' (too long)"
check_fail "register averylongusernameovertwentyonechars" # Max length is 20
echo "Testing invalid username: 'user withspace' (contains space)"
check_fail "register user withspace" # Cannot contain spaces
echo "Testing invalid username: 'guest' (reserved name)"
check_fail "register guest" # Reserved username
delay 500

echo "Registering fresh test users: 'testuser_perms' and 'otheruser_perms'..."
register testuser_perms
delay 250 # Delay for FS initialization for new user
register otheruser_perms
delay 250 # Delay for FS initialization for new user

echo "--- Test: 'listusers' command after registration (as Guest) ---"
echo "Expected to show Guest, testuser_perms, otheruser_perms (and any other pre-existing users)"
listusers
delay 250

echo "Initial user setup and preliminary checks complete."
echo "------------------------------------------------------"

# --- Login as primary test user (testuser_perms) and create their workspace ---
echo ""
echo "--- Phase: Logging in as 'testuser_perms' and Workspace Setup ---"
echo "Attempting login as 'testuser_perms'..."
login testuser_perms
delay 250 # Allow login process (incl. session/FS load) to complete

echo "--- Verifying Post-Login State for 'testuser_perms' ---"
echo "Current User (expected: testuser_perms):"
whoami
echo "Current Path after login (expected: /):"
pwd
delay 250

echo "--- Workspace Preparation for 'testuser_perms' ---"
echo "Attempting to remove '/test_workspace' (if it exists from a previous run for 'testuser_perms')..."
echo "(Note: rm -r -f suppresses errors for non-existent items)"
rm -r -f "/test_workspace"
delay 250 # Delay for FS operation

echo "Creating '/test_workspace' directory as 'testuser_perms'..."
mkdir "/test_workspace"
delay 250 # Delay for FS operation

echo "Changing current directory to '/test_workspace'..."
cd "/test_workspace"
delay 250 # Delay for cd operation

echo "--- Verifying Workspace Setup for 'testuser_perms' ---"
echo "Current User (expected: testuser_perms):"
whoami
echo "Current Path (expected: /test_workspace):"
pwd
echo "Listing contents and permissions of '/test_workspace' (should be empty, owned by testuser_perms):"
ls -l .
# Expected output for 'ls -l .':
# total 0
# (or similar, indicating an empty directory owned by testuser_perms with default dir permissions)
delay 500
echo "------------------------------------------------------"

# --- Test Section: File System - mkdir, touch, ls, pwd ---
echo ""
echo "===== Testing: File System - mkdir, touch, ls, pwd (as 'testuser_perms') ====="
echo "Ensuring current user is 'testuser_perms' and CWD is '/test_workspace'..."
whoami
cd "/test_workspace"
pwd
delay 250

echo "--- Test: 'mkdir' basic directory creation ---"
echo "Creating 'my_dir'..."
mkdir my_dir
echo "Listing contents of '/test_workspace' (should include 'my_dir'):"
ls -l
delay 250

echo "--- Test: 'mkdir -p' for multiple & nested directories ---"
echo "Creating 'level1/level2/level3' recursively..."
mkdir -p level1/level2/level3
echo "Listing contents of '/test_workspace':"
ls -l .
echo "Listing contents of 'level1':"
ls -l level1
echo "Listing contents of 'level1/level2':"
ls -l level1/level2
delay 250
echo "Displaying tree structure of 'level1':"
tree level1
delay 500

echo "--- Test: 'mkdir' error cases ---"
echo "Attempting 'mkdir' on path of an existing file..."
touch existing_file_for_mkdir_test.txt
check_fail "mkdir existing_file_for_mkdir_test.txt"
rm -f existing_file_for_mkdir_test.txt
delay 250

echo "Attempting 'mkdir' for an already existing directory (without -p)..."
mkdir existing_dir_for_mkdir_test
check_fail "mkdir existing_dir_for_mkdir_test"
rm -r -f existing_dir_for_mkdir_test
delay 250

echo "Attempting 'mkdir -p' where an intermediate path component is a file..."
echo "iam_a_file_content" > file_as_intermediate_path_for_mkdir.txt
check_fail "mkdir -p file_as_intermediate_path_for_mkdir.txt/new_subdir"
rm -f file_as_intermediate_path_for_mkdir.txt
delay 500

echo "--- Test: 'touch' creating a new file ---"
echo "Creating 'new_file.txt'..."
touch new_file.txt
ls -l new_file.txt # Show details of the new file
delay 250

echo "--- Test: 'touch' updating timestamp of an existing file ---"
echo "Initial 'new_file.txt' details:"
ls -l new_file.txt
delay 1500 # Wait 1.5 seconds to ensure timestamp difference
echo "Touching 'new_file.txt' again to update mtime..."
touch new_file.txt
echo "'new_file.txt' details after re-touching:"
ls -l new_file.txt
delay 250

echo "--- Test: 'touch -c' (no-create) flag ---"
echo "Touching existing 'new_file.txt' with -c (should update mtime)..."
delay 1500
touch -c new_file.txt
ls -l new_file.txt
echo "Attempting to touch non_existent_file_with_c.txt with -c (should NOT create it)..."
touch -c non_existent_file_with_c.txt
check_fail "ls non_existent_file_with_c.txt" # Verify it wasn't created
delay 250

echo "--- Test: 'touch -t STAMP' to set specific timestamp ---"
# OopisOS touch -t uses [[CC]YY]MMDDhhmm[.ss]
# Test with YYMMDDhhmm (e.g., May 20th, 14:30 of current year, POSIX-like heuristic)
# Or CCYYMMDDhhmm (e.g., 202305201430 for May 20, 2023, 14:30)
echo "Touching 'stamp_file.txt' with STAMP '2301151030' (Jan 15, 2023, 10:30)..."
touch -t 2301151030 stamp_file.txt
ls -l stamp_file.txt
rm -f stamp_file.txt
delay 250

echo "--- Test: 'touch --date STRING' to set specific timestamp ---"
echo "Touching 'date_string_file.txt' with --date '2022-07-04T12:00:00'..."
touch --date "2022-07-04T12:00:00" date_string_file.txt
ls -l date_string_file.txt
rm -f date_string_file.txt
delay 250

echo "--- Test: 'touch' error handling & edge cases ---"
echo "Testing 'touch' on an existing directory (should succeed and update timestamp)..."
mkdir touch_dir_test_timestamp
echo "Initial timestamp for 'touch_dir_test_timestamp':"
ls -l . | grep touch_dir_test_timestamp # Using grep to simplify output for manual check
delay 1500
echo "Touching the directory 'touch_dir_test_timestamp'..."
touch touch_dir_test_timestamp
echo "Timestamp after touch for 'touch_dir_test_timestamp':"
ls -l . | grep touch_dir_test_timestamp
rm -r -f touch_dir_test_timestamp
delay 250

echo "Testing 'touch' to create a new file in a directory without write permission..."
mkdir no_write_parent_for_touch_test
chmod 50 no_write_parent_for_touch_test # Owner r-x (no 'w'), Other ---
ls -l . # Show parent perms
check_fail "touch no_write_parent_for_touch_test/cannot_create_this.txt"
chmod 70 no_write_parent_for_touch_test # Grant write for owner to allow cleanup
rm -r -f no_write_parent_for_touch_test
delay 500

echo "--- Test: 'ls' basic operations ---"
echo "Testing 'ls' in an empty directory..."
mkdir empty_dir_for_ls
ls empty_dir_for_ls
rm -r -f empty_dir_for_ls
delay 250

echo "Testing 'ls -a' to show hidden files..."
touch .hidden_file_test.txt
mkdir .hidden_dir_test
ls # Should not show .hidden_file_test.txt or .hidden_dir_test
ls -a # Should show .hidden_file_test.txt and .hidden_dir_test
rm -f .hidden_file_test.txt
rm -r -f .hidden_dir_test
delay 250
# Note: More comprehensive 'ls' flag tests (sorting, -R, etc.) should be in a dedicated 'ls' section.

echo "Testing 'ls' on a non-existent directory (EXPECTED FAIL)..."
check_fail "ls non_existent_dir_for_ls_test"
delay 250

echo "--- Test: 'pwd' after 'cd' operations ---"
echo "Initial CWD:"
pwd
cd level1/level2
echo "CWD after 'cd level1/level2':"
pwd
delay 250
cd ..
echo "CWD after 'cd ..':"
pwd
delay 250
cd "/test_workspace"
echo "CWD after 'cd /test_workspace':"
pwd
delay 250

echo "--- Test: 'cd' error cases ---"
echo "Attempting 'cd' into a file..."
touch file_to_cd_into_error_test.txt
check_fail "cd file_to_cd_into_error_test.txt"
rm -f file_to_cd_into_error_test.txt
delay 250

echo "Attempting 'cd' into a directory without execute permission..."
mkdir dir_no_exec_for_cd_test
chmod 60 dir_no_exec_for_cd_test # Owner rw- (no 'x'), Other ---
ls -l . # Show parent perms
check_fail "cd dir_no_exec_for_cd_test"
chmod 70 dir_no_exec_for_cd_test # Grant execute for owner to allow cleanup
rm -r -f dir_no_exec_for_cd_test
delay 500
echo "------------------------------------------------------"

# --- Test Section: File Content (echo >, cat) ---
echo ""
echo "===== Testing: File Content - Redirection (>, >>) and 'cat' (as 'testuser_perms') ====="
echo "Ensuring current user is 'testuser_perms' and CWD is '/test_workspace'..."
whoami # Expected: testuser_perms
cd "/test_workspace"
pwd # Expected: /test_workspace
delay 250

echo "--- Test: 'echo \"text\" > filename' (Create/Overwrite) ---"
echo "Creating 'file_a.txt' with initial content..."
echo "Hello OopisOS" > file_a.txt
echo "Verifying 'file_a.txt' content and permissions:"
ls -l file_a.txt
cat file_a.txt
delay 250

echo "Overwriting 'file_a.txt' with new content..."
echo "New Content for file_a" > file_a.txt
echo "Verifying overwritten 'file_a.txt' content:"
cat file_a.txt
delay 250

echo "--- Test: 'echo \"text\" >> filename' (Create/Append) ---"
echo "Creating 'file_b.txt' with initial content via append..."
echo "Hello Again to file_b" >> file_b.txt
echo "Verifying 'file_b.txt' content and permissions:"
ls -l file_b.txt
cat file_b.txt
delay 250

echo "Appending more content to 'file_b.txt'..."
echo "And Again to file_b" >> file_b.txt
echo "Verifying appended 'file_b.txt' content:"
cat file_b.txt
delay 250

echo "--- Test: 'cat' multiple files ---"
echo "Displaying concatenated content of 'file_a.txt' and 'file_b.txt':"
cat file_a.txt file_b.txt
delay 500

echo "--- Test: Redirection creating file in a new subdirectory ---"
echo "Attempting: echo \"content\" > new_redir_subdir/output_via_redir.txt"
echo "Content for new_redir_subdir/output_via_redir.txt" > new_redir_subdir/output_via_redir.txt
echo "Verifying creation and content:"
ls -l new_redir_subdir # Check if directory was created
cat new_redir_subdir/output_via_redir.txt
rm -r -f new_redir_subdir # Cleanup
delay 250

echo "--- Test: 'cat' error cases ---"
echo "Attempting 'cat' on a non-existent file (EXPECTED FAIL)..."
check_fail "cat non_existent_file_for_cat_test.txt"
delay 250

echo "Attempting 'cat' on a directory (EXPECTED FAIL)..."
# 'my_dir' should exist from previous tests
check_fail "cat my_dir"
delay 250

echo "--- Test: Redirection and 'cat' with file permissions ---"
echo "Creating 'perm_test_redir.txt' and 'perm_test_cat.txt'..."
echo "Initial for redir" > perm_test_redir.txt
echo "Initial for cat" > perm_test_cat.txt
chmod 64 perm_test_redir.txt # Owner rw-, Other r--
chmod 64 perm_test_cat.txt  # Owner rw-, Other r--
ls -l perm_test_redir.txt perm_test_cat.txt
delay 250

echo "Setting 'perm_test_redir.txt' to read-only for owner (mode 44: r--r--)..."
chmod 44 perm_test_redir.txt
ls -l perm_test_redir.txt
delay 250
echo "Attempting 'echo \"text\" > perm_test_redir.txt' (overwrite, EXPECTED FAIL due to r-- permission)..."
check_fail 'echo "Overwrite attempt" > perm_test_redir.txt'
cat perm_test_redir.txt # Verify content is unchanged
delay 250
echo "Attempting 'echo \"text\" >> perm_test_redir.txt' (append, EXPECTED FAIL due to r-- permission)..."
check_fail 'echo "Append attempt" >> perm_test_redir.txt'
cat perm_test_redir.txt # Verify content is unchanged
chmod 64 perm_test_redir.txt # Restore writable for cleanup if needed, or just rm
rm -f perm_test_redir.txt
delay 250

echo "Setting 'perm_test_cat.txt' to no-read for owner (mode 04: ---r--)..."
# Note: mode 04 is unusual, typically owner has at least read. Using 24 (write-only for owner, read for other) or 00 could also be illustrative.
# Let's use 20 (owner -w-, other ---) to specifically test cat failing for owner lack of read.
chmod 20 perm_test_cat.txt # Owner -w-, Other ---
echo "Attempting 'ls -l perm_test_cat.txt' (owner has -w-, EXPECTED FAIL for ls -l due to no 'r')..."
check_fail "ls -l perm_test_cat.txt" # ls -l needs read access, which owner doesn't have
delay 250
echo "Attempting 'cat perm_test_cat.txt' (owner has -w-, EXPECTED FAIL for cat due to no 'r' permission)..."
check_fail "cat perm_test_cat.txt"
rm -f perm_test_cat.txt # Cleanup
delay 500
echo "------------------------------------------------------"

# --- Test Section: File Permissions (chmod, chown, access checks) ---
echo ""
echo "===== Testing: File Permissions ('chmod', 'chown', Access Checks) ====="
echo "Ensuring current user is 'testuser_perms' and CWD is '/test_workspace' for initial permission tests..."
whoami # Expected: testuser_perms
cd "/test_workspace"
pwd # Expected: /test_workspace
delay 250

echo "--- Setup: 'testuser_perms' creates 'perm_file_owner.txt' and 'perm_dir_owner' ---"
touch perm_file_owner.txt
mkdir perm_dir_owner
echo "Initial content for perm_file_owner.txt" > perm_file_owner.txt
echo "Initial state of test items (owned by 'testuser_perms'):"
ls -l perm_file_owner.txt # Default mode: 64 (rw-r--)
ls -l perm_dir_owner    # Default mode: 75 (rwxr-x)
delay 500

echo "--- Test: 'chmod' - Owner ('testuser_perms') changes permissions ---"
echo "Setting 'perm_file_owner.txt' to mode 75 (owner rwx, other r-x)..."
chmod 75 perm_file_owner.txt
ls -l perm_file_owner.txt
delay 250
echo "Setting 'perm_dir_owner' to mode 70 (owner rwx, other ---)..."
chmod 70 perm_dir_owner
ls -l perm_dir_owner
delay 250

echo "--- Test: 'chmod' with invalid mode strings (by 'testuser_perms') ---"
touch file_for_chmod_invalid_mode.txt
echo "Attempting 'chmod 99 file_for_chmod_invalid_mode.txt' (9 is not valid octal, EXPECTED FAIL)..."
check_fail "chmod 99 file_for_chmod_invalid_mode.txt"
echo "Attempting 'chmod abc file_for_chmod_invalid_mode.txt' (non-numeric, EXPECTED FAIL)..."
check_fail "chmod abc file_for_chmod_invalid_mode.txt"
echo "Attempting 'chmod 7 file_for_chmod_invalid_mode.txt' (needs two digits, EXPECTED FAIL)..."
check_fail "chmod 7 file_for_chmod_invalid_mode.txt"
rm -f file_for_chmod_invalid_mode.txt
delay 250

echo "--- Test: 'chown' - Owner ('testuser_perms') tries to 'chown' to a non-existent user ---"
touch temp_chown_target_by_owner.txt
echo "Attempting 'chown non_existent_user_test temp_chown_target_by_owner.txt' (EXPECTED FAIL)..."
check_fail "chown non_existent_user_test temp_chown_target_by_owner.txt"
rm -f temp_chown_target_by_owner.txt
delay 500

echo "--- Test: Owner ('testuser_perms') access based on their new permissions ---"
echo "'perm_file_owner.txt' mode is 75 (owner rwx, other r-x)."
echo "Owner ('testuser_perms') attempts to read 'perm_file_owner.txt' (should succeed)..."
cat perm_file_owner.txt
delay 250
echo "Owner ('testuser_perms') attempts to write (append) to 'perm_file_owner.txt' (should succeed)..."
echo "Appended by owner (testuser_perms)" >> perm_file_owner.txt
cat perm_file_owner.txt
delay 250

echo "'perm_dir_owner' mode is 70 (owner rwx, other ---)."
echo "Owner ('testuser_perms') attempts to list 'perm_dir_owner' (should succeed)..."
ls perm_dir_owner
delay 250
echo "Owner ('testuser_perms') attempts to create file in 'perm_dir_owner' (should succeed)..."
touch perm_dir_owner/owner_created.txt
ls -l perm_dir_owner
delay 500

echo "--- Test: Owner ('testuser_perms') 'chmod' to read-only for self ---"
echo "Setting 'perm_file_owner.txt' to mode 44 (owner r--, other r--)..."
chmod 44 perm_file_owner.txt
ls -l perm_file_owner.txt
delay 250
echo "Owner ('testuser_perms') attempts to write to their now read-only 'perm_file_owner.txt' (EXPECTED FAIL)..."
check_fail "echo 'owner write fail to mode 44' >> perm_file_owner.txt"
delay 250
echo "Owner ('testuser_perms') attempts to read their read-only 'perm_file_owner.txt' (should succeed)..."
cat perm_file_owner.txt
delay 250
echo "Resetting 'perm_file_owner.txt' to mode 64 (owner rw-, other r--) for subsequent tests..."
chmod 64 perm_file_owner.txt
ls -l perm_file_owner.txt
delay 250

echo "--- Test: 'chown' - Owner ('testuser_perms') changes ownership of 'perm_file_owner.txt' to 'otheruser_perms' ---"
chown otheruser_perms perm_file_owner.txt
echo "Verifying ownership and mode of 'perm_file_owner.txt' (owner: otheruser_perms, mode: 64):"
ls -l perm_file_owner.txt
echo "State of 'perm_dir_owner' (still owned by testuser_perms, mode 70):"
ls -l perm_dir_owner
delay 500

echo "--- Test: Original owner ('testuser_perms', now 'other') access to 'perm_file_owner.txt' ---"
echo "File 'perm_file_owner.txt' is now owned by 'otheruser_perms', mode 64 (owner rw-, other r--)."
echo "Current user 'testuser_perms' is 'other' for this file."
delay 250
echo "'testuser_perms' (as 'other') attempts 'chmod' on 'perm_file_owner.txt' (not owner, EXPECTED FAIL)..."
check_fail "chmod 77 perm_file_owner.txt"
delay 250
echo "'testuser_perms' (as 'other') attempts to write to 'perm_file_owner.txt' ('other' has r--, needs w, EXPECTED FAIL)..."
check_fail "echo 'original owner (testuser_perms) write fail after chown' >> perm_file_owner.txt"
delay 250
echo "'testuser_perms' (as 'other') attempts to read 'perm_file_owner.txt' ('other' has r--, should succeed)..."
cat perm_file_owner.txt
delay 500

echo "--- Test: Login as 'otheruser_perms' to test their owner capabilities ---"
login otheruser_perms
delay 250
echo "Current user (expected: otheruser_perms):"
whoami
echo "Current path (expected: /):"
pwd
delay 250
echo "Setting up '/opsy_workspace' for 'otheruser_perms'..."
rm -r -f /opsy_workspace # Cleanup from potential previous failed run
mkdir /opsy_workspace
delay 250
cd /opsy_workspace
echo "Current path for 'otheruser_perms' (expected: /opsy_workspace):"
pwd
delay 250

echo "--- Test: 'otheruser_perms' creates and manages THEIR OWN file ('opsy_file.txt') ---"
echo "Creating 'opsy_file.txt' with content by 'otheruser_perms'..."
echo "Content by otheruser_perms in opsy_file.txt" > opsy_file.txt
ls -l opsy_file.txt # Default mode 64
delay 250
echo "'otheruser_perms' (as owner) sets 'opsy_file.txt' to mode 70 (owner rwx, other ---)..."
chmod 70 opsy_file.txt
ls -l opsy_file.txt
delay 250
echo "'otheruser_perms' (as owner) appends to their 'opsy_file.txt' (mode 70, owner has rwx, should succeed)..."
echo "Appended by otheruser_perms" >> opsy_file.txt
cat opsy_file.txt
delay 250

echo "--- Test: 'otheruser_perms' (owner) 'chown's THEIR file ('opsy_file.txt') to 'testuser_perms' ---"
chown testuser_perms opsy_file.txt # opsy_file.txt is now owned by testuser_perms, mode 0o70
echo "Verifying 'opsy_file.txt' (owner: testuser_perms, mode: 70 by 'otheruser_perms' before chown):"
echo "Current user 'otheruser_perms' is now 'other' to 'opsy_file.txt' and has no permissions (---)."
echo "Attempting 'ls -l opsy_file.txt' as 'otheruser_perms' (EXPECTED FAIL - no 'r' for other)..."
check_fail "ls -l opsy_file.txt"
delay 250
echo "'otheruser_perms' (no longer owner) attempts 'chmod' on 'opsy_file.txt' (EXPECTED FAIL)..."
check_fail "chmod 60 opsy_file.txt"
delay 250
echo "'opsy_file.txt' is owned by 'testuser_perms', mode 70 (owner rwx, other ---)."
echo "Current user 'otheruser_perms' is 'other' and has no permissions (---)."
echo "'otheruser_perms' (as 'other') tries to read 'opsy_file.txt' (EXPECTED FAIL)..."
check_fail "cat opsy_file.txt"
delay 250
echo "Changing CWD to / for 'otheruser_perms' before logout..."
cd /
delay 250

echo "--- Test: Login back to 'testuser_perms' ---"
login testuser_perms
delay 250
echo "Ensuring CWD is '/test_workspace' for 'testuser_perms'..."
cd "/test_workspace"
echo "Current user (expected: testuser_perms):"
whoami
echo "Current path (expected: /test_workspace):"
pwd
delay 250

echo "--- Re-checking 'testuser_perms' (as 'other') access to 'perm_file_owner.txt' ---"
echo "'perm_file_owner.txt' is owned by 'otheruser_perms', mode 64 (owner rw-, other r--)."
echo "Current user 'testuser_perms' is 'other'."
ls -l perm_file_owner.txt
echo "'testuser_perms' (as 'other') attempts to read (should succeed, 'other' has r--)..."
cat perm_file_owner.txt
echo "'testuser_perms' (as 'other') attempts to write (EXPECTED FAIL, 'other' has r-- not w)..."
check_fail "echo 'another attempt by testuser_perms to write to perm_file_owner.txt' >> perm_file_owner.txt"
delay 500

echo "--- Test: Permissions for script execution (by 'testuser_perms' in their workspace) ---"
echo "Creating 'script_to_run.sh'..."
# Using simple echo to create script for clarity in test log
echo "echo 'Executable script content by testuser_perms'" > script_to_run.sh
echo "echo 'Arg1: \$1'" >> script_to_run.sh
echo "Initial permissions of 'script_to_run.sh' (default mode 64, owner rw-, other r--):"
ls -l script_to_run.sh
delay 250
echo "Attempting to 'run ./script_to_run.sh' (owner 'testuser_perms' lacks 'x' permission, EXPECTED FAIL)..."
check_fail "run ./script_to_run.sh an_arg"
delay 250
echo "Setting 'x' permission for owner on 'script_to_run.sh' (mode 74: owner rwx, other r--)..."
chmod 74 script_to_run.sh
ls -l script_to_run.sh
delay 250
echo "Attempting to 'run ./script_to_run.sh' with 'x' permission (should succeed)..."
run ./script_to_run.sh first_arg_for_script
delay 500

echo "--- Test: Directory permissions for 'cd' and creating files (by 'testuser_perms') ---"
echo "'perm_dir_owner' is owned by 'testuser_perms', mode 70 (owner rwx, other ---)."
ls -l perm_dir_owner
delay 250
echo "'testuser_perms' (owner) attempts to 'cd' into 'perm_dir_owner' (has 'x', should succeed)..."
cd perm_dir_owner
pwd
delay 250
echo "'testuser_perms' (owner) attempts to create file in 'perm_dir_owner' (has 'w', should succeed)..."
touch file_in_perm_dir_owner.txt
ls -l . # List contents of perm_dir_owner
delay 250
echo "Returning 'testuser_perms' to '/test_workspace'..."
cd "/test_workspace"
delay 250
echo "------------------------------------------------------"

# --- Test Section: File Removal (rm) - Extended (as testuser_perms) ---
echo ""
echo "===== Testing: File Removal ('rm') - Extended Tests (as 'testuser_perms') ====="
echo "Ensuring current user is 'testuser_perms' and CWD is '/test_workspace'..."
whoami # Expected: testuser_perms
cd "/test_workspace"
pwd # Expected: /test_workspace
delay 250

echo "--- Test: 'rm directory' (without -r, on non-empty directory, EXPECTED FAIL) ---"
mkdir dir_to_rm_fail_no_r_test
touch dir_to_rm_fail_no_r_test/somefile.txt
echo "Attempting 'rm dir_to_rm_fail_no_r_test'..."
check_fail "rm dir_to_rm_fail_no_r_test"
echo "Cleaning up 'dir_to_rm_fail_no_r_test' with -r -f..."
rm -r -f dir_to_rm_fail_no_r_test
delay 250

echo "--- Test: 'rm directory' (without -r, on empty directory, EXPECTED FAIL) ---"
mkdir empty_dir_to_rm_fail_no_r_test
echo "Attempting 'rm empty_dir_to_rm_fail_no_r_test'..."
check_fail "rm empty_dir_to_rm_fail_no_r_test"
echo "Cleaning up 'empty_dir_to_rm_fail_no_r_test' with -r -f..."
rm -r -f empty_dir_to_rm_fail_no_r_test
delay 250

echo "--- Test: 'rm -r directory_with_contents' (should succeed) ---"
mkdir dir_to_rm_with_r_test
touch dir_to_rm_with_r_test/some_file.txt
mkdir dir_to_rm_with_r_test/subdir_to_rm
touch dir_to_rm_with_r_test/subdir_to_rm/another_file.txt
echo "Attempting 'rm -r dir_to_rm_with_r_test'..."
rm -r dir_to_rm_with_r_test
echo "Verifying 'dir_to_rm_with_r_test' is removed (ls should fail or show nothing):"
check_fail "ls dir_to_rm_with_r_test" # Or ls and manually check output is empty for this name
delay 250

echo "--- Test: 'rm -f non_existent_file.txt' (should succeed silently, no error) ---"
rm -f this_file_does_not_exist_for_rm_f_test.txt
echo "(No output expected if successful and silent)"
delay 250

echo "--- Test: 'rm -f non_existent_dir/' (non-recursive, should succeed silently) ---"
rm -f this_dir_does_not_exist_for_rm_f_test/
echo "(No output expected if successful and silent)"
delay 250

echo "--- Test: 'rm -r -f non_existent_dir_recursive/' (recursive, should succeed silently) ---"
rm -r -f this_dir_does_not_exist_for_rm_f_recursive_test/
echo "(No output expected if successful and silent)"
delay 250

echo "--- Test: 'rm' on an owner's read-only file (parent dir is writable, should succeed) ---"
echo "Creating 'owner_read_only_rm_test_file.txt' and setting mode 40 (owner r--, other ---)..."
touch owner_read_only_rm_test_file.txt
chmod 40 owner_read_only_rm_test_file.txt
ls -l owner_read_only_rm_test_file.txt
echo "Attempting 'rm owner_read_only_rm_test_file.txt'..."
rm owner_read_only_rm_test_file.txt
echo "Verifying 'owner_read_only_rm_test_file.txt' is removed:"
check_fail "ls owner_read_only_rm_test_file.txt"
delay 250

echo "--- Test: 'rm' on a file in a parent directory where owner lacks write permission (EXPECTED FAIL) ---"
mkdir rm_parent_no_write_test
touch rm_parent_no_write_test/file_to_try_removing.txt
echo "Setting 'rm_parent_no_write_test' to mode 50 (owner r-x, other ---) (no 'w' for owner)..."
chmod 50 rm_parent_no_write_test
ls -l . # Show permissions of /test_workspace, focusing on rm_parent_no_write_test
echo "Attempting 'rm rm_parent_no_write_test/file_to_try_removing.txt'..."
check_fail "rm rm_parent_no_write_test/file_to_try_removing.txt"
echo "Granting 'w' permission to 'rm_parent_no_write_test' for cleanup (mode 70)..."
chmod 70 rm_parent_no_write_test
rm -r -f rm_parent_no_write_test
delay 500

echo "--- Test: 'rm .' (attempting to remove current directory, EXPECTED FAIL/Warning) ---"
check_fail "rm ."
delay 250

echo "--- Test: 'rm ..' (attempting to remove parent directory, EXPECTED FAIL/Warning from /test_workspace) ---"
check_fail "rm .."
delay 250
echo "Changing to a subdirectory to test 'rm ..' more thoroughly..."
mkdir rm_dotdot_child_dir
cd rm_dotdot_child_dir
pwd # Expected: /test_workspace/rm_dotdot_child_dir
check_fail "rm .." # Attempt to remove /test_workspace from within its child
cd .. # Back to /test_workspace
rm -r -f rm_dotdot_child_dir
delay 250

echo "--- Test: 'rm /' (attempting to remove root directory, EXPECTED FAIL) ---"
check_fail "rm /"
delay 250

echo "--- Test: 'rm -r /' (attempting to remove root directory recursively, EXPECTED FAIL) ---"
check_fail "rm -r /"
delay 500
echo "------------------------------------------------------"

# --- Test Section: Input/Output Redirection & Piping (as 'testuser_perms') ---
echo ""
echo "===== Testing: I/O Redirection (>, >>) & Piping (|) (as 'testuser_perms') ====="
echo "Ensuring current user is 'testuser_perms' and CWD is '/test_workspace'..."
whoami # Expected: testuser_perms
cd "/test_workspace"
pwd # Expected: /test_workspace
delay 250

echo "--- Setup: Creating 'redir_owner.txt' for redirection tests ---"
echo "Initial Owner Content for redir_owner.txt" > redir_owner.txt
chmod 64 redir_owner.txt # mode rw-r--
echo "Initial state of 'redir_owner.txt':"
ls -l redir_owner.txt
cat redir_owner.txt
delay 250

echo "--- Test: Output Redirection '>>' (append) to writable file ---"
echo "Appending content to 'redir_owner.txt' (owner 'testuser_perms' has 'rw')..."
echo "Owner Appended Content via >>" >> redir_owner.txt
echo "Verifying appended content:"
cat redir_owner.txt
delay 250

echo "--- Test: Output Redirection with Permissions ---"
echo "Changing 'redir_owner.txt' mode to 44 (owner r--, other r--)..."
chmod 44 redir_owner.txt
ls -l redir_owner.txt
delay 250

echo "Attempting 'echo > redir_owner.txt' (overwrite to r-- file, EXPECTED FAIL)..."
check_fail "echo 'Owner Overwrite Fail on r--' > redir_owner.txt"
echo "Verifying content of 'redir_owner.txt' (should be unchanged):"
cat redir_owner.txt
delay 250

echo "Attempting 'echo >> redir_owner.txt' (append to r-- file, EXPECTED FAIL)..."
check_fail 'echo "Owner Append Fail on r--" >> redir_owner.txt'
echo "Verifying content of 'redir_owner.txt' (should be unchanged):"
cat redir_owner.txt
delay 250
echo "Restoring 'redir_owner.txt' to mode 64 for cleanup..."
chmod 64 redir_owner.txt # Make it writable for rm
rm -f redir_owner.txt
delay 250

echo "--- Test: Output Redirection '>' to a directory path (EXPECTED FAIL) ---"
mkdir redir_target_is_dir_test
echo 'Attempting ''echo "text" > redir_target_is_dir_test''...'
check_fail 'echo "This should not write to a directory" > redir_target_is_dir_test'
ls -l redir_target_is_dir_test # Verify directory is not replaced/corrupted
rm -r -f redir_target_is_dir_test
delay 250

echo "--- Test: Output Redirection '>' from a command with no stdout ---"
echo "Attempting 'mkdir new_empty_dir_for_redir > output_from_mkdir.txt'..."
mkdir new_empty_dir_for_redir_cmd_test > output_from_mkdir.txt
echo "Verifying 'output_from_mkdir.txt' (should be empty as mkdir has no stdout):"
ls -l output_from_mkdir.txt
cat output_from_mkdir.txt # Should print nothing or a single newline if shell adds one
rm -f output_from_mkdir.txt
rm -r -f new_empty_dir_for_redir_cmd_test
delay 250

echo "--- Test: Output Redirection '>' from a failing command ---"
echo "Attempting 'non_existent_command_for_redir_test > output_from_failing_cmd.txt'..."
check_fail "non_existent_command_for_redir_test > output_from_failing_cmd.txt"
echo "Verifying 'output_from_failing_cmd.txt' was NOT created/modified (ls should fail):"
check_fail "ls output_from_failing_cmd.txt" # File should not exist as command failed before redirection
delay 250

echo "--- Test: Basic Command Piping '|' ---"
echo "Testing 'echo \"Piped hello content\" | cat'..."
echo "Piped hello content" | cat
delay 250

echo "Creating 'pipe_source_test.txt' for further pipe tests..."
echo "Line Alpha for pipe test" > pipe_source_test.txt
echo "Line Beta for pipe test" >> pipe_source_test.txt
echo "Line Gamma for pipe test" >> pipe_source_test.txt
echo "Content of 'pipe_source_test.txt':"
cat pipe_source_test.txt
delay 250

echo "Testing 'cat pipe_source_test.txt | cat'..."
cat pipe_source_test.txt | cat
delay 250

echo "--- Test: Piping with 'grep' ---"
echo "Testing 'cat pipe_source_test.txt | grep Beta'..."
cat pipe_source_test.txt | grep Beta
delay 250
echo "Testing 'cat pipe_source_test.txt | grep -v Alpha' (invert match)..."
cat pipe_source_test.txt | grep -v Alpha
delay 250

echo "--- Test: Multiple Pipes ---"
echo "Testing 'cat pipe_source_test.txt | grep Line | grep test'..."
cat pipe_source_test.txt | grep Line | grep test
delay 250

echo "--- Test: Piping with a failing command in the middle (EXPECTED FAIL) ---"
echo "Attempting 'cat pipe_source_test.txt | non_existent_command_in_pipe | grep Beta'..."
check_fail "cat pipe_source_test.txt | non_existent_command_in_pipe | grep Beta"
delay 250

echo "--- Test: Piping starting with a failing command (EXPECTED FAIL) ---"
echo "Attempting 'non_existent_command_first_in_pipe | grep Beta'..."
check_fail "non_existent_command_first_in_pipe | grep Beta"
delay 250

echo "--- Test: Combining Piping and Redirection ---"
echo "Testing 'cat pipe_source_test.txt | grep Alpha > pipe_then_redir_output.txt'..."
cat pipe_source_test.txt | grep Alpha > pipe_then_redir_output.txt
echo "Verifying 'pipe_then_redir_output.txt':"
ls -l pipe_then_redir_output.txt
cat pipe_then_redir_output.txt
rm -f pipe_then_redir_output.txt
delay 250

echo "Cleaning up 'pipe_source_test.txt'..."
rm -f pipe_source_test.txt
delay 500
echo "------------------------------------------------------"

# --- Test Section: Scripting ('run', arguments, permissions) - By 'testuser_perms' ---
echo ""
echo "===== Testing: Scripting - 'run' Command (as 'testuser_perms') ====="
echo "Ensuring current user is 'testuser_perms' and CWD is '/test_workspace'..."
whoami # Expected: testuser_perms
cd "/test_workspace"
pwd # Expected: /test_workspace
delay 250

echo "--- Test: Basic Script Execution (previously tested in permissions section) ---"
echo "Reference: 'script_to_run.sh' was created and tested for execute permissions."
echo "(Contents were: echo 'Executable script content...' and echo 'Arg1: \$1')"
echo "Re-running 'script_to_run.sh' (mode 74) with a new argument for confirmation:"
run ./script_to_run.sh "confirm_arg" # Should succeed
delay 250

echo "--- Test: Running a script that is readable but NOT executable by owner ---"
echo "Creating 'non_exec_by_owner_script.sh' with mode 60 (owner rw-, other ---)..."
echo "echo 'This script should not execute.'" > non_exec_by_owner_script.sh
chmod 60 non_exec_by_owner_script.sh
ls -l non_exec_by_owner_script.sh
echo "Attempting 'run ./non_exec_by_owner_script.sh' (EXPECTED FAIL - no 'x' perm)..."
check_fail "run ./non_exec_by_owner_script.sh"
rm -f non_exec_by_owner_script.sh
delay 250

echo "--- Test: Script with Argument Passing (\$1, \$2, \$@, \$#) ---"
echo "Creating 'test_args_script.sh'..."
# Using multiple echo commands for script content for clarity in test generation
echo "#!/bin/oopis_sh_shebang_test" > test_args_script.sh
echo "echo \"Script Name: \$0 (Note: OopisOS 'run' does not set \$0)\"" >> test_args_script.sh
echo "echo \"Arg1: \$1\"" >> test_args_script.sh
echo "echo \"Arg2: \$2\"" >> test_args_script.sh
echo "echo \"All Args (\$@): \$@\"" >> test_args_script.sh
echo "echo \"Num Args (\$#): \$#\"" >> test_args_script.sh
echo "# This is a comment line in the script" >> test_args_script.sh
echo "" >> test_args_script.sh
echo "echo \"End of argument test script.\"" >> test_args_script.sh
chmod 70 test_args_script.sh # Mode rwx--- for owner
echo "Content of 'test_args_script.sh':"
cat ./test_args_script.sh
delay 250
echo "Running 'test_args_script.sh foo bar baz'..."
run ./test_args_script.sh foo bar baz
delay 250
echo "Running 'test_args_script.sh \"hello world\" second'..."
run ./test_args_script.sh "hello world" second
delay 250
rm -f test_args_script.sh
delay 250

echo "--- Test: Running a script that contains a failing command ---"
echo "Creating 'failing_script.sh'..."
echo "echo \"About to run a failing command...\"" > failing_script.sh
echo "cat /non_existent_file_to_cause_failure_in_script.txt" >> failing_script.sh
echo "echo \"This line should not be reached if script exits on error.\"" >> failing_script.sh
chmod 70 failing_script.sh
echo "Content of 'failing_script.sh':"
cat ./failing_script.sh
delay 250
echo "Attempting 'run ./failing_script.sh' (EXPECTED FAIL due to internal 'cat' error)..."
check_fail "run ./failing_script.sh"
rm -f failing_script.sh
delay 250

echo "--- Test: Running an empty script ---"
echo "Creating 'empty_script.sh'..."
touch empty_script.sh
chmod 70 empty_script.sh
echo "Attempting 'run ./empty_script.sh' (should succeed with no output/error)..."
run ./empty_script.sh # Expect success, no output
rm -f empty_script.sh
delay 250

echo "--- Test: Running a script using an absolute path ---"
echo "Creating '/test_workspace/abs_path_script.sh'..."
echo "echo \"Script run via absolute path!\"" > /test_workspace/abs_path_script.sh
chmod 70 /test_workspace/abs_path_script.sh
echo "Attempting 'run /test_workspace/abs_path_script.sh'..."
run /test_workspace/abs_path_script.sh
rm -f /test_workspace/abs_path_script.sh
delay 500
echo "------------------------------------------------------"

# --- Final Cleanup of users and test_workspace ---
echo ""
echo "--- Test Completion: Final Cleanup Phase ---"
echo "Current user before final logout (expected: testuser_perms):"
whoami
delay 250
echo "Changing directory to root ('/') before attempting user removals..."
cd /
pwd # Expected: /
delay 250

echo "--- Attempting Invalid 'removeuser' Operations (as 'testuser_perms') ---"
echo "Attempting 'removeuser testuser_perms' (cannot remove self, EXPECTED FAIL)..."
check_fail "removeuser testuser_perms"
delay 250
echo "Attempting 'removeuser Guest' (cannot remove default Guest user, EXPECTED FAIL)..."
check_fail "removeuser Guest"
delay 250

echo "--- Logging out 'testuser_perms' to switch to 'Guest' for final cleanup ---"
logout # Switches to Guest
delay 250
echo "Current user after logout (expected: Guest):"
whoami
delay 250

echo "--- Attempting Invalid 'removeuser' Operations (as 'Guest') ---"
echo "Attempting 'removeuser Guest' (cannot remove self, EXPECTED FAIL)..."
check_fail "removeuser Guest"
delay 250

echo "--- Removing Test Users (as 'Guest') ---"
echo "Attempting to remove 'testuser_perms' (and their FS)..."
echo "(Note: In non-interactive script, 'removeuser' confirmation defaults to 'no'. If user had data, full removal might be 'cancelled' but command returns success.)"
removeuser testuser_perms
delay 500 # Allow time for FS operations potentially triggered by removeuser
echo "Attempting to remove 'otheruser_perms' (and their FS)..."
removeuser otheruser_perms
delay 500 # Allow time for FS operations

echo "--- Final Sanity Checks (as 'Guest') ---"
echo "Listing users after removal attempts:"
listusers # Verify testuser_perms and otheruser_perms are gone or removal was noted as cancelled
delay 250
echo "Attempting to remove '/test_workspace' from Guest's own FS (if any was created and not cleaned up)..."
rm -r -f "/test_workspace"
delay 250
echo "Final filesystem root listing from Guest's perspective:"
ls -l /
delay 500
echo "------------------------------------------------------"

echo ""
echo "===== OopisOS Test Suite Complete (v1.4.1) ====="
# --- Success Animation ---
echo " "
delay 500
echo "  ======================================================"
delay 200
echo "  ==                                                  =="
delay 200
echo "  ==         OopisOS Diagnostics - v1.4.1            =="
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

# --- Test Section: Manual User Interaction & Observation ---
echo ""
echo "========================================================================"
echo "===== MANUAL TESTING REQUIRED FOR THE FOLLOWING SCENARIOS ====="
echo "========================================================================"
echo "Current user should be 'Guest' if automated script cleanup was successful."
whoami
pwd
ls -l /
delay 1000

echo ""
echo "--- Manual Test 1: Full Editor ('edit') Functionality ---"
echo "  1. Create a new user for editor tests: 'register editortestuser'"
echo "  2. Login as editor test user: 'login editortestuser'"
echo "  3. Create a new file: 'edit testfile.txt'"
echo "     - Type some text. Press Ctrl+S to save and exit."
echo "     - Verify content: 'cat testfile.txt'"
echo "  4. Edit existing file: 'edit testfile.txt'"
echo "     - Make changes. Press Ctrl+O. When prompted 'Discard unsaved changes?', type 'YES' and press Enter."
echo "     - Verify content (should be original): 'cat testfile.txt'"
echo "  5. Markdown Mode & Preview:"
echo "     - 'edit test.md'"
echo "     - Type Markdown content (e.g., # Heading, *italic*)."
echo "     - Toggle preview: Ctrl+P. Observe split, edit-only, preview-only modes."
echo "     - Test word wrap toggle button."
echo "     - Save and exit (Ctrl+S)."
echo "  6. HTML Mode & Preview:"
echo "     - 'edit test.html'"
echo "     - Type simple HTML (e.g., <h1>Hello HTML</h1><p>Some text.</p>)."
echo "     - Toggle preview: Ctrl+P. Observe."
echo "     - Test exporting HTML preview button."
echo "     - Save and exit (Ctrl+S)."
echo "  7. Editor state: If you try to 'logout' or run 'clear' from another context while editor is active,"
echo "     those commands should be blocked or output suppressed until editor is exited."
echo "  (Remember to 'logout' from 'editortestuser' when done or 'removeuser editortestuser' as Guest)"
delay 2000

echo ""
echo "--- Manual Test 2: File System Interaction with Browser ---"
echo "  (Ensure you are logged in as a user with a prepared file system, e.g., 'testuser_perms' from earlier or a new one)"
echo "  Current user (make sure it's a test user, not Guest for all steps):"
whoami
echo "  1. 'export some_file.txt': (First, ensure 'some_file.txt' exists and has content)"
echo "     - Run the command. Expect a browser download prompt for 'some_file.txt'."
echo "  2. 'upload':"
echo "     - Run the command. Expect a browser file selection dialog."
echo "     - Select a small .txt, .md, or .html file from your computer."
echo "     - Verify the file appears in the current OopisOS directory ('ls')."
echo "     - Test uploading a file that already exists; observe overwrite confirmation prompt (type 'YES')."
echo "     - Test uploading a disallowed file type; observe error."
echo "  3. 'backup':"
echo "     - Run the command. Expect a browser download prompt for a JSON backup file."
echo "  4. 'restore': (CAUTION: This will overwrite the current user's file system!)"
echo "     - Best done with a dedicated test user or after backing up."
echo "     - Run 'restore'. Expect a file selection dialog."
echo "     - Select a previously downloaded OopisOS backup JSON file."
echo "     - Observe confirmation prompt (type 'YES'). Verify FS is restored ('ls', 'cat' some files)."
delay 2000

echo ""
echo "--- Manual Test 3: Interactive Flags (e.g., rm -i, cp -i, mv -i) ---"
echo "  (Perform as a test user like 'testuser_perms' in their workspace)"
echo "  1. Create a test file: 'echo \"interactive test\" > interactive_test.txt'"
echo "  2. Run 'rm -i interactive_test.txt'. Type 'NO' (or anything other than YES) and Enter. Verify file still exists."
echo "  3. Run 'rm -i interactive_test.txt'. Type 'YES' and Enter. Verify file is removed."
echo "  4. Create 'file_A_interactive.txt' and 'file_B_interactive.txt'."
echo "  5. Run 'cp -i file_A_interactive.txt file_B_interactive.txt'. Type 'YES' to overwrite. Verify."
echo "  6. Run 'mv -i file_A_interactive.txt file_C_interactive.txt'. If C exists, type 'YES' to overwrite. Verify."
delay 2000

echo ""
echo "--- Manual Test 4: Visual Output & Complex State Checks ---"
echo "  1. Create a deep and varied directory structure."
echo "  2. Manually run 'ls -l', 'ls -R', 'ls -lt', 'ls -S', 'tree -L 3' etc."
echo "     - Visually inspect the output for correct formatting, sorting, and content."
echo "  3. After various FS operations (touch, chmod, chown, file writes, redirection),"
echo "     use 'ls -lt' to manually verify that 'mtime' values are updating as expected on both"
echo "     the modified items and their parent directories where appropriate."
echo "  4. Test complex 'find' commands and visually verify the paths returned."
delay 2000

echo ""
echo "--- Manual Test 5: Tab Completion ---"
echo "  1. Type 'he' then press Tab. Expect 'help' or other 'he*' commands."
echo "  2. Type 'mkd' then press Tab. Expect 'mkdir'."
echo "  3. In '/test_workspace' (assuming files like 'file_a.txt', 'my_dir/' exist):"
echo "     - Type 'cat f' then Tab. Expect 'file_a.txt'."
echo "     - Type 'cd my' then Tab. Expect 'my_dir/'."
echo "     - Type 'ls non_existent_prefix' then Tab. Expect no completion or beep."
echo "  4. If multiple completions, they should be listed, or common prefix completed."
delay 2000

echo ""
echo "--- Manual Test 6: OS Halt/Restart Operations (Perform these last for a given session) ---"
echo "  1. 'reboot':"
echo "     - Run the command. Expect the OopisOS page to reload after a short delay."
echo "     - After reload, check if session state (e.g., current user, path, history) was auto-saved and restored correctly for the user who was logged in."
echo "  2. 'shutdown':"
echo "     - Run the command. Expect the terminal to become unresponsive and display a 'System halted' message."
echo "     - You will need to manually refresh the browser page to restart OopisOS."
delay 2000

echo ""
echo "--- Manual Test 7: Full System Reset (EXTREME CAUTION - WIPES ALL DATA) ---"
echo "  (This is the most destructive command. Perform only if you intend to clear everything.)"
echo "  1. Run 'reset'."
echo "     - Observe the confirmation prompt. Type 'YES' and press Enter."
echo "     - After reset, OopisOS should be in its initial state (Guest user, empty FS, cleared history)."
echo "     - Verify by checking 'whoami', 'ls /', 'history', 'listusers'."
delay 2000

echo ""
echo "===== End of Manual Testing Suggestions ====="
echo "Remember to log out or clean up test users and files as needed after manual tests."
echo "------------------------------------------------------"