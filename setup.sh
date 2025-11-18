#!/bin/bash

# This script performs the one-time setup required to get the project running.

# Exit the script immediately if a command exits with a non-zero status.
set -e

# 0. Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "Error: npm is not installed." >&2
    echo "Please install Node.js (which includes npm) from https://nodejs.org/" >&2
    echo "After installation, please run this script again." >&2
    exit 1
fi

# 1. Install all project dependencies from package.json
echo "Installing project dependencies..."
npm install

# 2. Run the test suite to verify the setup
echo "Running test suite..."
npm test

echo "Setup complete. You can now work with the project."