# OopisOS Non-Interactive Core Functionality Test Script
# Script Version 2.3.9 (Alias Test Phase Added)

echo "===== OopisOS Core Test Suite Initializing (v2.3.9 Final) ====="
echo "This script tests non-interactive core functionality."
echo "It will be executed by the 'userDiag' user."
echo "---------------------------------------------------------------------"
echo ""

# --- Phase 1: Login and Workspace Preparation ---
echo "--- Phase: Logging in as 'userDiag' and Preparing Workspace ---"
login userDiag pantload
delay 400

echo "Current User (expected: userDiag):"
whoami
echo "Current Path after login (expected: /home/userDiag):"
pwd
delay 400

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

# --- Phase 2: NEW - Parser/Lexer Robustness ---
echo ""
echo "===== Testing: Parser/Lexer Robustness (Quotes, Escapes, Errors) ====="
delay 400

echo "--- Test: Redirection with invalid/empty targets (Bug Fix Verification) ---"
check_fail "echo 'test' > ''"
check_fail "echo 'test' >"
check_fail "echo 'test' >> ''"
check_fail "echo 'test' >>"
check_fail ">"
check_fail ">>"
check_fail "> |"
delay 300

echo "--- Test: Filenames with spaces (Quoting) ---"
mkdir "a directory with spaces"
ls -l
touch "a directory with spaces/a file with spaces.txt"
ls "a directory with spaces"
echo "Quoted content" > "a directory with spaces/a file with spaces.txt"
cat "a directory with spaces/a file with spaces.txt"
rm -r -f "a directory with spaces"
delay 300

echo "--- Test: Filenames with escaped characters ---"
mkdir my\ test\ dir
ls
echo "Escaped content" > my\ test\ dir/escaped\ file.log
cat my\ test\ dir/escaped\ file.log
rm -r -f my\ test\ dir
delay 300

echo "--- Test: Complex echo with mixed quotes and escapes ---"
echo 'A string with "double quotes" inside single quotes' > mixed_quotes.txt
cat mixed_quotes.txt
echo "A string with 'single quotes' and an escaped \"double quote\"." >> mixed_quotes.txt
cat mixed_quotes.txt
rm -f mixed_quotes.txt
delay 300

echo "--- Test: Graceful handling of empty/multi-semicolon commands ---"
echo "Part 1";; echo "Part 2"
delay 700
echo "---------------------------------------------------------------------"


# --- Phase 3: Core File System Commands ---
echo ""
echo "===== Testing: Core File System (mkdir, touch, ls, pwd) ====="
echo "User: userDiag, CWD: /home/userDiag/diag_workspace"
delay 400

echo "--- Test: 'mkdir' basic, nested, and error cases ---"
mkdir my_dir
mkdir -p level1/level2/level3
ls -l .
ls -l level1
tree level1
delay 300
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

echo "--- Test: 'touch' functionality (creation, mtime, flags) ---"
touch new_file.txt; ls -l new_file.txt
delay 1600;
echo "Updating mtime of new_file.txt"
touch new_file.txt; ls -l new_file.txt
delay 1600;
echo "Testing 'touch -c' on existing file (mtime should still update)"
touch -c new_file.txt; ls -l new_file.txt
echo "Testing 'touch -c' on non-existent file (should NOT be created)"
touch -c non_existent_c.txt;
check_fail "ls non_existent_c.txt"
echo "Testing 'touch' with timestamp flags"
touch -t 2401151030 stamp_file.txt; ls -l stamp_file.txt; rm -f stamp_file.txt
touch --date "2023-07-04T12:00:00Z" date_file.txt; ls -l date_file.txt; rm -f date_file.txt
mkdir touch_dir; delay 1600; touch touch_dir; ls -l . | grep touch_dir; rm -r -f touch_dir
delay 700

echo "--- Test: 'ls' basic, hidden files, and errors ---"
mkdir empty_ls_dir; ls empty_ls_dir; rm -r -f empty_ls_dir
touch .hidden_file; mkdir .hidden_dir; ls; ls -a; rm -f .hidden_file; rm -r -f .hidden_dir
check_fail "ls non_existent_ls_dir"
delay 700

echo "--- Test: 'pwd' and 'cd' navigation & permissions ---"
pwd
cd level1/level2; pwd
cd ../..; pwd
touch file_for_cd_error.txt; check_fail "cd file_for_cd_error.txt"; rm -f file_for_cd_error.txt
mkdir no_exec_dir_cd; chmod 60 no_exec_dir_cd; check_fail "cd no_exec_dir_cd"; chmod 70 no_exec_dir_cd; rm -r -f no_exec_dir_cd
delay 700

