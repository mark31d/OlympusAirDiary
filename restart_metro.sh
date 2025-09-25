#!/bin/bash
echo "Stopping Metro bundler..."
pkill -f "react-native start" || true
sleep 2
echo "Starting Metro bundler with reset cache..."
cd /Users/oksanamatveyeva/Documents/Project/OlympusAirDiary/OlympusAirDiary
npx react-native start --reset-cache
