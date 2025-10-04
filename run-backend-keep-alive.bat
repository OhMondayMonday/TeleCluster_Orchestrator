@echo off
title Backend - TeleCluster
cd /d "C:\Users\ASUS\OneDrive\Escritorio\TeleCluster_Orchestrator\backend"
echo ================================
echo  Backend TeleCluster
echo ================================
echo.
echo Iniciando servidor en puerto 8000...
echo.
node server.js
echo.
echo Servidor detenido. Presiona cualquier tecla para cerrar...
pause