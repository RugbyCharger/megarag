#!/bin/bash

# MegaRAG Background Service
cd /Users/grantcharge/Projects/megarag

# Load environment variables
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
export NODE_ENV=production

# Start the production server
exec /Users/grantcharge/.nvm/versions/node/v24.12.0/bin/npm start
