Set objShell = CreateObject("WScript.Shell")
strPath = "c:\Users\Nuelthewave\Desktop\NT PR\nextellar-docs"
objShell.CurrentDirectory = strPath

' Change to repo directory
objShell.Run "cmd /c cd " & Chr(34) & strPath & Chr(34), 0, False

' Stage the file
WScript.Echo "Staging file..."
objShell.Run "cmd /c cd " & Chr(34) & strPath & Chr(34) & " && git add docs/guides/contributing.mdx", 0, False

' Create commit with message file
WScript.Echo "Creating commit..."
objShell.Run "cmd /c cd " & Chr(34) & strPath & Chr(34) & " && git commit -F COMMIT_MSG.txt", 0, False

' Push to remote
WScript.Echo "Pushing to remote..."
objShell.Run "cmd /c cd " & Chr(34) & strPath & Chr(34) & " && git push -u origin docs/contributing-validators", 0, False

WScript.Echo "Complete!"
