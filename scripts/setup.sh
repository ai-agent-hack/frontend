#!/bin/bash

# Set strict mode for better error handling
set -euo pipefail

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to check and install a command
check_and_install() {
    command_name="$1"
    install_command="$2"
    error_message="$3"
    
    if ! command -v "$command_name" &> /dev/null; then
        echo -e "${RED}Error: $error_message${NC}" >&2
        if [[ -n "$install_command" ]]; then
            echo -e "${YELLOW}Attempting to install $command_name...${NC}"
            eval "$install_command"
            if ! command -v "$command_name" &> /dev/null; then
                echo -e "${RED}Failed to install $command_name.${NC}" >&2
                exit 1
            fi
            echo -e "${GREEN}$command_name installed successfully.${NC}"
        else
            exit 1
        fi
    fi
}

# Check and install bun
check_and_install "bun" "" "bun is not installed."

# Install bun dependencies
echo -e "${YELLOW}Installing bun dependencies...${NC}"
bun install

echo -e "${GREEN}Frontend setup complete.${NC}"