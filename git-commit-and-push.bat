@echo off
cd /d "c:\Users\Nuelthewave\Desktop\NT PR\nextellar-docs"

echo Creating branch docs/frontmatter-audit...
git checkout -b docs/frontmatter-audit

echo.
echo Staging files...
git add -A

echo.
echo Committing changes...
git commit -m "docs: add frontmatter audit infrastructure for issue #1163"

echo.
echo Pushing to remote...
git push -u origin docs/frontmatter-audit

echo.
echo Done!
pause
