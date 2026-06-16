Get-NetTCPConnection | Where-Object { $_.LocalPort -eq 3005 -and $_.State -eq 'Listen' } | ForEach-Object {
  Write-Host "Killing PID $($_.OwningProcess)"
  Stop-Process -Id $_.OwningProcess -Force
}
