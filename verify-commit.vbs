Set objShell = CreateObject("WScript.Shell")
Set objExec = objShell.Exec("cmd /c cd c:\Users\Nuelthewave\Desktop\NT PR\nextellar-docs && git log --oneline -1")
strOutput = objExec.StdOut.ReadAll()
WScript.Echo "Latest commit:" & vbCrLf & strOutput

Set objExec = objShell.Exec("cmd /c cd c:\Users\Nuelthewave\Desktop\NT PR\nextellar-docs && git status")
strStatus = objExec.StdOut.ReadAll()
WScript.Echo "Git status:" & vbCrLf & strStatus
