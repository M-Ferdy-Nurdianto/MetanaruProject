@echo off
title Running METANARU Project
echo Starting METANARU Server...
start cmd /k "cd /d %~dp0server && npm run dev"
echo Starting METANARU Client...
start cmd /k "cd /d %~dp0client && npm run dev"
echo Project is starting in separate windows.
pause