echo "--- Test: Execute permission on script files ---"
echo 'echo "Execute bit test successful!"' > exec_test.sh
# Set to rw------- (60). Should not be executable.
chmod 60 exec_test.sh
check_fail "run ./exec_test.sh"
# Set to rwx------ (70). Should be executable.
chmod 70 exec_test.sh
run ./exec_test.sh
rm -f exec_test.sh
delay 700
echo "---------------------------------------------------------------------"

# --- Phase 4: File Content and Redirection ---
echo ""
echo "===== Testing: File Content (echo, cat, >, >>, |) ====="
delay 400

echo "--- Test: 'echo > file' (overwrite) & 'cat' ---"
echo "Hello OopisOS" > file_a.txt; cat file_a.txt
echo "New Content" > file_a.txt; cat file_a.txt
delay 400

echo "--- Test: 'echo >> file' (append) ---"
echo "Initial line" > file_b.txt; cat file_b.txt # Start with a clean file
echo "Appended line" >> file_b.txt; cat file_b.txt
delay 400

echo "--- Test: Append Redirection from Pipe ---"
echo "Piped append" | cat >> file_b.txt
cat file_b.txt # Should have three lines now
delay 400

echo "--- Test: 'cat' multiple files ---"
cat file_a.txt file_b.txt
delay 400

echo "--- Test: Piping and complex commands ---"
echo "Piped content" | cat
echo "L1\nL2\nL3\nL2" > pipe_src.txt
echo "--- Testing grep ---"; cat pipe_src.txt | grep "L2"
echo "--- Testing grep -v ---"; cat pipe_src.txt | grep -v "L1" | grep "L3"
echo "--- Testing grep -n (line numbers) ---"; cat pipe_src.txt | grep -n "L2"
echo "--- Testing grep -c (count) ---"; cat pipe_src.txt | grep -c "L2"
check_fail "cat pipe_src.txt | non_existent_pipe_cmd | cat"
cat pipe_src.txt | grep "L3" > pipe_out.txt; cat pipe_out.txt; rm -f pipe_out.txt
# New Test: Piping into a command that fails
check_fail "echo 'bad input' | check_fail 'echo this_should_succeed'"
rm -f pipe_src.txt
delay 700
echo "---------------------------------------------------------------------"

# --- Phase 5: Advanced 'ls' Flags ---
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
echo "--- ls -ld (list directory itself, long format) ---"; ls -ld . sub_ls
cd ../
rm -r -f ls_adv_dir
delay 700
echo "---------------------------------------------------------------------"

# --- Phase 6: File Permissions and User Switching ---
echo ""
echo "===== Testing: Permissions ('chmod', 'chown', Access Checks) ====="
echo "--- Setup: 'userDiag' creates a file for tests ---"
touch perm_file.txt;
echo "owner content (userDiag)" > perm_file.txt
ls -l perm_file.txt
delay 600

echo "--- Test: Verify 'userDiag' cannot move file to root-owned '/home' ---"
check_fail "mv perm_file.txt /home/"
delay 300

echo "--- Test: 'userDiag' makes its home and workspace world-traversable and writable ---"
cd .. # to /home/userDiag
chmod 75 .
chmod 77 diag_workspace
ls -ld . diag_workspace
cd diag_workspace # back to workspace
delay 600

echo "--- Test: Login as root to chown file to 'Guest' ---"
login root mcgoopis
cd /home/userDiag/diag_workspace
chown Guest perm_file.txt
ls -l perm_file.txt # Should now show 'Guest' as owner
logout # Return to Guest user
delay 300

echo "--- Test: As 'Guest' (new owner), set permissions and test cp -p ---"
whoami # Should be Guest now
cd /home/userDiag/diag_workspace
chmod 64 perm_file.txt
ls -l perm_file.txt
cp -p perm_file.txt perm_file_copy.txt
echo "Verifying 'cp -p' preserved ownership and mode:"
ls -l perm_file_copy.txt # Should be owned by Guest with mode 64
rm -f perm_file_copy.txt
delay 300

echo "--- Test: 'Guest' (owner, mode 64) can read and write ---"
cat perm_file.txt # Should succeed (Guest has read from 64)
echo 'Guest can write (mode 64)' >> perm_file.txt # Should succeed (Guest has write from 64)
cat perm_file.txt
check_fail "run ./perm_file.txt" # Not a script
delay 300

echo "--- Test: 'Guest' (owner, mode 64) changes mode to 44 (r--r--) ---"
chmod 44 perm_file.txt
ls -l perm_file.txt # Should now show mode 44 (r--r--)
delay 300

echo "--- Test: 'Guest' (owner, now mode 44) can read, but NOT write ---"
cat perm_file.txt # Should succeed
check_fail "echo 'Guest tries to write (mode 44)' >> perm_file.txt" # This should now FAIL as expected
delay 300

