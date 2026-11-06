#Requires -Version 5.1
[CmdletBinding()]
param(
    [switch]$SetupOnly,
    [switch]$ReinstallDependencies
)

$ErrorActionPreference = 'Stop'

function Invoke-Checked {
    param([string]$FilePath, [string[]]$Arguments)
    & $FilePath @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "A setup command failed (exit $LASTEXITCODE). Fix the error printed above and run this script again."
    }
}

function Test-AvailablePort {
    param([int]$Port)
    $listener = New-Object System.Net.Sockets.TcpListener -ArgumentList ([System.Net.IPAddress]::Loopback), $Port
    try { $listener.Start() }
    catch { throw "Port $Port is already in use or unavailable. Stop the other server with Ctrl+C, then try again." }
    finally { $listener.Stop() }
}

Push-Location -LiteralPath $PSScriptRoot
try {
    if (-not $SetupOnly) { Test-AvailablePort -Port 3000 }
    $node = Get-Command node.exe -ErrorAction SilentlyContinue
    $npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if (-not $node -or -not $npm) { throw 'Node.js and npm were not found. Install Node.js LTS (24 or newer), reopen PowerShell, and try again.' }
    $nodeVersion = & $node.Source --version
    if ($LASTEXITCODE -ne 0) { throw 'Could not read the Node.js version. Reinstall Node.js LTS.' }
    $versionMatch = [regex]::Match([string]$nodeVersion, '^v(\d+)\.')
    if (-not $versionMatch.Success) { throw 'Unexpected Node.js version output. Reinstall Node.js LTS.' }
    if ([int]$versionMatch.Groups[1].Value -lt 24) { throw 'Use Node.js 24 LTS or a newer LTS version for this project.' }

    if (-not (Test-Path -LiteralPath '.env.local')) {
        Copy-Item -LiteralPath '.env.example' -Destination '.env.local'
        Write-Host 'Created .env.local from the local development template.' -ForegroundColor Cyan
    }
    $manifestHash = (Get-FileHash -LiteralPath 'package.json' -Algorithm SHA256).Hash
    $lockHash = (Get-FileHash -LiteralPath 'package-lock.json' -Algorithm SHA256).Hash
    $fingerprint = "$manifestHash|$lockHash|$nodeVersion"
    $marker = Join-Path $PSScriptRoot 'node_modules\.marketpilot-install.sha256'
    $savedFingerprint = ''
    if (Test-Path -LiteralPath $marker) { $savedFingerprint = [string](Get-Content -LiteralPath $marker -Raw) }
    $nextCommand = Join-Path $PSScriptRoot 'node_modules\.bin\next.cmd'
    if ($ReinstallDependencies -or -not (Test-Path -LiteralPath $nextCommand) -or $savedFingerprint.Trim() -ne $fingerprint) {
        Write-Host 'Installing UI dependencies. The first run needs internet access...' -ForegroundColor Cyan
        Invoke-Checked -FilePath $npm.Source -Arguments @('ci', '--no-fund')
        Set-Content -LiteralPath $marker -Value $fingerprint -Encoding ASCII
    }

    if ($SetupOnly) {
        Write-Host 'UI setup complete. No server was started.' -ForegroundColor Green
    } else {
        try {
            $null = Invoke-WebRequest -Uri 'http://localhost:8000/api/v1/ready' -UseBasicParsing -TimeoutSec 2
        } catch {
            Write-Host 'Backend is not ready yet. Run Start-Backend.ps1 in another PowerShell window.' -ForegroundColor Yellow
        }
        Write-Host 'Starting UI. Open http://localhost:3000/signup once Next.js says Ready.' -ForegroundColor Green
        Write-Host 'Keep this window open. Press Ctrl+C to stop.'
        & $npm.Source run dev -- --hostname 127.0.0.1 --port 3000
        if ($LASTEXITCODE -notin @(0, 130, -1073741510)) { throw "UI exited with code $LASTEXITCODE. Review the server error above." }
    }
} catch {
    Write-Host ("ERROR: " + $_.Exception.Message) -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
