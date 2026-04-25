# Load FORMULIX_DB_* from azure.env into the current PowerShell process only.
# Usage (from repo root):  . .\scripts\Apply-AzureEnv.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root 'azure.env'

if (-not (Test-Path $envFile)) {
    Write-Warning "Missing: $envFile"
    Write-Host "Copy azure.env.example to azure.env and fill server, user, password."
    exit 1
}

$count = 0
Get-Content $envFile -Encoding UTF8 | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq '' -or $line.StartsWith('#')) { return }
    $i = $line.IndexOf('=')
    if ($i -lt 1) { return }
    $name = $line.Substring(0, $i).Trim()
    $value = $line.Substring($i + 1).Trim()
    if ($name -eq '') { return }
    [Environment]::SetEnvironmentVariable($name, $value, 'Process')
    $count++
}

Write-Host "Loaded $count variables from azure.env (current process only)."
Write-Host "Azure SQL: add client IP under Networking / Firewall if connection fails."
