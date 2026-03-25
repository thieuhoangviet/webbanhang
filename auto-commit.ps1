# Auto-Commit & Push to GitHub
# Theo doi thay doi file va tu dong commit + push len GitHub

$projectPath = $PSScriptRoot
$debounceSeconds = 5
$branch = "master"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " Auto-Commit GitHub Watcher" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Dang theo doi: $projectPath" -ForegroundColor Green
Write-Host "Nhan Ctrl+C de dung`n" -ForegroundColor Yellow

# Danh sach thu muc bo qua
$ignoredDirs = @(".git", "target", "node_modules", "uploads", ".mvn")

function Should-Ignore($path) {
    foreach ($dir in $ignoredDirs) {
        if ($path -like "*\$dir\*" -or $path -like "*\$dir") {
            return $true
        }
    }
    return $false
}

function Invoke-AutoCommit {
    Set-Location $projectPath
    
    $status = git status --short 2>&1
    if (-not $status -or $status.Count -eq 0) { return }

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    $commitMsg = "auto: update [$timestamp]"

    Write-Host "`n[$((Get-Date).ToString('HH:mm:ss'))] Phat hien thay doi - dang commit..." -ForegroundColor Cyan
    
    git add -A 2>&1 | Out-Null
    git commit -m $commitMsg 2>&1 | Out-Null
    
    $pushOutput = git push origin $branch 2>&1
    
    if ($LASTEXITCODE -eq 0 -or ($pushOutput -match "master")) {
        Write-Host "[OK] Da commit va push: $commitMsg" -ForegroundColor Green
    } else {
        Write-Host "[!] Push that bai: $pushOutput" -ForegroundColor Red
    }
}

# Tao FileSystemWatcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $projectPath
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite -bor [System.IO.NotifyFilters]::FileName

$global:lastChange = [DateTime]::MinValue
$global:debounceSeconds = $debounceSeconds

# Xu ly su kien thay doi file
$onChange = {
    $fullPath = $Event.SourceEventArgs.FullPath
    
    # Bo qua cac thu muc khong can thiet
    $ignoredDirs = @(".git", "target", "node_modules", "uploads", ".mvn")
    foreach ($dir in $ignoredDirs) {
        if ($fullPath -like "*\$dir\*") { return }
    }
    
    $global:lastChange = [DateTime]::Now
    Write-Host "." -NoNewline -ForegroundColor DarkGray
}

Register-ObjectEvent $watcher "Changed" -Action $onChange | Out-Null
Register-ObjectEvent $watcher "Created" -Action $onChange | Out-Null
Register-ObjectEvent $watcher "Deleted" -Action $onChange | Out-Null

Write-Host "Dang theo doi thay doi (debounce: ${debounceSeconds}s)..." -ForegroundColor Gray

# Vong lap chinh - kiem tra debounce va commit
try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        if ($global:lastChange -ne [DateTime]::MinValue) {
            $elapsed = ([DateTime]::Now - $global:lastChange).TotalSeconds
            if ($elapsed -ge $global:debounceSeconds) {
                $global:lastChange = [DateTime]::MinValue
                Invoke-AutoCommit
            }
        }
    }
} finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Write-Host "`nDa dung theo doi." -ForegroundColor Yellow
}
