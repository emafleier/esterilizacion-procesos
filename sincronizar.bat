@echo off
setlocal EnableDelayedExpansion
cd /d "C:\Users\Ipam Pc\Desktop\ESTERILIZACION"

echo.
echo ================================================
echo   CEyE Map ^| Sincronizar con GitHub
echo ================================================
echo.

:: 1. Descargar cambios remotos
echo [1/3] Obteniendo cambios de GitHub...
git pull origin main
if errorlevel 1 (
    echo.
    echo ERROR: No se pudieron obtener los cambios remotos.
    pause
    exit /b 1
)

:: 2. Confirmar cambios locales si los hay
git add .
git diff --cached --quiet
if errorlevel 1 (
    echo.
    echo [2/3] Confirmando cambios locales...
    for /f "tokens=1-3 delims=/" %%a in ("%date:~0,10%") do set FECHA=%%c-%%a-%%b
    for /f "tokens=1-2 delims=:." %%a in ("%time: =0%") do set HORA=%%a-%%b
    git commit -m "Actualizacion !FECHA! !HORA!"
) else (
    echo [2/3] Sin cambios nuevos para confirmar.
)

:: 3. Subir cambios
echo.
echo [3/3] Subiendo cambios a GitHub...
git push origin main
if errorlevel 1 (
    echo.
    echo ERROR: No se pudieron subir los cambios.
    pause
    exit /b 1
)

echo.
echo ================================================
echo   Sincronizacion completada!
echo   El sitio se actualiza en ~1 minuto.
echo   https://emafleier.github.io/esterilizacion-procesos
echo ================================================
echo.
pause
