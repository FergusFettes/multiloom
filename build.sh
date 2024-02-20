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

# echo "<style>" >> index.html
# # Include CSS directly into the <style> tag
# cat styles.css >> dist/index.html
# echo "</style>" >> dist/index.html

echo "</head>" >> index.html
echo "<body>" >> index.html

# Include the header and footer HTML
cat header.html >> index.html

echo "<script>" >> index.html

cat main.js >> index.html

echo "</script>" >> index.html
echo "</body>" >> index.html
echo "</html>" >> index.html
