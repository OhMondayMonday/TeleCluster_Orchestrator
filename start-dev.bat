@echo off
echo ================================
echo  TeleCluster Orchestrator
echo ================================
echo.
echo Iniciando Backend y Frontend...
echo.

echo [1/2] Iniciando Backend (Puerto 8000)...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo [2/2] Iniciando Frontend (Puerto 3000)...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ================================
echo  Servicios iniciados:
echo  - Backend:  http://localhost:8000
echo  - Frontend: http://localhost:3000
echo ================================
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul