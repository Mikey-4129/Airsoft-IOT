$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "Auto-sync: $timestamp"

Write-Host "Starting Git sync at $timestamp..." -ForegroundColor Cyan

# Git komutlarını çalıştır
& "C:\Program Files\Git\cmd\git.exe" add .
$commitResult = & "C:\Program Files\Git\cmd\git.exe" commit -m $commitMessage
if ($LASTEXITCODE -eq 0) {
    & "C:\Program Files\Git\cmd\git.exe" push
    Write-Host "Sync completed successfully!" -ForegroundColor Green
} else {
    Write-Host "No changes to commit or commit failed." -ForegroundColor Yellow
}
