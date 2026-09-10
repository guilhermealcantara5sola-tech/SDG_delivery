@echo off
title SDG Delivery - Servidor de Impressao Elgin i8
cls
echo ====================================================================
echo   SDG DELIVERY - SERVIDOR DE IMPRESSAO TERMICA ELGIN i8
echo ====================================================================
echo   IP da Impressora: 192.168.1.150
echo   Porta RAW ESC/POS: 9100
echo   Porta do Servidor Local: 3001
echo ====================================================================
echo.
echo Iniciando servidor de impressao...
node printer-server.js
pause
