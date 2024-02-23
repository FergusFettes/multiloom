#!/bin/bash

# Create the dist directory if it doesn't exist
mkdir -p dist

# Start with a clean index.html
echo "<!DOCTYPE html>" > index.html
echo "<html>" >> index.html
echo "<head>" >> index.html
echo "<meta charset='utf-8'>" >> index.html
echo "<title>TinyLoom</title>" >> index.html
cat src/imports.html >> index.html

echo "<style>" >> index.html
# Include CSS directly into the <style> tag
cat src/styles.css >> index.html
echo "</style>" >> index.html

echo "</head>" >> index.html
echo "<body>" >> index.html

# Include the header and footer HTML
cat src/header.html >> index.html

echo "<script>" >> index.html

cat src/data.js >> index.html
cat src/visualize.js >> index.html
cat src/main.js >> index.html
cat src/utils.js >> index.html
cat src/api.js >> index.html
cat src/eventListeners.js >> index.html
cat src/draggable.js >> index.html
cat src/models.js >> index.html

echo "</script>" >> index.html
echo "</body>" >> index.html
echo "</html>" >> index.html
