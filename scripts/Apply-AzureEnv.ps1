# טוען משתני FORMULIX_DB_* מקובץ azure.env לתוך תהליך PowerShell הנוכחי בלבד.
# שימוש: מתוך תיקיית שורש הפרויקט (איפה ש-azure.env):  . .\scripts\Apply-AzureEnv.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root 'azure.env'

if (-not (Test-Path $envFile)) {
    Write-Warning "לא נמצא $envFile"
    Write-Host "העתיקי azure.env.example ל-azure.env, מלאי שרת/משתמש/סיסמה, והריצי שוב."
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

Write-Host "נטענו $count משתני סביבה מ-azure.env (סשן נוכחי בלבד)."
Write-Host "ודאי: Azure SQL → Networking → Firewall rule ל-IP של המחשב."
