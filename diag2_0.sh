# OopisOS Non-Interactive Core Functionality Test Script
# Script Version for OopisOS v2.0 (using userDiag)

echo "===== OopisOS Core Test Suite Initializing (v2.0 Features) ====="
echo "This script tests non-interactive core functionality."
echo "It will be executed by the 'userDiag' user."
echo "---------------------------------------------------------------------"
echo ""

# --- Login as diagnostic user (userDiag) and set up the workspace ---
echo "--- Phase: Logging in as 'userDiag' and Preparing Workspace ---"
login userDiag pantload
delay 400

echo "Current User (expected: userDiag):"
whoami
echo "Current Path after login (expected: /home/userDiag):"
pwd
delay 400

# Use relative paths to create workspace inside the user's home directory
echo "Cleaning up and creating 'diag_workspace'..."
rm -r -f "diag_workspace" 
delay 400
mkdir "diag_workspace"
delay 400
cd "diag_workspace"

echo "Current User (expected: userDiag):"
whoami
echo "Current Path (expected: /home/userDiag/diag_workspace):"
pwd
delay 700
echo "---------------------------------------------------------------------"

# --- Test Section: Core File System (mkdir, touch, ls, pwd as 'userDiag') ---
echo ""
echo "===== Testing: Core File System (mkdir, touch, ls, pwd) ====="
echo "User: userDiag, CWD: /home/userDiag/diag_workspace"
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
pwd
cd level1/level2; pwd
cd ../..; pwd
touch file_for_cd_error.txt; check_fail "cd file_for_cd_error.txt"; rm -f file_for_cd_error.txt
mkdir no_exec_dir_cd; chmod 60 no_exec_dir_cd; check_fail "cd no_exec_dir_cd"; chmod 70 no_exec_dir_cd; rm -r -f no_exec_dir_cd
delay 700
echo "---------------------------------------------------------------------"

# --- Test Section: File Content (echo, cat, redirection, pipes as 'userDiag') ---
echo ""
echo "===== Testing: File Content (echo, cat, >, >>, |) ====="
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

# --- Test Section: Advanced 'ls' Flags (as 'userDiag') ---
echo ""
echo "===== Testing: Advanced 'ls' Flags ====="
mkdir ls_adv_dir; cd ls_adv_dir
touch file_c.txt; delay 100; touch file_z.log; delay 100
echo "smallest" > file_c.txt
echo "medium content here" > file_z.log
delay 1600; touch file_a.txt; echo "largest file content for size sort" > file_a.txt
delay 1600; touch file_b.md; echo "markdown" > file_b.md
mkdir sub_ls; touch sub_ls/nested.sh;
touch .hidden_adv.txt
delay 400
echo "--- ls (default sort by name) ---"; ls
echo "--- ls -l (long format) ---"; ls -l
echo "--- ls -a (all, including hidden) ---"; ls -a
echo "--- ls -t (sort by time, newest first) ---"; ls -t
echo "--- ls -tr (sort by time, oldest first) ---"; ls -tr
echo "--- ls -S (sort by size, largest first) ---"; ls -S
echo "--- ls -Sr (sort by size, smallest first) ---"; ls -Sr
echo "--- ls -X (sort by extension) ---"; ls -X
echo "--- ls -R (recursive) ---"; ls -R
cd ../
rm -r -f ls_adv_dir
delay 700
echo "---------------------------------------------------------------------"

# --- Test Section: File Permissions (chmod, chown, access checks) ---
echo ""
echo "===== Testing: File Permissions ('chmod', 'chown', Access Checks) ====="
echo "--- Setup: 'userDiag' creates a file for permission tests ---"
touch perm_file.txt; 
echo "owner content" > perm_file.txt
ls -l perm_file.txt
delay 600

echo "--- Test: Verify 'userDiag' cannot write to /home (as expected) ---"
check_fail "mv perm_file.txt /home/"
delay 300

echo "--- Test: 'userDiag' makes its home and workspace world-traversable for test ---"
# We are in /home/userDiag/diag_workspace. 'cd ..' goes to /home/userDiag.
cd ..
pwd # Expected: /home/userDiag
chmod 75 . # Sets /home/userDiag to rwxr-xr-x
chmod 75 diag_workspace # Sets diag_workspace to rwxr-xr-x
ls -ld . diag_workspace # Verify the permission changes
delay 600

echo "--- Test: Setting permissions to 64 and chown'ing file to 'Guest' ---"
# Go back into the workspace to chown the file
cd diag_workspace
chmod 64 perm_file.txt
chown Guest perm_file.txt
ls -l perm_file.txt
delay 300

echo "--- Test: Switch to 'Guest' to test owner permissions ---"
logout # Back to Guest
delay 300
whoami # Expected: Guest
# Now this cd will succeed because both /home/userDiag and diag_workspace are traversable
cd /home/userDiag/diag_workspace 
delay 300

echo "--- Test: 'Guest' (now owner) can access the file ---"
pwd
echo "File 'perm_file.txt' is owned by Guest."
echo "Appended by Guest" >> perm_file.txt
cat perm_file.txt
chmod 70 perm_file.txt
ls -l perm_file.txt
delay 600

