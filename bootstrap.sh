#!/bin/bash

# The current directory

dir="${HOME}/.karabiner"

# Create directories

mkdir -p "${HOME}/.config/"

# Create symlinks in config directory

ln -ns "${dir}/build" ~/.config/karabiner
