#!/usr/bin/env python3
import subprocess
import os

os.chdir(r'c:\Users\Nuelthewave\Desktop\NT PR\nextellar-docs')

print("=" * 60)
print("VERIFICATION: Git Commit and Push")
print("=" * 60)

# Check latest commit
print("\n1. Latest Commit:")
print("-" * 60)
result = subprocess.run(['git', 'log', '--oneline', '-1'], capture_output=True, text=True)
print(result.stdout)

# Check git status
print("\n2. Git Status:")
print("-" * 60)
result = subprocess.run(['git', 'status'], capture_output=True, text=True)
print(result.stdout)

# Check branch
print("\n3. Current Branch:")
print("-" * 60)
result = subprocess.run(['git', 'branch', '-vv'], capture_output=True, text=True)
print(result.stdout)

print("\n" + "=" * 60)
print("VERIFICATION COMPLETE")
print("=" * 60)
