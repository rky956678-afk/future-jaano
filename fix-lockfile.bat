@echo off
cd /d "C:\Users\Dell\Documents\GitHub\future-jaano"
echo Running pnpm install to regenerate lockfile...
pnpm install --no-frozen-lockfile
echo.
echo Done! Press any key to close.
pause