echo "--- Test: 'Guest' (owner, now mode 44) CANNOT chmod itself back to writable ---"
check_fail "chmod 70 perm_file.txt" # This should FAIL as expected.
ls -l perm_file.txt # Should still be mode 44
delay 300

echo "--- Test: 'root' steps in to allow Guest to write again (mode 70) ---"
login root mcgoopis
cd /home/userDiag/diag_workspace
chmod 70 perm_file.txt
ls -l perm_file.txt
logout
delay 300

echo "--- Test: Returning to 'userDiag' to restore secure permissions and clean up ---"
login userDiag pantload
cd /home/userDiag
chmod 70 .
chmod 70 diag_workspace
ls -ld . diag_workspace
cd diag_workspace
rm -f perm_file.txt
delay 700
echo "---------------------------------------------------------------------"

# --- Phase 7: Core Utilities (rm, cp, mv) ---
echo ""
echo "===== Testing: rm, cp, mv ====="
echo "--- Test: 'rm' on directory without -r flag ---"
mkdir rm_dir_no_r; check_fail "rm rm_dir_no_r"; rm -r -f rm_dir_no_r
delay 300
echo "--- Test: 'rm -rf' on a directory with contents ---"
mkdir rm_dir_r; touch rm_dir_r/f1; mkdir rm_dir_r/sub; touch rm_dir_r/sub/f2
rm -r -f rm_dir_r; check_fail "ls rm_dir_r"
delay 300

echo "--- Test: 'cp' file to file and into directory ---"
echo "cp_A" > cp_A.txt; cp cp_A.txt cp_C.txt;
mkdir cp_D; cp cp_A.txt cp_D; ls cp_D
delay 300

echo "--- Test: 'cp -r' directory to new directory ---"
mkdir cp_S; touch cp_S/s_file.txt; cp -r cp_S cp_S_copy; tree cp_S_copy
delay 300

echo "--- Test: 'cp' overwrite protections (no flags) ---"
touch cp_overwrite.txt
check_fail "cp cp_A.txt cp_overwrite.txt"
check_fail "cp cp_A.txt cp_A.txt" # Edge case: copy onto itself
delay 300

echo "--- Test: 'mv' file to file (rename) and into directory ---"
mv cp_A.txt mv_A.txt; ls mv_A.txt; check_fail "ls cp_A.txt"
mv mv_A.txt cp_D; ls cp_D/mv_A.txt
delay 300

echo "--- Test: 'mv' a directory ---"
mkdir mv_dir_src; mkdir mv_dir_dest
mv mv_dir_src mv_dir_dest
ls mv_dir_dest/mv_dir_src # Check if it was moved inside
delay 300

echo "--- Test: 'mv' overwrite protections (no flags) ---"
echo "content" > mv_dest.txt
echo "source" > mv_source.txt
check_fail "mv mv_source.txt mv_dest.txt"
delay 300

echo "--- Test: 'mv -f' to overwrite a file ---"
echo "original" > mv_target.txt
echo "source_f" > mv_source_f.txt
mv -f mv_source_f.txt mv_target.txt
cat mv_target.txt # Expected: "source_f"
check_fail "ls mv_source_f.txt"
delay 300

# Cleanup cp/mv
rm -rf cp_C.txt cp_D cp_S cp_S_copy cp_overwrite.txt mv_dir_dest mv_dest.txt mv_target.txt
delay 700
echo "---------------------------------------------------------------------"

# --- NEW PHASE ---
# --- Phase 8: Alias and Unalias Commands ---
echo ""
echo "===== Testing: Alias and Unalias Commands ====="
delay 400

echo "--- Test: Basic alias creation, listing, and execution ---"
alias l="ls"
alias la="ls -a"
echo "Listing all aliases:"
echo "Executing alias 'la':"
la
delay 300

echo "--- Test: Alias with arguments and overwriting ---"
alias ll="ls -l"
echo "Executing 'll' with an argument to list '/home':"
ll /home
echo "Overwriting alias 'll' to include the -a flag:"
alias ll="ls -la"
alias ll
echo "Executing overwritten 'll':"
ll
delay 300

echo "--- Test: Nested alias expansion ---"
alias list="ll"
echo "Executing nested alias 'list' (list -> ll -> ls -la):"
list
delay 300

echo "--- Test: unalias and error cases ---"
unalias l
check_fail "l"
echo "Verifying 'unalias' of a non-existent alias fails:"
check_fail "unalias no_such_alias"
echo "Verifying display of a non-existent alias fails:"
check_fail "alias no_such_alias"
delay 300

echo "--- Test: Alias loop detection (recursion) ---"
echo "Testing a two-alias loop:"
alias loop1="loop2"
alias loop2="loop1"
check_fail "loop1"
echo "Testing a self-referential loop:"
alias selfloop="selfloop -f"
check_fail "selfloop"
unalias loop1 loop2 selfloop
delay 300

