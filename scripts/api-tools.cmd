@echo off
setlocal ENABLEDELAYEDEXPANSION

REM API tools for Windows (cmd.exe)
REM Usage: api-tools cmd where cmd is one of: regen, smoke, env

if "%1"=="regen" goto :regen
if "%1"=="smoke" goto :smoke
if "%1"=="env" goto :env

:help
echo Usage: api-tools ^<regen^|smoke^|env^>
exit /b 1

:regen
echo [regen] Generating API docs: proxy-map, proxy-map-with-roles, roles-matrix...
npx tsx scripts\generateApiMap.ts || exit /b 1
npx tsx scripts\generateApiProxyRoles.ts || exit /b 1
npx tsx scripts\generateRoleMatrix.ts || exit /b 1
echo [regen] Done.
exit /b 0

:smoke
echo [smoke] GET /api/test-wp
curl -s -i http://localhost:3000/api/test-wp | findstr /R "HTTP/1.1 2.. HTTP/1.1 3.." || echo (non-2xx)

echo [smoke] GET /api/wp/posts?per_page=1
curl -s -i "http://localhost:3000/api/wp/posts?per_page=1" | findstr /R "HTTP/1.1 2.. HTTP/1.1 3.." || echo (non-2xx)

echo [smoke] GET /api/analytics/summary
curl -s -i http://localhost:3000/api/analytics/summary | findstr /R "HTTP/1.1 2.. HTTP/1.1 3.." || echo (non-2xx)
echo [smoke] Done.
exit /b 0

:env
echo [env] Validating required environment variables...
node scripts\validateEnv.js
exit /b %ERRORLEVEL%
