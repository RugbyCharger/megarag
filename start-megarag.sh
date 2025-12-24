#!/bin/bash

# MegaRAG Start Script
# For personal use on localhost:3000

cd "$(dirname "$0")"

echo "🚀 Starting MegaRAG..."
echo "   Server will be available at: http://localhost:3000"
echo "   Press Ctrl+C to stop"
echo ""

# Start the production server
npm start
