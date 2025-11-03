# Quick script to update Supabase Service Role Key
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔑 Update Supabase Service Role Key" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Instructions:" -ForegroundColor Yellow
Write-Host "1. Go to: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "2. Select your project" -ForegroundColor White
Write-Host "3. Settings → API" -ForegroundColor White
Write-Host "4. Copy the 'service_role' key (click 👁️ to reveal)" -ForegroundColor White
Write-Host ""

$key = Read-Host "Paste your Service Role Key here"

if ($key -match "^eyJ") {
    Write-Host ""
    Write-Host "✅ Key looks valid (starts with eyJ)" -ForegroundColor Green
    
    # Update .env file
    $envPath = Join-Path $PSScriptRoot ".env"
    $content = Get-Content $envPath -Raw
    $content = $content -replace 'SUPABASE_SERVICE_ROLE_KEY=.*', "SUPABASE_SERVICE_ROLE_KEY=$key"
    $content | Set-Content $envPath -NoNewline
    
    Write-Host "✅ .env file updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Test connection: node test-admin-login.js" -ForegroundColor White
    Write-Host "2. Start server: node server.js" -ForegroundColor White
    Write-Host "3. Login at: http://localhost:3001/login" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Invalid key format. Should start with 'eyJ'" -ForegroundColor Red
    Write-Host "Please try again." -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""










