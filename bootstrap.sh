#!/bin/bash

# The current directory

DIR=$(dirname $(readlink -f $0))

# Create directories

mkdir -p "${HOME}/.config/"

# Create symlinks in config directory

ln -ns "${DIR}/build" ~/.config/karabiner
