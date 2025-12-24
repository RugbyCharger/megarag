#!/bin/bash

# MegaRAG Launcher
# Opens Terminal and starts the MegaRAG server

PROJECT_DIR="/Users/grantcharge/Projects/megarag"
URL="http://localhost:3000"

# Open Terminal and run the server
osascript -e "tell application \"Terminal\"
    activate
    do script \"cd '$PROJECT_DIR' && echo '🚀 Starting MegaRAG...' && echo 'Server: $URL' && echo '' && npm start\"
end tell"

# Wait for server to start, then open browser
sleep 3
open "$URL"
