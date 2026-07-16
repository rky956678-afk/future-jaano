@echo off
cd /d "C:\Users\Dell\Documents\GitHub\future-jaano"

if exist ".git\index.lock" del /f ".git\index.lock"

git add lib/api-client-react/nixpacks.toml
git add lib/api-client-react/railway.toml
git add lib/api-zod/nixpacks.toml
git add lib/api-zod/railway.toml
git add lib/db/nixpacks.toml
git add lib/db/railway.toml
git add lib/api-spec/nixpacks.toml
git add lib/api-spec/railway.toml

git commit -m "fix: remove pnpm from lib services - use node server.mjs directly (no deps)"

git push origin main

echo.
echo Done! Press any key to close.
pause
