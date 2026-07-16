@echo off
cd /d "C:\Users\Dell\Documents\GitHub\future-jaano"
if exist ".git\index.lock" del /f ".git\index.lock"
git add railway.toml
git commit -m "fix: add root railway.toml - bypass pnpm install for api-client-react"
git push origin main
echo.
echo Done! Press any key to close.
pause