echo "--- Test: Alias persistence across sessions ---"
alias persistent_alias="echo This alias survived a logout!"
logout # to Guest
login userDiag pantload
echo "Checking for persistent alias after re-login:"
persistent_alias
delay 300

echo "--- Alias Test Phase Cleanup ---"
unalias la ll list persistent_alias
echo "Final alias list (should be empty):"
alias
delay 700
echo "---------------------------------------------------------------------"


# --- Phase 9: 'find' command ---
echo ""
echo "===== Testing: 'find' Command (Expanded) ====="
# All commands in this phase are now relative to the CWD, set before Phase 8
cd /home/userDiag/diag_workspace
echo "Ensuring CWD is correct for find tests: "; pwd
echo "--- Setup for find ---"
mkdir find_root; cd find_root
echo "find_A" > fileA.txt
echo "find_B" > fileB.log
mkdir dir1;  echo "in_dir1" > dir1/fileC.txt; chmod 70 dir1/fileC.txt
mkdir dir2; echo "find_E" > dir2/fileE.txt; chmod 64 dir2/fileE.txt; chmod 75 dir2
touch -t 2301010000 fileA.txt
delay 1600
touch fileB.log

login root mcgoopis
cd /home/userDiag/diag_workspace/find_root
chown Guest dir2
logout

login userDiag pantload
cd /home/userDiag/diag_workspace/find_root
echo "Resuming find tests as user: "; whoami
pwd
ls -R -l
delay 400

echo "--- find . -name \"*.txt\" ---"; find . -name "*.txt"
echo "--- find . -type d ---"; find . -type d
echo "--- find . -user Guest ---"; find . -user Guest
echo "--- find . -perm 70 ---"; find . -perm 70
echo "--- find . -mtime -1 (modified less than 1 day ago) ---"; find . -mtime -1
echo "--- find . -mtime +30 (modified more than 30 days ago) ---"; find . -mtime +30
echo "--- find . -name \"*.txt\" -o -name \"*.log\" ---"; find . -name "*.txt" -o -name "*.log"
echo "--- find . -type f -not -name \"fileA.txt\" ---"; find . -type f -not -name "fileA.txt"
echo "--- find . -name \"fileA.txt\" -exec cat {} \; ---"; find . -name "fileA.txt" -exec cat {} \;
echo "--- find . -type f -delete ---"
find . -type f -delete
echo "After delete (files should be gone):"; find . -type f -print
cd .. 
delay 700
echo "---------------------------------------------------------------------"

# --- Phase 10: Scripting (`run`) ---
echo ""
echo "===== Testing: Scripting - 'run' Command ====="
cd /home/userDiag/diag_workspace
echo "Ensuring CWD is correct for scripting tests: "; pwd
echo "--- Test: Basic Script Execution & Permissions ---"
echo "echo \"Basic script ran\"" > run_basic.sh;
check_fail "run ./run_basic.sh"
chmod 70 run_basic.sh;
run ./run_basic.sh
delay 300

echo "--- Test: Script with Argument Passing ---"
echo 'echo "All=$@"' > run_args.sh
echo 'echo "Count=$#"' >> run_args.sh
chmod 70 run_args.sh;
run ./run_args.sh first "second arg" third
delay 300

echo "--- Test: Running script via absolute path ---"
echo "echo \"Absolute path script!\"" > run_abs.sh
chmod 70 run_abs.sh
run /home/userDiag/diag_workspace/run_abs.sh
delay 300

echo "--- Test: Script that fails mid-execution ---"
echo 'echo "Part 1 of failing script will run."' > run_fail.sh
echo "cd /non_existent_directory_for_failure" >> run_fail.sh
echo 'echo "Part 2 of failing script SHOULD NOT RUN."' >> run_fail.sh
chmod 70 run_fail.sh
check_fail "run ./run_fail.sh"
delay 300

# Cleanup scripting tests
rm -f run_basic.sh run_args.sh run_abs.sh run_fail.sh
delay 700
echo "---------------------------------------------------------------------"

# --- Phase 11: Background Processes ---
echo ""
echo "===== Testing: Background Processes (&) ====="
echo "--- Test: Running a delay in the background ---"
echo "Starting background job, terminal should remain interactive..."
delay 2000 &
echo "This message should appear immediately after starting the background job."
delay 2500 # Wait for the background job to finish
echo "--- Background process test complete ---"
delay 700
echo "---------------------------------------------------------------------"


# --- Final Cleanup Phase ---
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
echo "===== OopisOS Core Test Suite Complete (v2.3.9) ======="
echo " "
delay 500
echo "  ======================================================"
delay 150
echo "  ==                                                  =="
delay 150
echo "  ==      OopisOS Core Diagnostics - v2.3.9           =="
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
