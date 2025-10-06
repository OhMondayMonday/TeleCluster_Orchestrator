# Start Both Backend and Frontend
Write-Host "🚀 TeleCluster Orchestrator - Full Stack Startup" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

$currentPath = Get-Location

# Start Backend in new terminal
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$currentPath'; .\start-backend.ps1"

# Wait a moment for backend to start
Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start Frontend in new terminal
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$currentPath'; .\start-frontend.ps1"

Write-Host ""
Write-Host "✅ Both servers are starting in separate terminals!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "📍 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📖 API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "🔐 Login:    http://localhost:3000/login" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Test Accounts (password: 'password'):" -ForegroundColor Yellow
Write-Host "   👨‍💼 Admin:    admin@pucp.edu.pe" -ForegroundColor White
Write-Host "   👨‍🏫 Profesor: profesor@pucp.edu.pe" -ForegroundColor White
Write-Host "   👨‍🎓 Alumno:   alumno@pucp.edu.pe" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
