@echo off
echo Parando servidor anterior...
taskkill /f /im python.exe 2>nul
echo.
echo Iniciando Django com ASGI (WebSocket)...
python -m daphne -b 0.0.0.0 -p 8000 SiteTeste.asgi:application
pause