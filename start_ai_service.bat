@echo off
setlocal
set "HF_ENDPOINT=https://hf-mirror.com"
echo Starting AI Match Service on port 5001...
cd /d "%~dp0ai_service"
.venv\Scripts\python app.py
