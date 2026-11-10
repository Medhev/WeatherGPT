#!/usr/bin/env bash
set -e
echo "Starting WeatherGPT Frontend..."
cd "$(dirname "$0")/../frontend"
npm run dev
