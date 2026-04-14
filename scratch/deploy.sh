#!/bin/bash
# Priority: use Node 22 from aaPanel
export PATH="/www/server/nodejs/v22.16.0/bin:$PATH"
cd /www/wwwroot/sikump.unikarta.ac.id

echo "Using Node version: $(node -v)"
export NODE_OPTIONS="--max-old-space-size=4096"

echo "Installing dependencies..."
bun install || npm install

echo "Building project..."
npx nuxi build

echo "Restarting PM2..."
pm2 delete sikump-nuxt || true
pm2 start .output/server/index.mjs --name "sikump-nuxt" --interpreter node

echo "Deployment complete!"
