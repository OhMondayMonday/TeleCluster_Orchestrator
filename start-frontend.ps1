# Start Frontend
Write-Host "🚀 Starting Frontend Development Server..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location frontend

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "✅ Dependencies found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Dependencies not found. Installing..." -ForegroundColor Yellow
    pnpm install
}

Write-Host ""
Write-Host "🔥 Starting Next.js server on http://localhost:3000" -ForegroundColor Green
Write-Host "🔐 Login page: http://localhost:3000/login" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

pnpm dev
