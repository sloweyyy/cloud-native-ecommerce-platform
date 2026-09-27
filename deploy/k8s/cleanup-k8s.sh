#!/usr/bin/env bash
# Backwards-compatible entry point for cleanup-all.sh (arguments passed through;
# see ./cleanup-all.sh --help).
exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/cleanup-all.sh" "$@"