echo "--- Test: Returning to 'userDiag' to restore permissions ---"
logout 
login userDiag pantload 
cd /home/userDiag # Navigate to home to restore permissions
pwd
chmod 70 . # Restore secure permissions on home
chmod 70 diag_workspace # Restore secure permissions on workspace
ls -ld . diag_workspace
cd diag_workspace # Return to workspace for next tests
delay 700
echo "---------------------------------------------------------------------"


# --- Test Section: File Removal, Copy, Move (as 'userDiag') ---
echo ""
echo "===== Testing: rm, cp, mv ====="
echo "--- Test: 'rm -r directory_with_contents' ---"
mkdir rm_dir_r; touch rm_dir_r/f1; mkdir rm_dir_r/sub; touch rm_dir_r/sub/f2
rm -rf rm_dir_r; check_fail "ls rm_dir_r"
delay 300

echo "--- Test: 'cp' file to file and into dir ---"
echo "cp_A" > cp_A.txt; cp cp_A.txt cp_C.txt; 
mkdir cp_D; cp cp_A.txt cp_D; ls cp_D
delay 300

echo "--- Test: 'cp -r' dir to dir ---"
mkdir cp_S; touch cp_S/s_file.txt; cp -r cp_S cp_S_copy; tree cp_S_copy
delay 300

echo "--- Test: 'mv' file to file (rename) and into dir ---"
mv cp_A.txt mv_A.txt; ls mv_A.txt; check_fail "ls cp_A.txt"
mv mv_A.txt cp_D; ls cp_D/mv_A.txt
delay 300

# Cleanup cp/mv
rm -rf cp_C.txt cp_D cp_S cp_S_copy
delay 700
echo "---------------------------------------------------------------------"


# --- Test Section: `find` command (as 'userDiag') ---
echo ""
echo "===== Testing: 'find' Command ====="
echo "--- Setup for find ---"
mkdir find_root
cd find_root
echo "find_A" > fileA.txt
echo "find_B" > fileB.log
touch -t 2301010000 fileA.txt
mkdir dir1; echo "in_dir1" > dir1/fileC.txt; chmod 70 dir1/fileC.txt

# --- CORRECTED LINE: Added 'chmod 64' on the file to make it readable by 'other' ---
mkdir dir2; echo "find_E" > dir2/fileE.txt
chmod 64 dir2/fileE.txt
chown Guest dir2/fileE.txt
chmod 75 dir2

ls -R
delay 400
echo "--- find . -name \"*.txt\" ---"; find . -name "*.txt"
echo "--- find . -type d ---"; find . -type d
echo "--- find . -user Guest ---"; find . -user Guest
echo "--- find . -name \"fileA.txt\" -exec cat {} \; ---"; find . -name "fileA.txt" -exec cat {} \;
echo "--- find . -type f -delete ---"
find . -type f -delete
echo "After delete (files should be gone):"; find . -type f -print
cd ..; rm -r -f find_root
delay 700
echo "---------------------------------------------------------------------"

# --- Test Section: Scripting (`run` as 'userDiag') ---
echo ""
echo "===== Testing: Scripting - 'run' Command ====="
echo "--- Test: Basic Script Execution ---"
echo "echo \"Basic script ran\"" > run_basic.sh; chmod 70 run_basic.sh; run ./run_basic.sh
delay 300
echo "--- Test: Script with Argument Passing ---"
echo 'echo "All=$@"' > run_args.sh
echo "echo \"Count=\$#\"" >> run_args.sh
chmod 70 run_args.sh;
run ./run_args.sh first "second arg" third
delay 300
echo "--- Test: Running script via absolute path ---"
echo "echo \"Absolute path script!\"" > run_abs.sh
chmod 70 run_abs.sh
run /home/userDiag/diag_workspace/run_abs.sh
delay 300
# Cleanup scripting tests
rm -f run_basic.sh run_args.sh run_abs.sh
delay 700
echo "---------------------------------------------------------------------"


# --- Test Completion: Final Cleanup Phase ---
echo ""
echo "--- Final Cleanup ---"
cd / 
login root mcgoopis
delay 300
echo "Current user for cleanup (expected: root):"; whoami
delay 300
rm -r -f /home/userDiag/diag_workspace
logout
echo "Final user list (expected: Guest, root, userDiag):"
listusers
delay 700
echo "---------------------------------------------------------------------"

echo ""
echo "===== OopisOS Core Test Suite Complete (v2.0) ======="
echo " "
delay 500
echo "  ======================================================"
delay 150
echo "  ==                                                  =="
delay 150
echo "  ==        OopisOS Core Diagnostics - v2.0           =="
delay 150
echo "  ==              CONGRATULATIONS,                    =="
delay 150
echo "  ==            ALL SYSTEMS ARE GO!                   =="
delay 200
echo "  ==                                                  =="
echo "  ==   (As usual, you've been a real pantload!)       =="
echo "  ==                                                  =="
delay 150
echo "  ======================================================"
echo " "
delay 500
echo "...kthxbye"