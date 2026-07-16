@echo off
cd /d "C:\Users\Dell\Documents\GitHub\future-jaano"
if exist ".git\index.lock" del /f ".git\index.lock"
git add nixpacks.toml
git commit -m "fix: root nixpacks.toml - skip pnpm, run api-client-react server directly"
git push origin main
echo.
echo Done! Press any key to close.
pause
