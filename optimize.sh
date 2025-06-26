#!/bin/bash

echo "🚀 Starting JS minification..."

# Install dependencies if not present
if ! command -v npx &> /dev/null; then
    echo "❌ Node.js/npx not found. Please install Node.js first."
    exit 1
fi

echo "📦 Minifying JavaScript files..."
npx terser script.js -o script.min.js --compress --mangle
npx terser main.js -o main.min.js --compress --mangle
npx terser index.js -o index.min.js --compress --mangle
npx terser GLTFLoader.js -o GLTFLoader.min.js --compress --mangle
npx terser DragControls.js -o DragControls.min.js --compress --mangle

echo "✅ JS minification complete!" 