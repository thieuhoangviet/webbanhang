# Auto-Commit & Push to GitHub
# Script theo dõi thay đổi file và tự động commit + push lên GitHub
# Cách dùng: .\auto-commit.ps1

$projectPath = $PSScriptRoot
$debounceMs = 5000      # Chờ 5 giây sau lần thay đổi cuối trước khi commit
$branch = "main"        # Branch cần push

Write-Host "======================================" -ForegroundColor Cyan
Write-Host " Auto-Commit GitHub Watcher" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Đang theo dõi: $projectPath" -ForegroundColor Green
Write-Host "Nhấn Ctrl+C để dừng`n" -ForegroundColor Yellow

# Kiểm tra remote
$remote = git -C $projectPath remote -v
if (-not $remote) {
    Write-Host "CẢNH BÁO: Chưa có git remote!" -ForegroundColor Red
    Write-Host "Hãy thêm remote bằng lệnh:" -ForegroundColor Yellow
    Write-Host "  git remote add origin https://github.com/USERNAME/REPO.git" -ForegroundColor White
    Write-Host ""
}

# FileSystemWatcher theo dõi toàn bộ project (trừ thư mục loại trừ)
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $projectPath
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite -bor [System.IO.NotifyFilters]::FileName

$global:timer = $null
$global:pendingChange = $false

function Invoke-AutoCommit {
    Set-Location $projectPath

    # Lấy danh sách file thay đổi
    $status = git status --short
    if (-not $status) {
        return
    }

    Write-Host "`n[$(Get-Date -Format 'HH:mm:ss')] Phát hiện thay đổi:" -ForegroundColor Cyan
    Write-Host $status -ForegroundColor Gray

    # Tạo commit message tự động
    $changedFiles = (git diff --cached --name-only; git diff --name-only; git ls-files --others --exclude-standard) |
        Where-Object { $_ -ne "" } |
        Select-Object -First 3
    $fileList = ($changedFiles -join ", ")
    if ($fileList.Length -gt 60) { $fileList = $fileList.Substring(0, 57) + "..." }
    $commitMsg = "auto: update $fileList [$(Get-Date -Format 'yyyy-MM-dd HH:mm')]"

    # Git add, commit, push
    git add -A
    git commit -m $commitMsg
    $pushResult = git push origin $branch 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[✓] Đã commit và push thành công!" -ForegroundColor Green
        Write-Host "    Message: $commitMsg" -ForegroundColor Gray
    } else {
        Write-Host "[✗] Push thất bại:" -ForegroundColor Red
        Write-Host $pushResult -ForegroundColor Red
    }
}

function Start-DebounceTimer {
    # Hủy timer cũ nếu còn
    if ($global:timer) {
        $global:timer.Stop()
        $global:timer.Dispose()
    }

    $global:timer = New-Object System.Timers.Timer
    $global:timer.Interval = $debounceMs
    $global:timer.AutoReset = $false

    Register-ObjectEvent -InputObject $global:timer -EventName Elapsed -Action {
        Invoke-AutoCommit
    } | Out-Null

    $global:timer.Start()
}

# Bỏ qua các thư mục không cần theo dõi
$ignoredPaths = @(".git", "target", "node_modules", ".mvn", "uploads", "__pycache__")

$action = {
    $path = $Event.SourceEventArgs.FullPath
    $name = $Event.SourceEventArgs.Name

    # Kiểm tra path có trong danh sách bỏ qua không
    foreach ($ignored in $ignoredPaths) {
        if ($name -like "*$ignored*") { return }
    }

    Write-Host "." -NoNewline -ForegroundColor DarkGray
    Start-DebounceTimer
}

Register-ObjectEvent $watcher "Changed" -Action $action | Out-Null
Register-ObjectEvent $watcher "Created" -Action $action | Out-Null
Register-ObjectEvent $watcher "Deleted" -Action $action | Out-Null
Register-ObjectEvent $watcher "Renamed" -Action $action | Out-Null

# Giữ script chạy
Write-Host "Đang theo dõi thay đổi (debounce: ${debounceMs}ms)..." -ForegroundColor Gray
try {
    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Write-Host "`nĐã dừng theo dõi." -ForegroundColor Yellow
}
