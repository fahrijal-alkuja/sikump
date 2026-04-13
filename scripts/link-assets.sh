#!/bin/bash

# Script to link legacy assets to Nuxt project
# Usage: bash scripts/link-assets.sh /path/to/legacy/app

LEGACY_PATH=$1

if [ -z "$LEGACY_PATH" ]; then
    echo "Error: Please provide the absolute path to your legacy application."
    echo "Usage: bash scripts/link-assets.sh /Users/username/Developer/MyApp/SIKUMP"
    exit 1
fi

if [ ! -d "$LEGACY_PATH" ]; then
    echo "Error: Directory $LEGACY_PATH not found."
    exit 1
fi

# Create public directory if not exists
mkdir -p public

# Check for common asset locations in CI
ASSETS_DIR="$LEGACY_PATH/assets"
UPLOADS_DIR="$LEGACY_PATH/uploads"

if [ -d "$ASSETS_DIR" ]; then
    echo "Linking legacy assets folder..."
    rm -rf public/assets
    ln -s "$ASSETS_DIR" public/assets
    echo "Success: Linked public/assets -> $ASSETS_DIR"
elif [ -d "$UPLOADS_DIR" ]; then
    echo "Linking legacy uploads folder to public/assets..."
    rm -rf public/assets
    ln -s "$UPLOADS_DIR" public/assets
    echo "Success: Linked public/assets -> $UPLOADS_DIR"
else
    echo "Warning: Could not automatically find 'assets' or 'uploads' folder in $LEGACY_PATH."
    echo "Please manually link your files to public/assets."
fi

echo "Done. You can now access legacy files via /assets/URL_PATH in your Nuxt app."
