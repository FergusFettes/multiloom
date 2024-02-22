#!/bin/bash

# Create the dist directory if it doesn't exist
mkdir -p dist

# Start with a clean index.html
echo "<!DOCTYPE html>" > index.html
echo "<html>" >> index.html
echo "<head>" >> index.html
echo "<meta charset='utf-8'>" >> index.html
echo "<title>TinyLoom</title>" >> index.html
cat imports.html >> index.html

echo "<style>" >> index.html
# Include CSS directly into the <style> tag
cat styles.css >> index.html
echo "</style>" >> index.html

echo "</head>" >> index.html
echo "<body>" >> index.html

# Include the header and footer HTML
cat header.html >> index.html

echo "<script>" >> index.html

cat data.js >> index.html
cat visualize.js >> index.html
cat main.js >> index.html
cat utils.js >> index.html
cat api.js >> index.html
cat eventListeners.js >> index.html
cat draggable.js >> index.html

echo "</script>" >> index.html
echo "</body>" >> index.html
echo "</html>" >> index.html
