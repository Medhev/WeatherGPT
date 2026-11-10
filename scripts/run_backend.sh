#!/usr/bin/env bash
set -e
echo "Starting WeatherGPT Backend..."
cd "$(dirname "$0")/../backend"
if [ -d "venv" ]; then
    source venv/bin/activate
fi
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
