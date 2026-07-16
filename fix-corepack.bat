@echo off
cd /d "C:\Users\Dell\Documents\GitHub\future-jaano"
if exist ".git\index.lock" del /f ".git\index.lock"

git add nixpacks.toml
git add railway.toml
git add artifacts/api-server/nixpacks.toml
git add artifacts/api-server/railway.toml
git add artifacts/future-jaano/nixpacks.toml
git add artifacts/future-jaano/railway.toml
git add artifacts/mockup-sandbox/nixpacks.toml
git add artifacts/mockup-sandbox/railway.toml
git add lib/api-client-react/nixpacks.toml
git add lib/api-client-react/railway.toml
git add lib/api-zod/nixpacks.toml
git add lib/api-zod/railway.toml
git add lib/db/nixpacks.toml
git add lib/db/railway.toml
git add lib/api-spec/nixpacks.toml
git add lib/api-spec/railway.toml

git commit -m "fix: enable Corepack + pnpm@9.15.4 in all nixpacks.toml before install, Node 22"

git push origin main

echo.
echo Done! Press any key to close.
pause
