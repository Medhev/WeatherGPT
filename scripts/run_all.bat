@echo off
echo ========================================================
echo   WeatherGPT: MoES & IMD Climate Intelligence Platform
echo ========================================================
echo Starting Backend and Frontend simultaneously...

start "WeatherGPT Backend" cmd /k "%~dp0run_backend.bat"
start "WeatherGPT Frontend" cmd /k "%~dp0run_frontend.bat"

echo.
echo Both servers initiated!
echo Backend Swagger API Docs: http://127.0.0.1:8000/docs
echo Frontend Web Dashboard:   http://localhost:5173
echo.
