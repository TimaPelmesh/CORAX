# Writes «Заявка CORAX.url» on the desktop with /h#pc=<this hostname>.
# Works on Windows 7+ (PowerShell 2). Called from corax_run.cmd.
$ErrorActionPreference = 'SilentlyContinue'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$cfgPath = Join-Path $here 'agent.json'
$server = ''
$raw = ''
if (Test-Path -LiteralPath $cfgPath) {
    try { $raw = [System.IO.File]::ReadAllText($cfgPath) } catch { $raw = '' }
}
if ($raw -match '"helpdesk_shortcut"\s*:\s*false') { exit 0 }
if ($raw -match '"server_url"\s*:\s*"([^"]+)"') { $server = $Matches[1] }
if (-not $server -or $server.Trim().Length -eq 0) { exit 0 }

$hostName = ''
if ($env:COMPUTERNAME) { $hostName = $env:COMPUTERNAME.Trim() }
if (-not $hostName -or $hostName -eq 'unknown-host') { exit 0 }

$base = $server.TrimEnd('/')
$pc = [uri]::EscapeDataString($hostName)
$url = $base + '/h#pc=' + $pc
$nl = "`r`n"
$body = '[InternetShortcut]' + $nl + 'URL=' + $url + $nl
$icon = Join-Path $here 'CORAX-Agent.exe'
if (Test-Path -LiteralPath $icon) {
    $body += 'IconFile=' + $icon + $nl + 'IconIndex=0' + $nl
}

$name = 'Заявка CORAX.url'
$dirs = @()
try {
    $pub = [Environment]::GetFolderPath('CommonDesktopDirectory')
    if ($pub) { $dirs += $pub }
} catch { }
$who = [string]$env:USERNAME
$isSvc = $false
if ($who -eq 'SYSTEM' -or $who -eq 'LOCAL SERVICE' -or $who -eq 'NETWORK SERVICE') { $isSvc = $true }
if (-not $isSvc) {
    try {
        $userDesk = [Environment]::GetFolderPath('Desktop')
        if ($userDesk) { $dirs += $userDesk }
    } catch { }
} else {
    $usersRoot = 'C:\Users'
    try { if ($env:PUBLIC) { $usersRoot = Split-Path -Parent $env:PUBLIC } } catch { }
    try {
        Get-ChildItem -Path $usersRoot -ErrorAction SilentlyContinue | Where-Object { $_.PSIsContainer } | ForEach-Object {
            $n = $_.Name
            if ($n -eq 'Public' -or $n -eq 'Default' -or $n -eq 'Default User' -or $n -eq 'All Users') { return }
            $d = Join-Path $_.FullName 'Desktop'
            if (Test-Path $d) { $dirs += $d }
        }
    } catch { }
}

$utf8 = New-Object System.Text.UTF8Encoding $false
foreach ($d in $dirs) {
    try {
        [System.IO.File]::WriteAllText((Join-Path $d $name), $body, $utf8)
    } catch { }
}
exit 0
