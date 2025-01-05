#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Installation directory
INSTALL_DIR="$HOME/bin"
BINARY_NAME="git"
BINARY_PATH="$INSTALL_DIR/$BINARY_NAME" 
REPO_URL="https://bolt.new/node-git/dist/cli.js"

echo "Installing node-git..."

# Create installation directory if it doesn't exist
mkdir -p "$INSTALL_DIR"

# Download the binary
if curl -fsSL "$REPO_URL" > "$BINARY_PATH"; then
    # Make binary executable
    chmod +x "$BINARY_PATH"

    # Add to PATH for current session
    export PATH="$INSTALL_DIR:$PATH"

    # Create alias for current session
    alias git="$BINARY_PATH"

    echo -e "${GREEN}✓ Installation successful!${NC}"
    echo "You can now use 'git' command in this session"
else
    echo -e "${RED}✗ Installation failed${NC}"
    exit 1
fi