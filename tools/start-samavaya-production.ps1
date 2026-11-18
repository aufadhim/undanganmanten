$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..\backend')

$env:NODE_ENV = 'production'
$env:SERVE_FRONTEND = 'true'
$env:FRONTEND_URL = 'https://samavaya.web.id'
$env:BACKEND_URL = 'https://samavaya.web.id'
$env:PORT = '4080'

& node.exe src/config/syncTemplateRegistry.cjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& node.exe src/server.js
exit $LASTEXITCODE
