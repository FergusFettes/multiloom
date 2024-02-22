#!/bin/bash

# Ensure that Prettier is installed
if ! command -v prettier &> /dev/null; then
    echo "Prettier could not be found. Please install it globally with 'npm install -g prettier'."
    exit 1
fi

# Find all .js files in the current directory and run prettier
find . -type f -name "*.js" -exec prettier --write {} +

echo "All .js files have been prettified."
