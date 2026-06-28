@echo off
cd /d "C:\Users\Dell\Documents\GitHub\future-jaano"

echo Removing git index lock if present...
if exist ".git\index.lock" del /f ".git\index.lock"

echo Adding files...
git add lib/api-client-react/nixpacks.toml
git add lib/api-zod/nixpacks.toml
git add lib/db/nixpacks.toml
git add lib/api-spec/nixpacks.toml
git add lib/api-spec/railway.toml
git add artifacts/mockup-sandbox/nixpacks.toml
git add artifacts/mockup-sandbox/railway.toml

echo Committing...
git commit -m "fix: add [start] to all lib nixpacks.toml, add configs for mockup-sandbox and api-spec"

echo Pushing...
git push origin main

echo.
echo Done! Press any key to close.
pause
